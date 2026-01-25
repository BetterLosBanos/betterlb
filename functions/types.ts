export interface Env {
  // KV Namespaces
  WEATHER_KV: KVNamespace;
  FOREX_KV: KVNamespace;
  BROWSER_KV: KVNamespace;

  // D1 Database
  BETTERGOV_DB: D1Database;

  // Environment variables
  WEATHER_API_KEY?: string;
  OPENWEATHERMAP_API_KEY?: string;
  FOREX_API_KEY?: string;
  MEILISEARCH_HOST?: string;
  MEILISEARCH_API_KEY?: string;
  JINA_API_KEY?: string;
  CF_ACCOUNT_ID?: string;
  CF_API_TOKEN?: string;
}

// Interface for Philippine city coordinates
export interface CityCoordinates {
  name: string;
  lat: number;
  lon: number;
}

// Interface for OpenWeatherMap API response
export interface OpenWeatherMapResponse {
  name?: string;
  coord?: { lat: number; lon: number };
  weather?: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main?: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility?: number;
  wind?: { speed: number; deg: number };
  clouds?: { all: number };
  rain?: Record<string, number>;
  dt?: number;
  sys?: Record<string, unknown>;
  timezone?: number;
  id?: number;
}

// Enhanced hourly forecast with detailed information
export interface HourlyForecast {
  dt: number;
  temp: number;
  feels_like: number;
  icon: string;
  description: string;
  humidity: number;
  wind_speed: number;
}

// Comprehensive weather data structure (API response format)
export interface WeatherData {
  name: string;
  coordinates: { lat: number; lon: number };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: { speed: number; deg: number };
  clouds: { all: number };
  rain?: Record<string, number>;
  dt: number;
  sys: Record<string, unknown>;
  timezone: number;
  id: number;
  timestamp: string;
  hourly: HourlyForecast[];
}

// Interface for weather response data (key-value map)
export interface WeatherResponseData {
  [cityName: string]: WeatherData;
}