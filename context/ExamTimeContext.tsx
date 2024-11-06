'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

interface ExamTimeContextProps {
    selectedTime: number;
    setSelectedTime: (time: number) => void;
    timeLeft: number;
    setTimeLeft: (time: number) => void;
    startTimer: () => void;
    stopTimer: () => void;
    resetTimer: () => void;
    isTimerRunning: boolean;
    isAnimating: boolean;
    setIsAnimating: (isAnimating: boolean) => void;
}

const ExamTimeContext = createContext<ExamTimeContextProps | undefined>(undefined);

export const ExamTimeProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedTime, setSelectedTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
        timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
        setIsTimerRunning(false);
        toast({
            description: 'O tempo chegou ao fim!',
            variant: 'destructive'
        });
        router.push('/resultado');
    }
  
    return () => clearTimeout(timer);
}, [isTimerRunning, timeLeft]);


  const startTimer = () => {
    if (timeLeft > 0) {
      setIsTimerRunning(true);
    }
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setTimeLeft(0);
    setIsTimerRunning(false);
    setIsAnimating(true);

    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };

  return (
    <ExamTimeContext.Provider
      value={{
        selectedTime,
        setSelectedTime,
        timeLeft,
        setTimeLeft,
        startTimer,
        stopTimer,
        resetTimer,
        isTimerRunning,
        isAnimating,
        setIsAnimating,
      }}
    >
      {children}
    </ExamTimeContext.Provider>
  );
};

export const useExamTime = () => {
  const context = useContext(ExamTimeContext);
  if (!context) {
    throw new Error('useExamTime must be used within an ExamTimeProvider');
  }
  return context;
};
