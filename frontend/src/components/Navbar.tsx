import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto">
        <div className="glass-effect rounded-2xl px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-purple flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <span className="text-xl font-bold text-white">InterviewAI</span>
            </motion.div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className={`text-sm font-medium transition-colors ${isActive('/dashboard')
                        ? 'text-purple-400'
                        : 'text-gray-300 hover:text-white'
                      }`}
                  >
                    Dashboard
                  </motion.span>
                </Link>
                <Link to="/upload">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    className={`text-sm font-medium transition-colors ${isActive('/upload')
                        ? 'text-purple-400'
                        : 'text-gray-300 hover:text-white'
                      }`}
                  >
                    Upload Resume
                  </motion.span>
                </Link>
              </>
            ) : (
              <>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  Features
                </motion.span>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  Pricing
                </motion.span>
              </>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-purple flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={logout}
                    className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Logout
                  </motion.button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-4 py-2"
                  >
                    Login
                  </motion.button>
                </Link>
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm font-medium bg-gradient-purple text-white px-6 py-2 rounded-full"
                  >
                    Get Started
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
