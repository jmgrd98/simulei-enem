'use client';

import { createContext, useContext, useState, ReactNode } from "react";

type Answer = { index: number; answer: string };

type UserScoreContextType = {
  score: number;
  disciplineScores: Record<string, number>;
  selectedAnswers: Answer[];
  incrementScore: (discipline: string) => void;
  decrementScore: (discipline: string) => void;
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
  const [disciplineScores, setDisciplineScores] = useState<Record<string, number>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Answer[]>([]);

  const incrementScore = (discipline: string) => {
    setDisciplineScores((prevScores) => {
      const updatedScores = {
        ...prevScores,
        [discipline]: (prevScores[discipline] || 0) + 1,
      };
      return updatedScores;
    });
  
    setScore((prevScore) => prevScore + 1); // Ensure `score` is updated separately
  };
  
  const decrementScore = (discipline: string) => {
    setDisciplineScores((prevScores) => {
      const updatedScores = {
        ...prevScores,
        [discipline]: Math.max((prevScores[discipline] || 0) - 1, 0),
      };
      return updatedScores;
    });
  
    setScore((prevScore) => Math.max(prevScore - 1, 0)); // Prevent negative scores
  };
  

  const resetScore = () => {
    setScore(0);
    setDisciplineScores({});
    setSelectedAnswers([]);
  };

  return (
    <UserScoreContext.Provider 
      value={{ 
        score,
        disciplineScores,
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


