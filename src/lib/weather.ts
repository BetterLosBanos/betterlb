import { HourlyForecast, WeatherData } from '../types';
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
 * Fetch weather data from API and transform to front-end type
 */
export const fetchWeatherData = async (): Promise<WeatherData[]> => {
  const data = await fetchWithCache('/api/weather');
  const cityKey = Object.keys(data)[0]; // Only 1 city
  const city = data[cityKey];

  // Transform 3-hour forecast data
  const hourly: HourlyForecast[] = (city.hourly || [])
    .slice(0, 4)
    .map((h: any) => ({
      hour: new Date(h.dt * 1000).toLocaleTimeString([], {
        hour: 'numeric',
        hour12: true,
      }),
      temperature: Math.round(h.temp),
      icon: mapWeatherIconToLucide(h.icon),
    }));

  const weatherData: WeatherData = {
    location: city.name || cityKey,
    temperature: Math.round(city.main.temp),
    condition: city.weather[0].description,
    humidity: city.main.humidity,
    windSpeed: city.wind.speed,
    icon: mapWeatherIconToLucide(city.weather[0].icon),
    hourly,
  };

  return [weatherData];
};
