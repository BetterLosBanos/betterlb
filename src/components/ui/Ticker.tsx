import { FC, useEffect, useState } from 'react';

import {
  DollarSignIcon,
  EuroIcon,
  JapaneseYenIcon,
  LoaderIcon,
  PoundSterlingIcon,
} from 'lucide-react';

import { fetchForexData, getCurrencyIconName } from '../../lib/forex';
import { fetchWeatherData } from '../../lib/weather';
import { ForexRate, WeatherData } from '../../types';

const getCurrencyIcon = (code: string) => {
  const iconName = getCurrencyIconName(code);
  switch (iconName) {
    case 'DollarSign':
      return <DollarSignIcon className='h-4 w-4' />;
    case 'JapaneseYen':
      return <JapaneseYenIcon className='h-4 w-4' />;
    case 'Euro':
      return <EuroIcon className='h-4 w-4' />;
    case 'PoundSterling':
      return <PoundSterlingIcon className='h-4 w-4' />;
    default:
      return null;
  }
};

const Ticker: FC = () => {
  const [forexRates, setForexRates] = useState<ForexRate[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [currentRateIndex, setCurrentRateIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    const getForexData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const transformedData = await fetchForexData([
          'USD',
          'EUR',
          'JPY',
          'GBP',
        ]);
        setForexRates(transformedData);
      } catch (error) {
        console.error('Error fetching forex data:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to fetch forex data'
        );
      } finally {
        setIsLoading(false);
      }
    };

    getForexData();
  }, []);

  useEffect(() => {
    const getWeatherData = async () => {
      try {
        setWeatherLoading(true);
        setWeatherError(null);
        const data = await fetchWeatherData();
        setWeatherData(data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setWeatherError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch weather data'
        );
      } finally {
        setWeatherLoading(false);
      }
    };

    getWeatherData();
  }, []);

  useEffect(() => {
    if (forexRates.length === 0) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentRateIndex(prevIndex => (prevIndex + 1) % forexRates.length);
        setIsAnimating(false);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, [forexRates.length]);

  if (isLoading && weatherLoading) {
    return (
      <div className='text-kapwa-text-inverse bg-(--color-bg-kapwa-bg-brand-default) px-4 py-1'>
        <div className='container mx-auto flex items-center justify-center'>
          <LoaderIcon className='mr-2 h-4 w-4 animate-spin' />
          <span className='text-xs'>Loading data...</span>
        </div>
      </div>
    );
  }

  if (
    (error && weatherError) ||
    (forexRates.length === 0 && weatherData.length === 0)
  ) {
    return null;
  }

  const currentRate = forexRates[currentRateIndex];

  if (!currentRate) return null;

  return (
    <div className='bg-kapwa-blue-950 py-1.5'>
      <div className='container mx-auto flex justify-end px-4'>
        <div className='flex items-center justify-end'>
          {/* Forex ticker */}
          <div className='flex-1 overflow-hidden pr-4'>
            <div className='relative flex h-6 items-center'>
              <div
                className={`flex items-center transition-all duration-200 ${
                  isAnimating
                    ? 'translate-y-2 opacity-0'
                    : 'translate-y-0 opacity-100'
                }`}
              >
                <div className='inline-flex items-center space-x-1'>
                  <span className='text-kapwa-yellow-500 opacity-80'>
                    {getCurrencyIcon(currentRate.code)}
                  </span>
                  <span className='text-kapwa-text-inverse text-xs font-medium'>
                    {currentRate.code}
                  </span>
                  <span className='text-kapwa-text-inverse text-xs opacity-90'>
                    ₱{currentRate.rate.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Weather information */}
          <div className='flex items-center space-x-6 border-l border-white/20 pl-4'>
            {weatherLoading ? (
              <div className='flex items-center space-x-2'>
                <LoaderIcon className='text-kapwa-text-inverse h-3 w-3 animate-spin opacity-80' />
                <span className='text-kapwa-text-inverse text-xs opacity-80'>
                  Loading weather...
                </span>
              </div>
            ) : weatherError ? (
              <div className='flex items-center space-x-2'>
                <span className='text-kapwa-text-inverse text-xs opacity-80'>
                  Weather unavailable
                </span>
              </div>
            ) : (
              weatherData.slice(0, 4).map(data => (
                <div
                  key={data.location}
                  className='flex flex-col items-center justify-center space-x-0 uppercase sm:flex-row sm:space-x-2'
                >
                  <span className='text-kapwa-text-inverse text-xs font-medium opacity-90'>
                    {data.location}
                  </span>
                  <span className='text-kapwa-text-inverse text-xs'>
                    {data.temperature}°C
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ticker;
