'use client';

import { createContext, useContext, useState, ReactNode, useRef, useEffect } from "react";

type ExamTimeContextType = {
  timeLeft: number;
  setTimeLeft: (timeLeft: number) => void;
  startTimer: () => void;
  resetTimer: () => void;
};

const ExamTimeContext = createContext<ExamTimeContextType | undefined>(undefined);

export const useExamTime = () => {
  const context = useContext(ExamTimeContext);
  if (!context) {
    throw new Error("useExamTime must be used within an ExamTimeProvider");
  }
  return context;
};

export const ExamTimeProvider = ({ children }: { children: ReactNode }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeLeft > 0 && timerRef.current === null) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    if (timeLeft === 0 && timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timeLeft]);

  const startTimer = () => {
    if (timerRef.current === null) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
  };

  const resetTimer = () => {
    setTimeLeft(0);
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <ExamTimeContext.Provider value={{ timeLeft, setTimeLeft, startTimer, resetTimer }}>
      {children}
    </ExamTimeContext.Provider>
  );
};
