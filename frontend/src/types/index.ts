export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface Interview {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  date: string;
  score?: number;
  questions?: number;
  duration?: string;
  feedback?: InterviewFeedback;
}

export interface InterviewFeedback {
  id: string;
  questions: Array<{
    id: number;
    question: string;
  }>;
  userAnswers: Array<{
    id: number;
    answer: string;
  }>;
  overallScore?: number;
  strengths?: string[];
  improvements?: string[];
  detailedFeedback?: string;
  createdAt?: string;
}

export interface Question {
  id: number;
  question: string;
}

export interface InterviewQuestion {
  id: string;
  questionText: string;
  questionNumber: number;
  totalQuestions: number;
}

export type InterviewState =
  | 'requesting-permission'
  | 'permission-denied'
  | 'loading-question'
  | 'ai-speaking'
  | 'recording'
  | 'processing'
  | 'completed'
  | 'error';

export interface RecordedAnswer {
  questionId: string;
  questionNumber: number;
  videoBlob: Blob;
  duration: number;
}
