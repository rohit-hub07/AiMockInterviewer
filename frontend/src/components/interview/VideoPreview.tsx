import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface VideoPreviewProps {
  stream: MediaStream | null;
  isRecording: boolean;
}

/**
 * VideoPreview component
 * Displays live camera feed with mirror effect (self-view style)
 */
export const VideoPreview = ({ stream, isRecording }: VideoPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) {
    return (
      <div className="aspect-video w-full bg-dark-card rounded-2xl flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">📹</div>
          <p className="text-gray-400">Camera not ready</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full bg-dark-card rounded-2xl overflow-hidden">
      {/* Video element with mirror effect */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover scale-x-[-1]" // Mirror effect
      />

      {/* Recording overlay indicator */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 border-4 border-red-500 rounded-2xl pointer-events-none"
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-white rounded-full" />
            REC
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
