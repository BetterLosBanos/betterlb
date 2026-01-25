// Enhanced Weather API - Path: functions/api/weather.ts
// Merges forecast capability with robust error handling
// Supports single city focus with easy configuration for other municipalities
import type {
  Env,
  CityCoordinates,
  OpenWeatherMapResponse,
  HourlyForecast,
  WeatherData,
  WeatherResponseData,
} from '../types';

// CONFIGURATION - Easy to change for other municipalities
const DEFAULT_CITY: CityCoordinates = {
  name: 'Los Baños',
  lat: 14.1763,
  lon: 121.2219,
};

// Optional: Add more cities if needed
const ADDITIONAL_CITIES: CityCoordinates[] = [
  // { name: 'Bay', lat: 14.1833, lon: 121.2833 },
  // { name: 'Calamba', lat: 14.2167, lon: 121.1667 },
];

const ALL_CITIES = [DEFAULT_CITY, ...ADDITIONAL_CITIES];

// Normalize city name for consistent key format
function normalizeCityKey(cityName: string): string {
  return cityName.toLowerCase().replace(/\s+/g, '_');
}

// Get city configuration by name (case-insensitive)
function getCityConfig(cityName: string): CityCoordinates | undefined {
  const normalized = cityName.toLowerCase();
  return ALL_CITIES.find(city => city.name.toLowerCase() === normalized);
}

// Fetch current weather and 3-hour forecast for a single city
async function fetchCityWeather(
  cityName: string,
  lat: number,
  lon: number,
  apiKey: string
): Promise<WeatherData | null> {
  try {
    // Use the standard weather API with coordinates
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const currentResponse = await fetch(currentUrl);

    if (!currentResponse.ok) {
      console.error(
        `Failed to fetch current weather for ${cityName}: ${currentResponse.statusText}`
      );
      return null;
    }

    const currentData = (await currentResponse.json()) as OpenWeatherMapResponse;

    // Fetch 3-hour forecast (5 day / 3 hour forecast)
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const forecastResponse = await fetch(forecastUrl);

    let hourly: HourlyForecast[] = [];

    if (forecastResponse.ok) {
      const forecastJson: any = await forecastResponse.json();
      // Take first 8 entries (next 24 hours in 3-hour intervals)
      const forecastList = forecastJson.list?.slice(0, 8) || [];

      hourly = forecastList.map((entry: any) => ({
        dt: entry.dt,
        temp: entry.main.temp,
        feels_like: entry.main.feels_like,
        icon: entry.weather[0].icon,
        description: entry.weather[0].description,
        humidity: entry.main.humidity,
        wind_speed: entry.wind.speed,
      }));
    } else {
      console.warn(
        `Failed to fetch forecast for ${cityName}: ${forecastResponse.statusText}`
      );
    }

    // Format the response data based on the comprehensive structure
    return {
      name: currentData.name || cityName.charAt(0).toUpperCase() + cityName.slice(1),
      coordinates: currentData.coord || { lat, lon },
      weather: currentData.weather || [],
      main: currentData.main || {
        temp: 0,
        feels_like: 0,
        temp_min: 0,
        temp_max: 0,
        pressure: 0,
        humidity: 0,
      },
      visibility: currentData.visibility || 0,
      wind: currentData.wind || { speed: 0, deg: 0 },
      clouds: currentData.clouds || { all: 0 },
      rain: currentData.rain || undefined,
      dt: currentData.dt || Math.floor(Date.now() / 1000),
      sys: currentData.sys || {},
      timezone: currentData.timezone || 0,
      id: currentData.id || 0,
      timestamp: new Date().toISOString(),
      hourly,
    };
  } catch (cityError) {
    console.error(`Error fetching data for ${cityName}:`, cityError);
    return null;
  }
}

// Core function to fetch weather data using OpenWeatherMap API
async function fetchWeatherData(
  env: Env,
  specificCity: string | null = null
): Promise<WeatherResponseData> {
  // Get API key from environment variable
  const apiKey = env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OpenWeatherMap API key not found in environment variables'
    );
  }

  // Determine which cities to fetch
  const citiesToFetch = specificCity
    ? [getCityConfig(specificCity)].filter(Boolean)
    : ALL_CITIES;

  // Fetch weather data for cities
  const weatherData: WeatherResponseData = {};

  if (citiesToFetch.length === 0) {
    console.warn(`No matching city found for: ${specificCity}`);
    return weatherData;
  }

  // Fetch weather data for cities
  for (const city of citiesToFetch) {
    if (!city) continue;

    const data = await fetchCityWeather(city.name, city.lat, city.lon, apiKey);

    if (data) {
      const cityKey = normalizeCityKey(city.name);
      weatherData[cityKey] = data;
    }

    // Add a small delay to avoid rate limiting
    if (citiesToFetch.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return weatherData;
}

// Handler for direct HTTP requests
export async function onRequest(context: {
  request: Request;
  env: Env;
  ctx: ExecutionContext;
}): Promise<Response> {
  try {
    const url = new URL(context.request.url);
    const cityParam = url.searchParams.get('city');
    const forceUpdate = url.searchParams.get('update') === 'true';

    // Always fetch fresh data if update=true is specified
    if (forceUpdate) {
      // Fetch fresh data for all cities
      const weatherData = await fetchWeatherData(context.env, cityParam);

      // Store the data in KV regardless of whether a specific city was requested
      if (!cityParam) {
        await context.env.WEATHER_KV.put(
          'philippines_weather',
          JSON.stringify(weatherData),
          {
            expirationTtl: 3600, // Expire after 1 hour
          }
        );
      } else if (cityParam && weatherData[normalizeCityKey(cityParam)]) {
        // If a specific city was requested and found, update just that city in the KV store
        const existingData =
          ((await context.env.WEATHER_KV.get('philippines_weather', {
            type: 'json',
          })) as WeatherResponseData) || {};
        const cityKey = normalizeCityKey(cityParam);
        existingData[cityKey] = weatherData[cityKey];
        await context.env.WEATHER_KV.put(
          'philippines_weather',
          JSON.stringify(existingData),
          {
            expirationTtl: 3600, // Expire after 1 hour
          }
        );
      }

      // Return the fresh data
      return new Response(JSON.stringify(weatherData), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'max-age=3600',
        },
      });
    }

    // Check if data exists in KV and is not expired
    const cachedData = (await context.env.WEATHER_KV.get(
      'philippines_weather',
      { type: 'json' }
    )) as WeatherResponseData | null;

    // If city parameter is provided, filter the data
    if (cityParam && cachedData) {
      const cityKey = normalizeCityKey(cityParam);
      if (cachedData[cityKey]) {
        return new Response(
          JSON.stringify({ [cityKey]: cachedData[cityKey] }),
          {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'max-age=3600',
            },
          }
        );
      }
    }

    // If we have cached data for all cities and no specific city is requested, return it
    if (cachedData && !cityParam) {
      return new Response(JSON.stringify(cachedData), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'max-age=3600',
        },
      });
    }

    // If we reach here, either:
    // 1. No cached data exists
    // 2. A specific city was requested that wasn't in the cache
    // 3. The cached data has expired
    // So we fetch fresh data
    const weatherData = await fetchWeatherData(context.env, cityParam);

    // Store the data in KV
    if (!cityParam) {
      await context.env.WEATHER_KV.put(
        'philippines_weather',
        JSON.stringify(weatherData),
        {
          expirationTtl: 3600, // Expire after 1 hour
        }
      );
    } else if (cityParam && weatherData[normalizeCityKey(cityParam)]) {
      // If a specific city was requested and found, update just that city in the KV store
      const existingData =
        ((await context.env.WEATHER_KV.get('philippines_weather', {
          type: 'json',
        })) as WeatherResponseData) || {};
      const cityKey = normalizeCityKey(cityParam);
      existingData[cityKey] = weatherData[cityKey];
      await context.env.WEATHER_KV.put(
        'philippines_weather',
        JSON.stringify(existingData),
        {
          expirationTtl: 3600, // Expire after 1 hour
        }
      );
    }

    // Return the response
    return new Response(JSON.stringify(weatherData), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'max-age=3600',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

export async function scheduled(controller: ScheduledController, env: Env) {
  try {
    // Fetch weather data for all cities
    const weatherData = await fetchWeatherData(env);

    // Store the data in Cloudflare KV
    await env.WEATHER_KV.put(
      'philippines_weather',
      JSON.stringify(weatherData),
      {
        expirationTtl: 3600 * 6, // Expire after 6 hours
      }
    );

    return {
      success: true,
      message: `Weather data updated for ${Object.keys(weatherData).length} Philippine cities`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error in weather scheduled function:', error);
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}
