import NodeCache from 'node-cache';

// 1 hour TTL, check for expired items every 10 minutes
export const cache = new NodeCache({ stdTTL: 60 * 60, checkperiod: 60 * 10 });

export function setCache(key: string, value: any): void {
  cache.set(key, value);
}

export function getCache<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined;
} 