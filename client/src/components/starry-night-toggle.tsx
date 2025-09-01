import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

interface StarryNightToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

export function StarryNightToggle({ isDarkMode, onToggle }: StarryNightToggleProps) {
  return (
    <motion.button
      onClick={onToggle}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
        isDarkMode
          ? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80'
          : 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Icon with rotation animation */}
      <motion.div
        animate={{ rotate: isDarkMode ? 360 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {isDarkMode ? (
          <Moon className="w-3 h-3" />
        ) : (
          <Sun className="w-3 h-3" />
        )}
      </motion.div>
      
      <span>
        {isDarkMode ? 'Dark' : 'Light'}
      </span>
    </motion.button>
  );
}