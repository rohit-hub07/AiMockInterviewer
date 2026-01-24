import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AnimatedButton from '../components/AnimatedButton';

const Home = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-150 h-150 bg-purple-500/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-125 h-125bg-pink-500/20 rounded-full blur-[150px]" />
      </div>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="inline-block"
              >
                <div className="glass-effect px-4 py-2 rounded-full text-sm text-purple-300">
                  ✨ AI-Powered Interview Practice
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="text-5xl lg:text-7xl font-bold leading-tight"
              >
                Ace Your Next{' '}
                <span className="gradient-text">Interview</span> with AI
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="text-lg text-gray-300 leading-relaxed"
              >
                Practice with our AI interviewer, get real-time feedback, and improve your
                interview skills. Upload your resume and start practicing with personalized
                questions tailored to your experience.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <Link to="/signup">
                  <AnimatedButton variant="primary">
                    Get Started Free
                  </AnimatedButton>
                </Link>
                <Link to="/upload">
                  <AnimatedButton variant="secondary">
                    Upload Resume
                  </AnimatedButton>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                className="flex gap-8 pt-8"
              >
                <div>
                  <div className="text-3xl font-bold gradient-text">10K+</div>
                  <div className="text-sm text-gray-400">Interviews Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold gradient-text">95%</div>
                  <div className="text-sm text-gray-400">Success Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold gradient-text">4.9★</div>
                  <div className="text-sm text-gray-400">User Rating</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Content - 3D Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full h-150">
                {/* Main card */}
                <motion.div
                  animate={{
                    y: [0, -20, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-100"
                >
                  <div className="glass-effect rounded-3xl p-8 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-purple flex items-center justify-center">
                        <span className="text-3xl">🤖</span>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">AI Interviewer</div>
                        <div className="text-sm text-gray-400">Ready to help</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="glass-effect p-4 rounded-xl">
                        <div className="text-sm text-purple-300 mb-2">Question 1 of 10</div>
                        <div className="text-sm text-gray-300">
                          Tell me about a challenging project you've worked on...
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1 h-2 bg-purple-500 rounded-full" />
                        <div className="flex-1 h-2 bg-purple-500/30 rounded-full" />
                        <div className="flex-1 h-2 bg-purple-500/30 rounded-full" />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button className="flex-1 glass-effect py-3 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
                        Skip
                      </button>
                      <button className="flex-1 bg-gradient-purple py-3 rounded-xl text-sm font-medium">
                        Answer
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Floating elements */}
                <motion.div
                  animate={{
                    y: [0, 15, 0],
                    rotate: [0, 5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute top-20 right-10 glass-effect p-4 rounded-2xl"
                >
                  <div className="text-2xl">✅</div>
                </motion.div>

                <motion.div
                  animate={{
                    y: [0, -15, 0],
                    rotate: [0, -5, 0],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.5,
                  }}
                  className="absolute bottom-20 left-10 glass-effect p-4 rounded-2xl"
                >
                  <div className="text-2xl">🎯</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Why Choose InterviewAI?</h2>
            <p className="text-gray-400 text-lg">
              Everything you need to succeed in your next interview
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="glass-effect p-8 rounded-3xl space-y-4 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-purple flex items-center justify-center text-3xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const features = [
  {
    icon: '🎯',
    title: 'Personalized Questions',
    description: 'Get interview questions tailored to your resume and the role you\'re applying for.',
  },
  {
    icon: '💡',
    title: 'Real-time Feedback',
    description: 'Receive instant feedback on your answers with detailed improvement suggestions.',
  },
  {
    icon: '📊',
    title: 'Performance Analytics',
    description: 'Track your progress over time and identify areas for improvement.',
  },
  {
    icon: '🎤',
    title: 'Voice Practice',
    description: 'Practice speaking your answers out loud with voice recognition support.',
  },
  {
    icon: '⚡',
    title: 'Quick Setup',
    description: 'Start practicing within minutes by simply uploading your resume.',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    description: 'Your data is encrypted and kept completely private and secure.',
  },
];

export default Home;
