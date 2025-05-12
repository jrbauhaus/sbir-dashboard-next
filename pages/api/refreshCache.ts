import { NextApiRequest, NextApiResponse } from 'next';
import { setCache } from '@/lib/cache';
import { SBIRApiService } from '@/lib/sbirService'; // Import the class

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Temporary protection using query param for Vercel Hobby Cron support
  if (req.query.cron_secret !== process.env.CRON_SECRET) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  // TODO: Re-enable this auth check once we upgrade to Vercel Pro or use an external cron job that supports custom headers
  // // Check for the secret in query parameters
  // if (req.query.cron_secret !== process.env.CRON_SECRET) {
  //   return res.status(401).json({ message: 'Unauthorized - Invalid cron secret' });
  // }

  // Optional: Add a secret to protect this endpoint if desired
  // if (req.headers['x-vercel-cron-secret'] !== process.env.VERCEL_CRON_SECRET) {
  //   return res.status(401).json({ message: 'Unauthorized' });
  // }

  try {
    console.log('[API /refreshCache] Starting cache refresh triggered by cron...');
    const sbirService = new SBIRApiService(); // Instantiate the service
    const data = await sbirService.getActiveTopics(); // Call the correct method
    setCache('sbirData', data);
    const count = Array.isArray(data) ? data.length : 'unknown';
    console.log(`[API /refreshCache] Cache refreshed successfully. ${count} items cached.`);
    res.status(200).json({ message: 'Cache refreshed successfully', itemCount: count });
  } catch (error: any) {
    console.error('[API /refreshCache] Error refreshing cache:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to refresh cache', error: error.message });
  }
} 