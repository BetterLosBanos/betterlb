import { FC, useEffect, useState } from 'react';

import * as LucideIcons from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { fetchForexData } from '../../lib/forex';
import { fetchWeatherData } from '../../lib/weather';
import { ForexRate, WeatherData } from '../../types';
import { Card, CardContent, CardHeader } from '../ui/Card';
import CriticalHotlinesWidget from '../widgets/CriticalHotlinesWidget';

const InfoWidgets: FC = () => {
  const { t } = useTranslation('common');
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [forexRates, setForexRates] = useState<ForexRate[]>([]);
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(true);
  const [isLoadingForex, setIsLoadingForex] = useState<boolean>(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [forexError, setForexError] = useState<string | null>(null);

  // Function to get weather icon component
  const getWeatherIcon = (iconName: string) => {
    const Icon = LucideIcons[iconName as keyof typeof LucideIcons];
    return Icon ? <Icon className='h-8 w-8' /> : null;
  };

  // Fetch weather data
  useEffect(() => {
    const getWeatherData = async () => {
      try {
        setIsLoadingWeather(true);
        setWeatherError(null);

        const transformedData = await fetchWeatherData();
        setWeatherData(transformedData);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setWeatherError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch weather data'
        );
      } finally {
        setIsLoadingWeather(false);
      }
    };

    getWeatherData();
  }, []);

  // Fetch forex data
  useEffect(() => {
    const getForexData = async () => {
      try {
        setIsLoadingForex(true);
        setForexError(null);

        // Get forex data for the top 6 currencies
        const transformedData = await fetchForexData([
          'USD',
          'EUR',
          'JPY',
          'GBP',
          'AUD',
          'SGD',
        ]);
        setForexRates(transformedData);
      } catch (error) {
        console.error('Error fetching forex data:', error);
        setForexError(
          error instanceof Error ? error.message : 'Failed to fetch forex data'
        );
      } finally {
        setIsLoadingForex(false);
      }
    };

    getForexData();
  }, []);

  return (
    <section className='bg-gray-50 py-12'>
      <div className='container mx-auto px-4'>
        <div className='mb-12 text-center'>
          <h2 className='mb-4 text-3xl font-bold text-gray-900'>
            {t('data.title')}
          </h2>
          <p className='mx-auto max-w-2xl text-lg text-gray-800'>
            {t('data.description')}
          </p>
        </div>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Weather Widget */}
          <Card>
            <CardHeader className='bg-primary-50'>
              <h3 className='flex items-center text-xl font-semibold text-gray-900'>
                <LucideIcons.Cloud className='text-primary-600 mr-2 h-5 w-5' />
                {t('weather.title')}
              </h3>
            </CardHeader>
            <CardContent className='@container'>
              {isLoadingWeather ? (
                <div className='flex h-40 items-center justify-center'>
                  <LucideIcons.Loader className='text-primary-600 h-8 w-8 animate-spin' />
                </div>
              ) : weatherError ? (
                <div className='p-4 text-center text-red-500'>
                  <LucideIcons.AlertCircle className='mx-auto mb-2 h-8 w-8' />
                  <p>{weatherError}</p>
                </div>
              ) : (
                <div className='grid grid-cols-2 gap-4 @md:grid-cols-4'>
                  {weatherData.map(location => (
                    <div
                      key={location.location}
                      className='flex flex-col items-center rounded-lg border border-gray-100 bg-white p-3 uppercase'
                    >
                      <div className='text-accent-500 mb-1'>
                        {getWeatherIcon(location.icon)}
                      </div>
                      <div className='text-lg font-semibold'>
                        {location.location}
                      </div>
                      <div className='text-2xl font-bold'>
                        {location.temperature}°C
                      </div>
                      <div className='text-center text-sm text-gray-800'>
                        {location.condition}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className='space-between flex w-full items-center'>
                <p className='mt-4 text-right text-sm text-gray-700'>
                  Weather data provided by{' '}
                  <a
                    href='https://openweathermap.org/'
                    className='text-gray-800 underline hover:text-gray-900'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    OpenWeather
                  </a>
                </p>
                <div className='mt-4 flex-1 text-right'>
                  <a
                    href='/data/weather'
                    className='text-primary-600 text-sm hover:underline'
                  >
                    Detailed Forecast
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Forex Widget */}
          <Card>
            <CardHeader className='bg-primary-50'>
              <h3 className='flex items-center text-xl font-semibold text-gray-900'>
                <LucideIcons.BarChart3 className='text-primary-600 mr-2 h-5 w-5' />
                {t('forex.title')}
              </h3>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-800 uppercase'>
                        Currency
                      </th>
                      <th className='px-3 py-3 text-right text-xs font-medium tracking-wider text-gray-800 uppercase'>
                        ₱ Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200 bg-white'>
                    {isLoadingForex ? (
                      <tr>
                        <td colSpan={3} className='px-3 py-8 text-center'>
                          <LucideIcons.Loader className='text-primary-600 mx-auto h-6 w-6 animate-spin' />
                        </td>
                      </tr>
                    ) : forexError ? (
                      <tr>
                        <td
                          colSpan={3}
                          className='px-3 py-4 text-center text-red-500'
                        >
                          <LucideIcons.AlertCircle className='mx-auto mb-2 h-6 w-6' />
                          <p>{forexError}</p>
                        </td>
                      </tr>
                    ) : forexRates.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className='px-3 py-4 text-center text-gray-800'
                        >
                          No forex data available
                        </td>
                      </tr>
                    ) : (
                      forexRates.map(rate => (
                        <tr key={rate.code} className='hover:bg-gray-50'>
                          <td className='px-3 py-2 whitespace-nowrap'>
                            <div className='flex items-center'>
                              <div className='font-medium text-gray-900'>
                                {rate.code}
                              </div>
                              <div className='ml-2 text-sm text-gray-800'>
                                {rate.currency}
                              </div>
                            </div>
                          </td>
                          <td className='px-3 py-2 text-right text-sm font-medium whitespace-nowrap'>
                            ₱{rate.rate.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className='mt-4 text-right'>
                <a
                  href='/data/forex'
                  className='text-primary-600 text-sm hover:underline'
                >
                  More Currencies
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Hotlines Widget */}
          <div className='lg:col-span-1'>
            <CriticalHotlinesWidget maxItems={4} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoWidgets;
