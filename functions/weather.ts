/**
 * Weather endpoint that queries the KV store directly
 * This endpoint is a simplified version that only reads from KV
 */
import { Env } from './types';

/**
 * CORS Configuration
 * Restricts API access to trusted origins only (security fix for T-059)
 */
const ALLOWED_ORIGINS = [
  'https://betterlb.pages.dev',
  'https://betterlb.gov.ph', // Custom domain if configured
  'http://localhost:5173', // Vite dev server
  'http://localhost:8788', // Wrangler dev server
];

/**
 * Get appropriate CORS headers based on request origin
 */
function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);

  if (isAllowed) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };
  }

  return {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function onRequest(context: {
  request: Request;
  env: Env;
  ctx: ExecutionContext;
}): Promise<Response> {
  const url = new URL(context.request.url);
  const origin = url.origin;

  try {
    const cityParam = url.searchParams.get('city');

    // Handle OPTIONS preflight requests
    if (context.request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(origin),
      });
    }

    // Get data from KV store
    const cachedData = (await context.env.WEATHER_KV.get(
      'philippines_weather',
      { type: 'json' }
    )) as Record<string, unknown> | null;

    if (!cachedData) {
      return new Response(
        JSON.stringify({
          error: 'No weather data found in KV store',
          message:
            'Try calling /api/weather?update=true to fetch and store fresh data',
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(origin),
          },
        }
      );
    }

    // If city parameter is provided, filter the data
    if (cityParam) {
      const cityKey = cityParam.toLowerCase();
      if (cachedData[cityKey]) {
        return new Response(
          JSON.stringify({ [cityKey]: cachedData[cityKey] }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...getCorsHeaders(origin),
              'Cache-Control': 'max-age=3600',
            },
          }
        );
      } else {
        return new Response(
          JSON.stringify({
            error: `No data found for city: ${cityParam}`,
            availableCities: Object.keys(cachedData),
          }),
          {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...getCorsHeaders(origin),
            },
          }
        );
      }
    }

    // Return all data if no city specified
    return new Response(JSON.stringify(cachedData), {
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(origin),
        'Cache-Control': 'max-age=3600',
      },
    });
  } catch (error) {
    // Log detailed error information on the server for debugging purposes,
    // but do not expose stack traces or internal details to the client.
    console.error('Error in weather endpoint:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(url.origin),
        },
      }
    );
  }
}
