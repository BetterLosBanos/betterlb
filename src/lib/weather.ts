import { WeatherData, HourlyForecast } from '../types';
import { fetchWithCache } from './api';

/**
 * Map OpenWeatherMap icon codes to Lucide icon names
 */
export const mapWeatherIconToLucide = (iconCode: string): string => {
  const iconMap: Record<string, string> = {
    '01d': 'Sun',
    '01n': 'Moon',
    '02d': 'CloudSun',
    '02n': 'CloudMoon',
    '03d': 'Cloud',
    '03n': 'Cloud',
    '04d': 'Cloud',
    '04n': 'Cloud',
    '09d': 'CloudDrizzle',
    '09n': 'CloudDrizzle',
    '10d': 'CloudRain',
    '10n': 'CloudRain',
    '11d': 'CloudLightning',
    '11n': 'CloudLightning',
    '13d': 'CloudSnow',
    '13n': 'CloudSnow',
    '50d': 'Cloud',
    '50n': 'Cloud',
  };
  return iconMap[iconCode] || 'Cloud';
};

/**
 * Fetch weather data for Los Baños and transform to frontend type
 */
export const fetchWeatherData = async (): Promise<WeatherData[]> => {
  // Always fetch the specific city
  let data = await fetchWithCache('/api/weather?city=Los%20Baños');

  // If KV is empty or city missing, fallback to update
  if (!data || Object.keys(data).length === 0 || !data['los_baños']) {
    data = await fetchWithCache('/api/weather?update=true');
  }

  const city = data['los_baños'];
  if (!city) {
    // Fallback in case API completely failed
    console.warn('No weather data returned for Los Baños');
    return [];
  }

  // Transform 3-hour forecast (first 4 entries)
  const hourly: HourlyForecast[] = (city.hourly || [])
    .slice(0, 4)
    .map((h: HourlyForecast) => ({
      hour: new Date(h.dt * 1000).toLocaleTimeString([], {
        hour: 'numeric',
        hour12: true,
      }),
      temperature: Math.round(h.temp),
      icon: mapWeatherIconToLucide(h.icon),
    }));

  const weatherData: WeatherData = {
    location: city.name || 'Los Baños',
    temperature: Math.round(city.main?.temp ?? 0),
    condition: city.weather?.[0]?.description ?? 'Unknown',
    humidity: city.main?.humidity ?? 0,
    windSpeed: city.wind?.speed ?? 0,
    icon: mapWeatherIconToLucide(city.weather?.[0]?.icon ?? '01d'),
    hourly,
    pressure: city.main?.pressure ?? 0,
    visibility: Math.round((city.visibility ?? 0) / 1000),
  };

  return [weatherData];
};
