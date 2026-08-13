import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnimatedButton from '../components/AnimatedButton';
import type { Interview, InterviewFeedback } from '../types';
import { useEffect, useState } from 'react';
import { getUserInterviews, getInterviewFeedback } from '../lib/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [feedbackData, setFeedbackData] = useState<InterviewFeedback | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  useEffect(() => {
    fetchUserInterviews();
  }, []);

  const fetchUserInterviews = async () => {
    try {
      setIsLoading(true);
      const data = await getUserInterviews();
      setInterviews(data.interviews || []);
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
      toast.error('Failed to load your interviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewFeedback = async (interview: Interview) => {
    if (interview.status !== 'completed') return;

    try {
      setLoadingFeedback(true);
      setSelectedInterview(interview);
      setShowFeedbackModal(true);

      const feedback = await getInterviewFeedback(interview.id);
      setFeedbackData(feedback);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
      toast.error('Failed to load feedback');
      setShowFeedbackModal(false);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setSelectedInterview(null);
    setFeedbackData(null);
  };

  const handleStartInterview = () => {
    // Check if there are questions in sessionStorage
    const questions = sessionStorage.getItem('interviewQuestions');
    if (!questions) {
      navigate('/upload');
      return;
    }
    navigate('/interview');
  };

  // Calculate stats from actual user data
  const totalInterviews = interviews.length;
  const completedInterviews = interviews.filter(i => i.status === 'completed');
  const averageScore = completedInterviews.length > 0
    ? Math.round(completedInterviews.reduce((sum, i) => sum + (i.score || 0), 0) / completedInterviews.length)
    : 0;
  const successRate = totalInterviews > 0
    ? Math.round((completedInterviews.length / totalInterviews) * 100)
    : 0;

  const stats = [
    {
      icon: '📊',
      label: 'Total Interviews',
      value: totalInterviews.toString(),
      change: completedInterviews.length > 0 ? `${completedInterviews.length} completed` : 'No interviews yet',
    },
    {
      icon: '⭐',
      label: 'Average Score',
      value: averageScore > 0 ? `${averageScore}%` : 'N/A',
      change: completedInterviews.length > 0 ? 'Based on completed' : 'Complete an interview',
    },
    {
      icon: '🎯',
      label: 'Success Rate',
      value: `${successRate}%`,
      change: totalInterviews > 0 ? 'Completion rate' : 'Start practicing',
    },
  ];

  const getStatusColor = (status: Interview['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10';
      case 'in-progress':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'pending':
        return 'text-blue-400 bg-blue-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: Interview['status']) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'in-progress':
        return '⏳';
      case 'pending':
        return '📋';
      default:
        return '•';
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-150 h-150 bg-purple-500/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-125 h-125 bg-pink-500/20 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              Welcome back, <span className="gradient-text">{user?.name}</span>
            </h1>
            <p className="text-gray-400 text-lg">Track your interview practice progress</p>
          </div>
          <Link to="/upload">
            <AnimatedButton variant="primary">
              + New Interview
            </AnimatedButton>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass-effect rounded-2xl p-6 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-4xl">{stat.icon}</span>
                <span className="text-sm text-gray-400">{stat.label}</span>
              </div>
              <div className="text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.change}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Interview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Interviews</h2>
            <select className="glass-effect px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option>All Status</option>
              <option>Completed</option>
              <option>In Progress</option>
              <option>Pending</option>
            </select>
          </div>

          <div className="grid gap-6">
            {isLoading ? (
              <div className="glass-effect rounded-2xl p-12 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-gray-400">Loading your interviews...</p>
              </div>
            ) : interviews.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-effect rounded-2xl p-12 text-center space-y-4"
              >
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-bold">No Interviews Yet</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Start your first AI-powered mock interview to track your progress and get personalized feedback.
                </p>
                <Link to="/upload">
                  <AnimatedButton variant="primary" className="mt-4">
                    Start Your First Interview
                  </AnimatedButton>
                </Link>
              </motion.div>
            ) : (
              interviews.map((interview, index) => (
                <motion.div
                  key={interview.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="glass-effect rounded-2xl p-6 cursor-pointer"
                  onClick={() => interview.status === 'completed' && handleViewFeedback(interview)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold">{interview.title}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            interview.status
                          )}`}
                        >
                          {getStatusIcon(interview.status)} {interview.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-2">
                          📅 {new Date(interview.date).toLocaleDateString()}
                        </span>
                        {interview.questions !== undefined && (
                          <span className="flex items-center gap-2">
                            ❓ {interview.questions} questions
                          </span>
                        )}
                        {interview.duration && (
                          <span className="flex items-center gap-2">
                            ⏱️ {interview.duration}
                          </span>
                        )}
                        {interview.score !== undefined && (
                          <span className="flex items-center gap-2">
                            ⭐ Score: {interview.score}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {interview.status === 'completed' ? (
                        <AnimatedButton
                          variant="secondary"
                          className="text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewFeedback(interview);
                          }}
                        >
                          View Feedback
                        </AnimatedButton>
                      ) : interview.status === 'in-progress' ? (
                        <AnimatedButton
                          variant="primary"
                          className="text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartInterview();
                          }}
                        >
                          Resume Interview
                        </AnimatedButton>
                      ) : (
                        <AnimatedButton
                          variant="primary"
                          className="text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartInterview();
                          }}
                        >
                          Start Interview
                        </AnimatedButton>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && selectedInterview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-8 overflow-y-auto"
            onClick={closeFeedbackModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-effect rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold gradient-text mb-2">
                    Interview Feedback
                  </h2>
                  <p className="text-gray-400">{selectedInterview.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedInterview.date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={closeFeedbackModal}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              {loadingFeedback ? (
                <div className="py-12 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
                  />
                  <p className="text-gray-400">Loading feedback...</p>
                </div>
               ) : feedbackData ? (
                <>
                   {(selectedInterview.score !== undefined || feedbackData.overallScore !== undefined) && (
                    <div className="glass-effect bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Overall Score</p>
                          <p className="text-5xl font-bold gradient-text">
                            {(selectedInterview.score ?? feedbackData.overallScore)!}%
                          </p>
                        </div>
                        <div className="text-6xl">
                          {(selectedInterview.score ?? feedbackData.overallScore)! >= 80 ? '🌟' :
                            (selectedInterview.score ?? feedbackData.overallScore)! >= 60 ? '⭐' : '📈'}
                        </div>
                      </div>
                    </div>
                  )}

                  {(feedbackData.strengths?.length || feedbackData.improvements?.length) && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {feedbackData.strengths && feedbackData.strengths.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-xl font-semibold flex items-center gap-2">
                            <span>💪</span> Strengths
                          </h3>
                          <ul className="space-y-2">
                            {feedbackData.strengths.map((strength, idx) => (
                              <li key={idx} className="flex gap-2 text-sm text-gray-300">
                                <span className="text-green-400">✓</span>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {feedbackData.improvements && feedbackData.improvements.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-xl font-semibold flex items-center gap-2">
                            <span>🎯</span> Areas to Improve
                          </h3>
                          <ul className="space-y-2">
                            {feedbackData.improvements.map((improvement, idx) => (
                              <li key={idx} className="flex gap-2 text-sm text-gray-300">
                                <span className="text-yellow-400">→</span>
                                {improvement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Detailed Feedback */}
                  {feedbackData.detailedFeedback && (
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold">📝 Detailed Feedback</h3>
                      <div className="glass-effect rounded-xl p-4 text-sm text-gray-300 whitespace-pre-wrap">
                        {feedbackData.detailedFeedback}
                      </div>
                    </div>
                  )}

                  {/* Questions & Answers */}
                  {feedbackData.questions && feedbackData.questions.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold">❓ Questions & Answers</h3>
                      <div className="space-y-4">
                        {feedbackData.questions.map((q, idx) => {
                          const answer = feedbackData.userAnswers?.find(a => a.id === q.id);
                          return (
                            <div key={q.id} className="glass-effect rounded-xl p-4 space-y-2">
                              <p className="font-medium text-purple-400">
                                Q{idx + 1}: {q.question}
                              </p>
                              <p className="text-sm text-gray-300">
                                <span className="text-gray-500">A:</span> {answer?.answer || 'No answer provided'}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12 text-center text-gray-400">
                  <p>No feedback available for this interview.</p>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end">
                <AnimatedButton variant="secondary" onClick={closeFeedbackModal}>
                  Close
                </AnimatedButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
