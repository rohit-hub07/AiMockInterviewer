import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCamera } from '../hooks/useCamera';
import { useMediaRecorder } from '../hooks/useMediaRecorder';
import { VideoPreview } from '../components/interview/VideoPreview';
import { QuestionPlayer } from '../components/interview/QuestionPlayer';
import { RecordingIndicator } from '../components/interview/RecordingIndicator';
import AnimatedButton from '../components/AnimatedButton';
import {
  getQuestionByIndex,
  speakQuestion,
  stopSpeaking,
  uploadAnswerVideo,
} from '../lib/interview';
import type { InterviewState, InterviewQuestion } from '../types';

/**
 * Interview Page
 * Main container for the complete AI video interview flow
 * 
 * Flow:
 * 1. Request camera/mic permission
 * 2. Load first question
 * 3. Play question via TTS (AI speaking)
 * 4. Start recording user's answer
 * 5. Stop recording on "Next" or timeout
 * 6. Upload video to backend
 * 7. Load next question and repeat
 * 8. Complete interview when all questions answered
 */
const Interview = () => {
  const navigate = useNavigate();
  const { stream, isLoading: cameraLoading, error: cameraError, hasPermission, requestPermission } = useCamera();
  const {
    isRecording,
    recordedBlob,
    recordingDuration,
    error: recordingError,
    startRecording,
    stopRecording,
    resetRecording,
  } = useMediaRecorder();

  const [interviewState, setInterviewState] = useState<InterviewState>('requesting-permission');
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Initialize interview: Request camera permission
   */
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  /**
   * Handle permission result
   */
  useEffect(() => {
    if (cameraError) {
      setInterviewState('permission-denied');
      toast.error(cameraError);
    } else if (hasPermission && stream) {
      setInterviewState('loading-question');
      loadQuestion(0);
    }
  }, [hasPermission, stream, cameraError]);

  /**
   * Load and play a question
   */
  const loadQuestion = useCallback(async (questionIndex: number) => {
    setInterviewState('loading-question');

    const question = getQuestionByIndex(questionIndex);

    if (!question) {
      // No more questions - complete interview
      completeInterview();
      return;
    }

    setCurrentQuestion(question);
    setCurrentQuestionIndex(questionIndex);

    // Wait a bit before speaking
    await new Promise(resolve => setTimeout(resolve, 500));

    // Play question via TTS
    setInterviewState('ai-speaking');
    setIsAISpeaking(true);

    try {
      await speakQuestion(question.questionText);
      setIsAISpeaking(false);

      // Start recording after AI finishes speaking
      startRecordingAnswer();
    } catch (error) {
      console.error('TTS error:', error);
      toast.error('Failed to play question audio');
      setIsAISpeaking(false);
      // Still allow recording even if TTS fails
      startRecordingAnswer();
    }
  }, []);

  /**
   * Start recording the user's answer
   */
  const startRecordingAnswer = useCallback(() => {
    if (!stream) {
      toast.error('Camera not available');
      return;
    }

    setInterviewState('recording');
    startRecording(stream);
    toast.success('Recording started. Answer the question!');
  }, [stream, startRecording]);

  /**
   * Handle "Next Question" button click
   */
  const handleNextQuestion = useCallback(async () => {
    if (!isRecording) return;

    setInterviewState('processing');

    // Stop recording
    await stopRecording();
  }, [isRecording, stopRecording]);

  /**
   * Upload recorded answer and move to next question
   */
  useEffect(() => {
    if (recordedBlob && interviewState === 'processing') {
      uploadAndProceed();
    }
  }, [recordedBlob, interviewState]);

  const uploadAndProceed = async () => {
    if (!recordedBlob || !currentQuestion) return;

    setIsUploading(true);
    const interviewId = sessionStorage.getItem('currentInterviewId') || 'temp-id';

    try {
      await uploadAnswerVideo(
        interviewId,
        currentQuestion.id,
        recordedBlob,
        currentQuestion.questionNumber
      );

      toast.success('Answer uploaded successfully!');

      // Reset recording state
      resetRecording();

      // Move to next question
      const nextIndex = currentQuestionIndex + 1;
      loadQuestion(nextIndex);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload answer. Please try again.');
      setInterviewState('recording');
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Complete the interview
   */
  const completeInterview = async () => {
    setInterviewState('completed');
    stopSpeaking();

    toast.success('Interview completed! Great job!');

    // Wait a bit before redirecting
    await new Promise(resolve => setTimeout(resolve, 2000));
    navigate('/dashboard');
  };

  /**
   * Handle errors
   */
  useEffect(() => {
    if (recordingError) {
      toast.error(recordingError);
      setInterviewState('error');
    }
  }, [recordingError]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  /**
   * Render different states
   */
  const renderContent = () => {
    switch (interviewState) {
      case 'requesting-permission':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="text-6xl mb-4">📹</div>
            <h2 className="text-2xl font-bold">Requesting Camera Access</h2>
            <p className="text-gray-400">
              Please allow camera and microphone access to start the interview
            </p>
            {cameraLoading && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"
              />
            )}
          </motion.div>
        );

      case 'permission-denied':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-400">Permission Denied</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              {cameraError || 'Camera and microphone access is required for the interview.'}
            </p>
            <div className="flex gap-4 justify-center">
              <AnimatedButton variant="secondary" onClick={() => navigate('/dashboard')}>
                Go Back
              </AnimatedButton>
              <AnimatedButton variant="primary" onClick={requestPermission}>
                Try Again
              </AnimatedButton>
            </div>
          </motion.div>
        );

      case 'loading-question':
      case 'ai-speaking':
      case 'recording':
      case 'processing':
        return (
          <div className="space-y-6">
            {/* Video Preview */}
            <VideoPreview stream={stream} isRecording={isRecording} />

            {/* Question Display */}
            <AnimatePresence mode="wait">
              <QuestionPlayer
                key={currentQuestion?.id}
                question={currentQuestion}
                isAISpeaking={isAISpeaking}
              />
            </AnimatePresence>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                {interviewState === 'processing' && 'Processing your answer...'}
                {interviewState === 'recording' && 'Recording your answer...'}
                {interviewState === 'ai-speaking' && 'Listen carefully to the question...'}
                {interviewState === 'loading-question' && 'Loading next question...'}
              </div>

              <div className="flex gap-4">
                {isRecording && (
                  <AnimatedButton
                    variant="primary"
                    onClick={handleNextQuestion}
                    isLoading={isUploading}
                  >
                    Next Question →
                  </AnimatedButton>
                )}
              </div>
            </div>
          </div>
        );

      case 'completed':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold gradient-text">Interview Completed!</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Great job! Your answers have been recorded and will be reviewed shortly.
            </p>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl"
            >
              ✓
            </motion.div>
          </motion.div>
        );

      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-400">Something Went Wrong</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              {recordingError || 'An error occurred during the interview.'}
            </p>
            <AnimatedButton variant="primary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </AnimatedButton>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-150 h-150 bg-purple-500/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-125 h-125 bg-pink-500/20 rounded-full blur-[150px]" />
      </div>

      {/* Recording Indicator (fixed position) */}
      <AnimatePresence>
        {isRecording && (
          <RecordingIndicator isRecording={isRecording} duration={recordingDuration} />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">
              AI <span className="gradient-text">Interview</span>
            </h1>
            <p className="text-gray-400">
              Answer each question clearly and professionally
            </p>
          </div>

          {/* Content Area */}
          <div className="glass-effect rounded-3xl p-8">
            {renderContent()}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Interview;
