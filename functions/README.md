# Cloudflare Pages Functions

Serverless backend functions deployed on Cloudflare Pages. These functions handle API requests, data fetching, and caching.

## Overview

The backend is built using Cloudflare Pages Functions, which provide:
- Edge computing (global distribution)
- Automatic HTTPS
- KV storage for caching
- TypeScript support

---

## Functions

### `/api/weather`

Weather data endpoint with caching.

**Method:** `GET`

**Query Parameters:**
- None (uses fixed location: Los Baños)

**Response:**
```json
{
  "location": "Los Baños, Laguna",
  "temperature": 28,
  "condition": "Partly Cloudy",
  "humidity": 75,
  "windSpeed": 3.5,
  "icon": "02d",
  "pressure": 1013,
  "visibility": 10,
  "hourly": [
    {
      "dt": 1706600000,
      "temp": 28,
      "feels_like": 31,
      "icon": "02d",
      "description": "Partly cloudy",
      "humidity": 75,
      "wind_speed": 3.5
    }
  ]
}
```

**Caching:**
- Weather data is cached in KV storage
- Cache expires after 30 minutes
- Reduces API calls to external weather service

**Implementation:** `functions/api/weather.ts`

---

### `/api/status`

Health check endpoint for monitoring.

**Method:** `GET`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:00:00Z",
  "version": "0.1.0"
}
```

---

## KV Storage

### `WEATHER_KV` Namespace

Stores cached weather data to reduce API calls.

**Key Structure:**
```
weather:current     - Current weather data
weather:forecast    - 24-hour forecast
weather:timestamp   - Last update time
```

**Cache Duration:**
- Weather data: 30 minutes
- Forecast data: 1 hour

---

## Local Development

### Prerequisites

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

### Running Locally

```bash
# Start the dev server with functions
npm run functions:dev
```

This starts:
- Vite dev server on port 5173
- Functions server proxied through Vite

### Environment Variables

Create `.dev.vars` for local development:

```env
# Weather API
WEATHER_API_KEY=your_api_key_here
WEATHER_API_URL=https://api.openweathermap.org/data/2.5

# KV Namespace (for local testing)
KV_ID=your_kv_namespace_id
```

---

## Deployment

### Automatic Deployment

Functions are deployed automatically when pushing to the main branch via Cloudflare Pages.

### Manual Deployment

```bash
# Deploy to Cloudflare Pages
wrangler pages deploy dist
```

---

## Error Handling

All functions return consistent error responses:

```json
{
  "error": "Error message",
  "status": 400
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `500` - Server Error
- `503` - Service Unavailable (API issues)

---

## CORS Configuration

All endpoints include CORS headers:

```typescript
headers.set('Access-Control-Allow-Origin', '*');
headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
headers.set('Access-Control-Max-Age', '86400');
```

---

## Monitoring

### Logs

View function logs in Cloudflare Dashboard:
1. Go to Pages project
2. Click on "Functions" tab
3. View real-time logs

### Analytics

Monitor:
- Request count
- Response times
- Error rates
- KV read/write operations

---

## Security

### API Keys

API keys are stored as environment variables:
- Never commit keys to Git
- Use `.dev.vars` for local development
- Use Cloudflare environment variables for production

### Rate Limiting

Consider implementing rate limiting for:
- Weather API (prevent abuse)
- Status endpoint (prevent monitoring spam)

---

## Performance Optimization

### Caching Strategy

1. **Weather Data**
   - Cache for 30 minutes
   - Update in background
   - Serve stale data on cache miss

2. **Static Responses**
   - Use Cache-Control headers
   - Leverage Cloudflare CDN

---

## Adding New Functions

1. Create a new file in `functions/api/`:
   ```bash
   touch functions/api/new-endpoint.ts
   ```

2. Export a default handler:
   ```typescript
   export interface Env {
     KV: KVNamespace;
   }

   export default {
     async fetch(request: Request, env: Env): Promise<Response> {
       // Handle request
       return new Response(JSON.stringify(data), {
         headers: { 'Content-Type': 'application/json' }
       });
     }
   };
   ```

3. Test locally:
   ```bash
   npm run functions:dev
   curl http://localhost:8788/api/new-endpoint
   ```

---

## Related Documentation

- [Cloudflare Pages Functions Docs](https://developers.cloudflare.com/pages/functions/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [KV Storage](https://developers.cloudflare.com/kv/)
