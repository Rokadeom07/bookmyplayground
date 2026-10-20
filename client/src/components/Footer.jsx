import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, Binary, Heart, Compass, MapPin } from 'lucide-react';
import { useCity } from '../context/CityContext';

export default function Footer() {
  const { setSelectedCity } = useCity();

  const sportsList = ['Cricket', 'Football', 'Pickleball', 'Hockey', 'Golf', 'Kabaddi'];
  const popularCities = ['Mumbai', 'Thane', 'Bengaluru', 'New Delhi', 'Pune', 'Hyderabad', 'Kalyan', 'Dombivli'];

  return (
    <footer className="bg-charcoal-950 text-gray-400 border-t border-gray-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center font-black text-white text-base">
                BM
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                BookMy<span className="text-brand-500">Playground</span>
              </span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed">
              India's smart sports ground discovery, recommendation, and booking platform.
              Powered by real-time MongoDB geospatial indexes, Open-Meteo weather intelligence, and instant slot verification.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Indian Sports Grounds
              </span>
            </div>
          </div>

          {/* Exactly 6 Sports */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Supported Sports (Exact 6)
            </h3>
            <ul className="space-y-2 text-xs">
              {sportsList.map(sport => (
                <li key={sport}>
                  <Link
                    to={`/explore?sport=${encodeURIComponent(sport)}`}
                    className="hover:text-brand-400 transition flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                    <span>{sport} Grounds</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Smart Features & Viva Lab */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Platform Innovations
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/smart-finder" className="hover:text-brand-400 transition flex items-center gap-1.5 text-brand-300 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  Smart Recommendation Engine
                </Link>
              </li>
              <li>
                <Link to="/group-finder" className="hover:text-brand-400 transition flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-blue-400" />
                  Group-Friendly Ground Finder
                </Link>
              </li>
              <li>
                <Link to="/near-me" className="hover:text-brand-400 transition flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  Find Grounds Near Me
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-brand-400 transition flex items-center gap-1.5 text-gray-300">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  All India Sports Grounds
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Indian Cities */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Top Sports Cities
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {popularCities.map(city => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedCity(city);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-2.5 py-1 rounded bg-charcoal-900 hover:bg-gray-800 text-[11px] text-gray-300 border border-gray-800 hover:border-gray-700 transition"
                >
                  {city}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-4 leading-relaxed">
              Third-Year Computer Engineering Project • Web Development Lab (WDL) & Data Structures.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3">
          <p>© 2026 BookMyPlayground India. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Built with MERN, Tailwind CSS, Leaflet & Open-Meteo</span>
            <span>•</span>
            <span className="text-brand-400 font-semibold">Production-Style WDL Demo</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
