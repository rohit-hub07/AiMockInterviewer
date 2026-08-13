import { useState, useEffect, useCallback, useRef } from 'react';
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
  submitTextAnswers,
} from '../lib/interview';
import { generateFeedback, endInterviewSession } from '../lib/api';
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
  const { stream, isLoading: cameraLoading, error: cameraError, hasPermission, requestPermission, stopCamera } = useCamera();
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
  const [showEndConfirmDialog, setShowEndConfirmDialog] = useState(false);
  const [hasLoadedFirstQuestion, setHasLoadedFirstQuestion] = useState(false);
  const [feedbackScore, setFeedbackScore] = useState<number | null>(null);
  const lastProcessedBlobRef = useRef<Blob | null>(null);

  // Default answer text for skipped questions
  const DEFAULT_SKIPPED_ANSWER = "I don't know the answer of this question";

  // Store all answers to upload at the end
  const [collectedAnswers, setCollectedAnswers] = useState<Array<{
    questionId: string;
    questionNumber: number;
    videoBlob: Blob | null;
    answerText: string;
  }>>([]);

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
    console.log('Permission state changed:', { hasPermission, stream: !!stream, cameraError });

    if (cameraError) {
      console.log('Setting state to permission-denied due to error:', cameraError);
      setInterviewState('permission-denied');
      toast.error(cameraError);
    } else if (hasPermission && stream && !hasLoadedFirstQuestion) {
      console.log('Permission granted and stream available, loading question');
      setHasLoadedFirstQuestion(true);
      setInterviewState('loading-question');
      loadQuestion(0);
    }
  }, [hasPermission, stream, cameraError, hasLoadedFirstQuestion]);

  /**
   * Start recording the user's answer
   */
  const startRecordingAnswer = useCallback(() => {
    console.log('startRecordingAnswer called, stream:', stream);

    if (!stream) {
      console.error('Stream is null/undefined in startRecordingAnswer!');
      toast.error('Camera not available. Please allow camera access.');
      setInterviewState('permission-denied');
      return;
    }

    // Verify stream is still active
    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];

    console.log('Video track:', videoTrack, 'readyState:', videoTrack?.readyState);
    console.log('Audio track:', audioTrack, 'readyState:', audioTrack?.readyState);

    if (!videoTrack || !audioTrack || videoTrack.readyState !== 'live' || audioTrack.readyState !== 'live') {
      console.error('Tracks not live! Video:', videoTrack?.readyState, 'Audio:', audioTrack?.readyState);
      toast.error('Camera or microphone is not available. Please refresh and try again.');
      setInterviewState('permission-denied');
      return;
    }

    console.log('Starting recording with stream...');
    setInterviewState('recording');
    startRecording(stream);
    toast.success('Recording started. Answer the question!');
  }, [stream, startRecording]);

  /**
   * Load and play a question
   */
  const loadQuestion = useCallback(async (questionIndex: number) => {
    console.log('loadQuestion called for index:', questionIndex, 'stream available:', !!stream);

    // Cancel any ongoing speech first
    stopSpeaking();
    setIsAISpeaking(false);

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
      console.log('Speaking question:', question.questionText);
      await speakQuestion(question.questionText);
      console.log('Question spoken, starting recording...');
      setIsAISpeaking(false);

      // Start recording after AI finishes speaking
      startRecordingAnswer();
    } catch (error) {
      console.error('TTS error:', error);
      // Only show error if it's not an interruption
      if (error instanceof Error && !error.message.includes('interrupted')) {
        toast.error('Failed to play question audio');
      }
      setIsAISpeaking(false);
      // Still allow recording even if TTS fails
      startRecordingAnswer();
    }
  }, [stream, startRecordingAnswer]);

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
   * Save answer to collection and move to next question
   */
  const saveAnswerAndProceed = useCallback((blob: Blob | null) => {
    if (!currentQuestion) return;

    console.log('Saving answer for question', currentQuestionIndex + 1, 'blob:', !!blob);

    const answerText = blob ? '' : DEFAULT_SKIPPED_ANSWER;
    setCollectedAnswers(prev => [...prev, {
      questionId: currentQuestion.id,
      questionNumber: currentQuestion.questionNumber,
      videoBlob: blob,
      answerText: answerText,
    }]);

    if (blob) {
      toast.success(`Answer ${currentQuestionIndex + 1} saved!`);
    } else {
      toast('Answer skipped (no recording)', { icon: '⏭️' });
    }

    resetRecording();

    const nextIndex = currentQuestionIndex + 1;
    loadQuestion(nextIndex);
  }, [currentQuestion, currentQuestionIndex, resetRecording, loadQuestion]);

  /**
   * Handle skip question
   */
  const handleSkipQuestion = useCallback(() => {
    if (!currentQuestion) return;

    if (isRecording) {
      stopRecording();
    }

    stopSpeaking();
    setIsAISpeaking(false);

    saveAnswerAndProceed(null);
  }, [currentQuestion, isRecording, stopRecording, saveAnswerAndProceed, stopSpeaking]);

  /**
   * Handle end interview early
   */
  const handleEndInterview = useCallback(() => {
    // Stop any ongoing recording
    if (isRecording) {
      stopRecording();
    }

    // Stop AI speaking
    stopSpeaking();
    setIsAISpeaking(false);

    completeInterview();
  }, [isRecording, stopRecording, stopSpeaking]);

  /**
   * Save recorded answer and move to next question
   */
  useEffect(() => {
    if (recordedBlob && interviewState === 'processing') {
      if (lastProcessedBlobRef.current === recordedBlob) {
        return;
      }
      lastProcessedBlobRef.current = recordedBlob;
      saveAnswerAndProceed(recordedBlob);
    }
  }, [recordedBlob, interviewState, saveAnswerAndProceed]);

  useEffect(() => {
    if (!recordedBlob) {
      lastProcessedBlobRef.current = null;
    }
  }, [recordedBlob]);

  /**
   * Complete the interview and upload all answers
   */
  const completeInterview = async () => {
    setInterviewState('completed');
    stopSpeaking();
    stopCamera();

    console.log('Interview complete! Total answers collected:', collectedAnswers.length);

    const MIN_BYTES = 50_000; 
    const answeredCount = collectedAnswers.filter(a => a.videoBlob && a.videoBlob.size > MIN_BYTES).length;
    const skippedCount = collectedAnswers.length - answeredCount;

    const interviewId = sessionStorage.getItem('currentInterviewId') || 'temp-id';

    try {
      setIsUploading(true);
      toast.loading('Uploading your answers...');

      const textAnswers = collectedAnswers.map(answer => ({
        id: parseInt(answer.questionId),
        answer: answer.answerText || DEFAULT_SKIPPED_ANSWER,
        isSkipped: !answer.videoBlob || answer.videoBlob.size <= MIN_BYTES,
      }));
      console.log("textAnswers: ", textAnswers);
      await submitTextAnswers(interviewId, textAnswers);

      toast.dismiss();
      toast.success(`Answers uploaded! ${answeredCount} answered, ${skippedCount} skipped`);

      toast.loading('Generating your feedback...');

      try {
        const feedbackResult = await generateFeedback(interviewId);
        console.log('Feedback generated:', feedbackResult);
        const overallScore = feedbackResult?.feedback?.result?.score ?? feedbackResult?.feedback?.overallScore ?? null;
        
        if (overallScore !== null) {
          setFeedbackScore(overallScore);
        }

        toast.dismiss();
        toast.success('Feedback generated successfully!');
      } catch (feedbackError) {
        console.error('Failed to generate feedback:', feedbackError);
        toast.dismiss();
        toast.error('Failed to generate feedback, but your answers are saved.');
      }

      try {
        await endInterviewSession(interviewId);
      } catch (endError) {
        console.error('Failed to end interview session:', endError);
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to upload answers:', error);
      toast.dismiss();
      toast.error('Failed to upload some answers. Please try again.');
      setIsUploading(false);
    }
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
      stopCamera();
    };
  }, [stopSpeaking, stopCamera]);

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
            {/* Debug info */}
            <div className="text-xs text-gray-500 bg-gray-800/50 rounded p-3 max-w-md mx-auto">
              <div>Has Permission: {hasPermission ? 'Yes' : 'No'}</div>
              <div>Stream: {stream ? 'Active' : 'None'}</div>
              <div>Loading: {cameraLoading ? 'Yes' : 'No'}</div>
              <div>Error: {cameraError || 'None'}</div>
            </div>
            <div className="flex gap-4 justify-center">
              <AnimatedButton variant="secondary" onClick={() => navigate('/dashboard')}>
                Go Back
              </AnimatedButton>
              <AnimatedButton
                variant="primary"
                onClick={() => {
                  console.log('Manually requesting permission again...');
                  requestPermission();
                }}
              >
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
              <div className="flex gap-3">
                {/* End Interview Button */}
                {(isRecording || isAISpeaking) && !isUploading && (
                  <AnimatedButton
                    variant="secondary"
                    onClick={() => setShowEndConfirmDialog(true)}
                  >
                    End Interview
                  </AnimatedButton>
                )}
              </div>

              <div className="flex-1 text-center text-sm text-gray-400">
                {interviewState === 'processing' && 'Processing your answer...'}
                {interviewState === 'recording' && 'Recording your answer...'}
                {interviewState === 'ai-speaking' && 'Listen carefully to the question...'}
                {interviewState === 'loading-question' && 'Loading next question...'}
              </div>

              <div className="flex gap-3">
                {/* Skip Question Button */}
                {(isRecording || isAISpeaking) && !isUploading && (
                  <AnimatedButton
                    variant="secondary"
                    onClick={handleSkipQuestion}
                  >
                    Skip Question
                  </AnimatedButton>
                )}

                {/* Next Question Button */}
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
        const answeredCount = collectedAnswers.filter(a => a.videoBlob).length;
        const skippedCount = collectedAnswers.length - answeredCount;

        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <h2 className="text-3xl font-bold gradient-text">Interview Completed!</h2>

             {/* Summary Stats */}
             <div className="glass-effect rounded-2xl p-6 max-w-md mx-auto space-y-4">
               <h3 className="text-xl font-semibold text-gray-300">Summary</h3>
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-green-500/10 rounded-xl p-4">
                   <p className="text-3xl font-bold text-green-400">{answeredCount}</p>
                   <p className="text-sm text-gray-400">Answered</p>
                 </div>
                 <div className="bg-yellow-500/10 rounded-xl p-4">
                   <p className="text-3xl font-bold text-yellow-400">{skippedCount}</p>
                   <p className="text-sm text-gray-400">Skipped</p>
                 </div>
               </div>
               <div className="bg-purple-500/10 rounded-xl p-4">
                 <p className="text-3xl font-bold gradient-text">{collectedAnswers.length}</p>
                 <p className="text-sm text-gray-400">Total Questions</p>
               </div>
                {feedbackScore !== null && (
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">Overall Score</p>
                    <p className="text-4xl font-bold gradient-text">{feedbackScore}%</p>
                  </div>
                )}
             </div>

            <p className="text-gray-400 max-w-md mx-auto">
              {isUploading
                ? 'Processing your interview...'
                : 'Your feedback is being generated. Redirecting to dashboard...'}
            </p>

            {isUploading && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"
              />
            )}
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

      {/* End Interview Confirmation Dialog */}
      <AnimatePresence>
        {showEndConfirmDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            onClick={() => setShowEndConfirmDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-effect rounded-2xl p-8 max-w-md w-full space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="text-5xl mb-4">⚠️</div>
                <h3 className="text-2xl font-bold">End Interview?</h3>
                <p className="text-gray-400">
                  Are you sure you want to end the interview? You have answered {currentQuestionIndex} out of {currentQuestion?.totalQuestions || 0} questions.
                </p>
              </div>

              <div className="flex gap-4">
                <AnimatedButton
                  variant="secondary"
                  onClick={() => setShowEndConfirmDialog(false)}
                  className="flex-1"
                >
                  Continue Interview
                </AnimatedButton>
                <AnimatedButton
                  variant="primary"
                  onClick={() => {
                    setShowEndConfirmDialog(false);
                    handleEndInterview();
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  Yes, End Now
                </AnimatedButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Interview;
