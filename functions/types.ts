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

export interface HourlyForecast {
  dt: number;
  temp: number;
  icon: string;
}

export interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: { speed: number; deg: number };
  clouds: { all: number };
  dt: number;
  hourly?: HourlyForecast[];
}
