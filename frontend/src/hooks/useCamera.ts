import { useState, useEffect, useRef, useCallback } from 'react';

interface UseCameraResult {
  stream: MediaStream | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  requestPermission: () => Promise<void>;
  stopCamera: () => void;
  isStreamActive: () => boolean;
}

/**
 * Custom hook to manage camera and microphone access
 * Handles permission requests, stream management, and cleanup
 */
export const useCamera = (): UseCameraResult => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);

  const requestPermission = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Requesting camera and microphone permission...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      console.log('Permission granted! Stream obtained:', mediaStream);
      console.log('Video tracks:', mediaStream.getVideoTracks());
      console.log('Audio tracks:', mediaStream.getAudioTracks());

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setHasPermission(true);
      setError(null);
      console.log('hasPermission set to true');
    } catch (err) {
      const error = err as Error;
      console.error('Camera permission error:', error);

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setError('Camera and microphone access denied. Please enable permissions in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        setError('No camera or microphone found. Please connect a device and try again.');
      } else {
        setError('Failed to access camera and microphone. Please try again.');
      }

      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStream(null);
      setHasPermission(false);
    }
  }, []);

  const isStreamActive = useCallback(() => {
    if (!streamRef.current) return false;

    const videoTrack = streamRef.current.getVideoTracks()[0];
    const audioTrack = streamRef.current.getAudioTracks()[0];

    return !!(
      videoTrack &&
      audioTrack &&
      videoTrack.readyState === 'live' &&
      audioTrack.readyState === 'live'
    );
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    stream,
    isLoading,
    error,
    hasPermission,
    requestPermission,
    stopCamera,
    isStreamActive,
  };
};
