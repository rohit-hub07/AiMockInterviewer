import { motion } from 'framer-motion';
import type { InterviewQuestion } from '../../types';

interface QuestionPlayerProps {
  question: InterviewQuestion | null;
  isAISpeaking: boolean;
}

/**
 * QuestionPlayer component
 * Displays the current question with AI speaking animation
 */
export const QuestionPlayer = ({ question, isAISpeaking }: QuestionPlayerProps) => {
  if (!question) {
    return (
      <div className="glass-effect rounded-2xl p-8 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-gray-400">Loading question...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="glass-effect rounded-2xl p-8 space-y-6"
    >
      {/* Question header */}
      <div className="flex items-center justify-between">
        <span className="text-purple-400 font-medium">
          Question {question.questionNumber} of {question.totalQuestions}
        </span>

        {isAISpeaking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 text-sm text-gray-400"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 bg-purple-500 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              className="w-2 h-2 bg-purple-500 rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              className="w-2 h-2 bg-purple-500 rounded-full"
            />
            <span className="ml-2">AI is speaking...</span>
          </motion.div>
        )}
      </div>

      {/* Question text */}
      <div className="space-y-2">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-purple flex items-center justify-center shrink-0">
            <span className="text-2xl">🤖</span>
          </div>
          <div className="flex-1">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white leading-relaxed"
            >
              {question.questionText}
            </motion.p>
          </div>
        </div>
      </div>

      {/* Visual indicator for AI speaking */}
      {isAISpeaking && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
          className="h-1 bg-gradient-purple rounded-full origin-left"
        />
      )}
    </motion.div>
  );
};
