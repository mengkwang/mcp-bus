import type { IncomingMessage, ServerResponse } from 'http';

export interface ApiRequest extends IncomingMessage {
  query?: Record<string, string | string[]>;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
  method?: string;
  url?: string;
}

export interface ApiResponse extends ServerResponse {
  status: (statusCode: number) => ApiResponse;
  json: (body: unknown) => ApiResponse | void;
  setHeader: (name: string, value: string) => this;
  end: (chunk?: unknown) => this;
}

/**
 * Resolves the LTA AccountKey from environment variables, request headers, or query parameters.
 */
export function getLtaAccountKey(req?: ApiRequest): { key: string; source: string } {
  // 1. Check request headers (case-insensitive in Node/Express/Vercel)
  if (req?.headers) {
    const headerKey =
      req.headers['accountkey'] ||
      req.headers['account-key'] ||
      req.headers['x-account-key'] ||
      req.headers['x-lta-account-key'];

    if (typeof headerKey === 'string' && headerKey.trim() !== '') {
      return { key: headerKey.trim(), source: 'request_header' };
    }
  }

  // 2. Check query params (?AccountKey=... or ?accountKey=...)
  if (req?.query) {
    const queryKey =
      req.query['AccountKey'] ||
      req.query['accountKey'] ||
      req.query['accountkey'];

    if (typeof queryKey === 'string' && queryKey.trim() !== '') {
      return { key: queryKey.trim(), source: 'query_param' };
    }
  }

  // 3. Check environment variables (Vercel & local .env configurations)
  const envVarNames = [
    'LTA_ACCOUNT_KEY',
    'ACCOUNT_KEY',
    'AccountKey',
    'accountkey',
    'LTA_KEY',
    'VITE_LTA_ACCOUNT_KEY',
    'VERCEL_LTA_ACCOUNT_KEY',
  ];

  for (const varName of envVarNames) {
    const val = process.env[varName];
    if (typeof val === 'string' && val.trim() !== '') {
      return { key: val.trim(), source: `env:${varName}` };
    }
  }

  return { key: '', source: 'none' };
}

/**
 * Health check endpoint for Vercel Serverless & Node.js environments.
 * Monitors API uptime, detects LTA_ACCOUNT_KEY configuration, and probes
 * live LTA DataMall v3 service to verify real connectivity.
 */
export default async function handler(req: ApiRequest, res: ApiResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, AccountKey, accountkey, x-account-key, x-lta-account-key'
  );
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { key: accountKey, source: keySource } = getLtaAccountKey(req);
  const isKeyConfigured = Boolean(accountKey && accountKey.length > 0);

  let ltaProbeStatus = isKeyConfigured ? 'untested' : 'missing_account_key';
  let ltaProbeMessage = isKeyConfigured
    ? 'AccountKey found. Testing LTA DataMall connectivity...'
    : 'No AccountKey found in Vercel environment or request headers.';
  let ltaProbeStatusCode: number | null = null;
  let probeLatencyMs: number | null = null;

  // If a key is available, run a live probe against LTA DataMall v3 BusArrival endpoint
  if (isKeyConfigured) {
    const startTime = Date.now();
    try {
      const probeUrl =
        'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const probeResponse = await fetch(probeUrl, {
        method: 'GET',
        headers: {
          AccountKey: accountKey,
          accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      probeLatencyMs = Date.now() - startTime;
      ltaProbeStatusCode = probeResponse.status;

      if (probeResponse.ok) {
        ltaProbeStatus = 'operational';
        ltaProbeMessage = 'Live LTA DataMall v3 connection verified successfully.';
      } else if (probeResponse.status === 401 || probeResponse.status === 403) {
        ltaProbeStatus = 'unauthorized_invalid_key';
        ltaProbeMessage = `LTA DataMall rejected the AccountKey with HTTP ${probeResponse.status}. Verify the key in Vercel settings.`;
      } else {
        ltaProbeStatus = `upstream_http_${probeResponse.status}`;
        ltaProbeMessage = `LTA DataMall responded with unexpected HTTP ${probeResponse.status}.`;
      }
    } catch (probeError: unknown) {
      probeLatencyMs = Date.now() - startTime;
      const isAbort =
        probeError instanceof Error && probeError.name === 'AbortError';
      ltaProbeStatus = isAbort ? 'timeout' : 'network_error';
      ltaProbeMessage = isAbort
        ? 'LTA DataMall probe timed out after 6 seconds.'
        : `Could not reach LTA DataMall: ${
            probeError instanceof Error ? probeError.message : String(probeError)
          }`;
    }
  }

  const isHealthy =
    ltaProbeStatus === 'operational' || ltaProbeStatus === 'missing_account_key';

  return res.status(200).json({
    status: isHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime ? Math.floor(process.uptime()) : 0,
    services: {
      api: 'operational',
      ltaDatamallV3: ltaProbeStatus,
    },
    ltaIntegration: {
      configured: isKeyConfigured,
      keySource,
      probeStatus: ltaProbeStatus,
      probeStatusCode: ltaProbeStatusCode,
      latencyMs: probeLatencyMs,
      message: ltaProbeMessage,
    },
    environment: {
      nodeVersion: process.version,
      hasLtaAccountKey: isKeyConfigured,
    },
  });
}
