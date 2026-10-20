import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin,
  Search,
  Compass,
  Navigation2,
  Sparkles,
  Users2,
  Binary,
  User,
  LogOut,
  LayoutDashboard,
  ShieldAlert,
  CalendarDays,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCity } from '../context/CityContext';
import { venueAPI } from '../services/api';

export default function Navbar() {
  const { user, isAuthenticated, isOwner, isAdmin, logout } = useAuth();
  const { selectedCity, setIsCityModalOpen } = useCity();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const profileRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Trie-based Autocomplete API
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await venueAPI.autocomplete(searchQuery);
        if (res.data.success) {
          setSuggestions(res.data.results);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.warn('Trie autocomplete lookup failed:', err.message);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSuggestionClick = item => {
    setShowSuggestions(false);
    setSearchQuery('');
    if (item.type === 'venue') {
      navigate(`/venue/${item.id}`);
    } else if (item.type === 'locality') {
      navigate(`/explore?locality=${encodeURIComponent(item.text)}`);
    } else if (item.type === 'city') {
      navigate(`/explore?city=${encodeURIComponent(item.text)}`);
    } else {
      navigate(`/explore?search=${encodeURIComponent(item.text)}`);
    }
  };

  const handleSearchSubmit = e => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { label: 'Explore Grounds', path: '/explore', icon: Compass },
    { label: 'Near Me', path: '/near-me', icon: Navigation2 },
    { label: 'Smart Finder', path: '/smart-finder', icon: Sparkles, badge: 'Smart' },
    { label: 'Group Finder', path: '/group-finder', icon: Users2 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-charcoal-900 text-white shadow-lg border-b border-gray-800">
      {/* Top Bar: Brand, City Selector, Global Search, Auth */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & City */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-rose-500 flex items-center justify-center shadow-md shadow-brand-600/30 group-hover:scale-105 transition-transform">
                <span className="text-xl font-black text-white tracking-wider">BM</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white flex items-center">
                  BookMy<span className="text-brand-500">Playground</span>
                </span>
                <span className="text-[10px] text-gray-400 tracking-wider uppercase font-medium -mt-1">
                  Smart Sports Booking
                </span>
              </div>
            </Link>

            {/* City Selector Button (BookMyShow style) */}
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-gray-800 text-gray-200 text-sm font-medium border border-gray-700 hover:border-gray-600 transition"
              title="Change City"
            >
              <MapPin className="w-4 h-4 text-brand-500" />
              <span>{selectedCity}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>

          {/* Autocomplete Search Bar (Powered by Trie DS) */}
          <div className="flex-1 max-w-md relative hidden md:block" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search turfs, box cricket, football grounds, localities..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-charcoal-800 text-gray-100 placeholder-gray-400 text-sm border border-gray-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              {isSearching && (
                <div className="absolute right-3 top-2.5">
                  <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </form>

            {/* Trie Dropdown Results */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-charcoal-900 border border-gray-700 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800 flex items-center justify-between">
                  <span>Instant Suggestions</span>
                  <span className="text-brand-400 font-normal">Verified Venues</span>
                </div>
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(item)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-800 flex items-center justify-between text-gray-200 transition"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-brand-500" />
                      <span className="font-medium text-white">{item.text || item.word}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 uppercase text-[10px]">
                      {item.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-3">
            {/* Ground Owner CTA */}
            {!isOwner && !isAdmin && (
              <Link
                to="/register-owner"
                className="hidden lg:inline-flex text-xs font-semibold px-3 py-1.5 rounded-md text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 transition"
              >
                List Your Ground
              </Link>
            )}

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-charcoal-800 hover:bg-gray-800 border border-gray-700 text-sm font-medium text-white transition"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold uppercase">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <span className="max-w-[100px] truncate hidden sm:inline">{user?.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-charcoal-900 border border-gray-700 rounded-xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-800">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-600/20 text-brand-400 border border-brand-500/30">
                        {user?.role}
                      </span>
                    </div>

                    {isOwner ? (
                      <Link
                        to="/dashboard/owner"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 hover:text-white"
                      >
                        <LayoutDashboard className="w-4 h-4 text-brand-500" />
                        Owner Dashboard
                      </Link>
                    ) : isAdmin ? (
                      <Link
                        to="/dashboard/admin"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 hover:text-white"
                      >
                        <ShieldAlert className="w-4 h-4 text-purple-400" />
                        Super Admin Panel
                      </Link>
                    ) : (
                      <Link
                        to="/dashboard/customer"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 hover:text-white"
                      >
                        <CalendarDays className="w-4 h-4 text-brand-500" />
                        My Bookings
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 hover:text-white"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      Manage Profile
                    </Link>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 border-t border-gray-800 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-gray-200 hover:text-white hover:bg-charcoal-800 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register-customer"
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30 transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-charcoal-800 text-gray-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Navigation Row: Quick feature links */}
      <nav className="hidden md:block bg-charcoal-950/80 border-t border-gray-800/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 h-11">
            {navLinks.map((link, idx) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={idx}
                  to={link.path}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                    isActive
                      ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                      : link.special
                      ? 'text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 font-semibold'
                      : 'text-gray-300 hover:bg-charcoal-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${link.special ? 'text-emerald-400' : 'text-gray-400'}`} />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.2 rounded-full font-bold ${
                        link.special
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-brand-500/20 text-brand-300 border border-brand-500/40'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-charcoal-900 border-t border-gray-800 px-4 pt-3 pb-6 space-y-3">
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsCityModalOpen(true);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-charcoal-800 text-sm font-medium text-gray-200"
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-500" />
              <span>City: {selectedCity}</span>
            </span>
            <span className="text-xs text-brand-400">Change</span>
          </button>

          <div className="space-y-1">
            {navLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <Link
                  key={idx}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-200 hover:bg-charcoal-800"
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <span>{link.label}</span>
                  </span>
                  {link.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-600/30 text-brand-400">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
