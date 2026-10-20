import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Clock,
  MapPin,
  Receipt,
  XCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Heart,
  ExternalLink,
} from 'lucide-react';
import { bookingAPI, venueAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import VenueCard from '../components/VenueCard';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [bookRes, favRes] = await Promise.allSettled([
          bookingAPI.getMyBookings(),
          venueAPI.getMyFavourites(),
        ]);
        if (bookRes.status === 'fulfilled' && bookRes.value.data.success) {
          setBookings(bookRes.value.data.bookings);
        }
        if (favRes.status === 'fulfilled' && favRes.value.data.success) {
          setFavourites(favRes.value.data.favourites || []);
        }
      } catch (err) {
        console.warn('Failed to load customer data:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCancel = async bookingId => {
    if (!window.confirm('Are you sure you want to cancel this booking? The slot will immediately become available for other players.')) {
      return;
    }

    try {
      setCancellingId(bookingId);
      const res = await bookingAPI.cancelBooking(bookingId, { reason: 'Customer requested cancellation' });
      if (res.data.success) {
        setBookings(prev =>
          prev.map(b => (b._id === bookingId ? { ...b, bookingStatus: 'cancelled' } : b))
        );
        alert('Booking successfully cancelled. Simulated refund initiated.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation failed.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleViewReceipt = async bookingId => {
    try {
      const res = await bookingAPI.getReceipt(bookingId);
      if (res.data.success) {
        setSelectedReceipt(res.data.receipt);
      }
    } catch (err) {
      alert('Could not generate receipt.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-charcoal-900 text-white rounded-3xl p-6 sm:p-8 border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center font-black text-2xl text-white shadow-md">
            {user?.name?.[0] || 'C'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{user?.name}</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-600/30 text-brand-400 border border-brand-500/30">
                Customer
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {user?.email} • {user?.phone} • Preferred City: {user?.preferredCity || 'Mumbai'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-charcoal-800 border border-gray-700 text-xs">
            <span className="text-gray-400 block text-[10px] uppercase">Total Bookings</span>
            <span className="font-bold text-white text-base">{bookings.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'bookings'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>My Ground Bookings ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('favourites')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'favourites'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Saved Favourites ({favourites.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('smart-tools')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'smart-tools'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ExternalLink className="w-4 h-4" />
          <span>Smart Sports Tools</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'profile'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Account Settings</span>
        </button>
      </div>

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-32 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-gray-200 text-center space-y-3">
              <CalendarDays className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="font-bold text-gray-800">No Bookings Yet</h3>
              <p className="text-xs text-gray-500">
                You haven't reserved any ground slots yet. Explore venues to book your first game!
              </p>
              <a
                href="/explore"
                className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold shadow transition"
              >
                Browse Sports Grounds
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map(b => {
                const isConfirmed = b.bookingStatus === 'confirmed';
                return (
                  <div
                    key={b._id}
                    className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-gray-500">
                          {b.bookingId}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            isConfirmed
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {b.bookingStatus}
                        </span>
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                          {b.sport}
                        </span>
                      </div>

                      <h3 className="font-black text-base text-gray-900">
                        {b.venue?.name || 'Sports Venue'}
                      </h3>

                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {b.venue?.locality}, {b.venue?.city} • Area: {b.playingArea?.name}
                      </p>

                      <div className="text-xs font-semibold text-brand-600 flex items-center gap-1.5 pt-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Match Date: {b.date} • Time: {b.startTime} - {b.endTime} (IST)</span>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase block md:text-right">Amount Paid</span>
                        <span className="text-lg font-black text-gray-900">₹{b.totalAmountInr}</span>
                        <span className="text-[10px] text-gray-400 block md:text-right">(Simulated)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewReceipt(b._id)}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-xs font-semibold text-gray-700 flex items-center gap-1 transition"
                        >
                          <Receipt className="w-3.5 h-3.5 text-gray-500" />
                          <span>Receipt</span>
                        </button>

                        {isConfirmed && (
                          <button
                            onClick={() => handleCancel(b._id)}
                            disabled={cancellingId === b._id}
                            className="px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-xs font-semibold text-red-600 transition"
                          >
                            {cancellingId === b._id ? 'Cancelling...' : 'Cancel Slot'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Account Settings Tab */}
      {activeTab === 'profile' && (
        <div className="max-w-xl bg-white rounded-3xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-base text-gray-900">Personal Information</h2>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-gray-500 block mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={user?.name || ''}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 font-medium"
              />
            </div>
            <div>
              <label className="text-gray-500 block mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 font-medium"
              />
            </div>
            <div>
              <label className="text-gray-500 block mb-1">Mobile Number</label>
              <input
                type="text"
                disabled
                value={user?.phone || ''}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* Favourites Tab */}
      {activeTab === 'favourites' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-gray-900">Your Saved Grounds ({favourites.length})</h2>
            <a href="/explore" className="text-xs text-brand-600 font-bold hover:underline">
              Discover More Turfs →
            </a>
          </div>

          {favourites.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-gray-200 text-center space-y-3">
              <Heart className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="font-bold text-gray-800">No Favourites Saved Yet</h3>
              <p className="text-xs text-gray-500">
                Click the heart icon on any ground detail page to bookmark it for quick access!
              </p>
              <a
                href="/explore"
                className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold shadow transition"
              >
                Browse Sports Grounds
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favourites.map(venue => (
                <VenueCard key={venue._id} venue={venue} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Smart Tools Tab */}
      {activeTab === 'smart-tools' && (
        <div className="space-y-6">
          <h2 className="font-bold text-lg text-gray-900">Smart Features & Algorithmic Tools</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest block">Feature 1</span>
                <h3 className="font-black text-base text-gray-900 mt-1">Smart Ground Finder</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Min Heap Priority Queue algorithm ranking Indian grounds based on real-time distance, budget, slot inventory, facilities, and verified ratings.
                </p>
              </div>
              <a
                href="/smart-finder"
                className="w-full py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold text-center block shadow hover:bg-brand-500 transition"
              >
                Launch Smart Finder →
              </a>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">Feature 2</span>
                <h3 className="font-black text-base text-gray-900 mt-1">Group-Friendly Ground Finder</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Dijkstra's shortest path solver on the MMR transit network finding the fairest geographic meeting point for multi-player squads.
                </p>
              </div>
              <a
                href="/group-finder"
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold text-center block shadow hover:bg-blue-500 transition"
              >
                Launch Group Finder →
              </a>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">Explore</span>
                <h3 className="font-black text-base text-gray-900 mt-1">Grounds & Turfs Near You</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Discover verified cricket pitches, football turfs, pickleball courts, and arenas with live slot availability in your city.
                </p>
              </div>
              <a
                href="/near-me"
                className="w-full py-2.5 rounded-xl bg-charcoal-900 text-white text-xs font-bold text-center block shadow hover:bg-charcoal-800 transition"
              >
                Find Grounds Near Me →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-base text-gray-900">Booking Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Receipt No:</span>
                <span className="font-mono font-bold text-gray-800">{selectedReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Booking ID:</span>
                <span className="font-mono font-bold text-brand-600">{selectedReceipt.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Venue:</span>
                <span className="font-semibold text-gray-900">{selectedReceipt.venue.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Slot Date & Time:</span>
                <span className="font-bold text-gray-800">{selectedReceipt.slotDate} ({selectedReceipt.slotTime})</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 font-bold">
                <span>Total Amount Paid:</span>
                <span>₹{selectedReceipt.pricing.totalInr}</span>
              </div>
            </div>

            <div className="p-2.5 bg-amber-50 rounded-lg text-[10px] text-amber-800 font-medium">
              ⚠️ {selectedReceipt.payment.disclaimer}
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full py-2.5 rounded-xl bg-charcoal-900 text-white font-bold text-xs"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
