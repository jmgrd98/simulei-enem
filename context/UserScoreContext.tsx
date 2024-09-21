'use client';

import { createContext, useContext, useState, ReactNode } from "react";

interface UserScoreContextType {
  score: number;
  incrementScore: () => void;
  decrementScore: () => void;
  resetScore: () => void;
}

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

  const incrementScore = () => setScore((prevScore) => prevScore + 1);

  const decrementScore = () => setScore((prevScore) => prevScore - 1);

  const resetScore = () => setScore(0);

  return (
    <UserScoreContext.Provider value={{ score, incrementScore, decrementScore, resetScore }}>
      {children}
    </UserScoreContext.Provider>
  );
};
