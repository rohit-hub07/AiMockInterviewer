import api from './api';
import type { Question, InterviewQuestion } from '../types';

/**
 * Fetch interview questions from sessionStorage or backend
 */
export const getInterviewQuestions = (): Question[] => {
  const stored = sessionStorage.getItem('interviewQuestions');
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

/**
 * Get a specific question by index
 */
export const getQuestionByIndex = (index: number): InterviewQuestion | null => {
  const questions = getInterviewQuestions();
  if (index >= questions.length) return null;

  return {
    id: questions[index].id.toString(),
    questionText: questions[index].question,
    questionNumber: index + 1,
    totalQuestions: questions.length,
  };
};

/**
 * Upload recorded answer video to backend
 */
export const uploadAnswerVideo = async (
  interviewId: string,
  questionId: string,
  videoBlob: Blob,
  questionNumber: number
): Promise<void> => {
  const formData = new FormData();
  formData.append('video', videoBlob, `answer-${questionNumber}.webm`);
  formData.append('interviewId', interviewId);
  formData.append('questionId', questionId);
  formData.append('questionNumber', questionNumber.toString());

  await api.post('/answer', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Upload multiple answers at once (batch upload)
 */
export const uploadAllAnswers = async (
  interviewId: string,
  answers: Array<{
    questionId: string;
    questionNumber: number;
    videoBlob: Blob | null;
  }>
): Promise<void> => {
  const formData = new FormData();
  formData.append('interviewId', interviewId);

  // Add all video blobs to FormData
  answers.forEach((answer) => {
    if (answer.videoBlob) {
      formData.append(`video_${answer.questionNumber}`, answer.videoBlob, `answer-${answer.questionNumber}.webm`);
      formData.append(`questionId_${answer.questionNumber}`, answer.questionId);
    } else {
      // Mark as empty/skipped answer
      formData.append(`empty_${answer.questionNumber}`, 'true');
      formData.append(`questionId_${answer.questionNumber}`, answer.questionId);
    }
  });

  formData.append('totalAnswers', answers.length.toString());

  await api.post('/answers/batch', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Text-to-speech: Convert question text to audio
 * Uses browser's native SpeechSynthesis API
 */
export const speakQuestion = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    // Cancel any ongoing speech first to prevent interruption errors
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => resolve();
    utterance.onerror = (event) => {
      // Don't reject on 'interrupted' errors as they're expected when skipping
      if (event.error === 'interrupted' || event.error === 'canceled') {
        resolve();
      } else {
        reject(new Error(`Speech synthesis error: ${event.error}`));
      }
    };

    window.speechSynthesis.speak(utterance);
  });
};

/**
 * Stop any ongoing speech
 */
export const stopSpeaking = (): void => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};
