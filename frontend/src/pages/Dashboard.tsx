import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnimatedButton from '../components/AnimatedButton';
import type { Interview } from '../types';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStartInterview = () => {
    // Check if there are questions in sessionStorage
    const questions = sessionStorage.getItem('interviewQuestions');
    if (!questions) {
      navigate('/upload');
      return;
    }
    navigate('/interview');
  };

  // Sample interviews - you can fetch from backend later
  const interviews: Interview[] = [
    {
      id: '1',
      title: 'Frontend Developer Interview',
      status: 'completed',
      date: '2026-01-20',
      score: 85,
      questions: 10,
      duration: '45 min',
    },
    {
      id: '2',
      title: 'React Developer Interview',
      status: 'in-progress',
      date: '2026-01-24',
      questions: 8,
      duration: '30 min',
    },
    {
      id: '3',
      title: 'Full Stack Interview',
      status: 'pending',
      date: '2026-01-25',
      questions: 15,
      duration: '60 min',
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
            {interviews.map((interview, index) => (
              <motion.div
                key={interview.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                whileHover={{ x: 5 }}
                className="glass-effect rounded-2xl p-6 cursor-pointer"
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
                      <span className="flex items-center gap-2">
                        ❓ {interview.questions} questions
                      </span>
                      <span className="flex items-center gap-2">
                        ⏱️ {interview.duration}
                      </span>
                      {interview.score && (
                        <span className="flex items-center gap-2">
                          ⭐ Score: {interview.score}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {interview.status === 'completed' ? (
                      <AnimatedButton variant="secondary" className="text-sm">
                        View Results
                      </AnimatedButton>
                    ) : interview.status === 'in-progress' ? (
                      <AnimatedButton
                        variant="primary"
                        className="text-sm"
                        onClick={handleStartInterview}
                      >
                        Resume Interview
                      </AnimatedButton>
                    ) : (
                      <AnimatedButton
                        variant="primary"
                        className="text-sm"
                        onClick={handleStartInterview}
                      >
                        Start Interview
                      </AnimatedButton>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="glass-effect rounded-2xl p-6 space-y-4"
        >
          <h2 className="text-2xl font-bold">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-4 py-3 border-b border-gray-700 last:border-0"
              >
                <span className="text-2xl">{activity.icon}</span>
                <div className="flex-1">
                  <p className="text-sm">{activity.text}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const stats = [
  {
    icon: '📊',
    label: 'Total Interviews',
    value: '12',
    change: '+3 this week',
  },
  {
    icon: '⭐',
    label: 'Average Score',
    value: '82%',
    change: '+5% improvement',
  },
  {
    icon: '🎯',
    label: 'Success Rate',
    value: '89%',
    change: 'Top 10%',
  },
];

const recentActivity = [
  {
    icon: '✅',
    text: 'Completed Frontend Developer Interview',
    time: '2 hours ago',
  },
  {
    icon: '📄',
    text: 'Uploaded new resume',
    time: '1 day ago',
  },
  {
    icon: '🎯',
    text: 'Achieved 90% score in React Interview',
    time: '3 days ago',
  },
  {
    icon: '🚀',
    text: 'Started Full Stack Interview preparation',
    time: '5 days ago',
  },
];

export default Dashboard;
