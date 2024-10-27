'use client';

import { createContext, useContext, useState, ReactNode } from "react";

type Answer = { index: number; answer: string };

type UserScoreContextType = {
  score: number;
  selectedAnswers: Answer[];
  incrementScore: () => void;
  decrementScore: () => void;
  resetScore: () => void;
  setSelectedAnswers: (selectedAnswers: Answer[] | ((prevAnswers: Answer[]) => Answer[])) => void;
};

const UserScoreContext = createContext<UserScoreContextType | undefined>(undefined);

export const useUserScore = () => {
  const context = useContext(UserScoreContext);
  if (!context) {
    throw new Error("useUserScore must be used within a UserScoreProvider");
  }
  return context;
};

export const UserScoreProvider = ({ children }: { children: ReactNode }) => {
  const [score, setScore] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Answer[]>([]);

  const incrementScore = () => setScore((prevScore) => prevScore + 1);
  const decrementScore = () => setScore((prevScore) => prevScore - 1);
  const resetScore = () => {
    setScore(0);
    setSelectedAnswers([]);
  };

  return (
    <UserScoreContext.Provider 
      value={{ 
        score,
        incrementScore,
        decrementScore,
        resetScore,
        selectedAnswers,
        setSelectedAnswers
      }}>
      {children}
    </UserScoreContext.Provider>
  );
};
