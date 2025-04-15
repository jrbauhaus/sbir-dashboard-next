import axios, { AxiosInstance, AxiosError } from 'axios';
import { SBIRSolicitation, SBIRTopic } from '@/types/sbir'; // Updated import path

const SBIR_API_BASE_URL = 'https://api.www.sbir.gov/public/api';
const MAX_RETRIES = 3; // Consider using this for retry logic if needed
const RETRY_DELAY_MS = 1500; // Consider using this for retry logic if needed

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
  async getActiveSolicitationsWithTopics(agency: string = 'DOD'): Promise<SBIRSolicitation[]> {
    const params: any = {
       agency: agency.toUpperCase(),
       // current_status: 'Active' // Let's rely on the post-fetch filtering for now
     };
     let allAgencySolicitations: SBIRSolicitation[] = [];

     try {
       console.log(`[API Service] Fetching solicitations for agency (${params.agency}) from ${SBIR_API_BASE_URL}`);
       const response = await this.axiosInstance.get<SBIRSolicitation[]>('/solicitations', { params });
       allAgencySolicitations = Array.isArray(response.data) ? response.data : [];
       console.log(`[API Service] API returned ${allAgencySolicitations.length} solicitations.`);
     } catch (error) {
       this.handleApiError(error, `getActiveSolicitationsWithTopics - initial fetch for ${agency}`);
       return []; // Return empty on error
     }

     const now = new Date();

     // Filter solicitations: keep if it has active topics OR if it has no topics but is itself active
     const solicitationsWithActiveTopicsOrIsActive = allAgencySolicitations.filter(sol => {
       if (!sol.solicitation_topics || sol.solicitation_topics.length === 0) {
         // No topics: check solicitation dates
         try {
           const closeDate = new Date(sol.close_date);
           const openDate = new Date(sol.open_date);
           if (isNaN(openDate.getTime()) || isNaN(closeDate.getTime())) return false;
           return openDate <= now && closeDate >= now;
         } catch { return false; }
       } else {
         // Has topics: check if *any* topic is active
         return sol.solicitation_topics.some(topic => {
           try {
             const topicCloseDate = new Date(topic.topic_closed_date);
             const topicOpenDate = new Date(topic.topic_open_date);
             if (isNaN(topicOpenDate.getTime()) || isNaN(topicCloseDate.getTime())) return false;
             return topicOpenDate <= now && topicCloseDate >= now;
           } catch { return false; }
         });
       }
     });

     // Map to final structure, keeping only active topics within each solicitation
     const finalSolicitations = solicitationsWithActiveTopicsOrIsActive.map(sol => {
       if (!sol.solicitation_topics || sol.solicitation_topics.length === 0) {
         return sol; // Return solicitation as-is if it had no topics initially
       }
       // Filter topics to keep only active ones
       const activeTopics = sol.solicitation_topics.filter(topic => {
         try {
           const topicCloseDate = new Date(topic.topic_closed_date);
           const topicOpenDate = new Date(topic.topic_open_date);
           if (isNaN(topicOpenDate.getTime()) || isNaN(topicCloseDate.getTime())) return false;
           return topicOpenDate <= now && topicCloseDate >= now;
         } catch { return false; }
       });
       return { ...sol, solicitation_topics: activeTopics };
     })
     // Ensure we don't return solicitations that *only* had inactive topics (and were inactive themselves)
     .filter(sol => {
        if (!sol.solicitation_topics || sol.solicitation_topics.length === 0) {
            // If no topics are left (or never existed), double check the main solicitation dates
            try {
              const closeDate = new Date(sol.close_date);
              const openDate = new Date(sol.open_date);
              if (isNaN(openDate.getTime()) || isNaN(closeDate.getTime())) return false;
              return openDate <= now && closeDate >= now;
            } catch { return false; }
        }
        return true; // Keep if it still has active topics
     });

     console.log(`[API Service] Filtered down to ${finalSolicitations.length} active solicitations/topics.`);
     return finalSolicitations;
   }

   async getSolicitation(id: string): Promise<SBIRSolicitation | null> {
     try {
       console.log(`[API Service] Fetching solicitation with ID: ${id}`);
       // First try to get it from the list of active solicitations
       const allSolicitations = await this.getActiveSolicitationsWithTopics();
       
       // Look for either a solicitation or topic with matching ID
       const solicitation = allSolicitations.find(sol => {
         if (sol.solicitation_number === id) return true;
         if (sol.solicitation_topics?.some(topic => topic.topic_number === id)) return true;
         return false;
       });

       if (solicitation) {
         // If it's a topic ID, filter to just that topic
         if (solicitation.solicitation_topics?.length) {
           const matchingTopic = solicitation.solicitation_topics.find(
             topic => topic.topic_number === id
           );
           if (matchingTopic) {
             return {
               ...solicitation,
               solicitation_topics: [matchingTopic]
             };
           }
         }
         return solicitation;
       }

       return null;
     } catch (error) {
       this.handleApiError(error, `getSolicitation - fetch for ID ${id}`);
       return null;
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