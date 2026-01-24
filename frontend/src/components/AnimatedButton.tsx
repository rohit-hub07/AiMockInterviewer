import type { HTMLMotionProps } from 'framer-motion'
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface AnimatedButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

const AnimatedButton = ({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  ...props
}: AnimatedButtonProps) => {
  const baseClasses = 'px-6 py-3 rounded-full font-medium text-sm transition-all duration-200';

  const variantClasses = {
    primary: 'bg-gradient-purple text-white shadow-lg shadow-purple-500/50',
    secondary: 'glass-effect text-white hover:bg-white/10',
    outline: 'border-2 border-purple-500 text-purple-400 hover:bg-purple-500/10',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      disabled={isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
          />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default AnimatedButton;
