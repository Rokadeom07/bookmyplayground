import React, { createContext, useContext, useState, useEffect } from 'react';
import { locationAPI } from '../services/api';

const CityContext = createContext();

export function CityProvider({ children }) {
  const [selectedCity, setSelectedCityState] = useState(() => {
    return localStorage.getItem('bmp_city') || 'Mumbai';
  });
  const [cities, setCities] = useState([]);
  const [popularCities, setPopularCities] = useState([]);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [recentCities, setRecentCities] = useState(() => {
    try {
      const saved = localStorage.getItem('bmp_recent_cities');
      return saved ? JSON.parse(saved) : ['Mumbai', 'Thane', 'Bengaluru'];
    } catch {
      return ['Mumbai', 'Thane', 'Bengaluru'];
    }
  });

  useEffect(() => {
    async function fetchCities() {
      try {
        const res = await locationAPI.getCities();
        if (res.data.success) {
          setCities(res.data.cities);
          setPopularCities(res.data.cities.filter(c => c.isPopular));
        }
      } catch (err) {
        console.warn('Failed to load cities from server:', err.message);
      }
    }
    fetchCities();
  }, []);

  const setSelectedCity = cityName => {
    setSelectedCityState(cityName);
    localStorage.setItem('bmp_city', cityName);

    // Update recent cities
    setRecentCities(prev => {
      const updated = [cityName, ...prev.filter(c => c !== cityName)].slice(0, 5);
      localStorage.setItem('bmp_recent_cities', JSON.stringify(updated));
      return updated;
    });

    setIsCityModalOpen(false);
  };

  return (
    <CityContext.Provider
      value={{
        selectedCity,
        setSelectedCity,
        cities,
        popularCities,
        recentCities,
        isCityModalOpen,
        setIsCityModalOpen,
      }}
    >
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
}
