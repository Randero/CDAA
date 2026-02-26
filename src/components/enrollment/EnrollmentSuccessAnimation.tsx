import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles, GraduationCap, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnrollmentSuccessAnimationProps {
  show: boolean;
  courseName: string;
  onContinue: () => void;
}

export function EnrollmentSuccessAnimation({ show, courseName, onContinue }: EnrollmentSuccessAnimationProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (show) {
      // Trigger confetti using dynamic import
      import('canvas-confetti').then((confettiModule) => {
        const confetti = confettiModule.default;
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors: ['#00f0ff', '#8b5cf6', '#10b981'],
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors: ['#00f0ff', '#8b5cf6', '#10b981'],
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      });

      // Animate steps
      const timer1 = setTimeout(() => setStep(1), 500);
      const timer2 = setTimeout(() => setStep(2), 1200);
      const timer3 = setTimeout(() => setStep(3), 1900);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setStep(0);
    }
  }, [show]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
      >
        <div className="text-center space-y-8 max-w-md px-6">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8, bounce: 0.5 }}
            className="relative mx-auto w-32 h-32"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-cyan/30 rounded-full blur-xl animate-pulse" />
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary to-cyan flex items-center justify-center">
              <CheckCircle2 className="w-16 h-16 text-primary-foreground" />
            </div>
            
            {/* Floating particles */}
            <motion.div
              animate={{ 
                y: [-10, 10, -10],
                rotate: [0, 360],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4"
            >
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </motion.div>
            <motion.div
              animate={{ 
                y: [10, -10, 10],
                rotate: [360, 0],
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute -bottom-2 -left-4"
            >
              <Sparkles className="w-6 h-6 text-cyan" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 20 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-primary via-cyan to-primary bg-clip-text text-transparent">
              Congratulations! 🎉
            </h1>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 20 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <p className="text-xl text-foreground">
              You're now enrolled in
            </p>
            <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-cyan/10 rounded-xl border border-primary/20">
              <GraduationCap className="w-6 h-6 text-primary" />
              <span className="font-semibold text-lg">{courseName}</span>
            </div>
          </motion.div>

          {/* Features Unlocked */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 20 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <p className="text-muted-foreground">
              All dashboard features are now unlocked for you!
            </p>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                "Course Materials",
                "Assignments",
                "Resources",
                "Certificates",
              ].map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>

            <Button 
              size="lg" 
              className="w-full mt-6 bg-gradient-to-r from-primary to-cyan hover:opacity-90"
              onClick={onContinue}
            >
              <Rocket className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
