import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Load = {
  id: string;
  from: string;
  to: string;
  date: string;
  type: string;
  weight: string;
};

type LoadsContextType = {
  loads: Load[];
  addLoad: (load: Omit<Load, 'id'>) => void;
  deleteLoad: (id: string) => void;
  editLoad: (load: Load) => void;
};

const LoadsContext = createContext<LoadsContextType>({
  loads: [],
  addLoad: () => {},
  deleteLoad: () => {},
  editLoad: () => {},
});

const STORAGE_KEY = 'VTRUCK_LOADS';

export const LoadsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loads, setLoads] = useState<Load[]>([]);

  // Load loads from AsyncStorage at startup
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setLoads(JSON.parse(saved));
      } catch (e) {
        console.log('Error loading loads from storage:', e);
      }
    })();
  }, []);

  // Save loads to AsyncStorage whenever they change
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loads)).catch(e =>
      console.log('Error saving loads to storage:', e)
    );
  }, [loads]);

  const addLoad = (load: Omit<Load, 'id'>) => {
    setLoads(prev => [
      { id: Date.now().toString(), ...load },
      ...prev,
    ]);
  };

  const deleteLoad = (id: string) => {
    setLoads(prev => prev.filter(load => load.id !== id));
  };

  const editLoad = (updatedLoad: Load) => {
    setLoads(prev =>
      prev.map(load => (load.id === updatedLoad.id ? updatedLoad : load))
    );
  };

  return (
    <LoadsContext.Provider value={{ loads, addLoad, deleteLoad, editLoad }}>
      {children}
    </LoadsContext.Provider>
  );
};

export const useLoads = () => useContext(LoadsContext);
