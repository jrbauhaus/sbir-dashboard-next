import { NextApiRequest, NextApiResponse } from 'next';
import { setCache } from '@/lib/cache';
import { SBIRApiService } from '@/lib/sbirService'; // Import the class

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: 'Unauthorized' }); // Changed to 401 as per Vercel docs for cron security
  }

  // Optional: Add a secret to protect this endpoint if desired
  // if (req.headers['x-vercel-cron-secret'] !== process.env.VERCEL_CRON_SECRET) {
  //   return res.status(401).json({ message: 'Unauthorized' });
  // }

  try {
    console.log('[API /refreshCache] Starting cache refresh...');
    const sbirService = new SBIRApiService(); // Instantiate the service
    const data = await sbirService.getActiveTopics(); // Call the correct method
    setCache('sbirData', data);
    const count = Array.isArray(data) ? data.length : 'unknown';
    console.log(`[API /refreshCache] Cache refreshed successfully. ${count} items cached.`);
    res.status(200).json({ message: 'Cache refreshed successfully', itemCount: count });
  } catch (error: any) {
    console.error('[API /refreshCache] Error refreshing cache:', error);
    res.status(500).json({ message: 'Failed to refresh cache', error: error.message });
  }
} 