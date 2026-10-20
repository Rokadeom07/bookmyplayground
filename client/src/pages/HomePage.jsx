import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Sparkles,
  Users2,
  Navigation2,
  Calendar,
  CloudRain,
  ChevronRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Award,
  ArrowRight,
} from 'lucide-react';
import { useCity } from '../context/CityContext';
import { venueAPI } from '../services/api';
import VenueCard from '../components/VenueCard';

export default function HomePage() {
  const { selectedCity, setIsCityModalOpen } = useCity();
  const navigate = useNavigate();

  const [popularVenues, setPopularVenues] = useState([]);
  const [weekendVenues, setWeekendVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');
  const [heroBgPhoto, setHeroBgPhoto] = useState('/images/hero-playground.jpg');

  const playgroundPhotos = [
    { id: 'turf', name: 'Turf Playground', img: '/images/hero-playground.jpg', icon: '⚽' },
    { id: 'cricket', name: 'Cricket Stadium', img: '/images/hero-cricket.jpg', icon: '🏏' },
    { id: 'arena', name: 'Sports Arena', img: '/images/hero-arena.jpg', icon: '🏟️' },
  ];

  // Exactly 6 Sports with custom branding and icons
  const sportsCategories = [
    { name: 'Cricket', icon: '🏏', tagline: 'Box Cricket & Full Pitches', count: '14 Grounds' },
    { name: 'Football', icon: '⚽', tagline: 'FIFA-grade 5v5 & 7v7 Turfs', count: '22 Arenas' },
    { name: 'Pickleball', icon: '🏓', tagline: 'International Court Standards', count: '9 Courts' },
    { name: 'Hockey', icon: '🏑', tagline: 'Synthetic Astroturf Grounds', count: '6 Stadiums' },
    { name: 'Golf', icon: '⛳', tagline: 'Driving Ranges & Putting Greens', count: '4 Greens' },
    { name: 'Kabaddi', icon: '🤼', tagline: 'Pro Mats & Mud Arenas', count: '8 Arenas' },
  ];

  useEffect(() => {
    async function fetchCityVenues() {
      setLoading(true);
      try {
        const res = await venueAPI.getVenues({
          city: selectedCity,
          limit: 6,
          sortBy: 'rating',
        });
        if (res.data.success) {
          setPopularVenues(res.data.venues);
          setWeekendVenues(res.data.venues.slice(0, 3));
        }
      } catch (err) {
        console.warn('Failed to fetch venues for city:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchCityVenues();
  }, [selectedCity]);

  const handleHeroSearch = e => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (heroSearch.trim()) queryParams.set('search', heroSearch.trim());
    if (selectedSport !== 'All') queryParams.set('sport', selectedSport);
    queryParams.set('city', selectedCity);
    navigate(`/explore?${queryParams.toString()}`);
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION WITH PROMINENT PLAYGROUND PHOTOGRAPH BACKGROUND */}
      <section className="relative bg-charcoal-950 text-white overflow-hidden py-20 sm:py-28 border-b border-gray-800">
        {/* Full-width Playground Photograph Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none transition-all duration-700 opacity-80 scale-100"
          style={{
            backgroundImage: `url('${heroBgPhoto}')`,
          }}
        />

        {/* Balanced Dark Gradient Overlay ensuring clear text readability without hiding the photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/50 to-charcoal-950/70 pointer-events-none" />
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        {/* Ambient Stadium Glow Accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-brand-600/15 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Top Row: Brand Tagline + Photo View Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-charcoal-950/80 backdrop-blur-md border border-white/20 text-brand-400 text-xs font-semibold shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
              <span>India's Smart Sports Ground Booking Platform 2.0</span>
            </div>

            {/* Playground Photo Switcher */}
            <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-charcoal-950/85 backdrop-blur-md border border-white/20 shadow-lg text-xs">
              <span className="px-2.5 py-1 text-gray-400 font-medium hidden sm:inline text-[11px]">Playground Photo:</span>
              {playgroundPhotos.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setHeroBgPhoto(p.img)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition flex items-center gap-1.5 ${
                    heroBgPhoto === p.img
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/40'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{p.icon}</span>
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-3xl space-y-5">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
              Book Your Playground in{' '}
              <button
                type="button"
                onClick={() => setIsCityModalOpen(true)}
                className="underline decoration-brand-500 decoration-wavy underline-offset-8 text-brand-400 hover:text-brand-300 transition"
              >
                {selectedCity}
              </button>
            </h1>

            <p className="text-base sm:text-xl text-gray-100 font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] max-w-2xl">
              Instant slot booking for turf cricket, football, pickleball, hockey, golf, and kabaddi.
              Enhanced with multi-factor smart recommendations, group travel fairness, and live weather risk radar.
            </p>

            {/* Smart Search Form */}
            <form
              onSubmit={handleHeroSearch}
              className="mt-8 bg-charcoal-950/85 backdrop-blur-md p-2 sm:p-3 rounded-2xl border border-white/25 shadow-2xl flex flex-col sm:flex-row gap-2 max-w-2xl"
            >
              {/* City Pill */}
              <button
                type="button"
                onClick={() => setIsCityModalOpen(true)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-charcoal-800 text-white text-sm font-semibold border border-white/10 hover:bg-charcoal-700 shrink-0"
              >
                <MapPin className="w-4 h-4 text-brand-500" />
                <span>{selectedCity}</span>
              </button>

              {/* Sport Selector */}
              <select
                value={selectedSport}
                onChange={e => setSelectedSport(e.target.value)}
                className="px-3 py-3 rounded-xl bg-charcoal-800 text-white text-sm font-medium border border-white/10 focus:outline-none shrink-0"
              >
                <option value="All">All 6 Sports</option>
                <option value="Cricket">Cricket</option>
                <option value="Football">Football</option>
                <option value="Pickleball">Pickleball</option>
                <option value="Hockey">Hockey</option>
                <option value="Golf">Golf</option>
                <option value="Kabaddi">Kabaddi</option>
              </select>

              {/* Search query input */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={heroSearch}
                  onChange={e => setHeroSearch(e.target.value)}
                  placeholder="Search by venue name, turf, or locality (e.g. Bandra, Thane)..."
                  className="w-full h-full px-4 py-3 rounded-xl bg-white text-gray-900 placeholder-gray-500 text-sm focus:outline-none font-medium"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold shadow-lg shadow-brand-600/40 transition flex items-center justify-center gap-2 shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Find Grounds</span>
              </button>
            </form>

            {/* Quick Metrics */}
            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-gray-200">
              <div className="flex items-center gap-2 bg-charcoal-950/70 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/15 shadow">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Verified Indian Grounds</span>
              </div>
              <div className="flex items-center gap-2 bg-charcoal-950/70 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/15 shadow">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Zero Double Booking Guarantee</span>
              </div>
              <div className="flex items-center gap-2 bg-charcoal-950/70 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/15 shadow">
                <CloudRain className="w-4 h-4 text-blue-400" />
                <span>Open-Meteo Weather Radar</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EXACTLY SIX SPORTS CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest block mb-1">
              Select Your Discipline
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Six Official Sports
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 mt-2 sm:mt-0"
          >
            <span>View All Arenas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {sportsCategories.map((s, idx) => (
            <Link
              key={idx}
              to={`/explore?sport=${encodeURIComponent(s.name)}&city=${encodeURIComponent(selectedCity)}`}
              className="group p-4 rounded-2xl bg-white border border-gray-200/90 hover:border-brand-500 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-gray-50 group-hover:bg-brand-50 flex items-center justify-center text-2xl transition-colors mb-3">
                  {s.icon}
                </div>
                <h3 className="font-bold text-base text-gray-900 group-hover:text-brand-600 transition-colors">
                  {s.name}
                </h3>
                <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                  {s.tagline}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-brand-600 font-semibold">
                <span>Explore</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. POPULAR GROUNDS IN SELECTED CITY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest block mb-1">
              Top Rated in {selectedCity}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Popular Grounds & Turfs
            </h2>
          </div>
          <Link
            to={`/explore?city=${encodeURIComponent(selectedCity)}`}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>See More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-80 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : popularVenues.length === 0 ? (
          <div className="p-8 rounded-2xl bg-gray-50 border border-gray-200 text-center">
            <p className="text-gray-600 text-sm">No approved grounds listed in {selectedCity} yet.</p>
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="mt-3 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
            >
              Switch to Mumbai or Bengaluru
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularVenues.map(venue => (
              <VenueCard key={venue._id} venue={venue} />
            ))}
          </div>
        )}
      </section>

      {/* 4. SMART FINDER & GROUP FINDER BANNER SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Smart Recommendation Card */}
          <div className="rounded-3xl bg-gradient-to-br from-charcoal-900 to-gray-900 text-white p-8 relative overflow-hidden border border-gray-800 flex flex-col justify-between shadow-xl">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-brand-600/20 blur-2xl pointer-events-none" />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-600/30 text-brand-300 text-xs font-bold mb-4 border border-brand-500/40">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Feature 1: Smart Ground Finder</span>
              </div>
              <h3 className="text-2xl font-black text-white leading-snug">
                Not Sure Which Turf to Pick? Let Our Algorithm Decide.
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 mt-2.5 leading-relaxed">
                Input your sport, budget, travel radius, player count, and time preference.
                Our Priority Queue Min-Heap algorithm weights Distance (25%), Price (25%), Availability (25%), Facilities (15%), and Rating (10%) to find your ideal match with a transparent explanation.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-mono">POST /api/recommendations/smart</span>
              <Link
                to="/smart-finder"
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
              >
                <span>Try Smart Finder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Group-Friendly Ground Finder Card */}
          <div className="rounded-3xl bg-gradient-to-br from-charcoal-950 to-blue-950 text-white p-8 relative overflow-hidden border border-gray-800 flex flex-col justify-between shadow-xl">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-blue-600/20 blur-2xl pointer-events-none" />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/30 text-blue-300 text-xs font-bold mb-4 border border-blue-500/40">
                <Users2 className="w-3.5 h-3.5" />
                <span>Feature 2: Group Ground Finder</span>
              </div>
              <h3 className="text-2xl font-black text-white leading-snug">
                Friends in Kalyan, Dombivli, and Thane? Find the Fairest Venue.
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 mt-2.5 leading-relaxed">
                Friends living across different localities can join a session and select their starting area.
                Our algorithm evaluates total travel distance and individual maximum travel to recommend the fairest midpoint with interactive Dijkstra path computation on our MMR network.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-mono">Dijkstra Shortest Path O((V+E)log V)</span>
              <Link
                to="/group-finder"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
              >
                <span>Launch Group Finder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WEATHER & NEARBY PROMO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-charcoal-900 to-gray-900 rounded-3xl p-8 sm:p-10 border border-gray-800 text-white flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
              <CloudRain className="w-3.5 h-3.5" />
              <span>Real-Time Weather Intelligence</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Avoid Rainouts with Open-Meteo Weather Radar
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Every outdoor ground is monitored with live temperature, precipitation probability, and wind metrics.
              If high rain is detected on your chosen match date, our system automatically suggests nearby covered and indoor arenas.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/near-me"
              className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2"
            >
              <Navigation2 className="w-4 h-4" />
              <span>Grounds Near Me</span>
            </Link>
            <Link
              to="/explore"
              className="px-6 py-3.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-white text-xs font-bold border border-white/10 shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Explore All Grounds</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest block mb-1">
            Simple 4-Step Flow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            How BookMyPlayground Works
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Choose City & Sport', desc: 'Select from major Indian cities and 6 premier sports disciplines.' },
            { step: '02', title: 'Smart Recommendation', desc: 'Let our weighted algorithm rank grounds tailored to your budget and distance.' },
            { step: '03', title: '10-Min Temporary Hold', desc: 'Atomic lock prevents double bookings while you complete your details.' },
            { step: '04', title: 'Instant Confirmation', desc: 'Receive instant confirmation receipt and weather advisories.' },
          ].map((item, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm relative">
              <span className="text-3xl font-black text-gray-200 block mb-2">{item.step}</span>
              <h4 className="font-bold text-base text-gray-900 mb-1">{item.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. BECOME A GROUND OWNER CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-brand-600 text-white p-8 sm:p-12 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black">Own a Sports Turf or Facility?</h3>
            <p className="text-xs sm:text-sm text-brand-100 leading-relaxed">
              List your venue on BookMyPlayground. Take advantage of automated slot optimisation, occupancy analytics, dynamic promotional pricing, and verified customer reservations.
            </p>
          </div>
          <Link
            to="/register-owner"
            className="px-6 py-3.5 rounded-xl bg-white text-brand-600 hover:bg-brand-50 text-xs font-black shadow-lg transition shrink-0"
          >
            Register as Ground Owner
          </Link>
        </div>
      </section>
    </div>
  );
}
