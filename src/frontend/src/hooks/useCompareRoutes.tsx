import { createContext, useContext, useState, ReactNode } from 'react';
import type { Route } from '../backend';

interface CompareContextType {
  selectedRoutes: Route[];
  addRoute: (route: Route) => void;
  removeRoute: (routeId: string) => void;
  clearRoutes: () => void;
  canAddMore: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selectedRoutes, setSelectedRoutes] = useState<Route[]>([]);

  const addRoute = (route: Route) => {
    if (selectedRoutes.length < 3 && !selectedRoutes.some((r) => r.id === route.id)) {
      setSelectedRoutes([...selectedRoutes, route]);
    }
  };

  const removeRoute = (routeId: string) => {
    setSelectedRoutes(selectedRoutes.filter((r) => r.id !== routeId));
  };

  const clearRoutes = () => {
    setSelectedRoutes([]);
  };

  const canAddMore = selectedRoutes.length < 3;

  return (
    <CompareContext.Provider value={{ selectedRoutes, addRoute, removeRoute, clearRoutes, canAddMore }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompareRoutes() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompareRoutes must be used within CompareProvider');
  }
  return context;
}
