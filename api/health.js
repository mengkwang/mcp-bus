/**
 * Health check endpoint for Vercel Serverless & Node.js environments.
 * Monitors API uptime and verifies LTA_ACCOUNT_KEY presence.
 */
export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const isLtaConfigured = Boolean(
    process.env.LTA_ACCOUNT_KEY && process.env.LTA_ACCOUNT_KEY.trim() !== ''
  );

  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime ? Math.floor(process.uptime()) : 0,
    services: {
      health: 'operational',
      ltaDatamallV3: isLtaConfigured ? 'configured' : 'missing_account_key',
    },
    environment: {
      nodeVersion: process.version,
      hasLtaAccountKey: isLtaConfigured,
    },
    message: isLtaConfigured
      ? 'All APIs operational with LTA AccountKey configured.'
      : 'API running. Configure LTA_ACCOUNT_KEY in Vercel environment variables to query live LTA DataMall.',
  });
}
