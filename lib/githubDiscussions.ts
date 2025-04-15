const GITHUB_API_URL = 'https://api.github.com/graphql';
const REPO_OWNER = 'jrbauhaus';
const REPO_NAME = 'sbir-dashboard-next';

export interface DiscussionCounts {
  [key: string]: number;
}

// Cache discussion counts to prevent excessive API calls
let discussionCountsCache: DiscussionCounts = {};
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minute cache

export async function getDiscussionCounts(paths: string[]): Promise<DiscussionCounts> {
  // Early return if no paths to check
  if (!paths.length) return {};

  // Return cached results if available and fresh
  const now = Date.now();
  if (Object.keys(discussionCountsCache).length > 0 && now - lastFetchTime < CACHE_DURATION) {
    return discussionCountsCache;
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

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const token = process.env.GITHUB_ACCESS_TOKEN?.trim();
    if (!token) {
      console.warn('[getDiscussionCounts] No GitHub token found');
      return {};
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
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn('[getDiscussionCounts] API error:', response.status);
      return {};
    }

    const data = await response.json();
    const discussions = data.data?.repository?.discussions?.nodes || [];
    
    // Create a map of pathname to comment count
    const counts: DiscussionCounts = {};
    paths.forEach(path => {
      const pathId = path.replace('/discuss/', '').trim();
      const discussion = discussions.find((d: any) => {
        const discussionTitle = (d.title || '').trim();
        return discussionTitle.includes(pathId);
      });
      
      counts[path] = discussion ? (discussion.comments?.totalCount || 0) + 1 : 0;
    });

    // Update cache
    discussionCountsCache = counts;
    lastFetchTime = now;

    return counts;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      console.warn('[getDiscussionCounts] Request timed out');
    } else {
      console.warn('[getDiscussionCounts] Error:', error);
    }
    return {};
  }
} 