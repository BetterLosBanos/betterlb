// Main entry point for Cloudflare Workers
import {
  scheduled as getWeatherScheduled,
  onRequest as weatherRequest,
} from './api/weather';
import { onRequest as weatherKVRequest } from './weather';
import { Env } from './types';

// Export the scheduled handlers
export { scheduled as scheduled_getWeather } from './api/weather';

// Handler for HTTP requests
export default {
  async scheduled(
    controller: ScheduledController,
    env: Env
    // ctx: ExecutionContext
  ): Promise<void> {
    console.log('Scheduled update');
    await getWeatherScheduled(controller, env);
  },

  async fetch(
    request: Request,
    env: Env
    // ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Add CORS headers to all responses
    const corsHeaders: Record<string, string> = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle OPTIONS requests for CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    // Route API requests to the appropriate handler
    if (path === '/api/weather') {
      const response = await weatherRequest({ request, env, ctx });
      // Add CORS headers to the response
      const newHeaders = new Headers(response.headers);
      Object.keys(corsHeaders).forEach(key => {
        newHeaders.set(key, corsHeaders[key]);
      });
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }

    // Handle the new KV-only endpoints
    if (path === '/weather') {
      const response = await weatherKVRequest({ request, env, ctx });
      // Add CORS headers to the response
      const newHeaders = new Headers(response.headers);
      Object.keys(corsHeaders).forEach(key => {
        newHeaders.set(key, corsHeaders[key]);
      });
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }

    // Simple API to check if the functions are running
    if (path === '/api/status') {
      return new Response(
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
            ...corsHeaders,
          },
        }
      );
    }

    // Return 404 for any other routes
    return new Response(
      JSON.stringify({
        error: 'Not found',
        availableEndpoints: ['/api/status', '/api/weather', '/weather'],
      }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  },
};
