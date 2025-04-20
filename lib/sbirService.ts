import axios, { AxiosInstance, AxiosError } from 'axios';
import { SBIRTopic } from '@/types/sbir'; // Removed SBIRSolicitation import

const SBIR_API_BASE_URL = 'https://api.www.sbir.gov/public/api';
// New DoD API Endpoint
const DOD_API_URL = "https://www.dodsbirsttr.mil/topics/api/public/topics/search?searchParam=%7B%22searchText%22:null,%22components%22:null,%22programYear%22:null,%22solicitationCycleNames%22:%5B%22openTopics%22%5D,%22releaseNumbers%22:%5B%5D,%22topicReleaseStatus%22:%5B591,592%5D,%22modernizationPriorities%22:null,%22sortBy%22:%22finalTopicCode,asc%22%7D&size=1000&page=0";

const MAX_RETRIES = 3; // Consider using this for retry logic if needed
const RETRY_DELAY_MS = 1500; // Consider using this for retry logic if needed

// Define an interface for the raw topic structure based on the sample
interface RawDoDTopic {
  topicCode: string;
  topicTitle: string;
  topicStatus: string;
  topicPreReleaseStartDate?: number; // Added - confirmed from debug logs
  topicPreReleaseEndDate?: number; // Added - confirmed from debug logs
  topicStartDate?: number; // Added - confirmed from debug logs (potential open date)
  topicEndDate?: number;   // Added - confirmed from debug logs (potential close date)
  component: string;
  solicitationNumber?: string;
  solicitationTitle?: string;
  program?: string;
}

export class SBIRApiService {
  private axiosInstance: AxiosInstance;

  constructor() { // Simplified constructor
    this.axiosInstance = axios.create({
      baseURL: SBIR_API_BASE_URL,
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // Headers like Origin, Referer, User-Agent might not be needed/allowed in server-side requests
        // Keep them for now, but monitor if they cause issues.
        'Origin': 'https://www.sbir.gov',
        'Referer': 'https://www.sbir.gov/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });
  }

  // Method to fetch active solicitations with topics
  async getActiveSolicitationsWithTopics(agency: string = 'DOD'): Promise<any[]> {
    console.warn("[API Service] getActiveSolicitationsWithTopics is deprecated. Use getActiveTopics.");
    return []; 
  }

  async getSolicitation(id: string): Promise<SBIRTopic | null> {
    console.warn("[API Service] getSolicitation needs refactoring for the new topic structure.");
    try {
      const allTopics = await this.getActiveTopics();
      const topic = allTopics.find((t: SBIRTopic) => t.topic_number === id);
      return topic || null; 
    } catch (error) {
      this.handleApiError(error, `getSolicitation - fetch for ID ${id}`);
      return null;
    }
  }

  // --- New Method using DoD API --- 
  async getActiveTopics(): Promise<SBIRTopic[]> {
    console.log(`[API Service] Fetching active topics from ${DOD_API_URL}`);
    try {
      const response = await fetch(DOD_API_URL, {
        headers: {
          'Accept': 'application/json',
          // Add headers similar to the old Axios config
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': 'https://www.dodsbirsttr.mil/topics-app/', // Referer matching the site
          'Origin': 'https://www.dodsbirsttr.mil' // Origin matching the site
        },
        cache: 'no-store' 
      });

      if (!response.ok) {
        // Log the response body for more details on 403 if possible
        let errorBody = '';
        try { errorBody = await response.text(); } catch {}
        console.error('DoD API Fetch Error Body:', errorBody); 
        throw new Error(`Failed to fetch DoD topics: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      const rawTopics: RawDoDTopic[] = json?.data || []; // Use the defined interface
      console.log(`[API Service] DoD API returned ${rawTopics.length} raw topics.`);

      // Removed debug logs - no longer needed

      const now = new Date();
      console.log(`[API Service] Filtering with current time: ${now.toISOString()}`); // Log current time

      // Filter raw topics based on dates (CORRECTED LOGIC v3)
      const activeRawTopics = rawTopics.filter((topic: RawDoDTopic) => {
        let openDateTs: number | undefined = undefined;
        let closeDateTs: number | undefined = undefined;
        const status = topic.topicStatus;

        // Explicit per-status logic using CONFIRMED fields from RawDoDTopic
        if (status === 'Pre-Release') {
          openDateTs = topic.topicPreReleaseStartDate;
          closeDateTs = topic.topicPreReleaseEndDate;
        } else if (status === 'Open') {
          // Tentatively use topicStartDate/EndDate for 'Open' status
          openDateTs = topic.topicStartDate;
          closeDateTs = topic.topicEndDate;
        } else {
          // Filter out topics with unhandled statuses
          return false; 
        }

        // Check if date timestamps were found for the status
        if (openDateTs === undefined || closeDateTs === undefined) {
           return false;
        }

        // Dates are numbers (ms timestamps), parse them
        const open = new Date(openDateTs);
        const close = new Date(closeDateTs);

        // Check parsing validity
        const isValid = !isNaN(open.getTime()) && !isNaN(close.getTime());
        if (!isValid) return false; // Filter out if dates are invalid

        // Check if the date range includes now
        const isOpen = open <= now && close >= now;

        // Optional: Keep detailed log commented out for future debugging
        // console.log(`[API Service] Topic ${topic.topicCode}: Status=${status}, OpenTs=${openDateTs}, CloseTs=${closeDateTs}, ParsedOpen=${open.toISOString()}, ParsedClose=${close.toISOString()}, IsOpen=${isOpen}`);

        return isOpen; // Only return true if dates are valid AND within range
      });
      // End of filter

      console.log(`[API Service] Filtered down to ${activeRawTopics.length} currently active topics.`);

      // Map filtered raw topics to the SBIRTopic structure used by frontend
      const cleanedTopics: SBIRTopic[] = activeRawTopics.map((topic: RawDoDTopic) => {
        const topicNumber = topic.topicCode;

        // --- CORRECTED DATE MAPPING LOGIC ---
        // NOTE:
        // - For Pre-Release, show topicPreReleaseStartDate as open.
        // - For Open, show topicStartDate as open.
        // - Always use topicEndDate for submission deadline.

        // Set open date properly depending on topic status
        const mappedOpen = 
          topic.topicStatus === 'Pre-Release'
            ? topic.topicPreReleaseStartDate
              ? new Date(topic.topicPreReleaseStartDate).toISOString()
              : '' 
            : topic.topicStartDate 
              ? new Date(topic.topicStartDate).toISOString()
              : '';

        // Always use topicEndDate for deadline
        const mappedClose = topic.topicEndDate
          ? new Date(topic.topicEndDate).toISOString()
          : '';
        // --- END CORRECTED DATE MAPPING LOGIC ---

        return {
          topic_number: topicNumber,
          topic_title: topic.topicTitle,
          topic_status: topic.topicStatus,
          submission_window_open: mappedOpen, // Use corrected open date
          submission_deadline: mappedClose,    // Use corrected close date
          component: topic.component,
          solicitation_number: topic.solicitationNumber,
          solicitation_title: topic.solicitationTitle,
          program: topic.program,
        };
      });

      return cleanedTopics;

    } catch (error) {
      this.handleApiError(error, `getActiveTopics - fetch from DoD API`);
      return []; // Return empty on error
    }
  }

  private handleApiError(error: any, context?: string): void {
    const message = context ? `SBIR API Error (${context}):` : 'SBIR API Error:';
    console.error(message, error instanceof Error ? error.message : error);
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('Response Status:', axiosError.response?.status);
        console.error('Response Data:', axiosError.response?.data);
    } else if (error instanceof Error) {
        console.error('Stack:', error.stack);
    }
  }
} 