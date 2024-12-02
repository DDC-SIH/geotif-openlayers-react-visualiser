import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the type for the context value
interface MapContextType {
  mapState: any;
  setMapState: React.Dispatch<React.SetStateAction<any>>;
}

// Create the context with a default value of null
const MapContext = createContext<MapContextType | null>(null);

interface MapProviderProps {
  children: ReactNode;
}

export const MapProvider: React.FC<MapProviderProps> = ({ children }) => {
  const [mapState, setMapState] = useState<any>(null);

  return (
    <MapContext.Provider value={{ mapState, setMapState }}>
      {children}
    </MapContext.Provider>
  );
};

// Custom hook to use the MapContext
export const useMap = (): MapContextType => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
};
