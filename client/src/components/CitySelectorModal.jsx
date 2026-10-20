import React, { useState } from 'react';
import { Search, MapPin, X, Clock, Check } from 'lucide-react';
import { useCity } from '../context/CityContext';

export default function CitySelectorModal() {
  const {
    selectedCity,
    setSelectedCity,
    cities,
    popularCities,
    recentCities,
    isCityModalOpen,
    setIsCityModalOpen,
  } = useCity();

  const [search, setSearch] = useState('');

  if (!isCityModalOpen) return null;

  const filteredCities = cities.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.stateName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Header & Search */}
        <div className="p-6 border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Select Your City</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Discover sports grounds, turfs, and live weather in your region
              </p>
            </div>
            <button
              onClick={() => setIsCityModalOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search Indian city or state (e.g. Mumbai, Bengaluru, Thane)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
              autoFocus
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Recently Selected */}
          {!search && recentCities && recentCities.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Recently Visited</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentCities.map(city => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                      selectedCity === city
                        ? 'bg-brand-50 border-brand-300 text-brand-700 font-bold'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{city}</span>
                    {selectedCity === city && <Check className="w-3 h-3 text-brand-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Indian Cities */}
          {!search && (
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Popular Cities in India
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {popularCities.map(city => {
                  const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();
                  return (
                    <button
                      key={city._id}
                      onClick={() => setSelectedCity(city.name)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-gray-900">{city.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-brand-600" />}
                      </div>
                      <span className="text-[11px] text-gray-400 mt-1">{city.stateName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Filtered Cities */}
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
              {search ? `Search Results (${filteredCities.length})` : 'All Indian Cities'}
            </div>
            {filteredCities.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No cities found matching "{search}".
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredCities.map(city => {
                  const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();
                  return (
                    <button
                      key={city._id}
                      onClick={() => setSelectedCity(city.name)}
                      className={`px-3 py-2 rounded-lg text-left text-xs transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-brand-600 text-white font-bold'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="truncate">
                        <span className="block font-medium truncate">{city.name}</span>
                        <span
                          className={`text-[10px] block ${
                            isSelected ? 'text-brand-100' : 'text-gray-400'
                          }`}
                        >
                          {city.stateName}
                        </span>
                      </div>
                      {city.venueCount > 0 && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono ml-1 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {city.venueCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
