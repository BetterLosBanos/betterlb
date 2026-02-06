/**
 * Facebook Post Parser API
 * POST /api/admin/parse-facebook-post - Parse Facebook post content to extract session data
 */
import { Env } from '../../types';
import { AuthContext, withAuth } from '../../utils/admin-auth';

interface ParsedSessionData {
  session_type: 'regular' | 'special' | 'inaugural' | null;
  ordinal: number | null;
  date: string | null;
  attendee_names: string[];
  confidence: {
    session_type: number;
    ordinal: number;
    date: number;
    attendees: number;
  };
}

/**
 * Parse Facebook post content to extract session information
 *
 * Expected patterns:
 * - "100th Regular Session" or "100th Regular" or "100th Regular Session of the Sangguniang Bayan"
 * - "Special Session" or "5th Special Session"
 * - "Inaugural Session"
 * - Date patterns: "January 1, 2024", "Jan 1, 2024", "01/01/2024"
 */
function parseFacebookPostContent(content: string): ParsedSessionData {
  const result: ParsedSessionData = {
    session_type: null,
    ordinal: null,
    date: null,
    attendee_names: [],
    confidence: {
      session_type: 0,
      ordinal: 0,
      date: 0,
      attendees: 0,
    },
  };

  // Normalize content
  const normalized = content.replace(/\s+/g, ' ').trim();

  // Parse session type and ordinal
  // Matches: "100th Regular Session", "5th Special", "Inaugural Session"
  const sessionPattern =
    /(\d+)(?:st|nd|rd|th)\s+(Regular|Special|Inaugural)\s+(?:Session|)?/i;
  const sessionMatch = normalized.match(sessionPattern);

  if (sessionMatch) {
    result.ordinal = parseInt(sessionMatch[1], 10);
    const typeStr = sessionMatch[2].toLowerCase();
    result.session_type =
      typeStr === 'regular'
        ? 'regular'
        : typeStr === 'special'
          ? 'special'
          : 'inaugural';
    result.confidence.session_type = 0.9;
    result.confidence.ordinal = 0.9;
  } else {
    // Try to find session type without ordinal
    if (/\bRegular\s+Session\b/i.test(normalized)) {
      result.session_type = 'regular';
      result.confidence.session_type = 0.7;
    } else if (/\bSpecial\s+Session\b/i.test(normalized)) {
      result.session_type = 'special';
      result.confidence.session_type = 0.7;
    } else if (/\bInaugural\s+Session\b/i.test(normalized)) {
      result.session_type = 'inaugural';
      result.confidence.session_type = 0.7;
    }
  }

  // Parse date
  // Try various date formats
  const datePatterns = [
    /(\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b)/i,
    /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}\b)/i,
    /(\b\d{1,2}\/\d{1,2}\/\d{4}\b)/,
    /(\b\d{4}-\d{2}-\d{2}\b)/,
  ];

  for (const pattern of datePatterns) {
    const match = normalized.match(pattern);
    if (match) {
      result.date = match[1];
      result.confidence.date = 0.8;
      break;
    }
  }

  // Extract attendee names
  // This is a basic implementation - in production, you'd use a more sophisticated
  // approach or integrate with the persons database for fuzzy matching
  const lines = normalized.split(/[.\n]+/);
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip if it contains session info or date
    if (
      trimmed.length < 3 ||
      /session|meeting|ordinal|date|time|agenda/i.test(trimmed)
    ) {
      continue;
    }
    // Basic name pattern: Title (optional) + Name
    const nameMatch = trimmed.match(
      /^(?:Hon\.?|Mayor|Vice Mayor|Councilor)?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/
    );
    if (nameMatch) {
      result.attendee_names.push(nameMatch[1]);
    }
  }

  if (result.attendee_names.length > 0) {
    result.confidence.attendees = 0.6;
  }

  return result;
}

/**
 * POST /api/admin/parse-facebook-post
 * Parse Facebook post content to extract session data
 */
async function handleParsePost(context: {
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

    // Parse the content
    const parsed = parseFacebookPostContent(content);

    // If we found attendee names, try to match them against the database
    let matchedAttendees: Array<{
      person_id: string;
      name: string;
      confidence: number;
    }> = [];

    if (parsed.attendee_names.length > 0) {
      // For each extracted name, try to find a match in the persons table
      for (const name of parsed.attendee_names) {
        const nameParts = name.split(' ');
        if (nameParts.length >= 2) {
          const firstName = nameParts[0];
          const lastName = nameParts[nameParts.length - 1];

          // Try exact match first
          let match = await env.BETTERLB_DB.prepare(
            `SELECT id, first_name, middle_name, last_name
             FROM persons
             WHERE first_name = ?1 AND last_name = ?2`
          )
            .bind(firstName, lastName)
            .first();

          // If no exact match, try fuzzy search
          if (!match) {
            match = await env.BETTERLB_DB.prepare(
              `SELECT id, first_name, middle_name, last_name
               FROM persons
               WHERE first_name LIKE ?1 OR last_name LIKE ?2
               LIMIT 5`
            )
              .bind(`${firstName}%`, `${lastName}%`)
              .first();
          }

          if (match) {
            matchedAttendees.push({
              person_id: match.id,
              name: `${match.first_name} ${match.last_name}`,
              confidence: 0.7,
            });
          }
        }
      }
    }

    return Response.json({
      success: true,
      parsed,
      matched_attendees: matchedAttendees,
    });
  } catch (error) {
    console.error('Error parsing Facebook post:', error);
    return Response.json({ error: 'Failed to parse post' }, { status: 500 });
  }
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  return withAuth(handleParsePost)(context);
}
