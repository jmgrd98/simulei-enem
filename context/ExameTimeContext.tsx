import { createContext, useContext, useState, useEffect } from 'react';

interface ExamTimeContextProps {
  timeLeft: number;
  setTimeLeft: (time: number) => void;
  startTimer: () => void;
  resetTimer: () => void;
}

const ExamTimeContext = createContext<ExamTimeContextProps | undefined>(undefined);

export const ExamTimeProvider = ({ children }: { children: React.ReactNode }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [isTimerRunning, timeLeft]);

  const startTimer = () => setIsTimerRunning(true);
  const resetTimer = () => {
    setTimeLeft(0);
    setIsTimerRunning(false);
  };

  return (
    <ExamTimeContext.Provider value={{ timeLeft, setTimeLeft, startTimer, resetTimer }}>
      {children}
    </ExamTimeContext.Provider>
  );
};

export const useExamTime = () => {
  const context = useContext(ExamTimeContext);
  if (!context) {
    throw new Error("useExamTime must be used within an ExamTimeProvider");
  }
  return context;
};
