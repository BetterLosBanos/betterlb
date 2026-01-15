import { ComponentType, FC, useEffect, useState } from 'react';

import * as LucideIcons from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { fetchForexData, getCurrencyIconName } from '../../lib/forex';
import { ForexRate } from '../../types';

const ForexPage: FC = () => {
  const [forexRates, setForexRates] = useState<ForexRate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'1W' | '1M' | '3M' | '6M' | '1Y'>(
    '1M'
  );
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [phpAmount, setPhpAmount] = useState<string>('1000');

  // Function to get currency icon
  const getCurrencyIcon = (code: string, size = 'h-6 w-6') => {
    const iconName = getCurrencyIconName(code);
    if (!iconName) return null;

    const Icon = (
      LucideIcons as unknown as Record<
        string,
        ComponentType<{ className?: string }>
      >
    )[iconName];
    return Icon ? <Icon className={size} /> : null;
  };

  // Function to get flag emoji for currency code
  const getCurrencyFlag = (code: string) => {
    const flagMap: Record<string, string> = {
      USD: '🇺🇸', // United States Dollar
      EUR: '🇪🇺', // Euro
      GBP: '🇬🇧', // British Pound
      JPY: '🇯🇵', // Japanese Yen
      AUD: '🇦🇺', // Australian Dollar
      CAD: '🇨🇦', // Canadian Dollar
      CHF: '🇨🇭', // Swiss Franc
      CNY: '🇨🇳', // Chinese Yuan
      SEK: '🇸🇪', // Swedish Krona
      NZD: '🇳🇿', // New Zealand Dollar
      MXN: '🇲🇽', // Mexican Peso
      SGD: '🇸🇬', // Singapore Dollar
      HKD: '🇭🇰', // Hong Kong Dollar
      NOK: '🇳🇴', // Norwegian Krone
      KRW: '🇰🇷', // South Korean Won
      TRY: '🇹🇷', // Turkish Lira
      RUB: '🇷🇺', // Russian Ruble
      INR: '🇮🇳', // Indian Rupee
      BRL: '🇧🇷', // Brazilian Real
      ZAR: '🇿🇦', // South African Rand
      DKK: '🇩🇰', // Danish Krone
      PLN: '🇵🇱', // Polish Zloty
      TWD: '🇹🇼', // Taiwan Dollar
      THB: '🇹🇭', // Thai Baht
      MYR: '🇲🇾', // Malaysian Ringgit
      IDR: '🇮🇩', // Indonesian Rupiah
      VND: '🇻🇳', // Vietnamese Dong
      CZK: '🇨🇿', // Czech Koruna
      HUF: '🇭🇺', // Hungarian Forint
      ILS: '🇮🇱', // Israeli Shekel
      CLP: '🇨🇱', // Chilean Peso
      PEN: '🇵🇪', // Peruvian Sol
      COP: '🇨🇴', // Colombian Peso
      BHD: '🇧🇭', // Bahraini Dinar
      KWD: '🇰🇼', // Kuwaiti Dinar
      SAR: '🇸🇦', // Saudi Riyal
      AED: '🇦🇪', // UAE Dirham
      BND: '🇧🇳', // Brunei Dollar
    };
    return flagMap[code] || '🏴';
  };

  // Fetch forex data
  useEffect(() => {
    const getForexData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get all available forex data
        const data = await fetchForexData();
        setForexRates(data);

        // Set USD as selected by default
        if (data.length > 0 && !selectedCurrency) {
          setSelectedCurrency('USD');
        }
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
  }, [selectedCurrency]);

  // Get selected currency data
  const selectedCurrencyData = forexRates.find(
    rate => rate.code === selectedCurrency
  );

  // Generate historical data based on current rate (mock data)
  const generateHistoricalData = (currentRate: number, timeframe: string) => {
    const data = [];
    let days = 30; // default to 1 month

    switch (timeframe) {
      case '1W':
        days = 7;
        break;
      case '1M':
        days = 30;
        break;
      case '3M':
        days = 90;
        break;
      case '6M':
        days = 180;
        break;
      case '1Y':
        days = 365;
        break;
      default:
        days = 30;
    }

    const today = new Date();
    const volatility = 0.02; // 2% volatility

    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      // Generate a random walk around the current rate
      const randomFactor = 1 + (Math.random() * volatility * 2 - volatility);
      const historicalRate = currentRate * randomFactor;

      data.push({
        date: date.toISOString().split('T')[0],
        rate: parseFloat(historicalRate.toFixed(4)),
      });
    }

    return data;
  };

  // Format currency name
  const formatCurrencyName = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Filter currencies based on search term
  const filteredForexRates = forexRates.filter(
    rate =>
      rate.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rate.currency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate historical data for the selected currency
  const historicalData = selectedCurrencyData
    ? generateHistoricalData(selectedCurrencyData.rate, timeframe)
    : [];

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
          <div className='grid grid-cols-1 gap-8 lg:grid-cols-4'>
            {/* Currency Selection Panel */}
            <div className='overflow-hidden rounded-lg bg-white shadow-md'>
              <div className='sticky top-0 z-10 border-b border-gray-100 bg-white p-6 pb-4'>
                {!isSearchOpen ? (
                  <div className='flex items-center justify-between'>
                    <h2 className='text-xl font-bold text-gray-800'>
                      Currencies
                    </h2>
                    <button
                      onClick={() => setIsSearchOpen(true)}
                      className='rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700'
                    >
                      <LucideIcons.Search className='h-5 w-5' />
                    </button>
                  </div>
                ) : (
                  <div className='relative'>
                    <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                      <LucideIcons.Search className='h-5 w-5 text-gray-400' />
                    </div>
                    <input
                      type='text'
                      placeholder='Search currencies...'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      onBlur={() => {
                        if (!searchTerm) {
                          setIsSearchOpen(false);
                        }
                      }}
                      autoFocus
                      className='focus:ring-primary-500 focus:border-primary-500 block w-full rounded-md border border-gray-300 bg-white py-2 pr-10 pl-10 leading-5 placeholder-gray-500 focus:placeholder-gray-400 focus:ring-1 focus:outline-none sm:text-sm'
                    />
                    <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setIsSearchOpen(false);
                        }}
                        className='text-gray-400 hover:text-gray-600'
                      >
                        <LucideIcons.X className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className='scrollbar-thin h-[520px] overflow-y-auto px-6 pb-6'>
                {filteredForexRates.length > 0 ? (
                  <div className='space-y-2 pt-2'>
                    {filteredForexRates.map(rate => (
                      <button
                        key={rate.code}
                        onClick={() => setSelectedCurrency(rate.code)}
                        className={`flex w-full cursor-pointer items-center justify-between rounded-md px-4 py-3 text-left transition-all ${
                          selectedCurrency === rate.code
                            ? 'bg-primary-100 text-primary-800'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className='flex items-center gap-3'>
                          <span className='text-2xl'>
                            {getCurrencyFlag(rate.code)}
                          </span>
                          <div>
                            <div className='font-medium'>{rate.code}</div>
                            <div className='text-xs text-gray-800'>
                              {formatCurrencyName(rate.currency)}
                            </div>
                          </div>
                        </div>
                        <span className='font-semibold'>
                          {rate.rate ? `₱${rate.rate.toFixed(2)}` : 'No Data'}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className='flex h-full flex-col items-center justify-center pt-8 text-center'>
                    <LucideIcons.SearchX className='mb-4 h-12 w-12 text-gray-400' />
                    <h3 className='mb-2 text-lg font-medium text-gray-600'>
                      No currencies found
                    </h3>
                    <p className='mb-4 text-sm text-gray-500'>
                      {searchTerm
                        ? `No currencies match "${searchTerm}"`
                        : 'No currencies available'}
                    </p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className='text-primary-600 hover:text-primary-700 text-sm font-medium'
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Currency Details and Chart */}
            {selectedCurrencyData && (
              <div className='lg:col-span-3'>
                <div className='mb-8 rounded-lg bg-white p-6 shadow-md'>
                  <div className='mb-6 flex flex-col items-start justify-between md:flex-row md:items-center'>
                    <div className='mb-4 flex items-center md:mb-0'>
                      <div className='bg-primary-100 mr-4 rounded-full p-3'>
                        {getCurrencyIcon(
                          selectedCurrencyData.code,
                          'h-8 w-8 text-primary-600'
                        )}
                      </div>
                      <div>
                        <h2 className='text-2xl font-bold text-gray-800'>
                          {selectedCurrencyData.code}
                        </h2>
                        <p className='text-gray-800'>
                          {formatCurrencyName(selectedCurrencyData.currency)}
                        </p>
                      </div>
                    </div>
                    <div className='rounded-lg bg-gray-100 p-4'>
                      <div className='mb-1 text-sm text-gray-800'>
                        Current Rate
                      </div>
                      <div className='text-3xl font-bold text-gray-800'>
                        {selectedCurrencyData.rate
                          ? `₱${selectedCurrencyData.rate.toFixed(4)}`
                          : 'Data Unavailable'}
                      </div>
                      <div className='text-xs text-gray-800'>
                        Philippine Peso
                      </div>
                    </div>
                  </div>

                  {/* Timeframe Selection */}
                  <div className='mb-4 flex space-x-2'>
                    {(['1W', '1M', '3M', '6M', '1Y'] as const).map(period => (
                      <button
                        key={period}
                        onClick={() => setTimeframe(period)}
                        className={`rounded-md px-3 py-1 text-sm ${
                          timeframe === period
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>

                  {/* Chart */}
                  <div className='hidden h-80'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <LineChart
                        data={historicalData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                        <XAxis
                          dataKey='date'
                          tick={{ fontSize: 12 }}
                          tickFormatter={value => {
                            const date = new Date(value);
                            return date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            });
                          }}
                        />
                        <YAxis
                          domain={['auto', 'auto']}
                          tick={{ fontSize: 12 }}
                          tickFormatter={value => `₱${value.toFixed(2)}`}
                        />
                        <Tooltip
                          formatter={(value: number) => [
                            `₱${value.toFixed(4)}`,
                            'Rate',
                          ]}
                          labelFormatter={label => {
                            const date = new Date(label);
                            return date.toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            });
                          }}
                        />
                        <Legend />
                        <Line
                          type='monotone'
                          dataKey='rate'
                          name={`PHP to ${selectedCurrencyData.code} Rate`}
                          stroke='#4f46e5'
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Conversion Calculator */}
                <div className='rounded-lg bg-white p-6 shadow-md'>
                  <h3 className='mb-4 text-xl font-bold text-gray-800'>
                    Currency Converter
                  </h3>
                  <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <div>
                      <label className='mb-2 block text-sm font-medium text-gray-700'>
                        Philippine Peso (PHP)
                      </label>
                      <div className='relative rounded-md shadow-xs'>
                        <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                          <span className='text-gray-800 sm:text-sm'>₱</span>
                        </div>
                        <input
                          type='number'
                          className='focus:ring-primary-500 focus:border-primary-500 block w-full rounded-md border-gray-300 py-3 pr-12 pl-7 sm:text-sm'
                          placeholder='0.00'
                          value={phpAmount}
                          onChange={e => setPhpAmount(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className='mb-2 block text-sm font-medium text-gray-700'>
                        {selectedCurrencyData.code} (
                        {formatCurrencyName(selectedCurrencyData.currency)})
                      </label>
                      <div className='relative rounded-md shadow-xs'>
                        <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                          <span className='text-gray-800 sm:text-sm'>
                            {selectedCurrencyData.code === 'USD'
                              ? '$'
                              : selectedCurrencyData.code === 'EUR'
                                ? '€'
                                : selectedCurrencyData.code === 'GBP'
                                  ? '£'
                                  : selectedCurrencyData.code === 'JPY'
                                    ? '¥'
                                    : ''}
                          </span>
                        </div>
                        <input
                          type='text'
                          className='focus:ring-primary-500 focus:border-primary-500 block w-full rounded-md border-gray-300 bg-gray-50 py-3 pr-12 pl-7 sm:text-sm'
                          readOnly
                          value={
                            selectedCurrencyData.rate && phpAmount
                              ? (
                                  parseFloat(phpAmount) /
                                  selectedCurrencyData.rate
                                ).toFixed(2)
                              : 'Data Unavailable'
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <p className='mt-4 text-sm text-gray-800'>
                    Exchange rates are provided by Bangko Sentral ng Pilipinas
                    (BSP). Last updated:{' '}
                    {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Forex Information Section */}
        <div className='mt-12 rounded-lg bg-white p-6 shadow-md'>
          <h2 className='mb-4 text-2xl font-bold text-gray-800'>
            About Foreign Exchange Rates
          </h2>
          <p className='mb-4 text-gray-800'>
            The foreign exchange rates displayed on this page are sourced from
            the Bangko Sentral ng Pilipinas (BSP), the central bank of the
            Philippines. These rates represent the official reference rates for
            the Philippine Peso against major world currencies.
          </p>
          <div className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div className='border-primary-500 border-l-4 pl-4'>
              <h3 className='mb-2 text-lg font-semibold text-gray-800'>
                Understanding Exchange Rates
              </h3>
              <p className='text-gray-800'>
                Exchange rates indicate how much of one currency can be
                exchanged for another. The rates shown here represent the amount
                of Philippine Pesos (PHP) needed to purchase one unit of the
                foreign currency.
              </p>
            </div>
            <div className='border-primary-500 border-l-4 pl-4'>
              <h3 className='mb-2 text-lg font-semibold text-gray-800'>
                Official BSP Rates
              </h3>
              <p className='text-gray-800'>
                For official foreign exchange reference rates and more detailed
                information, please visit the{' '}
                <a
                  href='https://www.bsp.gov.ph/SitePages/Statistics/ExchangeRate.aspx'
                  className='text-primary-600 hover:underline'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Bangko Sentral ng Pilipinas website
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForexPage;
