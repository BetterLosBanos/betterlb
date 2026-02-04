/**
 * Legislative Post Parser API
 * POST /api/admin/parse-legislative-post - Parse Facebook post content to extract legislative items
 */
import { Env } from '../../types';
import { AuthContext, withAuth } from '../../utils/admin-auth';

interface ParsedLegislativeItem {
  type: 'ordinance' | 'resolution' | 'executive_order';
  number: string;
  title: string;
  authors: string[];
  co_authors: string[];
  seconded_by: string[];
  moved_by?: string;
  confidence: {
    type: number;
    number: number;
    title: number;
    authors: number;
  };
}

interface ParsedSessionInfo {
  type: 'regular' | 'special' | 'inaugural' | null;
  ordinal: number | null;
}

interface MatchedPerson {
  person_id: string;
  name: string;
  confidence: number;
}

interface ParseLegislativePostResponse {
  success: boolean;
  session_info: ParsedSessionInfo;
  items: ParsedLegislativeItem[];
  matched_persons: {
    [raw_name: string]: MatchedPerson | null;
  };
}

// Unicode mathematical bold digits to regular digits mapping
const BOLD_DIGIT_MAP: Record<string, string> = {
  '\ud835\udfce': '0', // 𝟎
  '\ud835\udfcf': '1', // 𝟏
  '\ud835\udfd0': '2', // 𝟐
  '\ud835\udfd1': '3', // 𝟑
  '\ud835\udfd2': '4', // 𝟒
  '\ud835\udfd3': '5', // 𝟓
  '\ud835\udfd4': '6', // 𝟔
  '\ud835\udfd5': '7', // 𝟕
  '\ud835\udfd6': '8', // 𝟖
  '\ud835\udfd7': '9', // 𝟗
};

// Normalizes Unicode mathematical bold digits and other special characters to regular text
function normalizeText(text: string): string {
  let normalized = text;

  // Replace Unicode mathematical bold digits
  for (const [bold, regular] of Object.entries(BOLD_DIGIT_MAP)) {
    normalized = normalized.replaceAll(bold, regular);
  }

  // Normalize various Unicode characters to their ASCII equivalents
  normalized = normalized.normalize('NFKC');

  return normalized;
}

// Clean up "Hon." prefix from names
function cleanName(name: string): string {
  return name
    .replace(/^Hon\.?\s*/i, '')
    .replace(/^HON\.?\s*/i, '')
    .trim();
}

// Split names by common delimiters (/, "and", &, comma)
function splitNames(namesStr: string): string[] {
  if (!namesStr || namesStr.trim() === '') return [];

  const trimmed = namesStr.trim();

  // Handle "All SB Members" pattern
  if (/all\s+sb\s+members/i.test(trimmed)) {
    return ['All SB Members'];
  }

  // Try splitting by " / " first (common pattern in posts)
  if (trimmed.includes(' / ')) {
    return trimmed.split(' / ').map(cleanName).filter(Boolean);
  }

  // Try comma
  if (trimmed.includes(',')) {
    return trimmed.split(',').map(cleanName).filter(Boolean);
  }

  // Try " and "
  if (/\s+and\s+/i.test(trimmed)) {
    return trimmed
      .split(/\s+and\s+/i)
      .map(cleanName)
      .filter(Boolean);
  }

  // Try " & "
  if (trimmed.includes(' & ')) {
    return trimmed.split(' & ').map(cleanName).filter(Boolean);
  }

  // Single name
  return [cleanName(trimmed)].filter(Boolean);
}

/**
 * Parse session info from post content
 */
function parseSessionInfo(content: string): ParsedSessionInfo {
  const result: ParsedSessionInfo = {
    type: null,
    ordinal: null,
  };

  const normalized = normalizeText(content);

  // Matches: "100th Regular Session", "5th Special", "Inaugural Session"
  const sessionPattern =
    /(\d+)(?:st|nd|rd|th)\s+(Regular|Special|Inaugural)\s+(?:Session|)?/i;
  const sessionMatch = normalized.match(sessionPattern);

  if (sessionMatch) {
    result.ordinal = parseInt(sessionMatch[1], 10);
    const typeStr = sessionMatch[2].toLowerCase();
    result.type =
      typeStr === 'regular'
        ? 'regular'
        : typeStr === 'special'
          ? 'special'
          : 'inaugural';
  } else {
    // Try to find session type without ordinal
    if (/\bRegular\s+Session\b/i.test(normalized)) {
      result.type = 'regular';
    } else if (/\bSpecial\s+Session\b/i.test(normalized)) {
      result.type = 'special';
    } else if (/\bInaugural\s+Session\b/i.test(normalized)) {
      result.type = 'inaugural';
    }
  }

  return result;
}

/**
 * Parse legislative items from Facebook post content
 */
function parseLegislativeItems(content: string): ParsedLegislativeItem[] {
  const items: ParsedLegislativeItem[] = [];
  const normalized = normalizeText(content);

  // First, split the content by numbered items (1., 2., etc.) at the start of a line
  // We need to capture everything from the number pattern to the next number pattern or end
  const lines = normalized.split('\n');
  const currentItemBlocks: string[] = [];
  let currentBlock = '';

  for (const line of lines) {
    // Check if this line starts with a number pattern (e.g., "1. ORDINANCE NO.")
    // Supports numbers like 2026-2464, 2026-2464-A, 2026-2464-B
    const numberedItemMatch = line.match(
      /^(\d+)\.\s+(ORDINANCE|RESOLUTION|EXECUTIVE\s+ORDER|KAUTUSAN)\s+(?:NO\.|BLG\.)?\s*(\d{4}-\d+(?:-[A-Z]+)?)/i
    );

    if (numberedItemMatch) {
      // Save previous block if exists
      if (currentBlock.trim()) {
        currentItemBlocks.push(currentBlock.trim());
      }
      // Start new block with this line
      currentBlock = line;
    } else if (currentBlock) {
      // Add to current block
      currentBlock += '\n' + line;
    } else {
      // Skip lines before first numbered item
      continue;
    }
  }

  // Don't forget the last block
  if (currentBlock.trim()) {
    currentItemBlocks.push(currentBlock.trim());
  }

  // Now parse each block
  for (const block of currentItemBlocks) {
    const item = parseSingleBlock(block);
    if (item) {
      items.push(item);
    }
  }

  return items;
}

/**
 * Parse a single legislative item block
 */
function parseSingleBlock(block: string): ParsedLegislativeItem | null {
  // Extract type and number from first line
  const firstLine = block.split('\n')[0];
  const typeMatch = firstLine.match(
    /(ORDINANCE|RESOLUTION|EXECUTIVE\s+ORDER|KAUTUSAN)/i
  );
  // Supports numbers like 2026-2464, 2026-2464-A, 2026-2464-B
  const numberMatch = block.match(/(\d{4}-\d+(?:-[A-Z]+)?)/);

  if (!typeMatch || !numberMatch) {
    return null;
  }

  const typeStr = typeMatch[1].toUpperCase();
  const number = numberMatch[1];

  // Determine document type
  let type: 'ordinance' | 'resolution' | 'executive_order';
  if (typeStr === 'KAUTUSAN' || typeStr === 'ORDINANCE') {
    type = 'ordinance';
  } else if (typeStr === 'RESOLUTION') {
    type = 'resolution';
  } else if (typeStr.includes('EXECUTIVE')) {
    type = 'executive_order';
  } else {
    type = 'ordinance';
  }

  // Extract title - everything from the first line after the number until we hit
  // Author/Co-Author/Seconded By/Moved By pattern
  let title = '';
  const lines = block.split('\n');

  // Skip the first line (contains the number)
  // The title is typically on the second line (and possibly continues on subsequent lines)
  // It ends when we hit a line with "Author:", "Co-Author:", "Seconded By:", "Moved By:", etc.

  const titleLines: string[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if this line starts an author field
    if (
      /^(?:Authors?|Author|May\s+Akda|Co-Author|Pinangalawahan)\s*:/i.test(
        line
      ) ||
      /^Seconded\s+By\s*:/i.test(line) ||
      /^Moved\s+By\s*:/i.test(line) ||
      /^Author\(s\)\s*:/i.test(line)
    ) {
      break;
    }

    // This is still part of the title
    titleLines.push(line);
  }

  title = titleLines.join(' ').trim();

  // Clean up the title - remove trailing punctuation
  title = title.replace(/[\s""]+$/, '').trim();

  // If title is empty or too short, use a default
  if (title.length < 10) {
    title = `[Title to be completed]`;
  }

  // Now extract authors, co-authors, seconded by, moved by
  const authors: string[] = [];
  const co_authors: string[] = [];
  const seconded_by: string[] = [];
  let moved_by: string | undefined;

  // Join lines to make pattern matching easier
  const fullText = block;

  // Extract Author: or May Akda: (English and Tagalog)
  const authorPatterns = [
    /\nAuthor:\s*([^\n]+)/i,
    /\nAuthors?:\s*([^\n]+)/i,
    /\nAuthor\(s\):\s*([^\n]+)/i,
    /\nMay\s+Akda:\s*([^\n]+)/i,
  ];

  for (const pattern of authorPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      authors.push(...splitNames(match[1]));
      break; // Only use the first match
    }
  }

  // Extract Co-Author: or Pinangalawahan ni:
  const coAuthorPatterns = [
    /\nCo-Author:\s*([^\n]+)/i,
    /\nPinangalawahan\s+ni:\s*([^\n]+)/i,
  ];

  for (const pattern of coAuthorPatterns) {
    const match = fullText.match(pattern);
    if (match) {
      co_authors.push(...splitNames(match[1]));
      break;
    }
  }

  // Extract Seconded By:
  const secondedByMatch = fullText.match(/\nSeconded\s+By:\s*([^\n]+)/i);
  if (secondedByMatch) {
    seconded_by.push(...splitNames(secondedByMatch[1]));
  }

  // Extract Moved By: (for resolutions)
  const movedByMatch = fullText.match(/\nMoved\s+By:\s*([^\n]+)/i);
  if (movedByMatch) {
    const movedByNames = splitNames(movedByMatch[1]);
    if (movedByNames.length > 0) {
      moved_by = movedByNames[0];
    }
  }

  // If no authors found via Author: field, try end-of-title pattern
  // Pattern: "...). Councilor First M. Last [MM/DD/YYYY]"
  if (authors.length === 0 && co_authors.length === 0) {
    const titleEndAuthorPattern =
      /(?:Councilor|Councilwoman|Honorable|Vice\s+Mayor|Konsehal)\s+([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+(?:\s+[A-Z]\.?)?(?:\s+[A-Z][a-z]+)?)(?:\s+\d{1,2}[/-]\d{1,2}[/-]\d{2,4})?\s*$/i;
    const endMatch = fullText.match(titleEndAuthorPattern);
    if (endMatch) {
      const authorName = endMatch[1].trim();
      if (authorName.length > 3) {
        authors.push(authorName);
      }
    }
  }

  return {
    type,
    number,
    title,
    authors,
    co_authors,
    seconded_by,
    moved_by,
    confidence: {
      type: 0.9,
      number: 0.95,
      title: title !== '[Title to be completed]' ? 0.8 : 0.3,
      authors: authors.length > 0 ? 0.7 : 0.2,
    },
  };
}

/**
 * Match extracted names to database persons
 */
async function matchPersonsToDatabase(
  names: string[],
  env: Env
): Promise<Map<string, MatchedPerson | null>> {
  const matched = new Map<string, MatchedPerson | null>();

  for (const rawName of names) {
    if (matched.has(rawName)) continue;

    // Skip special names like "All SB Members"
    if (/all\s+sb\s+members/i.test(rawName)) {
      matched.set(rawName, null);
      continue;
    }

    const cleanedName = cleanName(rawName);
    const nameParts = cleanedName.split(/\s+/);

    if (nameParts.length < 2) {
      matched.set(rawName, null);
      continue;
    }

    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];

    // Try exact match on first and last name
    let match = await env.BETTERLB_DB.prepare(
      `SELECT id, first_name, middle_name, last_name, suffix
       FROM persons
       WHERE LOWER(first_name) = LOWER(?1) AND LOWER(last_name) = LOWER(?2)`
    )
      .bind(firstName, lastName)
      .first<{
        id: string;
        first_name: string;
        middle_name: string | null;
        last_name: string;
        suffix: string | null;
      }>();

    // If no exact match, try fuzzy search
    if (!match) {
      match = await env.BETTERLB_DB.prepare(
        `SELECT id, first_name, middle_name, last_name, suffix
         FROM persons
         WHERE LOWER(first_name) LIKE LOWER(?1) OR LOWER(last_name) LIKE LOWER(?2)
         LIMIT 1`
      )
        .bind(`${firstName}%`, `${lastName}%`)
        .first<{
          id: string;
          first_name: string;
          middle_name: string | null;
          last_name: string;
          suffix: string | null;
        }>();
    }

    // If still no match, try searching full name
    if (!match) {
      match = await env.BETTERLB_DB.prepare(
        `SELECT id, first_name, middle_name, last_name, suffix
         FROM persons
         WHERE first_name || ' ' || last_name LIKE ?1
         LIMIT 1`
      )
        .bind(`%${cleanedName}%`)
        .first<{
          id: string;
          first_name: string;
          middle_name: string | null;
          last_name: string;
          suffix: string | null;
        }>();
    }

    if (match) {
      const parts = [match.first_name, match.middle_name, match.last_name];
      if (match.suffix) parts.push(match.suffix);
      matched.set(rawName, {
        person_id: match.id,
        name: parts.filter(Boolean).join(' '),
        confidence: 0.7,
      });
    } else {
      matched.set(rawName, null);
    }
  }

  return matched;
}

/**
 * POST /api/admin/parse-legislative-post
 * Parse Facebook post content to extract legislative items
 */
async function handleParseLegislativePost(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string') {
      return Response.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      );
    }

    // Parse session info
    const session_info = parseSessionInfo(content);

    // Parse legislative items
    const items = parseLegislativeItems(content);

    // Collect all unique person names for matching
    const allNames = new Set<string>();
    for (const item of items) {
      item.authors.forEach(n => allNames.add(n));
      item.co_authors.forEach(n => allNames.add(n));
      item.seconded_by.forEach(n => allNames.add(n));
      if (item.moved_by) allNames.add(item.moved_by);
    }

    // Match names to database persons
    const matchedPersonsMap = await matchPersonsToDatabase(
      Array.from(allNames),
      env
    );

    // Convert Map to object for JSON serialization
    const matched_persons: { [raw_name: string]: MatchedPerson | null } = {};
    matchedPersonsMap.forEach((value, key) => {
      matched_persons[key] = value;
    });

    return Response.json({
      success: true,
      session_info,
      items,
      matched_persons,
    } satisfies ParseLegislativePostResponse);
  } catch (error) {
    console.error('Error parsing legislative post:', error);
    return Response.json(
      { error: 'Failed to parse legislative post' },
      { status: 500 }
    );
  }
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  return withAuth(handleParseLegislativePost)(context);
}
