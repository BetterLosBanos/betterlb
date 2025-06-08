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
  const apiKey = import.meta.env.OPENWEATHERMAP_API_KEY;
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

// Function for scheduled execution
export async function onScheduled(event) {
  try {
    // Fetch weather data for all cities
    const weatherData = await fetchWeatherData(event.env);

    // Store the data in Cloudflare KV
    await event.env.WEATHER_KV.put('philippines_weather', JSON.stringify(weatherData), {
      expirationTtl: 3600 // Expire after 1 hour
    });

    return {
      success: true,
      message: `Weather data updated for ${Object.keys(weatherData).length} Philippine cities`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in weather function:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Function for direct API access
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const city = url.searchParams.get('city');

  try {
    // Try to get cached data first if no specific city is requested
    if (!city) {
      const cachedData = await env.WEATHER_KV.get('philippines_weather');
      if (cachedData) {
        return new Response(cachedData, {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // If no cached data or specific city requested, fetch fresh data
    const weatherData = await fetchWeatherData(env, city);

    return new Response(JSON.stringify(weatherData), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Trigger function every hour
export const scheduled = {
  cron: '0 * * * *' // Run every hour at minute 0
};
