// BSP API endpoint for exchange rates
const BSP_URL = "https://www.bsp.gov.ph/_api/web/lists/getByTitle('Exchange%20Rate')/items?$select=*&$filter=Group%20eq%20%271%27&$orderby=Ordering%20asc";

// Core function to fetch currency exchange rates
async function fetchForexData(env) {
  try {
    // Fetch exchange rate data
    const response = await fetch(BSP_URL, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch BSP data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Process the data to make it more usable
    const processedData = {
      metadata: {
        source: "Bangko Sentral ng Pilipinas",
        fetchedAt: new Date().toISOString(),
        url: "https://www.bsp.gov.ph/SitePages/Statistics/ExchangeRate.aspx"
      },
      rates: data.value.map(item => ({
        country: item.Title,
        currency: item.Unit,
        symbol: item.Symbol,
        euroEquivalent: parseFloat(item.EURequivalent),
        usdEquivalent: parseFloat(item.USDequivalent),
        phpEquivalent: parseFloat(item.PHPequivalent),
        countryCode: item.CountryCode,
        publishedDate: item.PublishedDate
      }))
    };
    
    return processedData;
  } catch (error) {
    console.error('Error fetching forex data:', error);
    throw error;
  }
}

// Function for scheduled execution
export async function onScheduled(event) {
  try {
    // Fetch forex data
    const forexData = await fetchForexData(event.env);
    
    // Store the data in Cloudflare KV
    await event.env.FOREX_KV.put('bsp_exchange_rates', JSON.stringify(forexData), {
      expirationTtl: 3600 // Expire after 1 hour
    });
    
    return {
      success: true,
      message: `Exchange rate data updated for ${forexData.rates.length} currencies`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in forex scheduled function:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Function for direct API access
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const symbol = url.searchParams.get('symbol');
  
  try {
    // Try to get cached data first
    const cachedData = await env.FOREX_KV.get('bsp_exchange_rates');
    
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      
      // If a specific currency symbol is requested, filter the data
      if (symbol) {
        const upperSymbol = symbol.toUpperCase();
        const filteredRates = parsedData.rates.filter(rate => 
          rate.symbol.toUpperCase() === upperSymbol
        );
        
        if (filteredRates.length > 0) {
          return new Response(JSON.stringify({
            metadata: parsedData.metadata,
            rates: filteredRates
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      
      // Return all data if no symbol specified or no match found
      return new Response(cachedData, {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // If no cached data, fetch fresh data
    const forexData = await fetchForexData(env);
    
    // Filter by symbol if specified
    if (symbol) {
      const upperSymbol = symbol.toUpperCase();
      const filteredRates = forexData.rates.filter(rate => 
        rate.symbol.toUpperCase() === upperSymbol
      );
      
      if (filteredRates.length > 0) {
        return new Response(JSON.stringify({
          metadata: forexData.metadata,
          rates: filteredRates
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    return new Response(JSON.stringify(forexData), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Trigger function every hour
export const scheduled = {
  cron: '0 * * * *' // Run every hour at minute 0
};
