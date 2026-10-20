import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  SlidersHorizontal,
  MapPin,
  RotateCcw,
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { venueAPI, locationAPI } from '../services/api';
import { useCity } from '../context/CityContext';
import VenueCard from '../components/VenueCard';

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedCity, setSelectedCity, cities } = useCity();

  // Filters state initialized from URL params
  const [city, setCity] = useState(searchParams.get('city') || selectedCity || 'All');
  const [locality, setLocality] = useState(searchParams.get('locality') || '');
  const [sport, setSport] = useState(searchParams.get('sport') || 'All');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '4000');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '0');
  const [isIndoor, setIsIndoor] = useState(searchParams.get('isIndoor') || '');
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [sortBy, setSortBy] = useState('rating');
  const [page, setPage] = useState(1);

  // Data
  const [venues, setVenues] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const availableFacilities = [
    'Floodlights',
    'Parking',
    'Washrooms',
    'Drinking Water',
    'Changing Rooms',
    'Cafeteria',
  ];

  // Fetch localities when city changes
  useEffect(() => {
    async function loadLocalities() {
      if (!city || city === 'All') {
        setLocalities([]);
        return;
      }
      try {
        const res = await locationAPI.getLocalities(city);
        if (res.data.success) {
          setLocalities(res.data.localities);
        }
      } catch (err) {
        console.warn('Could not load localities:', err.message);
      }
    }
    loadLocalities();
  }, [city]);

  // Fetch filtered venues
  useEffect(() => {
    async function fetchFilteredVenues() {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 9,
          sortBy,
        };

        if (city && city !== 'All') params.city = city;
        if (locality) params.locality = locality;
        if (sport && sport !== 'All') params.sport = sport;
        if (search) params.search = search;
        if (maxPrice && Number(maxPrice) < 4000) params.maxPrice = maxPrice;
        if (minRating && Number(minRating) > 0) params.minRating = minRating;
        if (isIndoor) params.isIndoor = isIndoor;
        if (selectedFacilities.length > 0) params.facilities = selectedFacilities.join(',');

        const res = await venueAPI.getVenues(params);
        if (res.data.success) {
          setVenues(res.data.venues);
          setTotalCount(res.data.totalCount);
          setTotalPages(res.data.totalPages);
        }
      } catch (err) {
        console.warn('Venue query error:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchFilteredVenues();
  }, [city, locality, sport, search, maxPrice, minRating, isIndoor, selectedFacilities, sortBy, page]);

  const toggleFacility = fac => {
    setSelectedFacilities(prev =>
      prev.includes(fac) ? prev.filter(f => f !== fac) : [...prev, fac]
    );
  };

  const handleResetFilters = () => {
    setCity('All');
    setLocality('');
    setSport('All');
    setSearch('');
    setMaxPrice('4000');
    setMinRating('0');
    setIsIndoor('');
    setSelectedFacilities([]);
    setSortBy('rating');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner & Search */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Explore Sports Grounds & Turfs
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Showing {totalCount} verified sports venues across India
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-semibold flex items-center gap-1.5 bg-white shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand-600" />
            <span>Filters</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={e => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold bg-white text-gray-800 focus:outline-none focus:border-brand-500 shadow-sm"
            >
              <option value="rating">Highest Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Venue Name</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filters Sidebar */}
        <div className={`lg:block ${showMobileFilters ? 'block' : 'hidden'} space-y-6`}>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-brand-600" />
                <span>Filters</span>
              </span>
              <button
                onClick={handleResetFilters}
                className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            </div>

            {/* City Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                City
              </label>
              <select
                value={city}
                onChange={e => {
                  setCity(e.target.value);
                  setLocality('');
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium bg-white focus:outline-none focus:border-brand-500"
              >
                <option value="All">All Indian Cities</option>
                {cities.map(c => (
                  <option key={c._id} value={c.name}>
                    {c.name} ({c.stateName})
                  </option>
                ))}
              </select>
            </div>

            {/* Locality Selector if city chosen */}
            {localities.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Locality in {city}
                </label>
                <select
                  value={locality}
                  onChange={e => {
                    setLocality(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium bg-white focus:outline-none focus:border-brand-500"
                >
                  <option value="">All Localities</option>
                  {localities.map(loc => (
                    <option key={loc._id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Exact 6 Sports Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Sport (Exact 6 Supported)
              </label>
              <div className="space-y-1">
                {['All', 'Cricket', 'Football', 'Pickleball', 'Hockey', 'Golf', 'Kabaddi'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSport(s);
                      setPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                      sport === s
                        ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <span>{s === 'All' ? 'All Sports' : s}</span>
                    {sport === s && <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Budget Slider */}
            <div>
              <div className="flex justify-between text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                <span>Max Hourly Budget</span>
                <span className="text-brand-600">₹{maxPrice}/hr</span>
              </div>
              <input
                type="range"
                min="500"
                max="4000"
                step="100"
                value={maxPrice}
                onChange={e => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>₹500</span>
                <span>₹4,000+</span>
              </div>
            </div>

            {/* Indoor/Outdoor Preference */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Venue Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsIndoor(isIndoor === 'false' ? '' : 'false')}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition ${
                    isIndoor === 'false'
                      ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  Outdoor Ground
                </button>
                <button
                  type="button"
                  onClick={() => setIsIndoor(isIndoor === 'true' ? '' : 'true')}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition ${
                    isIndoor === 'true'
                      ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  Indoor / Covered
                </button>
              </div>
            </div>

            {/* Facilities Checkboxes */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Required Facilities
              </label>
              <div className="space-y-1.5">
                {availableFacilities.map(fac => {
                  const isChecked = selectedFacilities.includes(fac);
                  return (
                    <label
                      key={fac}
                      className="flex items-center gap-2 text-xs text-gray-700 hover:text-gray-900 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          toggleFacility(fac);
                          setPage(1);
                        }}
                        className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span>{fac}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Grounds Grid */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="h-80 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : venues.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white border border-gray-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-gray-800">No Grounds Found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No verified venues matched your current search and filter criteria. Try expanding your budget, selecting "All Cities", or clearing sport filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-md hover:bg-brand-500 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {venues.map(v => (
                  <VenueCard key={v._id} venue={v} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Page {page} of {totalPages} ({totalCount} venues)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium disabled:opacity-40 hover:bg-gray-50 transition flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium disabled:opacity-40 hover:bg-gray-50 transition flex items-center gap-1"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
