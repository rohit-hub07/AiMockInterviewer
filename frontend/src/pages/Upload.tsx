import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';
import AnimatedButton from '../components/AnimatedButton';
import { updateInterviewSession, saveInterviewQuestions } from '../lib/api';

interface Question {
  id: number;
  question: string;
}

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.type === 'application/msword' || droppedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setFile(droppedFile);
    } else {
      toast.error('Please upload a PDF or DOC file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.data.success) {
        toast.success(response.data.message || 'Resume uploaded successfully!');
        setQuestions(response.data.questionsObject || []);
        setShowQuestions(true);

        sessionStorage.setItem('interviewQuestions', JSON.stringify(response.data.questionsObject));
      }
    } catch (error: any) {
      clearInterval(progressInterval);
      const message = error.response?.data?.message || 'Failed to upload resume. Please try again.';
      toast.error(message);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartInterview = async () => {
    try {
      const response = await api.post('/interviews/create');
      if (response.data.success) {
        const interviewId = response.data.interviewId;
        sessionStorage.setItem('currentInterviewId', interviewId);
        
        if (questions.length > 0) {
          try {
            await Promise.all([
              updateInterviewSession(interviewId, {
                questionCount: questions.length,
                title: `Interview - ${new Date().toLocaleDateString()}`,
              }),
              saveInterviewQuestions(interviewId, questions),
            ]);
          } catch (updateError) {
            console.error('Failed to update interview session:', updateError);
          }
        }
        
        navigate('/interview');
        toast.success('Starting interview...');
      }
    } catch (error: any) {
      toast.error('Failed to create interview session');
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-150 h-150 bg-purple-500/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-125 h-125 bg-pink-500/20 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold">
              Upload Your <span className="gradient-text">Resume</span>
            </h1>
            <p className="text-lg text-gray-400">
              Upload your resume to get personalized interview questions
            </p>
          </div>

          {/* Upload Area */}
          <AnimatePresence mode="wait">
            {!showQuestions ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-effect rounded-3xl p-8 space-y-6"
              >
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragging
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-600 hover:border-purple-500/50'
                    }`}
                >
                  <motion.div
                    animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="text-6xl">📄</div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {file ? file.name : 'Drop your resume here'}
                      </h3>
                      <p className="text-gray-400">
                        or click to browse (PDF, DOC, DOCX)
                      </p>
                    </div>
                  </motion.div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between glass-effect p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-purple flex items-center justify-center">
                          📄
                        </div>
                        <div>
                          <div className="font-medium">{file.name}</div>
                          <div className="text-sm text-gray-400">
                            {(file.size / 1024).toFixed(2)} KB
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setUploadProgress(0);
                        }}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    {isUploading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-2"
                      >
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Uploading...</span>
                          <span className="text-purple-400">{uploadProgress}%</span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            className="h-full bg-gradient-purple"
                          />
                        </div>
                      </motion.div>
                    )}

                    <AnimatedButton
                      variant="primary"
                      isLoading={isUploading}
                      onClick={handleUpload}
                      className="w-full"
                    >
                      Generate Interview Questions
                    </AnimatedButton>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="questions"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-effect rounded-3xl p-8 space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="text-5xl mb-4">✅</div>
                  <h2 className="text-2xl font-bold">Questions Generated!</h2>
                  <p className="text-gray-400">
                    {questions.length} personalized questions ready for your interview
                  </p>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {questions.map((q, index) => (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-effect p-4 rounded-xl"
                    >
                      <div className="flex gap-3">
                        <span className="text-purple-400 font-semibold">{index + 1}.</span>
                        <p className="text-gray-300">{q.question}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <AnimatedButton
                    variant="secondary"
                    onClick={() => {
                      setFile(null);
                      setShowQuestions(false);
                      setQuestions([]);
                      setUploadProgress(0);
                    }}
                    className="flex-1"
                  >
                    Upload Another Resume
                  </AnimatedButton>
                  <AnimatedButton
                    variant="primary"
                    onClick={handleStartInterview}
                    className="flex-1"
                  >
                    Start Interview
                  </AnimatedButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Upload;
