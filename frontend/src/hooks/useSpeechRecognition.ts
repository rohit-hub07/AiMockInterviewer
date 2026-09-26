import { useState, useRef, useCallback, useEffect } from 'react';

// Minimal typings for the Web Speech API (Chrome/Edge). Firefox/Safari may lack it.
interface SpeechRecognitionResultLike extends ArrayLike<{ transcript: string }> {
  isFinal: boolean;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

const getSpeechRecognitionCtor = (): (new () => SpeechRecognitionLike) | null => {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition as (new () => SpeechRecognitionLike) | undefined)
    || (w.webkitSpeechRecognition as (new () => SpeechRecognitionLike) | undefined)
    || null;
};

export const isSpeechRecognitionSupported = (): boolean => getSpeechRecognitionCtor() !== null;

/**
 * Live speech-to-text hook using the browser Web Speech API.
 * Runs in parallel with MediaRecorder so spoken answers become real
 * text that is sent to the backend/LLM (previously only a
 * "Video answer recorded..." placeholder was sent).
 */
export const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(isSpeechRecognitionSupported);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTranscriptRef = useRef('');
  const shouldRestartRef = useRef(false);

  // Mirror transcript in a ref for use inside MediaRecorder callbacks (avoids stale closures).
  const transcriptRef = useRef('');
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const startListening = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setError('Speech recognition is not supported in this browser. Answers will be saved without transcription.');
      return;
    }
    try {
      // Stop any previous instance
      try { recognitionRef.current?.abort(); } catch { /* noop */ }

      const recognition = new Ctor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const alt = result[0];
          if (!alt) continue;
          if (result.isFinal) {
            finalTranscriptRef.current = (finalTranscriptRef.current + ' ' + alt.transcript).trim();
          } else {
            interim += alt.transcript;
          }
        }
        setTranscript((finalTranscriptRef.current + ' ' + interim).trim());
      };

      recognition.onerror = (event: { error: string }) => {
        // 'no-speech' / 'audio-capture' are common when mic is quiet; don't spam.
        if (event.error === 'no-speech' || event.error === 'aborted') return;
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setError('Microphone blocked for transcription. Please allow mic access.');
        }
      };

      recognition.onend = () => {
        // Auto-restart while the answer recording is still active (Chrome stops after ~60s / pauses).
        if (shouldRestartRef.current) {
          try { recognition.start(); } catch { /* already started */ }
        } else {
          setIsListening(false);
        }
      };

      finalTranscriptRef.current = '';
      setTranscript('');
      setError(null);
      shouldRestartRef.current = true;
      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError('Could not start transcription.');
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    const rec = recognitionRef.current;
    if (rec) {
      try { rec.stop(); } catch { /* noop */ }
    }
    setIsListening(false);
    return transcriptRef.current;
  }, []);

  const resetTranscript = useCallback(() => {
    finalTranscriptRef.current = '';
    setTranscript('');
  }, []);

  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      try { recognitionRef.current?.abort(); } catch { /* noop */ }
    };
  }, []);

  return {
    transcript,
    transcriptRef,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
};
