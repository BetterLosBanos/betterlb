/* eslint-disable @typescript-eslint/no-unused-vars */
// Main entry point for Cloudflare Workers
import {
  scheduled as getWeatherScheduled,
  onRequest as weatherRequest,
} from './api/weather';
import { Env } from './types';
import { onRequest as weatherKVRequest } from './weather';
import { setSecurityHeaders } from './utils/security-headers';

// Export the scheduled handlers
export { scheduled as scheduled_getWeather } from './api/weather';

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

// Handler for HTTP requests
export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    console.log('Scheduled update');
    await getWeatherScheduled(controller, env);
  },

  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const origin = url.origin;

    // Handle OPTIONS requests for CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(origin),
      });
    }

    // Route API requests to the appropriate handler
    if (path === '/api/weather') {
      const response = await weatherRequest({ request, env, ctx });
      // Add CORS headers to the response
      const newHeaders = new Headers(response.headers);
      const corsHeaders = getCorsHeaders(origin);
      Object.keys(corsHeaders).forEach(key => {
        newHeaders.set(key, corsHeaders[key]);
      });
      const withCors = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
      // Apply security headers
      return setSecurityHeaders(withCors, env);
    }

    // Handle the new KV-only endpoints
    if (path === '/weather') {
      const response = await weatherKVRequest({ request, env, ctx });
      // Add CORS headers to the response
      const newHeaders = new Headers(response.headers);
      const corsHeaders = getCorsHeaders(origin);
      Object.keys(corsHeaders).forEach(key => {
        newHeaders.set(key, corsHeaders[key]);
      });
      const withCors = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
      // Apply security headers
      return setSecurityHeaders(withCors, env);
    }

    // Simple API to check if the functions are running
    if (path === '/api/status') {
      const response = new Response(
        JSON.stringify({
          status: 'online',
          functions: ['weather'],
          endpoints: [
            {
              path: '/api/weather',
              description:
                'Get weather data for Philippine cities (fetches from external API)',
              parameters: [
                {
                  name: 'city',
                  required: false,
                  description: 'Specific city to get weather for',
                },
                {
                  name: 'update',
                  required: false,
                  description: 'Set to "true" to force update KV store',
                },
              ],
            },
            {
              path: '/weather',
              description:
                'Get weather data from KV store only (no external API calls)',
              parameters: [
                {
                  name: 'city',
                  required: false,
                  description: 'Specific city to get weather for',
                },
              ],
            },
          ],
          timestamp: new Date().toISOString(),
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders(origin),
          },
        }
      );
      return setSecurityHeaders(response, env);
    }

    // Return 404 for any other routes
    const notFoundResponse = new Response(
      JSON.stringify({
        error: 'Not found',
        availableEndpoints: ['/api/status', '/api/weather', '/weather'],
      }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders(origin),
        },
      }
    );
    return setSecurityHeaders(notFoundResponse, env);
  },
};
