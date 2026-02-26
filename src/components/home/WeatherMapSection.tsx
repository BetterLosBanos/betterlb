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
  LucideIcon,
  MapPin,
  Moon,
  Sun,
  Wind,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/Card';

import { config } from '@/lib/lguConfig';
import { fetchWeatherData } from '@/lib/weather';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Map Lucide string to actual component
const lucideIconMap: Record<string, LucideIcon> = {
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
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch weather data'
        );
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
        center: [
          config.location.coordinates.lat,
          config.location.coordinates.lon,
        ],
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
      const marker = L.marker([
        config.location.coordinates.lat,
        config.location.coordinates.lon,
      ]).addTo(mapInstance);
      const popupContent = document.createElement('div');
      popupContent.textContent = `${config.lgu.fullName} Municipal Hall`;
      const popupSub = document.createElement('div');
      popupSub.textContent = `${config.lgu.province}, Philippines`;
      popupContent.appendChild(popupSub);
      marker.bindPopup(popupContent);

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
    <section className='border-kapwa-border-weak border-t py-12 bg-kapwa-bg-surface'>
      <div className='container px-4 mx-auto'>
        {/* Header - restored */}
        <div className='mb-12 text-center'>
          <h2 className='text-2xl font-bold md:text-3xl text-kapwa-text-strong'>
            Weather and Map of {config.lgu.name}
          </h2>
        </div>

        <div className='flex flex-col items-stretch gap-6 md:flex-row'>
          {/* Weather Card - using Card component */}
          <Card className='w-full flex-1 md:min-w-[200px]'>
            <CardContent className='p-4 md:p-6'>
              {loading ? (
                <div className='text-kapwa-text-disabled flex items-center gap-2'>
                  <LoaderIcon className='h-5 w-5 animate-spin' />
                  Loading weather...
                </div>
              ) : error ? (
                <p className='text-red-500'>{error}</p>
              ) : weather ? (
                <>
                  {/* Top: Temp & Condition */}
                  <div className='flex items-center gap-4 mb-4'>
                    <WeatherIcon className='text-kapwa-text-brand h-14 w-14 shrink-0' />
                    <div className='flex flex-col gap-1'>
                      <div className='text-kapwa-text-strong text-5xl font-bold'>
                        {weather.temperature}°C
                      </div>
                      <div className='text-kapwa-text-on-disabled text-center text-base capitalize'>
                        {weather.condition}
                      </div>
                      <div className='text-kapwa-text-disabled mt-1 flex items-center gap-2 text-sm'>
                        <MapPin className='h-4 w-4' />
                        {config.lgu.name}, {config.lgu.province}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Humidity & Wind */}
                  <div className='text-kapwa-text-support flex justify-center gap-8 mb-4 text-sm'>
                    <div className='flex items-center gap-2'>
                      <Droplet className='text-kapwa-text-link h-4 w-4' />
                      {weather.humidity}%
                    </div>
                    <div className='flex items-center gap-2'>
                      <Wind className='text-kapwa-text-disabled h-4 w-4' />
                      {weather.windSpeed} m/s
                    </div>
                  </div>

                  {/* Bottom: Hourly forecast */}
                  <div className='flex justify-between gap-2'>
                    {hourlyForecast.map((h, idx) => {
                      const IconComp = lucideIconMap[h.icon] || Sun;
                      return (
                        <div
                          key={idx}
                          className='hover:bg-kapwa-bg-surface-brand bg-kapwa-bg-hover flex w-full flex-col items-center gap-1.5 rounded-xl p-2 transition-all duration-200 hover:-translate-y-0.5 sm:flex-1 sm:p-3'
                        >
                          <IconComp className='text-kapwa-text-brand h-6 w-6' />
                          <div className='text-base font-bold'>
                            {h.temperature}°
                          </div>
                          <div className='text-kapwa-text-disabled text-xs'>
                            {h.hour}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className='text-kapwa-text-strong'>
                  No weather data available.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Map Container */}
          <div className='flex w-full flex-col overflow-hidden rounded-xl shadow-sm hover:shadow-md md:flex-[2.5]'>
            <div
              id='map-container'
              className='h-64 w-full md:flex-1'
              role='application'
              aria-label={`Interactive map of ${config.lgu.fullName} Municipal Hall`}
            >
              <noscript>
                <div className='text-kapwa-text-disabled p-4 text-sm'>
                  JavaScript is required to view the interactive map.
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${config.location.coordinates.lat}&mlon=${config.location.coordinates.lon}#map=15/${config.location.coordinates.lat}/${config.location.coordinates.lon}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-kapwa-text-brand ml-1 underline'
                  >
                    View {config.lgu.fullName} Municipal Hall on OpenStreetMap
                  </a>
                </div>
              </noscript>
            </div>
            <div className='border-kapwa-border-weak bg-kapwa-bg-surface flex items-center gap-2 border-t p-3'>
              <MapPin className='text-kapwa-text-brand h-5 w-5' />
              <span className='text-kapwa-text-support text-sm font-medium'>
                {config.lgu.fullName} Municipal Hall
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
