import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  HelpCircle,
  X,
  MapPin,
  TrendingUp,
  Award,
  Zap,
  Info,
  DollarSign,
  Star,
} from 'lucide-react';
import { recommendationAPI, locationAPI } from '../services/api';
import { useCity } from '../context/CityContext';
import VenueCard from '../components/VenueCard';

export default function SmartFinderPage() {
  const { selectedCity, cities } = useCity();

  // Inputs
  const [sport, setSport] = useState('Football');
  const [city, setCity] = useState(selectedCity || 'Mumbai');
  const [locality, setLocality] = useState('');
  const [budgetInr, setBudgetInr] = useState(2000);
  const [maxDistanceKm, setMaxDistanceKm] = useState(25);
  const [preferredDate, setPreferredDate] = useState(new Date().toISOString().split('T')[0]);
  const [preferredTime, setPreferredTime] = useState('18:00');
  const [numberOfPlayers, setNumberOfPlayers] = useState(12);
  const [selectedFacilities, setSelectedFacilities] = useState(['Floodlights', 'Parking']);
  const [isIndoor, setIsIndoor] = useState('');

  // Configurable Weights
  const [weights, setWeights] = useState({
    distance: 0.25,
    price: 0.25,
    availability: 0.25,
    facilities: 0.15,
    rating: 0.1,
  });
  const [showWeightSliders, setShowWeightSliders] = useState(false);

  // Results & Modal
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [breakdownModalVenue, setBreakdownModalVenue] = useState(null);

  const availableFacilities = ['Floodlights', 'Parking', 'Washrooms', 'Drinking Water', 'Changing Rooms'];

  // Handle recommendation query
  const handleCalculateRecommendations = async e => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        sport,
        city: city === 'All' ? '' : city,
        preferredLocality: locality,
        budgetInr: Number(budgetInr),
        maxDistanceKm: Number(maxDistanceKm),
        preferredDate,
        preferredTime,
        numberOfPlayers: Number(numberOfPlayers),
        requiredFacilities: selectedFacilities,
        isIndoor: isIndoor === '' ? undefined : isIndoor === 'true',
        weights,
      };

      const res = await recommendationAPI.getSmartRecommendations(payload);
      if (res.data.success) {
        setResults(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Smart recommendation engine failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCalculateRecommendations();
  }, [city, sport]);

  const toggleFacility = fac => {
    setSelectedFacilities(prev =>
      prev.includes(fac) ? prev.filter(f => f !== fac) : [...prev, fac]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-2 border border-brand-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Min-Heap Top-K Priority Queue & Multi-Factor Normalization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Smart Ground Recommendation Engine
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Personalized venue matching powered by our weighted ranking formula with explainable match scores
          </p>
        </div>

        <button
          onClick={() => setShowWeightSliders(!showWeightSliders)}
          className="px-4 py-2 rounded-xl border border-gray-300 hover:border-gray-400 text-xs font-semibold flex items-center gap-2 bg-white shadow-sm transition"
        >
          <Sliders className="w-3.5 h-3.5 text-brand-600" />
          <span>{showWeightSliders ? 'Hide Algorithm Weights' : 'Configure Algorithm Weights'}</span>
        </button>
      </div>

      {/* Configurable Algorithm Weights Panel */}
      {showWeightSliders && (
        <div className="p-5 rounded-2xl bg-charcoal-900 text-white border border-gray-800 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span>Customize Algorithm Weights (Total: 100%)</span>
            </h3>
            <span className="text-[11px] text-gray-400 font-mono">
              Score = w₁·Dist + w₂·Price + w₃·Avail + w₄·Fac + w₅·Rate
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-xs">
            <div>
              <div className="flex justify-between mb-1 text-gray-300">
                <span>Distance</span>
                <span className="font-bold text-brand-400">{Math.round(weights.distance * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.6"
                step="0.05"
                value={weights.distance}
                onChange={e => setWeights({ ...weights, distance: parseFloat(e.target.value) })}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-gray-300">
                <span>Price & Budget</span>
                <span className="font-bold text-brand-400">{Math.round(weights.price * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.6"
                step="0.05"
                value={weights.price}
                onChange={e => setWeights({ ...weights, price: parseFloat(e.target.value) })}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-gray-300">
                <span>Slot Availability</span>
                <span className="font-bold text-brand-400">{Math.round(weights.availability * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.6"
                step="0.05"
                value={weights.availability}
                onChange={e => setWeights({ ...weights, availability: parseFloat(e.target.value) })}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-gray-300">
                <span>Facilities</span>
                <span className="font-bold text-brand-400">{Math.round(weights.facilities * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.4"
                step="0.05"
                value={weights.facilities}
                onChange={e => setWeights({ ...weights, facilities: parseFloat(e.target.value) })}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-gray-300">
                <span>Rating</span>
                <span className="font-bold text-brand-400">{Math.round(weights.rating * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.4"
                step="0.05"
                value={weights.rating}
                onChange={e => setWeights({ ...weights, rating: parseFloat(e.target.value) })}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Inputs Form & Live Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form */}
        <form
          onSubmit={handleCalculateRecommendations}
          className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4"
        >
          <h2 className="font-bold text-base text-gray-900 pb-2 border-b border-gray-100">
            Player Preferences
          </h2>

          {/* Sport */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Sport
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {['Cricket', 'Football', 'Pickleball', 'Hockey', 'Golf', 'Kabaddi'].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSport(s)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition border ${
                    sport === s
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              City
            </label>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-brand-500"
            >
              <option value="All">All Cities</option>
              {cities.map(c => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div>
            <div className="flex justify-between text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              <span>Hourly Budget (INR)</span>
              <span className="text-brand-600">₹{budgetInr}/hr</span>
            </div>
            <input
              type="range"
              min="800"
              max="3500"
              step="100"
              value={budgetInr}
              onChange={e => setBudgetInr(e.target.value)}
              className="w-full accent-brand-600 cursor-pointer"
            />
          </div>

          {/* Max Distance */}
          <div>
            <div className="flex justify-between text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              <span>Max Distance Radius</span>
              <span className="text-brand-600">{maxDistanceKm} km</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={maxDistanceKm}
              onChange={e => setMaxDistanceKm(e.target.value)}
              className="w-full accent-brand-600 cursor-pointer"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                Preferred Date
              </label>
              <input
                type="date"
                value={preferredDate}
                onChange={e => setPreferredDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                Preferred Time
              </label>
              <input
                type="time"
                value={preferredTime}
                onChange={e => setPreferredTime(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs font-medium"
              />
            </div>
          </div>

          {/* Facilities */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Must-Have Facilities
            </label>
            <div className="space-y-1">
              {availableFacilities.map(f => (
                <label key={f} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFacilities.includes(f)}
                    onChange={() => toggleFacility(f)}
                    className="rounded border-gray-300 text-brand-600"
                  />
                  <span>{f}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Running Min-Heap Evaluation...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Recalculate Recommendations</span>
              </>
            )}
          </button>
        </form>

        {/* Right Recommendations Grid */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Highlights Row */}
          {results?.highlights && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-brand-50 border border-brand-200 text-xs space-y-1">
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block">
                  Best Match
                </span>
                <p className="font-bold text-gray-900 truncate">
                  {results.highlights.bestMatch?.name || 'N/A'}
                </p>
                <span className="text-[11px] font-black text-brand-700">
                  {results.highlights.bestMatch?.matchPercentage}% Score
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                  Cheapest Suitable
                </span>
                <p className="font-bold text-gray-900 truncate">
                  {results.highlights.cheapestSuitable?.name || 'N/A'}
                </p>
                <span className="text-[11px] font-black text-emerald-700">
                  ₹{results.highlights.cheapestSuitable?.priceInr}/hr
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs space-y-1">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  Nearest Ground
                </span>
                <p className="font-bold text-gray-900 truncate">
                  {results.highlights.nearestSuitable?.name || 'N/A'}
                </p>
                <span className="text-[11px] font-black text-blue-700">
                  {results.highlights.nearestSuitable?.distanceKm?.toFixed(1)} km
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs space-y-1">
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
                  Best Facilities
                </span>
                <p className="font-bold text-gray-900 truncate">
                  {results.highlights.bestFacilities?.name || 'N/A'}
                </p>
                <span className="text-[11px] font-black text-purple-700">
                  {results.highlights.bestFacilities?.facilitiesCount} Amenities
                </span>
              </div>
            </div>
          )}

          {/* Filter Pills */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-200">
            <h2 className="font-bold text-base text-gray-900">
              Ranked Grounds ({results?.recommendations?.length || 0})
            </h2>
            <span className="text-xs text-gray-400 font-mono">PriorityQueue.extractTopK(10)</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : results?.recommendations?.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-gray-200 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-gray-300 mx-auto" />
              <h3 className="font-bold text-gray-800">No Suitable Matches Found</h3>
              <p className="text-xs text-gray-500">
                Try widening your budget or selecting "All Cities" to discover more grounds.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results?.recommendations?.map(venue => (
                <div key={venue._id} className="relative flex flex-col justify-between">
                  <VenueCard
                    venue={venue}
                    matchPercentage={venue.matchPercentage}
                    explanation={venue.explanation}
                  />
                  {/* How This Score Was Calculated Button */}
                  <button
                    onClick={() => setBreakdownModalVenue(venue)}
                    className="mt-2 text-center text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center justify-center gap-1 py-1"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>How this {venue.matchPercentage}% was calculated</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. "HOW THIS SCORE WAS CALCULATED" BREAKDOWN MODAL */}
      {breakdownModalVenue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900">Score Calculation Breakdown</h3>
                <p className="text-xs text-gray-500">{breakdownModalVenue.name}</p>
              </div>
              <button
                onClick={() => setBreakdownModalVenue(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-brand-50 rounded-xl border border-brand-200 text-xs text-brand-900">
              <strong>Total Match Score: {breakdownModalVenue.matchPercentage}%</strong>
              <p className="text-[11px] mt-0.5 opacity-90">{breakdownModalVenue.explanation}</p>
            </div>

            {/* Individual Normalized Components */}
            <div className="space-y-3 text-xs">
              {breakdownModalVenue.scoreBreakdown && (
                <>
                  <div>
                    <div className="flex justify-between font-semibold text-gray-700 mb-1">
                      <span>Distance (Weight: {Math.round(breakdownModalVenue.scoreBreakdown.distance.weight * 100)}%)</span>
                      <span className="text-brand-600 font-bold">{breakdownModalVenue.scoreBreakdown.distance.score}/100</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-brand-600 h-full" style={{ width: `${breakdownModalVenue.scoreBreakdown.distance.score}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-400">Actual distance: {breakdownModalVenue.scoreBreakdown.distance.valueKm.toFixed(1)} km</span>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-gray-700 mb-1">
                      <span>Price & Budget (Weight: {Math.round(breakdownModalVenue.scoreBreakdown.price.weight * 100)}%)</span>
                      <span className="text-brand-600 font-bold">{breakdownModalVenue.scoreBreakdown.price.score}/100</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-brand-600 h-full" style={{ width: `${breakdownModalVenue.scoreBreakdown.price.score}%` }} />
                    </div>
                    <span className="text-[10px] text-gray-400">Hourly fee: ₹{breakdownModalVenue.scoreBreakdown.price.valueInr}/hr</span>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-gray-700 mb-1">
                      <span>Slot Availability (Weight: {Math.round(breakdownModalVenue.scoreBreakdown.availability.weight * 100)}%)</span>
                      <span className="text-brand-600 font-bold">{breakdownModalVenue.scoreBreakdown.availability.score}/100</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-brand-600 h-full" style={{ width: `${breakdownModalVenue.scoreBreakdown.availability.score}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-gray-700 mb-1">
                      <span>Facilities (Weight: {Math.round(breakdownModalVenue.scoreBreakdown.facilities.weight * 100)}%)</span>
                      <span className="text-brand-600 font-bold">{breakdownModalVenue.scoreBreakdown.facilities.score}/100</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-brand-600 h-full" style={{ width: `${breakdownModalVenue.scoreBreakdown.facilities.score}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-gray-700 mb-1">
                      <span>Rating (Weight: {Math.round(breakdownModalVenue.scoreBreakdown.rating.weight * 100)}%)</span>
                      <span className="text-brand-600 font-bold">{breakdownModalVenue.scoreBreakdown.rating.score}/100</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-brand-600 h-full" style={{ width: `${breakdownModalVenue.scoreBreakdown.rating.score}%` }} />
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setBreakdownModalVenue(null)}
              className="w-full py-2.5 rounded-xl bg-gray-900 text-white font-bold text-xs"
            >
              Close Breakdown
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
