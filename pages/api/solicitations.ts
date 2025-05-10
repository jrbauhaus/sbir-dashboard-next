import { NextApiRequest, NextApiResponse } from 'next';
import { getCache, setCache } from '@/lib/cache';
import { SBIRApiService } from '@/lib/sbirService'; // Import the class

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let data = getCache('sbirData');
  
  if (data) {
    console.log('[API /solicitations] Serving from cache.');
  } else {
    console.log('[API /solicitations] Cache miss - fetching fresh data...');
    const sbirService = new SBIRApiService(); // Instantiate the service
    data = await sbirService.getActiveTopics(); // Call the correct method
    setCache('sbirData', data);
    console.log('[API /solicitations] Fetched and cached fresh data.');
  }

  res.status(200).json(data);
} 