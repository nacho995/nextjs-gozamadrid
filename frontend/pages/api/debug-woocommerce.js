export default async function handler(req, res) {
  res.status(200).json({
    credentials: {
      hasKey: !!process.env.WC_CONSUMER_KEY,
      hasSecret: !!process.env.WC_CONSUMER_SECRET,
      keyLength: process.env.WC_CONSUMER_KEY?.length || 0,
      secretLength: process.env.WC_CONSUMER_SECRET?.length || 0,
      keyPrefix: process.env.WC_CONSUMER_KEY?.substring(0, 10) || 'N/A',
      secretPrefix: process.env.WC_CONSUMER_SECRET?.substring(0, 10) || 'N/A'
    },
    env: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV
    }
  });
} 