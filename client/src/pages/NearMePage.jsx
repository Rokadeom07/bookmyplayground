import React, { useState, useEffect } from 'react';
import {
  Navigation2,
  MapPin,
  Compass,
  Sliders,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { venueAPI } from '../services/api';
import VenueCard from '../components/VenueCard';

// Custom marker icon setup for Leaflet
const userMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const groundMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function NearMePage() {
  const [coords, setCoords] = useState(null); // { lat, lng }
  const [radius, setRadius] = useState(20);
  const [sport, setSport] = useState('All');
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);

  // Manual fallback coordinates (Mumbai Bandra by default if permission denied)
  const defaultCenter = [19.0558, 72.8315];

  // Request browser location on mount
  useEffect(() => {
    requestUserLocation();
  }, []);

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. Using Mumbai city center.');
      setCoords({ lat: defaultCenter[0], lng: defaultCenter[1] });
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      position => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGeoError(null);
      },
      err => {
        setGeoError('Location access was denied or timed out. Switched to Mumbai central coordinates for demonstration.');
        // Fallback to Mumbai coords
        setCoords({ lat: defaultCenter[0], lng: defaultCenter[1] });
        setLoading(false);
      },
      { timeout: 8000 }
    );
  };

  // Query nearby grounds whenever coords, radius, or sport changes
  useEffect(() => {
    if (!coords) return;

    async function fetchNearby() {
      setLoading(true);
      try {
        const params = {
          lat: coords.lat,
          lng: coords.lng,
          radius,
        };
        if (sport !== 'All') params.sport = sport;

        const res = await venueAPI.getNearMe(params);
        if (res.data.success) {
          setVenues(res.data.venues);
        }
      } catch (err) {
        console.warn('Nearby query error:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchNearby();
  }, [coords, radius, sport]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Radius Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mb-2 border border-brand-200">
            <Navigation2 className="w-3.5 h-3.5" />
            <span>MongoDB 2dsphere Geospatial Indexing + Haversine Formula</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Find Sports Grounds Near Me
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Real distance measured in kilometers from your exact GPS coordinates
          </p>
        </div>

        {/* Radius Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider mr-1">
            Radius:
          </span>
          {[2, 5, 10, 20, 50].map(r => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                radius === r
                  ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/30'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      {/* Geolocation Notice */}
      {geoError && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{geoError}</span>
          </div>
          <button
            onClick={requestUserLocation}
            className="text-xs font-bold text-brand-600 underline ml-2"
          >
            Retry GPS
          </button>
        </div>
      )}

      {/* Filter by Sport Pill Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Cricket', 'Football', 'Pickleball', 'Hockey', 'Golf', 'Kabaddi'].map(s => (
          <button
            key={s}
            onClick={() => setSport(s)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium shrink-0 transition ${
              sport === s
                ? 'bg-charcoal-900 text-white font-bold'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Map View & Grounds Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interactive Leaflet Map */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-200 p-2 shadow-sm h-[480px] flex flex-col overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>Interactive OpenStreetMap</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              {coords ? `${coords.lat.toFixed(3)}°N, ${coords.lng.toFixed(3)}°E` : ''}
            </span>
          </div>

          <div className="flex-1 w-full rounded-2xl overflow-hidden relative">
            {coords && (
              <MapContainer
                center={[coords.lat, coords.lng]}
                zoom={11}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User GPS Pin */}
                <Marker position={[coords.lat, coords.lng]} icon={userMarkerIcon}>
                  <Popup>
                    <div className="text-xs font-bold">📍 Your Location</div>
                  </Popup>
                </Marker>

                {/* Nearby Grounds Pins */}
                {venues.map(v => {
                  const [vLng, vLat] = v.location.coordinates;
                  return (
                    <Marker key={v._id} position={[vLat, vLng]} icon={groundMarkerIcon}>
                      <Popup>
                        <div className="text-xs space-y-1">
                          <p className="font-bold text-gray-900">{v.name}</p>
                          <p className="text-gray-500">{v.distanceKm?.toFixed(1)} km away</p>
                          <p className="text-brand-600 font-bold">₹{v.baseHourlyPricePaise / 100}/hr</p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            )}
          </div>
        </div>

        {/* Nearby Venues Ranked List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-gray-900">
              {venues.length} Grounds within {radius} km
            </h2>
            <span className="text-xs text-gray-500">Sorted by Haversine distance</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : venues.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white border border-gray-200 text-center space-y-3">
              <Compass className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="font-bold text-gray-800">No grounds within {radius} km</h3>
              <p className="text-xs text-gray-500">
                Try widening your search radius to 50 km or selecting "All" sports.
              </p>
              <button
                onClick={() => setRadius(50)}
                className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
              >
                Expand to 50 km
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {venues.map(v => (
                <VenueCard key={v._id} venue={v} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
