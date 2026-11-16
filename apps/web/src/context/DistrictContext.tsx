import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface DistrictContextType {
  currentDistrict: string;
  setDistrict: (district: string) => void;
  availableDistricts: string[];
}

const MAHARASHTRA_DISTRICTS = [
  'Nanded',
  'Mumbai',
  'Pune',
  'Nagpur',
  'Thane',
  'Nashik',
  'Chhatrapati Sambhajinagar',
  'Ratnagiri',
  'Sindhudurg',
  'Solapur',
  'Kolhapur',
  'Amravati',
  'All Maharashtra',
];

const DistrictContext = createContext<DistrictContextType | undefined>(undefined);

export const DistrictProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentDistrict, setCurrentDistrict] = useState<string>(() => {
    return localStorage.getItem('aapadamitra_selected_district') || 'Nanded';
  });

  // Automatically sync district with user profile if defined
  useEffect(() => {
    if (user && (user as any).district) {
      setCurrentDistrict((user as any).district);
      localStorage.setItem('aapadamitra_selected_district', (user as any).district);
    }
  }, [user]);

  const setDistrict = (district: string) => {
    setCurrentDistrict(district);
    localStorage.setItem('aapadamitra_selected_district', district);
  };

  return (
    <DistrictContext.Provider
      value={{
        currentDistrict,
        setDistrict,
        availableDistricts: MAHARASHTRA_DISTRICTS,
      }}
    >
      {children}
    </DistrictContext.Provider>
  );
};

export const useDistrict = () => {
  const context = useContext(DistrictContext);
  if (!context) {
    throw new Error('useDistrict must be used within a DistrictProvider');
  }
  return context;
};

