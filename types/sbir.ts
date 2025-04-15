export interface SBIRTopic {
    topic_title: string;
    branch: string;
    topic_number: string;
    topic_open_date: string;
    topic_closed_date: string;
    topic_description: string;
    sbir_topic_link: string;
    subtopics: any[];
  }

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
  solicitation_topics: SBIRTopic[];
} 