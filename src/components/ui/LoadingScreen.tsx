import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Outer spinning ring */}
      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary/50"
          style={{ width: 120, height: 120 }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        {/* Inner pulsing ring */}
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-transparent border-b-accent border-l-accent/50"
          style={{ width: 104, height: 104 }}
          animate={{ rotate: -360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        {/* Logo container with pulse effect */}
        <motion.div
          className="relative flex items-center justify-center rounded-full bg-card/80 backdrop-blur-sm"
          style={{ width: 120, height: 120 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <motion.img
            src={logo}
            alt="Cyber Defend Africa Academy"
            className="w-16 h-16 rounded-full object-cover"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>

      {/* Loading text */}
      <motion.p
        className="mt-6 text-muted-foreground text-sm font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {message}
      </motion.p>

      {/* Progress dots */}
      <div className="mt-4 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
