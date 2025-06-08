# BetterGov Cloudflare Functions

This folder contains Cloudflare Functions that run on a schedule to fetch and store data for the BetterGov application.

## Functions

### 1. Weather Data (`get-weather.js`)

Fetches weather data for major Philippine cities from OpenWeatherMap API and stores it in Cloudflare KV.

- **Schedule**: Runs hourly
- **KV Store**: `WEATHER_KV`
- **Environment Variables**: Requires `OPENWEATHERMAP_API_KEY`

### 2. Currency Exchange Rates (`get-forex.js`)

Fetches currency exchange rates from Bangko Sentral ng Pilipinas (BSP) and stores them in Cloudflare KV.

- **Schedule**: Runs hourly
- **KV Store**: `FOREX_KV`
- **Data Source**: BSP Exchange Rate API

## Setup Instructions

1. Install Wrangler CLI (Cloudflare Workers CLI):
   ```
   npm install -g wrangler
   ```

2. Login to your Cloudflare account:
   ```
   wrangler login
   ```

3. Create KV namespaces:
   ```
   wrangler kv:namespace create WEATHER_KV
   wrangler kv:namespace create FOREX_KV
   ```

4. Update the `wrangler.toml` file with the KV namespace IDs from the previous step.

5. Add your OpenWeatherMap API key as a secret:
   ```
   wrangler secret put OPENWEATHERMAP_API_KEY
   ```

6. Deploy the functions:
   ```
   wrangler deploy
   ```

## Accessing the Data

The data is stored in Cloudflare KV with the following keys:

- Weather data: `philippines_weather`
- Currency exchange rates: `bsp_exchange_rates`

You can access this data from your frontend application or other Cloudflare Workers/Functions.
