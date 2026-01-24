/**
 * Weather endpoint that fetches current weather + 3-hour forecast
 */
import { Env, WeatherData, HourlyForecast } from '../types';

const CITIES = [
  { name: 'Los Baños', lat: 14.1763, lon: 121.2219 },
];

async function fetchWeatherData(
  lat: number,
  lon: number,
  apiKey: string
): Promise<WeatherData> {
  // Fetch current weather
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  const currentResponse = await fetch(currentUrl);
  
  if (!currentResponse.ok) {
    throw new Error(`Weather API error: ${currentResponse.statusText}`);
  }
  
  const currentData: any = await currentResponse.json();

  // Fetch 3-hour forecast (5 day / 3 hour forecast)
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  const forecastResponse = await fetch(forecastUrl);
  
  let hourly: HourlyForecast[] = [];
  
  if (forecastResponse.ok) {
    const forecastJson: any = await forecastResponse.json();
    // Take first 4 entries (next 12 hours in 3-hour intervals)
    const forecastList = forecastJson.list?.slice(0, 4) || [];
    
    hourly = forecastList.map((entry: any) => ({
      dt: entry.dt,
      temp: entry.main.temp,
      icon: entry.weather[0].icon,
    }));
  }

  return {
    name: currentData.name,
    main: currentData.main,
    weather: currentData.weather,
    wind: currentData.wind,
    clouds: currentData.clouds,
    dt: currentData.dt,
    hourly,
  };
}

export async function onRequest(context: {
  request: Request;
  env: Env;
  ctx: ExecutionContext;
}): Promise<Response> {
  try {
    const url = new URL(context.request.url);
    const cityParam = url.searchParams.get('city');
    const update = url.searchParams.get('update');

    // Check if we should fetch fresh data
    if (update === 'true') {
      const apiKey = context.env.OPENWEATHERMAP_API_KEY;
      
      if (!apiKey) {
        return new Response(
          JSON.stringify({
            error: 'OpenWeatherMap API key not configured',
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      // Fetch weather for all cities
      const weatherPromises = CITIES.map(city =>
        fetchWeatherData(city.lat, city.lon, apiKey)
      );
      
      const weatherResults = await Promise.all(weatherPromises);
      
      // Store in KV with city name as key
      const weatherData: Record<string, WeatherData> = {};
      weatherResults.forEach((data, index) => {
        const cityKey = CITIES[index].name.toLowerCase().replace(/\s+/g, '_');
        weatherData[cityKey] = data;
      });

      // Cache for 1 hour
      await context.env.WEATHER_KV.put(
        'philippines_weather',
        JSON.stringify(weatherData),
        { expirationTtl: 3600 }
      );

      return new Response(JSON.stringify(weatherData), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'max-age=3600',
        },
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
            'Access-Control-Allow-Origin': '*',
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
              'Access-Control-Allow-Origin': '*',
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
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }
    }

    // Return all data if no city specified
    return new Response(JSON.stringify(cachedData), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'max-age=3600',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: (error as Error).message,
        stack: (error as Error).stack,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}