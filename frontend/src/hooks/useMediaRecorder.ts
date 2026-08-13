import { useState, useRef, useCallback } from 'react';

interface UseMediaRecorderResult {
  isRecording: boolean;
  recordedBlob: Blob | null;
  recordingDuration: number;
  error: string | null;
  startRecording: (stream: MediaStream) => void;
  stopRecording: () => Promise<void>;
  resetRecording: () => void;
}

/**
 * Custom hook to manage video + audio recording
 * Records from a MediaStream and produces a Blob
 */
export const useMediaRecorder = (): UseMediaRecorderResult => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const startRecording = useCallback((stream: MediaStream) => {
    try {
      // Reset state
      chunksRef.current = [];
      setRecordedBlob(null);
      setRecordingDuration(0);
      setError(null);

      // Create MediaRecorder with preferred format
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      let recorder: MediaRecorder;

      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        // Fallback to default codecs if vp9 not supported
        recorder = new MediaRecorder(stream);
      }

      // Collect data chunks
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        setIsRecording(false);

        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      // Handle errors
      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording failed. Please try again.');
        setIsRecording(false);
      };

      // Start recording
      recorder.start(1000); // Collect data every second
      mediaRecorderRef.current = recorder;
      startTimeRef.current = Date.now();
      setIsRecording(true);

      // Start duration timer
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setRecordingDuration(elapsed);
      }, 1000);

    } catch (err) {
      console.error('Start recording error:', err);
      setError('Failed to start recording. Please check your permissions.');
    }
  }, []);

  const stopRecording = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state === 'recording') {
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          setRecordedBlob(blob);
          setIsRecording(false);

          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }

          resolve();
        };

        recorder.stop();
      } else {
        resolve();
      }
    });
  }, []);

  const resetRecording = useCallback(() => {
    chunksRef.current = [];
    setRecordedBlob(null);
    setRecordingDuration(0);
    setError(null);
  }, []);

  return {
    isRecording,
    recordedBlob,
    recordingDuration,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  };
};
