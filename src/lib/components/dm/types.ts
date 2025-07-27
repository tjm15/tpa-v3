export interface PlanningApplication {
  id: string;
  reference: string;
  address: string;
  applicant: string;
  description: string;
  type: 'full' | 'outline' | 'reserved' | 'householder' | 'listed' | 'change_of_use';
  status: 'received' | 'under_review' | 'consultation' | 'determination' | 'decided';
  submittedDate: Date;
  targetDate: Date;
  officer: string;
  ward: string;
  parish?: string;
  constraints: string[];
  documents: ApplicationDocument[];
  consultations: Consultation[];
  assessments: {
    siteAssessment?: AssessmentStatus;
    policyCompliance?: AssessmentStatus;
    consultationReview?: AssessmentStatus;
    recommendation?: AssessmentStatus;
  };
}

export interface ApplicationDocument {
  id: string;
  name: string;
  type: 'plan' | 'form' | 'statement' | 'report' | 'photo' | 'other';
  uploadDate: Date;
  size: number;
  processed?: boolean;
}

export interface Consultation {
  id: string;
  consultee: string;
  type: 'statutory' | 'non_statutory' | 'neighbour';
  sentDate: Date;
  responseDate?: Date;
  response?: 'support' | 'object' | 'neutral' | 'no_response';
  comments?: string;
}

export interface AssessmentStatus {
  status: 'not_started' | 'in_progress' | 'complete' | 'review_required';
  assignedTo?: string;
  lastUpdated: Date;
  notes?: string;
  aiInsights?: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
