// Define the new structure based on the DoD API
export interface SBIRTopic {
  topic_number: string;
  topic_title: string;
  topic_status: string; // "Pre-Release" | "Open"
  submission_window_open: string;
  submission_deadline: string;
  component: string; // e.g., "NAVY", "ARMY"
  // Add fields from the API response
  solicitation_number?: string;
  solicitation_title?: string;
  program?: string;
  // topic_description?: string;
  // topic_link?: string; // If the API provides a direct link
}

// Comment out the old Solicitation type for now
/*
export interface SBIRSolicitation {
  solicitation_id: number;
  solicitation_title: string;
  solicitation_number: string;
  program: string;
  phase: string;
  agency: string;
  branch: string;
  solicitation_year: number;
  release_date: string;
  open_date: string;
  close_date: string;
  application_due_date: string[];
  occurrence_number: string | null;
  solicitation_agency_url: string;
  current_status: string;
  solicitation_topics: SBIRTopic[]; // This nesting is no longer needed
} 
*/

// Define an interface for the raw topic structure based on the sample
interface RawDoDTopic {
  topicCode: string;
  topicTitle: string;
  topicStatus: string;
  // Confirmed date fields from debug logs
  topicPreReleaseStartDate?: number; // Use number for millisecond timestamps
  topicPreReleaseEndDate?: number;
  topicStartDate?: number; // Potential open date
  topicEndDate?: number;   // Potential close date
  // Removed non-existent/unused date fields:
  // topicOpenDate?: string; 
  // topicCAPOCStartDate?: string; 
  // topicCloseDate?: string;
  // topicCAPOCEndDate?: string;
  component: string;
  solicitationNumber?: string;
  solicitationTitle?: string;
  program?: string;
  // Add other potentially useful fields observed in debug logs if needed
  // topicId?: string;
  // releaseNumber?: number;
} 