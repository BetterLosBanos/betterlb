import { FC, useEffect, useState } from 'react';

import * as LucideIcons from 'lucide-react';

import { fetchWeatherData } from '../../lib/weather';
import { WeatherData } from '../../types';

const WeatherPage: FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  // Function to get weather icon component
  const getWeatherIcon = (iconName: string, size = 'h-8 w-8') => {
    const Icon = LucideIcons[iconName as keyof typeof LucideIcons];
    return Icon ? <Icon className={size} /> : null;
  };

  // Fetch weather data
  useEffect(() => {
    const getWeatherData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchWeatherData();
        setWeatherData(data);

        // Set first city as selected by default
        if (data.length > 0 && !selectedCity) {
          setSelectedCity(data[0].location);
        }
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch weather data'
        );
      } finally {
        setIsLoading(false);
      }
    };

    getWeatherData();
  }, [selectedCity]);

  // Get selected city data
  const selectedCityData = weatherData.find(
    city => city.location === selectedCity
  );

  // Get weather condition description
  const getWeatherDescription = (condition: string) => {
    // Capitalize first letter of each word
    return condition
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get background class based on weather condition
  const getWeatherBackground = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('clear'))
      return 'bg-linear-to-br from-blue-400 to-blue-600';
    if (lowerCondition.includes('cloud'))
      return 'bg-linear-to-br from-gray-300 to-gray-500 text-black';
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle'))
      return 'bg-linear-to-br from-blue-600 to-blue-800';
    if (lowerCondition.includes('thunder'))
      return 'bg-linear-to-br from-gray-700 to-gray-900 text-black';
    if (lowerCondition.includes('snow'))
      return 'bg-linear-to-br from-blue-100 to-blue-300';
    if (lowerCondition.includes('mist') || lowerCondition.includes('fog'))
      return 'bg-linear-to-br from-gray-400 to-gray-600';
    return 'bg-linear-to-br from-blue-500 to-blue-700';
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        {isLoading ? (
          <div className='flex h-64 items-center justify-center'>
            <div className='border-primary-600 h-12 w-12 animate-spin rounded-full border-t-2 border-b-2'></div>
          </div>
        ) : error ? (
          <div className='rounded-sm border-l-4 border-red-500 bg-red-100 p-4 text-red-700 shadow-md'>
            <p className='font-bold'>Error</p>
            <p>{error}</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
            {/* City Selection Panel */}
            <div className='rounded-lg bg-white p-6 shadow-md'>
              <h2 className='mb-4 text-xl font-bold text-gray-800'>Cities</h2>
              <div className='space-y-2'>
                {weatherData.map(city => (
                  <button
                    key={city.location}
                    onClick={() => setSelectedCity(city.location)}
                    className={`flex w-full items-center justify-between rounded-md px-4 py-3 text-left transition-all ${
                      selectedCity === city.location
                        ? 'bg-primary-100 text-primary-800'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className='flex items-center'>
                      <span className='mr-3'>
                        {getWeatherIcon(city.icon, 'h-6 w-6')}
                      </span>
                      <span className='font-medium uppercase'>
                        {city.location}
                      </span>
                    </div>
                    <span className='text-lg font-semibold'>
                      {city.temperature}°C
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Weather Display */}
            {selectedCityData && (
              <div className='lg:col-span-2'>
                <div
                  className={`rounded-lg p-8 shadow-lg ${getWeatherBackground(
                    selectedCityData.condition
                  )}`}
                >
                  <div className='mb-8 flex flex-col items-center justify-between md:flex-row'>
                    <div>
                      <h2 className='mb-1 text-3xl font-bold uppercase'>
                        {selectedCityData.location}
                      </h2>
                      <p className='text-xl opacity-90'>
                        {getWeatherDescription(selectedCityData.condition)}
                      </p>
                    </div>
                    <div className='mt-4 flex items-center md:mt-0'>
                      {getWeatherIcon(selectedCityData.icon, 'h-16 w-16')}
                      <span className='ml-4 text-6xl font-bold'>
                        {selectedCityData.temperature}°C
                      </span>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4 text-center md:grid-cols-4'>
                    <div className='rounded-lg bg-white/20 p-4 backdrop-blur-xs'>
                      <div className='mb-1 text-black/80'>Humidity</div>
                      <div className='text-xl font-semibold'>
                        {selectedCityData.humidity}%
                      </div>
                    </div>
                    <div className='rounded-lg bg-white/20 p-4 backdrop-blur-xs'>
                      <div className='mb-1 text-black/80'>Wind</div>
                      <div className='text-xl font-semibold'>
                        {Math.round(selectedCityData.windSpeed * 3.6)} km/h
                      </div>
                    </div>
                    <div className='rounded-lg bg-white/20 p-4 backdrop-blur-xs'>
                      <div className='mb-1 text-black/80'>Pressure</div>
                      <div className='text-xl font-semibold'>
                        {selectedCityData.pressure} hPa
                      </div>
                    </div>
                    <div className='rounded-lg bg-white/20 p-4 backdrop-blur-xs'>
                      <div className='mb-1 text-black/80'>Visibility</div>
                      <div className='text-xl font-semibold'>
                        {selectedCityData.visibility} km
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weather Forecast */}
                <div className='mt-8 hidden rounded-lg bg-white p-6 shadow-md'>
                  <h3 className='mb-4 text-xl font-bold text-gray-800'>
                    5-Day Forecast
                  </h3>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-5'>
                    {[...Array(5)].map((_, index) => {
                      const date = new Date();
                      date.setDate(date.getDate() + index);
                      const dayName = date.toLocaleDateString('en-US', {
                        weekday: 'short',
                      });
                      const dayNum = date.getDate();

                      // Generate some mock forecast data
                      const mockTemp = Math.round(
                        selectedCityData.temperature + (Math.random() * 6 - 3)
                      );
                      const mockIcon =
                        index % 2 === 0 ? selectedCityData.icon : 'Cloud';

                      return (
                        <div
                          key={index}
                          className='rounded-lg bg-gray-50 p-4 text-center'
                        >
                          <p className='font-medium text-gray-800'>{dayName}</p>
                          <p className='mb-2 text-sm text-gray-800'>{dayNum}</p>
                          <div className='my-2 flex justify-center'>
                            {getWeatherIcon(mockIcon, 'h-8 w-8 text-gray-700')}
                          </div>
                          <p className='text-lg font-semibold text-gray-800'>
                            {mockTemp}°C
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Weather Information Section */}
        <div className='mt-12 rounded-lg bg-white p-6 shadow-md'>
          <h2 className='mb-4 text-2xl font-bold text-gray-800'>
            About Weather Data
          </h2>
          <p className='mb-4 text-gray-800'>
            The weather data displayed on this page is sourced from the
            Philippine Atmospheric, Geophysical and Astronomical Services
            Administration (PAGASA) and other reliable weather services. The
            information is updated regularly to provide you with the most
            accurate and current weather conditions across major Philippine
            cities.
          </p>
          <div className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div className='border-primary-500 border-l-4 pl-4'>
              <h3 className='mb-2 text-lg font-semibold text-gray-800'>
                Understanding the Data
              </h3>
              <p className='text-gray-800'>
                Temperature is displayed in Celsius (°C). Weather conditions are
                categorized based on current atmospheric observations. The
                forecast provides a 5-day outlook to help you plan ahead.
              </p>
            </div>
            <div className='border-primary-500 border-l-4 pl-4'>
              <h3 className='mb-2 text-lg font-semibold text-gray-800'>
                Weather Advisories
              </h3>
              <p className='text-gray-800'>
                For official weather advisories, warnings, and detailed
                forecasts, please visit the{' '}
                <a
                  href='https://bagong.pagasa.dost.gov.ph/'
                  className='text-primary-600 hover:underline'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  PAGASA official website
                </a>{' '}
                or follow their social media channels for real-time updates.
              </p>
            </div>
          </div>
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
        </div>
      </div>
    </div>
  );
};

export default WeatherPage;
