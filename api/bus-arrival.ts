import type { ApiRequest, ApiResponse } from './health.ts';
import { getLtaAccountKey } from './health.ts';

/**
 * LTA DataMall v3 Bus Arrival Proxy Endpoint
 *
 * Endpoint: GET /api/bus-arrival?BusStopCode=04121[&ServiceNo=7]
 * Upstream: https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121
 * Required Header upstream: AccountKey
 * Refreshes every 20 seconds.
 */

export default async function handler(req: ApiRequest, res: ApiResponse) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, AccountKey, accountkey, x-account-key, x-lta-account-key'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed. Use GET.' });
  }

  // Parse parameters
  const query = (req.query as Record<string, string | undefined>) || {};
  const busStopCode =
    query.BusStopCode || query.busStopCode || query.busstopcode;
  const serviceNo = query.ServiceNo || query.serviceNo || query.serviceno;

  if (!busStopCode) {
    return res.status(400).json({
      error: 'Missing required parameter: BusStopCode',
      example: '/api/bus-arrival?BusStopCode=04121&ServiceNo=7',
    });
  }

  // Resolve LTA Account Key from headers, query, or environment variables
  const { key: accountKey, source: keySource } = getLtaAccountKey(req);

  if (!accountKey || accountKey.trim() === '') {
    return res.status(200).json({
      isLive: false,
      configured: false,
      hasAccountKey: false,
      keySource: 'none',
      BusStopCode: String(busStopCode),
      message:
        'LTA_ACCOUNT_KEY is not configured in Vercel environment or request headers. Configure LTA_ACCOUNT_KEY in Vercel to receive live Singapore bus telemetry.',
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        AccountKey: accountKey.trim(),
        accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        isLive: false,
        configured: true,
        hasAccountKey: true,
        keySource,
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
      hasAccountKey: true,
      keySource,
      ...data,
    });
  } catch (error: unknown) {
    console.error('Error fetching LTA BusArrival:', error);
    const isAbort =
      error instanceof Error && error.name === 'AbortError';

    return res.status(502).json({
      isLive: false,
      configured: true,
      hasAccountKey: true,
      keySource,
      error: isAbort
        ? 'LTA DataMall request timed out after 8 seconds'
        : 'Failed to connect to LTA DataMall upstream service',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
