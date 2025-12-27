// src/hooks/durationProvider.tsx
"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface DurationContextProps {
  durations: number;
  setDurations: React.Dispatch<React.SetStateAction<number>>;
}

const DurationContext = createContext<DurationContextProps | undefined>(undefined);

export const DurationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [durations, setDurations] = useState<number>(0);

  return (
    <DurationContext.Provider value={{ durations, setDurations }}>
      {children}
    </DurationContext.Provider>
  );
};

export const useDuration = (): DurationContextProps => {
  const context = useContext(DurationContext);
  if (!context) {
    throw new Error('useDuration must be used within a DurationProvider');
  }
  return context;
};
