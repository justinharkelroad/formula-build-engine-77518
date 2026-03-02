import { useState, useEffect } from "react";
import { getCountdownDeadline } from "@/config/event";

interface CountdownTimerProps {
  autoReset?: boolean;
  className?: string;
  fallbackDeadline?: string;
  label?: string;
}

const CountdownTimer = ({ autoReset = false, className = "", fallbackDeadline, label }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });
  const [countdownInfo, setCountdownInfo] = useState({
    deadline: fallbackDeadline || "",
    resetCount: 0,
    isOriginal: true
  });

  useEffect(() => {
    if (autoReset) {
      const info = getCountdownDeadline();
      setCountdownInfo(info);
    }
  }, [autoReset]);

  useEffect(() => {
    const targetDeadline = autoReset ? countdownInfo.deadline : (fallbackDeadline || countdownInfo.deadline);
    if (!targetDeadline) return;

    const updateCountdown = () => {
      const targetDate = new Date(targetDeadline).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        if (autoReset) {
          // Trigger a refresh of countdown data
          const newInfo = getCountdownDeadline();
          setCountdownInfo(newInfo);
        } else {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        }
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [autoReset, countdownInfo.deadline, fallbackDeadline]);

  if (timeLeft.expired && !autoReset) {
    return (
      <div className={`text-destructive font-semibold ${className}`}>
        Early-bird pricing has ended
      </div>
    );
  }

  const getCountdownLabel = () => {
    if (label) return label;
    if (!autoReset || countdownInfo.isOriginal) {
      return "Early-bird pricing ends in:";
    }
    return `Limited-time pricing ends in:`;
  };

  return (
    <div className={`${className}`}>
      <div className="text-sm font-medium mb-2">
        {getCountdownLabel()}
        {autoReset && !countdownInfo.isOriginal && (
          <span className="ml-2 text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
            EXTENDED!
          </span>
        )}
      </div>
      <div className="flex gap-2 text-lg font-bold">
        <span className="bg-primary text-primary-foreground px-2 py-1 rounded">
          {timeLeft.days}d
        </span>
        <span className="bg-primary text-primary-foreground px-2 py-1 rounded">
          {timeLeft.hours}h
        </span>
        <span className="bg-primary text-primary-foreground px-2 py-1 rounded">
          {timeLeft.minutes}m
        </span>
        <span className="bg-primary text-primary-foreground px-2 py-1 rounded">
          {timeLeft.seconds}s
        </span>
      </div>
    </div>
  );
};

export default CountdownTimer;