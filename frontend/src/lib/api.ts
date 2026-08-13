import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on login/signup page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

/**
 * Fetch user's interview history
 */
export const getUserInterviews = async () => {
  const response = await api.get('/interviews/user');
  return response.data;
};

/**
 * Fetch feedback for a specific interview
 */
export const getInterviewFeedback = async (interviewId: string) => {
  const response = await api.get(`/feedback/${interviewId}`);
  return response.data;
};

/**
 * Generate feedback for an interview
 */
export const generateFeedback = async (interviewId: string) => {
  const response = await api.post('/feedback', { interviewId });
  return response.data;
};

/**
 * End an interview session
 */
export const endInterviewSession = async (interviewId: string) => {
  const response = await api.post('/interviews/end', { interviewId });
  return response.data;
};

/**
 * Update interview session details
 */
export const updateInterviewSession = async (interviewId: string, data: { questionCount?: number; title?: string }) => {
  const response = await api.post('/interviews/update', { interviewId, ...data });
  return response.data;
};

/**
 * Save questions for an interview
 */
export const saveInterviewQuestions = async (interviewId: string, questions: Array<{ id: number; question: string }>) => {
  const response = await api.post('/question/create-question', { questionObject: questions, interviewId });
  return response.data;
};
