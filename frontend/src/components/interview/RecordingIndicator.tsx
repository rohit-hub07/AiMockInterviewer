import { motion } from 'framer-motion';

interface RecordingIndicatorProps {
  isRecording: boolean;
  duration: number;
}

/**
 * RecordingIndicator component
 * Shows recording status with red dot and timer
 */
export const RecordingIndicator = ({ isRecording, duration }: RecordingIndicatorProps) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isRecording) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="fixed top-24 right-6 z-50 glass-effect px-6 py-3 rounded-full flex items-center gap-3"
    >
      {/* Pulsing red dot */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [1, 0.6, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="w-3 h-3 bg-red-500 rounded-full"
      />

      {/* Timer */}
      <span className="text-white font-mono font-medium">
        {formatTime(duration)}
      </span>

      {/* Recording text */}
      <span className="text-red-400 text-sm font-medium">RECORDING</span>
    </motion.div>
  );
};
