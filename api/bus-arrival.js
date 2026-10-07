/**
 * LTA DataMall v3 Bus Arrival Proxy Endpoint
 *
 * Endpoint: GET /api/bus-arrival?BusStopCode=04121[&ServiceNo=7]
 * Upstream: https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121
 * Required Header upstream: AccountKey
 * Refreshes every 20 seconds.
 */

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey, x-account-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed. Use GET.' });
  }

  // Parse parameters
  const query = req.query || {};
  const busStopCode =
    query.BusStopCode || query.busStopCode || query.busstopcode;
  const serviceNo = query.ServiceNo || query.serviceNo || query.serviceno;

  if (!busStopCode) {
    return res.status(400).json({
      error: 'Missing required parameter: BusStopCode',
      example: '/api/bus-arrival?BusStopCode=04121&ServiceNo=7',
    });
  }

  // Resolve LTA Account Key (From environment or request header)
  const accountKey =
    process.env.LTA_ACCOUNT_KEY ||
    req.headers['accountkey'] ||
    req.headers['x-account-key'] ||
    '';

  if (!accountKey || accountKey.trim() === '') {
    return res.status(200).json({
      isLive: false,
      configured: false,
      BusStopCode: String(busStopCode),
      message:
        'LTA_ACCOUNT_KEY is not yet configured in environment variables. Add LTA_ACCOUNT_KEY in Vercel to receive live Singapore bus telemetry.',
      documentation:
        'https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html',
      Services: [],
    });
  }

  try {
    // Construct LTA DataMall v3 endpoint
    const url = new URL(
      'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival'
    );
    url.searchParams.set('BusStopCode', String(busStopCode));
    if (serviceNo) {
      url.searchParams.set('ServiceNo', String(serviceNo));
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        AccountKey: accountKey.trim(),
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        isLive: false,
        error: `LTA DataMall API responded with HTTP ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();

    // Cache header: LTA refreshes every 20 seconds, so cache for 15s
    res.setHeader(
      'Cache-Control',
      'public, max-age=15, stale-while-revalidate=5'
    );

    return res.status(200).json({
      isLive: true,
      configured: true,
      ...data,
    });
  } catch (error) {
    console.error('Error fetching LTA BusArrival:', error);
    return res.status(502).json({
      isLive: false,
      error: 'Failed to connect to LTA DataMall upstream service',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
