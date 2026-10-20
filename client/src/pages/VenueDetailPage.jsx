import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Zap,
  Info,
  Navigation,
  Check,
  Share2,
  Heart,
  ChevronRight,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { venueAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import WeatherAlertBanner from '../components/WeatherAlertBanner';
import CheckoutModal from '../components/CheckoutModal';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const groundMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function VenueDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking selection state
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedArea, setSelectedArea] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Checkout modal state
  const [checkoutBooking, setCheckoutBooking] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [holdingSlot, setHoldingSlot] = useState(null);

  // Favourite & Review state
  const [isFavourite, setIsFavourite] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    cleanlinessRating: 5,
    facilitiesRating: 5,
    valueRating: 5,
    comment: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function fetchVenue() {
      setLoading(true);
      try {
        const res = await venueAPI.getVenueById(id);
        if (res.data.success) {
          setVenue(res.data.venue);
          if (res.data.venue.playingAreas?.length > 0) {
            setSelectedArea(res.data.venue.playingAreas[0]);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load venue details.');
      } finally {
        setLoading(false);
      }
    }
    fetchVenue();

    // Check favourite status if logged in
    if (isAuthenticated) {
      venueAPI.getMyFavourites().then(res => {
        if (res.data.success) {
          const isFav = res.data.favourites.some(f => f && (f._id === id || f === id));
          setIsFavourite(isFav);
        }
      }).catch(() => {});
    }
  }, [id, isAuthenticated]);

  const handleToggleFavourite = async () => {
    if (!isAuthenticated) {
      alert('Please log in to save grounds to your favourites.');
      navigate('/login');
      return;
    }
    try {
      const res = await venueAPI.toggleFavourite(venue._id);
      if (res.data.success) {
        setIsFavourite(res.data.isFavourite);
      }
    } catch (err) {
      alert('Could not update favourite status.');
    }
  };

  const handleSubmitReview = async e => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      alert('Please write a comment for your review.');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await venueAPI.addReview(venue._id, reviewForm);
      if (res.data.success) {
        alert('Review submitted successfully! Thank you for helping the community.');
        setVenue(prev => ({
          ...prev,
          ratingAverage: res.data.ratingAverage,
          ratingCount: res.data.ratingCount,
          reviews: [
            {
              ...res.data.review,
              customer: { name: user?.name || 'Sports Player' },
            },
            ...(prev.reviews || []),
          ],
        }));
        setIsReviewModalOpen(false);
        setReviewForm({ rating: 5, cleanlinessRating: 5, facilitiesRating: 5, valueRating: 5, comment: '' });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Fetch slots whenever selectedDate or selectedArea changes
  useEffect(() => {
    if (!venue || !selectedArea || venue.type === 'discovery') return;

    async function loadSlots() {
      setSlotsLoading(true);
      try {
        const res = await bookingAPI.getSlots({
          venueId: venue._id,
          playingAreaId: selectedArea._id,
          date: selectedDate,
        });
        if (res.data.success) {
          setSlots(res.data.slots);
        }
      } catch (err) {
        console.warn('Slot lookup failed:', err.message);
      } finally {
        setSlotsLoading(false);
      }
    }
    loadSlots();
  }, [venue, selectedArea, selectedDate]);

  const handleSlotClick = async slot => {
    if (slot.status !== 'available') return;

    if (!isAuthenticated) {
      alert('Please sign in or register to book a sports slot.');
      navigate('/login');
      return;
    }

    setHoldingSlot(slot.startTime);

    try {
      // 1. Concurrency-safe hold request
      const holdRes = await bookingAPI.holdSlot({
        venueId: venue._id,
        playingAreaId: selectedArea._id,
        date: selectedDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });

      if (holdRes.data.success) {
        setCheckoutBooking({
          venueId: venue._id,
          venueName: venue.name,
          playingAreaId: selectedArea._id,
          playingAreaName: selectedArea.name,
          sport: selectedArea.sport,
          date: selectedDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          originalPriceInr: slot.originalPriceInr,
          finalPriceInr: slot.finalPriceInr,
          discountInr: slot.originalPriceInr - slot.finalPriceInr,
          sessionToken: holdRes.data.sessionToken,
        });
        setIsCheckoutOpen(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Slot could not be locked. It may have just been taken.');
    } finally {
      setHoldingSlot(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-6">
        <div className="h-72 rounded-3xl bg-gray-200" />
        <div className="h-10 w-2/3 bg-gray-200 rounded-xl" />
        <div className="h-40 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-800">Venue Not Found</h2>
        <p className="text-xs text-gray-500">{error || 'This ground does not exist or was removed.'}</p>
        <button
          onClick={() => navigate('/explore')}
          className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  const isDiscovery = venue.type === 'discovery' || !venue.isAvailableForBooking;
  const [lng, lat] = venue.location?.coordinates || [72.8777, 19.076];
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. PHOTO GALLERY & HERO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-80 sm:h-96 rounded-3xl overflow-hidden shadow-lg">
        <div className="lg:col-span-2 relative h-full">
          <img
            src={venue.images?.[0] || 'https://images.unsplash.com/photo-1529900240041-52c10c42ff8c?w=1200'}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            {isDiscovery ? (
              <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold uppercase tracking-wider shadow">
                Discovery Venue — Explore Only
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider shadow flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-current" />
                Live Bookable Venue
              </span>
            )}
          </div>
        </div>

        <div className="hidden lg:grid grid-rows-2 gap-4 h-full">
          <div className="relative h-full overflow-hidden">
            <img
              src={venue.images?.[1] || venue.images?.[0] || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800'}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative h-full overflow-hidden bg-gray-900 text-white flex items-center justify-center p-6 text-center">
            <div>
              <span className="text-2xl font-black block">6 Official Sports</span>
              <span className="text-xs text-gray-400 mt-1 block">Cricket • Football • Pickleball • Hockey • Golf • Kabaddi</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. VENUE TITLE, ADDRESS & ACTION BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {venue.sports?.map(sport => (
              <span
                key={sport}
                className="px-2.5 py-0.5 rounded-md bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200"
              >
                {sport}
              </span>
            ))}
            {venue.isIndoor && (
              <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                Covered All-Weather
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {venue.name}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1.5">
            <span className="flex items-center gap-1 font-medium text-gray-700">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              {venue.address}, {venue.locality}, {venue.city} - {venue.pincode}
            </span>
            <span>•</span>
            <div className="flex items-center gap-1 text-emerald-700 font-bold">
              <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
              <span>{venue.ratingAverage}</span>
              <span className="text-gray-400 font-normal">({venue.ratingCount} reviews)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleFavourite}
            className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              isFavourite
                ? 'border-rose-300 bg-rose-50 text-rose-600 font-bold'
                : 'border-gray-300 hover:border-gray-400 text-gray-700 bg-white'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavourite ? 'fill-rose-600 text-rose-600' : 'text-gray-500'}`} />
            <span>{isFavourite ? 'Favourited' : 'Save to Favourites'}</span>
          </button>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl border border-gray-300 hover:border-gray-400 text-xs font-semibold text-gray-700 flex items-center gap-1.5 bg-white shadow-sm transition"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span>Google Maps Directions</span>
          </a>
        </div>
      </div>

      {/* 3. WEATHER RADAR PANEL (Open-Meteo Integration) */}
      <WeatherAlertBanner
        venueId={venue._id}
        date={selectedDate}
        onSelectAlternative={alt => navigate(`/venue/${alt.id}`)}
      />

      {/* 4. MAIN BOOKING WORKFLOW & DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Venue Info, Facilities, Playing Areas */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Ground */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
            <h2 className="font-bold text-base text-gray-900">About this Sports Facility</h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {venue.description || 'Verified Indian sports ground offering professional artificial turf surface and floodlights.'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Surface</span>
                <span className="font-semibold text-gray-800">{venue.surface}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Operating Hours</span>
                <span className="font-semibold text-gray-800">
                  {venue.operatingHours?.open} to {venue.operatingHours?.close}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Capacity</span>
                <span className="font-semibold text-gray-800">{venue.capacity} Players</span>
              </div>
            </div>
          </div>

          {/* Facilities */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
            <h2 className="font-bold text-base text-gray-900">Facilities & Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {venue.facilities?.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ground Rules */}
          {/* Ground Rules */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
            <h2 className="font-bold text-base text-gray-900">Ground Rules & Guidelines</h2>
            <ul className="space-y-2 text-xs text-gray-600">
              {venue.rules?.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Ground Location Map */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base text-gray-900">Ground Location & Live Map</h2>
                <p className="text-xs text-gray-500 mt-0.5">{venue.address}, {venue.locality}, {venue.city}</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-gray-100 text-gray-700 font-bold">
                {venue.location?.coordinates?.[1].toFixed(4)}° N, {venue.location?.coordinates?.[0].toFixed(4)}° E
              </span>
            </div>
            {venue.location?.coordinates && (
              <div className="h-64 rounded-xl overflow-hidden border border-gray-200 relative z-0">
                <MapContainer
                  center={[venue.location.coordinates[1], venue.location.coordinates[0]]}
                  zoom={14}
                  scrollWheelZoom={false}
                  className="w-full h-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[venue.location.coordinates[1], venue.location.coordinates[0]]}
                    icon={groundMarkerIcon}
                  >
                    <Popup>
                      <div className="text-xs">
                        <strong className="block text-brand-600">{venue.name}</strong>
                        <span>{venue.address}</span>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base text-gray-900">
                Verified Player Reviews ({venue.reviews?.length || 0})
              </h2>
              {isAuthenticated && (
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold border border-brand-200 transition shadow-sm"
                >
                  Write a Review
                </button>
              )}
            </div>
            {venue.reviews?.length === 0 ? (
              <p className="text-xs text-gray-500">No verified reviews yet. Be the first player to review after booking!</p>
            ) : (
              <div className="space-y-3">
                {venue.reviews?.map((r, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{r.customer?.name || 'Sports Player'}</span>
                      <div className="flex items-center gap-1 text-emerald-600 font-bold">
                        <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                        <span>{r.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-gray-600">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Slot Selection & Concurrency Engine */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border-2 border-brand-500/20 p-6 shadow-xl sticky top-24 space-y-5">
            <div>
              <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest block mb-1">
                Booking Engine
              </span>
              <h3 className="font-extrabold text-lg text-gray-900">Select Date & Playing Slot</h3>
            </div>

            {isDiscovery ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                <span className="font-bold block text-sm">Discovery Venue Only</span>
                <p>
                  This genuine Indian ground is currently in public discovery status. Online slot booking will be enabled as soon as the venue owner onboarding process is complete.
                </p>
                <button
                  onClick={() => navigate('/explore')}
                  className="w-full mt-2 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition"
                >
                  Explore Other Bookable Venues
                </button>
              </div>
            ) : (
              <>
                {/* Playing Area Selector if multi-court */}
                {venue.playingAreas?.length > 1 && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Choose Pitch / Court
                    </label>
                    <div className="space-y-1.5">
                      {venue.playingAreas.map(area => (
                        <button
                          key={area._id}
                          type="button"
                          onClick={() => setSelectedArea(area)}
                          className={`w-full text-left p-2.5 rounded-xl border text-xs font-medium transition flex items-center justify-between ${
                            selectedArea?._id === area._id
                              ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold shadow-sm'
                              : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div>
                            <span className="block font-bold">{area.name}</span>
                            <span className="text-[10px] text-gray-500">{area.dimensions} • {area.sport}</span>
                          </div>
                          <span className="font-bold text-brand-600">₹{area.hourlyPricePaise / 100}/hr</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Date Picker */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Select Match Date
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 focus:outline-none focus:border-brand-600"
                  />
                </div>

                {/* Slots Grid */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Hourly Slots ({slots.filter(s => s.status === 'available').length} Available)
                    </label>
                  </div>

                  {slotsLoading ? (
                    <div className="py-8 text-center text-xs text-gray-400 animate-pulse">
                      Checking atomic slot conflicts...
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-500">
                      No bookable slots found for this date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                      {slots.map((slot, idx) => {
                        const isAvail = slot.status === 'available';
                        const isHeld = slot.status === 'held';
                        const isBooked = slot.status === 'booked';
                        const isMaint = slot.status === 'maintenance';
                        const isLocking = holdingSlot === slot.startTime;

                        return (
                          <button
                            key={idx}
                            disabled={!isAvail || isLocking}
                            onClick={() => handleSlotClick(slot)}
                            className={`p-2.5 rounded-xl text-left border transition relative flex flex-col justify-between ${
                              isAvail
                                ? 'border-gray-200 bg-white hover:border-brand-500 hover:shadow-md cursor-pointer'
                                : isHeld
                                ? 'border-amber-200 bg-amber-50 text-amber-700 opacity-80 cursor-not-allowed'
                                : isMaint
                                ? 'border-amber-300 bg-amber-50/80 text-amber-900 opacity-80 cursor-not-allowed'
                                : 'border-gray-200 bg-gray-100 text-gray-400 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <span className="font-bold text-xs text-gray-900">
                              {slot.startTime} - {slot.endTime}
                            </span>

                            <div className="mt-1 flex items-center justify-between">
                              {isAvail ? (
                                <div className="flex items-center gap-1">
                                  {slot.promotion ? (
                                    <>
                                      <span className="text-[10px] text-gray-400 line-through">
                                        ₹{slot.originalPriceInr}
                                      </span>
                                      <span className="text-xs font-black text-brand-600">
                                        ₹{slot.finalPriceInr}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-xs font-bold text-gray-800">
                                      ₹{slot.finalPriceInr}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[10px] uppercase font-bold tracking-wider">
                                  {isHeld ? 'On Hold' : isMaint ? 'Maintenance' : 'Booked'}
                                </span>
                              )}
                            </div>

                            {slot.promotion && isAvail && (
                              <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded-full bg-brand-600 text-white text-[8px] font-black uppercase shadow">
                                {slot.promotion.discountPercentage}% OFF
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-2 text-[11px] text-gray-400 flex items-center justify-between">
                  <span>• 10-minute hold on click</span>
                  <span>• Zero double-booking</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 5. CHECKOUT MODAL */}
      {isCheckoutOpen && checkoutBooking && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false);
            setCheckoutBooking(null);
          }}
          bookingDetails={checkoutBooking}
          onBookingSuccess={() => {
            // Refresh slots after booking
            setSelectedDate(prev => prev);
          }}
        />
      )}

      {/* 6. REVIEW SUBMISSION MODAL */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-600 tracking-wider">Community Review</span>
                <h3 className="font-black text-lg text-gray-900">Review {venue.name}</h3>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Overall Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          reviewForm.rating >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-gray-700 ml-2">{reviewForm.rating} / 5 Stars</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Cleanliness</label>
                  <select
                    value={reviewForm.cleanlinessRating}
                    onChange={e => setReviewForm(prev => ({ ...prev, cleanlinessRating: Number(e.target.value) }))}
                    className="w-full mt-1 px-2 py-1.5 rounded-lg border text-xs"
                  >
                    {[5, 4, 3, 2, 1].map(n => (
                      <option key={n} value={n}>{n} ★</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Facilities</label>
                  <select
                    value={reviewForm.facilitiesRating}
                    onChange={e => setReviewForm(prev => ({ ...prev, facilitiesRating: Number(e.target.value) }))}
                    className="w-full mt-1 px-2 py-1.5 rounded-lg border text-xs"
                  >
                    {[5, 4, 3, 2, 1].map(n => (
                      <option key={n} value={n}>{n} ★</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Value</label>
                  <select
                    value={reviewForm.valueRating}
                    onChange={e => setReviewForm(prev => ({ ...prev, valueRating: Number(e.target.value) }))}
                    className="w-full mt-1 px-2 py-1.5 rounded-lg border text-xs"
                  >
                    {[5, 4, 3, 2, 1].map(n => (
                      <option key={n} value={n}>{n} ★</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Feedback & Experience</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Share details about turf surface condition, floodlights, parking, and staff courtesy..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-brand-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow transition disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Post Verified Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
