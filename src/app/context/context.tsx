/**
 * App Context
 * 
 * Simplified context for NearNow application.
 * Currently minimal as we don't need auth or dashboard stats.
 * Can be extended in the future if needed.
 */

"use client";

import {
  createContext,
  PropsWithChildren,
  useContext,
} from "react";

interface AppContextType {
  // Add any shared app state here in the future
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppProvider = ({ children }: PropsWithChildren) => {
  const value: AppContextType = {
    // Add any shared app state here in the future
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};

// Create a hook for accessing the AppContext
export const useAppContext = () => {
  return useContext(AppContext) as AppContextType;
};

export default AppProvider;

