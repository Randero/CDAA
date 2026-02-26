import { motion } from "framer-motion";

export const CyberGrid = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base grid */}
      <div className="absolute inset-0 cyber-grid" />
      
      {/* Animated scanline */}
      <motion.div 
        className="absolute inset-x-0 h-32 cyber-scanline"
        animate={{ y: ["-100%", "1000%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Floating orbs */}
      <motion.div 
        className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-cyan/10 to-primary/10 blur-3xl"
        animate={{ 
          scale: [1, 1.3, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      
      <motion.div 
        className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-gradient-to-r from-accent/10 to-magenta/10 blur-3xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-cyan/20 to-transparent" />
      
      {/* Animated lines */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--cyan))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--cyan))" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(var(--cyan))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.line
          x1="0"
          y1="30%"
          x2="100%"
          y2="30%"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        />
        <motion.line
          x1="0"
          y1="70%"
          x2="100%"
          y2="70%"
          stroke="url(#lineGradient)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 3, delay: 1.5 }}
        />
      </svg>
    </div>
  );
};
