import React, { useState, useEffect } from 'react';
import {
  Users2,
  Plus,
  Compass,
  MapPin,
  CheckCircle2,
  Share2,
  Shield,
  Navigation,
  ArrowRight,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { groupAPI, locationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCity } from '../context/CityContext';
import VenueCard from '../components/VenueCard';

// Markers
const friendIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const venuePinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function GroupFinderPage() {
  const { user, isAuthenticated } = useAuth();
  const { selectedCity } = useCity();

  const [activeSession, setActiveSession] = useState(null);
  const [sessionCodeInput, setSessionCodeInput] = useState('');
  const [fairnessMode, setFairnessMode] = useState('fairest_travel');

  // Form states to create session
  const [sessionName, setSessionName] = useState('Weekend 7v7 Football Clash');
  const [sport, setSport] = useState('Football');
  const [city, setCity] = useState(selectedCity || 'Mumbai');
  const [preferredDate, setPreferredDate] = useState(new Date().toISOString().split('T')[0]);

  // Join participant form
  const [participantName, setParticipantName] = useState('');
  const [localityName, setLocalityName] = useState('Kalyan West');
  const [localities, setLocalities] = useState([]);

  // Results & Dijkstra
  const [recommendations, setRecommendations] = useState([]);
  const [dijkstraTrace, setDijkstraTrace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load available localities
  useEffect(() => {
    async function loadLocalities() {
      try {
        const res = await locationAPI.getLocalities(city);
        if (res.data.success && res.data.localities.length > 0) {
          setLocalities(res.data.localities);
          setLocalityName(res.data.localities[0].name);
        }
      } catch (err) {}
    }
    loadLocalities();
  }, [city]);

  // Create demo default participants for instant college viva showcase
  const handleQuickDemoSession = async () => {
    setLoading(true);
    try {
      const res = await groupAPI.createSession({
        name: 'Weekend Friendly Match (Kalyan vs Thane vs Dombivli)',
        sport: 'Football',
        city: 'Mumbai',
        preferredDate: new Date().toISOString().split('T')[0],
        fairnessMode: 'fairest_travel',
        initialParticipant: {
          name: 'Rahul (Kalyan)',
          localityName: 'Kalyan West',
          coordinates: [73.1305, 19.2437],
        },
      });

      if (res.data.success) {
        const session = res.data.session;
        // Add 2 more friends
        await groupAPI.joinSession(session._id, {
          name: 'Sneha (Dombivli)',
          localityName: 'Dombivli East',
          cityName: 'Dombivli',
          coordinates: [73.0863, 19.2184],
        });

        await groupAPI.joinSession(session._id, {
          name: 'Vikram (Thane)',
          localityName: 'Thane West',
          cityName: 'Thane',
          coordinates: [72.9781, 19.2183],
        });

        // Fetch refreshed session
        const refreshed = await groupAPI.getSession(session._id);
        setActiveSession(refreshed.data.session);

        // Fetch fairness recommendations
        const recRes = await groupAPI.getRecommendations(session._id, { fairnessMode: 'fairest_travel' });
        if (recRes.data.success) {
          setRecommendations(recRes.data.recommendations);
          setDijkstraTrace(recRes.data.educationalDijkstra);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start demo session.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddParticipant = async e => {
    e.preventDefault();
    if (!participantName.trim() || !activeSession) return;

    try {
      setLoading(true);
      await groupAPI.joinSession(activeSession._id, {
        name: participantName.trim(),
        localityName,
        cityName: activeSession.city,
      });

      const refreshed = await groupAPI.getSession(activeSession._id);
      setActiveSession(refreshed.data.session);
      setParticipantName('');

      const recRes = await groupAPI.getRecommendations(activeSession._id, { fairnessMode });
      if (recRes.data.success) {
        setRecommendations(recRes.data.recommendations);
        setDijkstraTrace(recRes.data.educationalDijkstra);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join group.');
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = async mode => {
    setFairnessMode(mode);
    if (!activeSession) return;
    try {
      setLoading(true);
      const recRes = await groupAPI.getRecommendations(activeSession._id, { fairnessMode: mode });
      if (recRes.data.success) {
        setRecommendations(recRes.data.recommendations);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2 border border-blue-200">
            <Users2 className="w-3.5 h-3.5" />
            <span>Group Travel Distance Fairness Optimizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Group-Friendly Ground Finder
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Friends live in different areas? Find the fairest ground so nobody travels an unfair distance.
          </p>
        </div>

        {!activeSession && (
          <button
            onClick={handleQuickDemoSession}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/30 transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>1-Click MMR Friends Demo Session</span>
          </button>
        )}
      </div>

      {/* Active Session Display */}
      {activeSession ? (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Session Stats Bar */}
          <div className="bg-charcoal-900 text-white rounded-3xl p-6 border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30 uppercase">
                  Session Code: {activeSession.sessionCode}
                </span>
                <span className="text-xs text-gray-400">{activeSession.sport}</span>
              </div>
              <h2 className="text-xl font-black text-white">{activeSession.name}</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {activeSession.participants?.length} Friends Joined • Target Date: {activeSession.preferredDate}
              </p>
            </div>

            {/* Fairness Mode Selector */}
            <div className="flex items-center gap-2 bg-charcoal-800 p-1 rounded-2xl border border-gray-700">
              {[
                { id: 'fairest_travel', label: 'Fairest Travel' },
                { id: 'minimum_travel', label: 'Minimum Total' },
                { id: 'lowest_price', label: 'Lowest Price' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => handleModeChange(m.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    fairnessMode === m.id
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Participant Roster & Add Friend Box */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Friends Roster */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 shadow-sm">
              <h3 className="font-bold text-sm text-gray-900 pb-2 border-b border-gray-100 flex items-center justify-between">
                <span>Group Friends ({activeSession.participants?.length})</span>
                <span className="text-xs text-blue-600 font-normal">Locality-Level GPS</span>
              </h3>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {activeSession.participants?.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                        {p.name[0]}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">{p.name}</span>
                        <span className="text-[11px] text-gray-500 flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {p.localityName}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Another Friend Form */}
              <form onSubmit={handleAddParticipant} className="pt-3 border-t border-gray-100 space-y-2">
                <input
                  type="text"
                  placeholder="Friend's Name (e.g. Amit)..."
                  value={participantName}
                  onChange={e => setParticipantName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-blue-500"
                />
                <select
                  value={localityName}
                  onChange={e => setLocalityName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-blue-500"
                >
                  {localities.map(loc => (
                    <option key={loc._id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                  <option value="Kalyan West">Kalyan West</option>
                  <option value="Dombivli East">Dombivli East</option>
                  <option value="Thane West">Thane West</option>
                </select>
                <button
                  type="submit"
                  disabled={!participantName.trim() || loading}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Friend to Session</span>
                </button>
              </form>
            </div>

            {/* Educational Dijkstra Network Visualization Box */}
            <div className="lg:col-span-2 bg-charcoal-900 text-white rounded-3xl p-6 border border-gray-800 space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-bold text-xs text-white uppercase tracking-wider">
                      Optimal Transit Route Solver (Transit Network)
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">Shortest Route</span>
                </div>

                {dijkstraTrace ? (
                  <div className="mt-4 space-y-3 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-charcoal-800 p-3 rounded-2xl border border-gray-700">
                      <div>
                        <span className="text-gray-400 text-[10px] block uppercase">Origin Node</span>
                        <span className="font-bold text-blue-400">{dijkstraTrace.sourceNode}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block uppercase">Target Turf Node</span>
                        <span className="font-bold text-emerald-400">{dijkstraTrace.targetNode}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block uppercase">Optimal Shortest Distance</span>
                        <span className="font-black text-white text-sm">
                          {dijkstraTrace.computedShortestDistanceKm?.toFixed(1)} km
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-400 text-[10px] uppercase font-bold block mb-1">
                        Reconstructed Shortest Route:
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-charcoal-800/80 border border-gray-700/60 font-mono text-xs text-emerald-300">
                        {dijkstraTrace.optimalPath?.map((node, i) => (
                          <React.Fragment key={i}>
                            <span className="px-2 py-0.5 rounded bg-gray-700 text-white">{node}</span>
                            {i < dijkstraTrace.optimalPath.length - 1 && (
                              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Optimal transit route dynamically evaluates connecting road and transit corridors to find the fastest travel trajectory for friends meeting at the turf.
                    </p>
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500 text-xs">
                    Calculating graph shortest path...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Multi-Participant Geographic Fairness Map */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 space-y-3 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-gray-900">
                  Interactive Group Transit Map & Geographic Midpoint
                </h3>
                <p className="text-xs text-gray-500">
                  Purple markers: Group participants' localities • Green markers: Recommended sports grounds
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200 w-fit">
                {activeSession.participants?.length || 0} Friends • {recommendations.length} Grounds
              </span>
            </div>

            <div className="h-80 rounded-2xl overflow-hidden border border-gray-200 relative z-0">
              <MapContainer
                center={[19.15, 72.98]}
                zoom={11}
                scrollWheelZoom={false}
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {/* Participant pins */}
                {activeSession.participants?.map((p, idx) => {
                  const lat = p.coordinates?.[1] || 19.2437;
                  const lng = p.coordinates?.[0] || 73.1305;
                  return (
                    <Marker key={`part-${idx}`} position={[lat, lng]} icon={friendIcon}>
                      <Popup>
                        <div className="text-xs">
                          <strong className="block text-purple-700">Player: {p.name}</strong>
                          <span>Locality: {p.localityName}</span>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
                {/* Recommended Venue pins */}
                {recommendations.map(venue => {
                  const lat = venue.location?.coordinates?.[1];
                  const lng = venue.location?.coordinates?.[0];
                  if (!lat || !lng) return null;
                  return (
                    <Marker key={`ven-${venue._id}`} position={[lat, lng]} icon={venuePinIcon}>
                      <Popup>
                        <div className="text-xs">
                          <strong className="block text-emerald-700">{venue.name}</strong>
                          <span className="block font-bold text-blue-600">{venue.fairnessScore}% Fairness Match</span>
                          <span className="block text-gray-500">{venue.locality}, {venue.city}</span>
                          <a
                            href={`/venue/${venue._id}`}
                            className="inline-block mt-1 font-bold text-brand-600 underline"
                          >
                            View & Book Slot →
                          </a>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </div>

          {/* Ranked Group Venues */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-900">
              Fairness-Ranked Venues for Your Group ({recommendations.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map(venue => (
                <div key={venue._id} className="bg-white rounded-3xl border border-gray-200 p-5 space-y-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-black text-base text-gray-900 leading-snug">{venue.name}</h4>
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black border border-blue-200 shrink-0">
                        {venue.fairnessScore}% Fair
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {venue.locality}, {venue.city}
                    </span>

                    <p className="mt-2.5 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      {venue.explanation}
                    </p>

                    {/* Participant travel breakdown table */}
                    <div className="mt-3 space-y-1.5 text-[11px]">
                      <span className="font-bold text-gray-700 block uppercase text-[10px]">
                        Individual Travel Breakdown:
                      </span>
                      {venue.participantBreakdown?.map((pb, i) => (
                        <div key={i} className="flex justify-between items-center text-gray-600">
                          <span>{pb.participantName} ({pb.locality})</span>
                          <span className="font-mono font-bold text-gray-900">{pb.distanceKm.toFixed(1)} km (~{pb.estimatedTravelTimeMinutes}m)</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase">Hourly Price</span>
                      <span className="block font-black text-gray-900">₹{venue.hourlyPriceInr}</span>
                    </div>
                    <a
                      href={`/venue/${venue._id}`}
                      className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition"
                    >
                      Book for Group
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Blank State: Create Session Form */
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-gray-900">Start a Group Booking Session</h2>
            <p className="text-xs text-gray-500">
              Create a group session, enter your friends' localities, and calculate the fairest ground.
            </p>
          </div>

          <form
            onSubmit={async e => {
              e.preventDefault();
              setLoading(true);
              try {
                const res = await groupAPI.createSession({
                  name: sessionName,
                  sport,
                  city,
                  preferredDate,
                  fairnessMode,
                  initialParticipant: {
                    name: user?.name || 'You',
                    localityName: localityName || 'Kalyan West',
                  },
                });
                if (res.data.success) {
                  setActiveSession(res.data.session);
                  const recRes = await groupAPI.getRecommendations(res.data.session._id, { fairnessMode });
                  if (recRes.data.success) {
                    setRecommendations(recRes.data.recommendations);
                    setDijkstraTrace(recRes.data.educationalDijkstra);
                  }
                }
              } catch (err) {
                alert(err.response?.data?.message || 'Failed to create group session.');
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Session Title
              </label>
              <input
                type="text"
                value={sessionName}
                onChange={e => setSessionName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-blue-500"
                placeholder="e.g. Sunday Football Match"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Sport
                </label>
                <select
                  value={sport}
                  onChange={e => setSport(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium"
                >
                  <option value="Football">Football</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Pickleball">Pickleball</option>
                  <option value="Hockey">Hockey</option>
                  <option value="Golf">Golf</option>
                  <option value="Kabaddi">Kabaddi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Your Starting Locality
              </label>
              <input
                type="text"
                value={localityName}
                onChange={e => setLocalityName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium"
                placeholder="e.g. Kalyan West"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/30 transition"
            >
              {loading ? 'Creating Group Session...' : 'Create Group Session'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
