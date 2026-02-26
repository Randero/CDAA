import { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  targetDate: Date | string;
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function CountdownTimer({ targetDate, className, showIcon = true, compact = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        total: difference,
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const isExpired = timeLeft.total <= 0;
  const isUrgent = timeLeft.total > 0 && timeLeft.days === 0 && timeLeft.hours < 24;
  const isWarning = timeLeft.total > 0 && timeLeft.days <= 1;

  if (isExpired) {
    return (
      <div className={cn("flex items-center gap-1.5 text-destructive", className)}>
        {showIcon && <AlertTriangle className="h-4 w-4" />}
        <span className="font-medium">Deadline passed</span>
      </div>
    );
  }

  const getStatusColor = () => {
    if (isUrgent) return "text-destructive";
    if (isWarning) return "text-amber-500";
    return "text-muted-foreground";
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1.5", getStatusColor(), className)}>
        {showIcon && <Clock className="h-3.5 w-3.5" />}
        <span className="text-sm font-medium">
          {timeLeft.days > 0 ? `${timeLeft.days}d ` : ""}
          {timeLeft.hours.toString().padStart(2, "0")}:
          {timeLeft.minutes.toString().padStart(2, "0")}:
          {timeLeft.seconds.toString().padStart(2, "0")}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className={cn("flex items-center gap-1.5", getStatusColor())}>
        {showIcon && <Clock className="h-4 w-4" />}
        <span className="text-sm font-medium">Time Remaining</span>
      </div>
      <div className="flex gap-2">
        {timeLeft.days > 0 && (
          <div className={cn("flex flex-col items-center rounded-lg bg-muted px-3 py-2", isUrgent && "bg-destructive/10")}>
            <span className={cn("text-lg font-bold", getStatusColor())}>{timeLeft.days}</span>
            <span className="text-xs text-muted-foreground">days</span>
          </div>
        )}
        <div className={cn("flex flex-col items-center rounded-lg bg-muted px-3 py-2", isUrgent && "bg-destructive/10")}>
          <span className={cn("text-lg font-bold", getStatusColor())}>{timeLeft.hours.toString().padStart(2, "0")}</span>
          <span className="text-xs text-muted-foreground">hrs</span>
        </div>
        <div className={cn("flex flex-col items-center rounded-lg bg-muted px-3 py-2", isUrgent && "bg-destructive/10")}>
          <span className={cn("text-lg font-bold", getStatusColor())}>{timeLeft.minutes.toString().padStart(2, "0")}</span>
          <span className="text-xs text-muted-foreground">min</span>
        </div>
        <div className={cn("flex flex-col items-center rounded-lg bg-muted px-3 py-2", isUrgent && "bg-destructive/10")}>
          <span className={cn("text-lg font-bold", getStatusColor())}>{timeLeft.seconds.toString().padStart(2, "0")}</span>
          <span className="text-xs text-muted-foreground">sec</span>
        </div>
      </div>
      {isUrgent && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Deadline approaching soon!
        </p>
      )}
    </div>
  );
}
