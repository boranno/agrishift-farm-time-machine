import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_FARM_KEY = 'agrishift_farm_profile';
const STORAGE_SOIL_KEY = 'agrishift_soil_profile';

export const DEMO_FARM = {
  id: 'farm-khulna-01',
  name: 'দাকোপ উপকূলীয় প্রদর্শনী খামার / Dacope Coastal Demo Farm',
  district: 'Khulna',
  upazila: 'Dacope',
  union: 'Bajua',
  aez: 'AEZ 13: Ganges Tidal Floodplain',
  latitude: 22.5721,
  longitude: 89.5105,
  area: 3.5,
  areaUnit: 'bigha',
  soilType: 'Clay Loam (Ganges Alluvium)',
  waterSource: 'Rainfed + Pond Storage (Scarce dry-season water)',
  currentCrops: {
    kharif1: 'Fallow / Weed Growth',
    kharif1Bn: 'পতিত জমি / আগাছা',
    kharif2: 'T. Aman Rice (Local Swarna)',
    kharif2Bn: 'রোপা আমন (স্থানীয় স্বর্ণা)',
    rabi: 'Boro Rice (High Salinity Risk)',
    rabiBn: 'বোরো ধান (অতিরিক্ত সেচ ও নোনা পানির ঝুঁকি)'
  },
  farmerPriorities: ['soil', 'water'],
  isDemo: true
};

export const DEMO_SOIL = {
  pH: 6.8,
  ec: 4.8, // dS/m (moderate salinity)
  nitrogenMgKg: 120,
  phosphorusMgKg: 18,
  potassiumMgKg: 150,
  isDemo: true
};

export const FarmContext = createContext(null);

export const FarmProvider = ({ children }) => {
  const [farm, setFarm] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_FARM_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEMO_FARM;
  });

  const [soil, setSoil] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SOIL_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEMO_SOIL;
  });

  const [season, setSeason] = useState('rabi'); // 'rabi', 'kharif1', 'kharif2'

  const updateFarm = (newFarmData) => {
    const updated = { ...farm, ...newFarmData, isDemo: false };
    setFarm(updated);
    try {
      localStorage.setItem(STORAGE_FARM_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  const updateSoil = (newSoilData) => {
    const updated = { ...soil, ...newSoilData, isDemo: newSoilData.isDemo ?? false };
    localStorage.setItem(STORAGE_SOIL_KEY, JSON.stringify(updated));
    setSoil(updated);
  };

  const resetToDemoFarm = () => {
    setFarm(DEMO_FARM);
    setSoil(DEMO_SOIL);
    try {
      localStorage.setItem(STORAGE_FARM_KEY, JSON.stringify(DEMO_FARM));
      localStorage.setItem(STORAGE_SOIL_KEY, JSON.stringify(DEMO_SOIL));
    } catch (e) {}
  };

  const clearFarm = () => {
    setFarm(null);
    setSoil(null);
    try {
      localStorage.removeItem(STORAGE_FARM_KEY);
      localStorage.removeItem(STORAGE_SOIL_KEY);
    } catch (e) {}
  };

  return (
    <FarmContext.Provider
      value={{
        farm,
        soil,
        season,
        setSeason,
        updateFarm,
        updateSoil,
        resetToDemoFarm,
        clearFarm
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};

