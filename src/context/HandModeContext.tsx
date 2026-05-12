import React, { createContext, useContext, useState, ReactNode } from "react";

interface HandModeContextType {
  isHandModeEnabled: boolean;
  setIsHandModeEnabled: (enabled: boolean) => void;
}

const HandModeContext = createContext<HandModeContextType | undefined>(undefined);

export function HandModeProvider({ children }: { children: ReactNode }) {
  const [isHandModeEnabled, setIsHandModeEnabled] = useState(false);

  return (
    <HandModeContext.Provider value={{ isHandModeEnabled, setIsHandModeEnabled }}>
      {children}
    </HandModeContext.Provider>
  );
}

export function useHandMode() {
  const context = useContext(HandModeContext);
  if (context === undefined) {
    throw new Error("useHandMode must be used within a HandModeProvider");
  }
  return context;
}
