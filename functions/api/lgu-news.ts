/**
 * LGU News API
 * GET /api/lgu-news - Scrapes losbanos.gov.ph homepage for recent news posts
 *
 * Extracts the 3 most recent posts from the Los Baños LGU website homepage.
 * Uses KV caching with 15-minute TTL and rate limiting (30 requests/minute).
 */
import { createKVCache, CACHE_TTL } from '../utils/kv-cache';
import { cachedJson } from '../utils/cache';
import {
  checkRateLimit,
  getClientIdentifier,
  addRateLimitHeaders,
  createRateLimitResponse,
} from '../utils/rate-limit';
import type { Env } from '../types';

/**
 * LGU News Post structure
 */
interface LGUNewsPost {
  title: string;
  url: string;
  date: string;
  excerpt: string;
  imageUrl: string;
}

/**
 * API Response shape
 */
interface LGUNewsResponse {
  posts: LGUNewsPost[];
  source: string;
  cached: boolean;
}

/**
 * Fetch and parse LGU homepage HTML to extract recent news posts
 */
async function fetchAndParse(): Promise<LGUNewsResponse> {
  try {
    // Fetch homepage with 10-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://losbanos.gov.ph/', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // Parse HTML using regex to extract posts from .callout.secondary containers
    const posts: LGUNewsPost[] = [];
    const postBlocks = html.split('callout secondary');

    // Process each post block (skip first as it's before the first callout)
    for (let i = 1; i < postBlocks.length && posts.length < 3; i++) {
      const block = postBlocks[i];

      // Extract title and URL from <h5><a href="...">
      const titleMatch = block.match(
        /<h5><a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a><\/h5>/
      );
      if (!titleMatch) continue;

      const title = titleMatch[2].trim();
      let url = titleMatch[1];

      // Extract date from <small> tag
      const dateMatch = block.match(/<small[^>]*>([^<]*)<\/small>/);
      const date = dateMatch
        ? dateMatch[1].replace(/Published date:\s*/, '').trim()
        : '';

      // Extract image URL
      let imageUrl = '';
      const imgContainerMatch = block.match(
        /<a[^>]*class="img-container"[^>]*><img[^>]*src="([^"]*)"/
      );
      if (imgContainerMatch) {
        imageUrl = imgContainerMatch[1];
      } else {
        // Fallback: look for any img with class containing "cover"
        const coverImgMatch = block.match(
          /<img[^>]*class="[^"]*cover[^"]*"[^>]*src="([^"]*)"/
        );
        if (coverImgMatch) {
          imageUrl = coverImgMatch[1];
        } else {
          // Final fallback: any img src containing "cover_images"
          const anyImgMatch = block.match(
            /<img[^>]*src="([^"]*cover_images[^"]*)"/
          );
          if (anyImgMatch) {
            imageUrl = anyImgMatch[1];
          }
        }
      }

      // Extract excerpt (content between </small> and closing </div>)
      const excerptMatch = block.match(/<\/small>([\s\S]*?)<\/div>/);
      let excerpt = '';
      if (excerptMatch) {
        // Remove HTML delimiters and normalize whitespace
        excerpt = excerptMatch[1]
          .replace(/[<>]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
      }

      // Prepend base URL to relative paths
      if (url.startsWith('/')) {
        url = 'https://losbanos.gov.ph' + url;
      }
      if (imageUrl.startsWith('/')) {
        imageUrl = 'https://losbanos.gov.ph' + imageUrl;
      }

      posts.push({
        title,
        url,
        date,
        excerpt,
        imageUrl,
      });
    }

    return {
      posts,
      source: 'losbanos.gov.ph',
      cached: false,
    };
  } catch (error) {
    console.error('Error fetching LGU news:', error);
    throw error;
  }
}

/**
 * GET /api/lgu-news
 * Returns the 3 most recent news posts from losbanos.gov.ph
 */
export async function onRequestGet(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const { request, env } = context;

  try {
    // Rate limit check: 30 requests per minute
    const rateLimitResult = await checkRateLimit(
      env.WEATHER_KV,
      'lgu-news:' + getClientIdentifier(request),
      { limit: 30, window: 60 }
    );

    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult, 30);
    }

    // Use KV cache with 15-minute TTL
    const kvCache = createKVCache(env);
    const result = await kvCache.get<LGUNewsResponse>(
      'lgu-news:homepage',
      async () => {
        const data = await fetchAndParse();
        return data;
      },
      CACHE_TTL.list
    );

    // Mark as cached when coming from KV
    const response = cachedJson(
      {
        ...result,
        cached: true,
      },
      'list'
    );

    // Add rate limit headers
    return addRateLimitHeaders(response, rateLimitResult, 30);
  } catch (error) {
    console.error('LGU news API error:', error);
    return cachedJson(
      { error: 'Failed to fetch news', posts: [] },
      'none',
      502
    );
  }
}
