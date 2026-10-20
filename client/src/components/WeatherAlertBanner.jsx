import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Wind, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { weatherAPI } from '../services/api';

export default function WeatherAlertBanner({ venueId, date, onSelectAlternative }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alternatives, setAlternatives] = useState([]);

  useEffect(() => {
    if (!venueId || !date) return;

    async function fetchWeather() {
      setLoading(true);
      try {
        const res = await weatherAPI.getVenueWeather(venueId, date);
        if (res.data.success) {
          setWeatherData(res.data);

          // If risk is HIGH, fetch covered/indoor alternatives
          if (res.data.summary?.overallRisk === 'HIGH') {
            const altRes = await weatherAPI.getAlternatives({ venueId });
            if (altRes.data.success) {
              setAlternatives(altRes.data.alternatives);
            }
          }
        }
      } catch (err) {
        console.warn('Weather fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [venueId, date]);

  if (loading) {
    return (
      <div className="p-4 rounded-xl bg-gray-100 animate-pulse text-xs text-gray-500">
        Fetching live Open-Meteo weather forecast for {date}...
      </div>
    );
  }

  if (!weatherData || !weatherData.isForecastAvailable) {
    return (
      <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2 text-xs text-gray-600">
        <HelpCircle className="w-4 h-4 text-gray-400 shrink-0" />
        <span>Weather forecast unavailable for this booking time (outside 14-day window).</span>
      </div>
    );
  }

  const { summary } = weatherData;
  const isHighRisk = summary?.overallRisk === 'HIGH';
  const isModerateRisk = summary?.overallRisk === 'MODERATE';

  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${
        isHighRisk
          ? 'bg-rose-50/90 border-rose-200 text-rose-950'
          : isModerateRisk
          ? 'bg-amber-50/90 border-amber-200 text-amber-950'
          : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {isHighRisk ? (
            <div className="p-2 rounded-xl bg-rose-600 text-white">
              <CloudRain className="w-5 h-5 animate-bounce" />
            </div>
          ) : isModerateRisk ? (
            <div className="p-2 rounded-xl bg-amber-500 text-white">
              <Wind className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-emerald-600 text-white">
              <Sun className="w-5 h-5" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm">
                Live Weather Intelligence ({date})
              </h4>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  isHighRisk
                    ? 'bg-rose-600 text-white'
                    : isModerateRisk
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {summary?.overallRisk} RISK
              </span>
            </div>

            <p className="text-xs mt-0.5 opacity-90">
              {summary?.averageTempC}°C • Rain Probability: {summary?.maxRainProb}% • Venue:{' '}
              {summary?.venueType}
            </p>
          </div>
        </div>
      </div>

      {/* High-risk rain warning */}
      {isHighRisk && (
        <div className="mt-3 pt-3 border-t border-rose-200 space-y-2 text-xs">
          <div className="flex items-start gap-1.5 text-rose-800 font-semibold">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>
              Significant rain is forecast near this outdoor ground on {date}. Consider choosing an indoor covered venue.
            </span>
          </div>

          {/* Smart Alternative Recommendation List */}
          {alternatives.length > 0 && (
            <div className="mt-2 bg-white/80 rounded-xl p-3 border border-rose-200 space-y-2">
              <span className="font-bold text-[11px] text-gray-800 uppercase tracking-wider block">
                Recommended Covered / Indoor Alternatives (Ranked by PQ):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {alternatives.map(alt => (
                  <div
                    key={alt.id}
                    className="p-2.5 rounded-lg border border-gray-200 bg-white hover:border-brand-500 transition cursor-pointer flex justify-between items-center"
                    onClick={() => onSelectAlternative && onSelectAlternative(alt)}
                  >
                    <div>
                      <span className="font-bold text-xs text-gray-900 block truncate">{alt.name}</span>
                      <span className="text-[10px] text-gray-500">{alt.locality} • ₹{alt.hourlyPriceInr}/hr</span>
                    </div>
                    <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded">
                      View
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
