import { useEffect, useState } from 'react';

import { HourlyForecast, WeatherData } from '@/types';
import L from 'leaflet';
// Fix Leaflet default marker icon issue in Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import {
  Cloud,
  CloudDrizzle,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplet,
  LoaderIcon,
  MapPin,
  Moon,
  Sun,
  Wind,
} from 'lucide-react';

import { fetchWeatherData } from '@/lib/weather';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Map Lucide string to actual component
const lucideIconMap: Record<string, any> = {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudDrizzle,
  CloudRain,
  CloudLightning,
  CloudSnow,
};

interface LeafletHTMLElement extends HTMLElement {
  _leaflet_id?: number;
}

export default function WeatherMapSection() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch weather data
  useEffect(() => {
    const getWeather = async () => {
      try {
        setLoading(true);
        const data = await fetchWeatherData(); // WeatherData[]
        const losBanos = data[0]; // Only 1 city
        setWeather(losBanos);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getWeather();
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    const container = document.getElementById('map-container');
    if (!container) {
      console.log('Map: Container not found');
      return;
    }

    // If map already exists, clean it up first
    const containerLeaflet = container as LeafletHTMLElement;
    if (containerLeaflet._leaflet_id) {
      containerLeaflet.innerHTML = '';
      delete containerLeaflet._leaflet_id;
    }

    let mapInstance: L.Map | null = null;

    // Check if Leaflet is available
    if (typeof L === 'undefined') {
      console.error('Map: Leaflet not loaded');
      return;
    }

    try {
      console.log('Map: Initializing Leaflet...');

      // Create the map
      mapInstance = L.map(container, {
        center: [14.1763, 121.2219],
        zoom: 15,
        scrollWheelZoom: false,
        zoomControl: true,
        keyboard: true,
        keyboardPanDelta: 80,
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstance);

      // Add marker
      const marker = L.marker([14.1763, 121.2219]).addTo(mapInstance);
      marker.bindPopup(
        '<strong>Los Baños Municipal Hall</strong><br>Laguna, Philippines'
      );

      // Force resize after a short delay to ensure proper rendering
      setTimeout(() => {
        if (mapInstance) {
          mapInstance.invalidateSize();
          console.log('Map: Initial resize complete');
        }
      }, 100);

      // Another resize after tiles might have loaded
      setTimeout(() => {
        if (mapInstance) {
          mapInstance.invalidateSize();
          console.log('Map: Secondary resize complete');
        }
      }, 500);

      console.log('Map: Leaflet initialized successfully');
    } catch (error) {
      console.error('Map: Initialization failed:', error);
    }

    return () => {
      if (mapInstance) {
        console.log('Map: Cleaning up map instance');
        try {
          mapInstance.remove();
        } catch (e) {
          console.warn('Map: Cleanup warning:', e);
        }
      }
    };
  }, []);

  // Safe hourly forecast
  const hourlyForecast: HourlyForecast[] =
    weather?.hourly && weather.hourly.length > 0
      ? weather.hourly.slice(0, 4)
      : Array.from({ length: 4 }, (_, i) => ({
          hour: `${i + 1}PM`,
          temperature: weather?.temperature ?? 30,
          icon: weather?.icon ?? 'Sun',
        }));

  const WeatherIcon = weather ? lucideIconMap[weather.icon || 'Sun'] : Sun;

  return (
    <section className='border-t border-slate-200 bg-slate-50 py-16'>
      <div className='container mx-auto max-w-6xl px-4'>
        <div className='mb-10 text-center'>
          <h2 className='text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl'>
            Weather and Map of Los Baños
          </h2>
        </div>

        <div className='flex gap-6'>
          {/* Weather Card */}
          <div className='min-w-[200px] flex-1'>
            <div className='flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md'>
              {loading ? (
                <div className='flex items-center gap-2 text-slate-500'>
                  <LoaderIcon className='h-5 w-5 animate-spin' />
                  Loading weather...
                </div>
              ) : error ? (
                <p className='text-red-500'>{error}</p>
              ) : weather ? (
                <>
                  {/* Top: Temp & Condition */}
                  <div className='flex items-center gap-4'>
                    <WeatherIcon className='text-primary-600 h-14 w-14 shrink-0' />
                    <div className='flex flex-col gap-1'>
                      <div className='text-5xl font-bold text-slate-900'>
                        {weather.temperature}°C
                      </div>
                      <div className='text-base text-slate-600 capitalize'>
                        {weather.condition}
                      </div>
                      <div className='mt-1 flex items-center gap-2 text-sm text-slate-500'>
                        <MapPin className='h-4 w-4' />
                        Los Baños, Laguna
                      </div>
                    </div>
                  </div>
                  {/* Middle: Humidity & Wind */}
                  <div className='mt-2 flex justify-center gap-8 text-sm text-slate-700'>
                    <div className='flex items-center gap-2'>
                      <Droplet className='h-4 w-4 text-blue-500' />
                      {weather.humidity}%
                    </div>
                    <div className='flex items-center gap-2'>
                      <Wind className='h-4 w-4 text-slate-400' />
                      {weather.windSpeed} m/s
                    </div>
                  </div>

                  {/* Bottom: Hourly forecast */}
                  <div className='mt-4 flex justify-between gap-2'>
                    {hourlyForecast.map((h, idx) => {
                      const IconComp = lucideIconMap[h.icon] || Sun;
                      return (
                        <div
                          key={idx}
                          className='hover:bg-primary-50 flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-xl bg-slate-100 p-3 transition-all duration-200 hover:-translate-y-0.5'
                        >
                          <IconComp className='text-primary-600 h-6 w-6' />
                          <div className='text-base font-bold'>
                            {h.temperature}°
                          </div>
                          <div className='text-xs text-slate-500'>{h.hour}</div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className='text-slate-500'>No weather data available.</p>
              )}
            </div>
          </div>

          {/* Map Card with Bottom Attribution */}
          <div className='flex min-w-[300px] flex-[2.5] flex-col overflow-hidden rounded-xl shadow-sm hover:shadow-md'>
            {/* Map Container */}
            <div
              id='map-container'
              className='w-full flex-1'
              role='application'
              aria-label='Interactive map of Los Baños Municipal Hall'
            >
              <noscript>
                <div className='p-4 text-sm text-gray-500'>
                  JavaScript is required to view the interactive map.
                  <a
                    href='https://www.openstreetmap.org/?mlat=14.1647&mlon=121.2436#map=15/14.1647/121.2436'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-primary-600 ml-1 underline'
                  >
                    View Los Baños Municipal Hall on OpenStreetMap
                  </a>
                </div>
              </noscript>
            </div>
            <div className='flex items-center gap-2 border-t border-slate-300 bg-white p-3'>
              <MapPin className='text-primary-600 h-5 w-5' />
              <span className='text-sm font-medium text-slate-700'>
                Los Baños Municipal Hall
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
