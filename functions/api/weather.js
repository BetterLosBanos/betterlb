// Major Philippine cities with their coordinates (latitude, longitude)
const PHILIPPINE_CITIES = [
  { name: 'Manila', lat: 14.5995, lon: 120.9842 },
  { name: 'Cebu', lat: 10.3157, lon: 123.8854 },
  { name: 'Davao', lat: 7.1907, lon: 125.4553 },
  { name: 'Baguio', lat: 16.4023, lon: 120.5960 }
];

// Map of city names to their coordinates for quick lookup
const CITY_COORDINATES = PHILIPPINE_CITIES.reduce((map, city) => {
  map[city.name.toLowerCase()] = { lat: city.lat, lon: city.lon };
  return map;
}, {});

// Core function to fetch weather data using OpenWeatherMap API
async function fetchWeatherData(env, specificCity = null) {
  // Get API key from environment variable
  const apiKey = env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) {
    throw new Error('OpenWeatherMap API key not found in environment variables');
  }

  // Determine which cities to fetch
  const citiesToFetch = specificCity
    ? [specificCity.toLowerCase()].filter(city => CITY_COORDINATES[city])
    : PHILIPPINE_CITIES.map(city => city.name.toLowerCase());

  // Fetch weather data for cities
  const weatherData = {};

  for (const cityName of citiesToFetch) {
    try {
      const coords = CITY_COORDINATES[cityName];
      if (!coords) {
        console.error(`No coordinates found for city: ${cityName}`);
        continue;
      }

      // Use the standard weather API with coordinates
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&units=metric&appid=${apiKey}`
      );

      if (!response.ok) {
        console.error(`Failed to fetch weather data for ${cityName}: ${response.statusText}`);
        continue;
      }

      const data = await response.json();

      // Format the response data based on the example format
      weatherData[cityName] = {
        city: data.name || cityName.charAt(0).toUpperCase() + cityName.slice(1),
        coordinates: data.coord || { lat: coords.lat, lon: coords.lon },
        weather: data.weather || [],
        main: data.main || {
          temp: 0,
          feels_like: 0,
          temp_min: 0,
          temp_max: 0,
          pressure: 0,
          humidity: 0
        },
        visibility: data.visibility || 0,
        wind: data.wind || { speed: 0, deg: 0 },
        clouds: data.clouds || { all: 0 },
        rain: data.rain || {},
        dt: data.dt || Math.floor(Date.now() / 1000),
        sys: data.sys || {},
        timezone: data.timezone || 0,
        id: data.id || 0,
        timestamp: new Date().toISOString()
      };

      // Add a small delay to avoid rate limiting
      if (citiesToFetch.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (cityError) {
      console.error(`Error fetching data for ${cityName}:`, cityError);
    }
  }

  return weatherData;
}


// Handler for direct HTTP requests
export async function onRequest(context) {
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
        await context.env.WEATHER_KV.put('philippines_weather', JSON.stringify(weatherData), {
          expirationTtl: 3600 // Expire after 1 hour
        });
      } else if (cityParam && weatherData[cityParam.toLowerCase()]) {
        // If a specific city was requested and found, update just that city in the KV store
        const existingData = await context.env.WEATHER_KV.get('philippines_weather', { type: 'json' }) || {};
        existingData[cityParam.toLowerCase()] = weatherData[cityParam.toLowerCase()];
        await context.env.WEATHER_KV.put('philippines_weather', JSON.stringify(existingData), {
          expirationTtl: 3600 // Expire after 1 hour
        });
      }

      // Return the fresh data
      return new Response(JSON.stringify(cityParam ? weatherData[cityParam.toLowerCase()] || {} : weatherData), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'max-age=3600'
        }
      });
    }

    // Check if data exists in KV and is not expired
    const cachedData = await context.env.WEATHER_KV.get('philippines_weather', { type: 'json' });

    // If city parameter is provided, filter the data
    if (cityParam && cachedData) {
      const cityKey = cityParam.toLowerCase();
      if (cachedData[cityKey]) {
        return new Response(JSON.stringify({ [cityKey]: cachedData[cityKey] }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'max-age=3600'
          }
        });
      }
    }

    // If we have cached data for all cities and no specific city is requested, return it
    if (cachedData && !cityParam) {
      return new Response(JSON.stringify(cachedData), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'max-age=3600'
        }
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
      await context.env.WEATHER_KV.put('philippines_weather', JSON.stringify(weatherData), {
        expirationTtl: 3600 // Expire after 1 hour
      });
    } else if (cityParam && weatherData[cityParam.toLowerCase()]) {
      // If a specific city was requested and found, update just that city in the KV store
      const existingData = await context.env.WEATHER_KV.get('philippines_weather', { type: 'json' }) || {};
      existingData[cityParam.toLowerCase()] = weatherData[cityParam.toLowerCase()];
      await context.env.WEATHER_KV.put('philippines_weather', JSON.stringify(existingData), {
        expirationTtl: 3600 // Expire after 1 hour
      });
    }

    // Return the response
    return new Response(JSON.stringify(cityParam ? weatherData[cityParam.toLowerCase()] || {} : weatherData), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'max-age=3600'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function scheduled(controller, env, ctx) {
  try {
    // Fetch weather data for all cities
    const weatherData = await fetchWeatherData(env);

    // Store the data in Cloudflare KV
    await env.WEATHER_KV.put('philippines_weather', JSON.stringify(weatherData), {
      expirationTtl: 3600 * 6 // Expire after 6 hours
    });

    return {
      success: true,
      message: `Weather data updated for ${Object.keys(weatherData).length} Philippine cities`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in weather scheduled function:', error);
    return {
      success: false,
      error: error.message
    };
  }
}