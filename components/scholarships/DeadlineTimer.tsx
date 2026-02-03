"use client";

import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface DeadlineTimerProps {
  deadline: any; // Firebase Timestamp эсвэл String
}

const DeadlineTimer = ({ deadline }: DeadlineTimerProps) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Firebase Timestamp-ийг Date объект руу хөрвүүлэх
      const targetDate = deadline?.seconds 
        ? new Date(deadline.seconds * 1000) 
        : new Date(deadline);
        
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft("Хугацаа дууссан");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);

      if (days > 0) {
        setTimeLeft(`${days} өдөр үлдсэн`);
      } else {
        setTimeLeft(`${hours} цаг үлдсэн`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000 * 60 * 60); // Цаг тутамд шинэчлэх
    return () => clearInterval(timer);
  }, [deadline]);

  return (
    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
      <Timer size={14} />
      <span>{timeLeft}</span>
    </div>
  );
};

export default DeadlineTimer;