import { useState, useEffect } from 'react';

export interface CountdownData {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formatted: string;
}

/**
 * Hook to create a countdown timer to a target timestamp
 * @param targetTimestamp - Unix timestamp in seconds
 * @returns Countdown data with days, hours, minutes, seconds
 */
export function useCountdown(targetTimestamp: number): CountdownData {
  const [countdown, setCountdown] = useState<CountdownData>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: true,
    formatted: '00:00:00',
  });

  useEffect(() => {
    const calculateCountdown = () => {
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const difference = targetTimestamp - now;

      if (difference <= 0) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          formatted: '00:00:00',
        });
        return;
      }

      const days = Math.floor(difference / (60 * 60 * 24));
      const hours = Math.floor((difference % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((difference % (60 * 60)) / 60);
      const seconds = difference % 60;

      let formatted = '';
      if (days > 0) {
        formatted = `${days}d ${hours}h ${minutes}m`;
      } else if (hours > 0) {
        formatted = `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        formatted = `${minutes}m ${seconds}s`;
      } else {
        formatted = `${seconds}s`;
      }

      setCountdown({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
        formatted,
      });
    };

    // Calculate immediately
    calculateCountdown();

    // Update every second
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp]);

  return countdown;
}
