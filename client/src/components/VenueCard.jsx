import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Zap, Shield, Sparkles, Navigation } from 'lucide-react';

export default function VenueCard({ venue, matchPercentage, explanation }) {
  const isDiscovery = venue.type === 'discovery' || !venue.isAvailableForBooking;
  const basePriceInr = venue.baseHourlyPricePaise ? venue.baseHourlyPricePaise / 100 : 1200;

  // Primary image fallback
  const imageUrl =
    venue.images?.[0] ||
    'https://images.unsplash.com/photo-1529900240041-52c10c42ff8c?w=800';

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 hover:border-brand-500/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Image & Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={venue.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          {/* Status Badge */}
          {isDiscovery ? (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/90 text-white text-[10px] font-bold tracking-wide uppercase shadow-md flex items-center gap-1 backdrop-blur-sm">
              <Shield className="w-3 h-3" />
              Discovery Venue
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-emerald-600/95 text-white text-[10px] font-bold tracking-wide uppercase shadow-md flex items-center gap-1 backdrop-blur-sm">
              <Zap className="w-3 h-3 fill-current" />
              Instant Booking
            </span>
          )}

          {/* Smart Match % Badge if passed from Smart Recommendation */}
          {matchPercentage !== undefined && (
            <span className="px-2.5 py-1 rounded-full bg-brand-600 text-white text-[11px] font-black tracking-tight shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {matchPercentage}% Match
            </span>
          )}
        </div>

        {/* Bottom Distance & Sport Overlay */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between text-white">
          <div className="flex flex-wrap gap-1">
            {venue.sports?.map(sport => (
              <span
                key={sport}
                className="px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-[10px] font-semibold tracking-wide border border-white/20"
              >
                {sport}
              </span>
            ))}
          </div>

          {venue.distanceKm !== undefined && venue.distanceKm !== null && (
            <span className="text-[11px] font-bold bg-brand-600/90 backdrop-blur-sm px-2 py-0.5 rounded-md shadow flex items-center gap-1">
              <Navigation className="w-3 h-3" />
              {typeof venue.distanceKm === 'number' ? venue.distanceKm.toFixed(1) : venue.distanceKm} km
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Rating */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-brand-600 transition-colors line-clamp-1">
              {venue.name}
            </h3>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shrink-0">
              <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
              <span>{venue.ratingAverage ? venue.ratingAverage.toFixed(1) : '4.5'}</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">
              {venue.locality}, {venue.city}
            </span>
          </div>

          {/* Smart Recommendation Explanation snippet if available */}
          {explanation && (
            <div className="p-2 mb-2.5 rounded-lg bg-rose-50/70 border border-rose-100 text-[11px] text-brand-900 leading-tight">
              {explanation}
            </div>
          )}

          {/* Facilities pills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {venue.facilities?.slice(0, 3).map((f, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium"
              >
                {f}
              </span>
            ))}
            {venue.facilities?.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                +{venue.facilities.length - 3}
              </span>
            )}
            {venue.isIndoor && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                Indoor Covered
              </span>
            )}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-medium">
              Starts at
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-gray-900">₹{basePriceInr}</span>
              <span className="text-xs text-gray-500 font-normal">/ hour</span>
            </div>
          </div>

          <Link
            to={`/venue/${venue._id}`}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
              isDiscovery
                ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                : 'bg-brand-600 text-white hover:bg-brand-500 shadow-brand-600/20'
            }`}
          >
            {isDiscovery ? 'Explore Turf' : 'Book Slot'}
          </Link>
        </div>
      </div>
    </div>
  );
}
