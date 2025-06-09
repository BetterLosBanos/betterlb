export interface Env {
  // KV Namespaces
  WEATHER_KV: KVNamespace;
  FOREX_KV: KVNamespace;
  BROWSER_KV: KVNamespace;
  
  // Environment variables
  WEATHER_API_KEY?: string;
  OPENWEATHERMAP_API_KEY?: string; // Added this to match the code
  FOREX_API_KEY?: string;
  MEILISEARCH_HOST?: string;
  MEILISEARCH_API_KEY?: string;
}

export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    uv: number;
    wind_kph: number;
    wind_dir: string;
    precip_mm: number;
  };
}

export interface ForexData {
  base: string;
  date: string;
  rates: Record<string, number>;
  timestamp: number;
}
