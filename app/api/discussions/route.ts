import { NextResponse } from 'next/server';

const GITHUB_API_URL = 'https://api.github.com/graphql';
const REPO_OWNER = 'jrbauhaus';
const REPO_NAME = 'sbir-dashboard-next';

// Use a more efficient cache structure
interface CacheData {
  counts: Record<string, number>;
  timestamp: number;
}

let cache: CacheData = {
  counts: {},
  timestamp: 0
};

const CACHE_DURATION = 300000; // 5 minutes cache

export async function GET(request: Request) {
  try {
    const now = Date.now();
    
    // Return full cache if fresh
    if (now - cache.timestamp < CACHE_DURATION) {
      return NextResponse.json({ counts: cache.counts });
    }

    const query = `
      query {
        repository(owner: "${REPO_OWNER}", name: "${REPO_NAME}") {
          discussions(first: 100) {
            nodes {
              number
              title
              comments {
                totalCount
              }
            }
          }
        }
      }
    `;

    const token = process.env.GITHUB_ACCESS_TOKEN?.trim();
    if (!token) {
      return NextResponse.json({ counts: {} });
    }

    const response = await fetch(GITHUB_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v4+json',
        'User-Agent': 'sbir-dashboard'
      },
      body: JSON.stringify({ query }),
      cache: 'no-store'
    });

    if (!response.ok) {
      // If cache exists but expired, better to return stale data than nothing
      if (Object.keys(cache.counts).length > 0) {
        return NextResponse.json({ counts: cache.counts });
      }
      return NextResponse.json({ counts: {} });
    }

    const data = await response.json();
    if (!data.data?.repository?.discussions?.nodes) {
      if (Object.keys(cache.counts).length > 0) {
        return NextResponse.json({ counts: cache.counts });
      }
      return NextResponse.json({ counts: {} });
    }

    const discussions = data.data.repository.discussions.nodes;
    const counts: Record<string, number> = {};
    
    // Process all discussions and create a map of ID -> count
    discussions.forEach((d: any) => {
      const title = (d.title || '').trim();
      // Extract topic/solicitation ID from title
      const match = title.match(/[A-Z]+\d+[-][A-Z]\d+/);
      if (match) {
        const id = match[0];
        counts[id] = d.comments?.totalCount || 0;
      }
    });

    // Update cache
    cache = {
      counts,
      timestamp: now
    };

    return NextResponse.json({ counts });
  } catch (error) {
    console.error('[Discussion Counts API] Error:', error);
    // Return stale cache on error if available
    if (Object.keys(cache.counts).length > 0) {
      return NextResponse.json({ counts: cache.counts });
    }
    return NextResponse.json({ counts: {} });
  }
} 