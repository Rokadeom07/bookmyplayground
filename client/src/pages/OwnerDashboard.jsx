import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Percent,
  Clock,
  Plus,
  Tag,
  AlertCircle,
  Building,
  CalendarCheck,
  Zap,
  CheckCircle2,
  DollarSign,
  MapPin,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { ownerAPI, venueAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function OwnerDashboard() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [optimisation, setOptimisation] = useState(null);
  const [myVenues, setMyVenues] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  // New ground form modal
  const [isAddGroundOpen, setIsAddGroundOpen] = useState(false);
  const [newGround, setNewGround] = useState({
    name: '',
    sports: ['Football'],
    address: '',
    city: 'Mumbai',
    locality: 'Bandra West',
    pincode: '400050',
    coordinatesLng: 72.8315,
    coordinatesLat: 19.0558,
    baseHourlyPriceInr: 1500,
    surface: 'Artificial Turf',
    isIndoor: false,
  });

  // New promo form modal
  const [isAddPromoOpen, setIsAddPromoOpen] = useState(false);
  const [newPromo, setNewPromo] = useState({
    venueId: '',
    title: 'Weekday Afternoon Special',
    discountPercentage: 15,
    startHour: '14:00',
    endHour: '17:00',
    applicableDays: [1, 2, 3, 4, 5],
  });

  // Maintenance slot blocking state
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);
  const [newBlock, setNewBlock] = useState({
    venueId: '',
    specificDate: new Date().toISOString().split('T')[0],
    openTime: '10:00',
    closeTime: '13:00',
    blockReason: 'Turf Brushing & Floodlight Repair',
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [anRes, optRes, venRes, bookRes, promoRes, blockRes] = await Promise.all([
        ownerAPI.getAnalytics(),
        ownerAPI.getSlotOptimisation(),
        venueAPI.getMyVenues(),
        bookingAPI.getOwnerBookings(),
        ownerAPI.getPromotions(),
        ownerAPI.getBlockedSlots(),
      ]);

      if (anRes.data.success) setAnalytics(anRes.data.metrics);
      if (optRes.data.success) setOptimisation(optRes.data);
      if (venRes.data.success) {
        setMyVenues(venRes.data.venues);
        if (venRes.data.venues.length > 0) {
          setNewPromo(prev => ({ ...prev, venueId: venRes.data.venues[0]._id }));
          setNewBlock(prev => ({ ...prev, venueId: venRes.data.venues[0]._id }));
        }
      }
      if (bookRes.data.success) setMyBookings(bookRes.data.bookings);
      if (promoRes.data.success) setPromotions(promoRes.data.promotions);
      if (blockRes.data.success) setBlockedSlots(blockRes.data.rules || []);
    } catch (err) {
      console.warn('Dashboard load error:', err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleBlockSlot = async e => {
    e.preventDefault();
    try {
      const res = await ownerAPI.blockSlot(newBlock);
      if (res.data.success) {
        alert('Slot successfully blocked for maintenance!');
        setIsAddBlockOpen(false);
        loadDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to block slot.');
    }
  };

  const handleUnblockSlot = async ruleId => {
    if (!window.confirm('Restore this slot to public booking inventory?')) return;
    try {
      const res = await ownerAPI.unblockSlot(ruleId);
      if (res.data.success) {
        alert('Slot restored to public inventory!');
        loadDashboardData();
      }
    } catch (err) {
      alert('Failed to unblock slot.');
    }
  };

  const handleCreateGround = async e => {
    e.preventDefault();
    try {
      const payload = {
        name: newGround.name,
        sports: newGround.sports,
        address: newGround.address,
        state: 'Maharashtra',
        city: newGround.city,
        locality: newGround.locality,
        pincode: newGround.pincode,
        coordinates: [Number(newGround.coordinatesLng), Number(newGround.coordinatesLat)],
        baseHourlyPriceInr: Number(newGround.baseHourlyPriceInr),
        surface: newGround.surface,
        isIndoor: newGround.isIndoor,
      };

      const res = await venueAPI.createVenue(payload);
      if (res.data.success) {
        alert(res.data.message);
        setIsAddGroundOpen(false);
        loadDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not create venue.');
    }
  };

  const handleCreatePromo = async e => {
    e.preventDefault();
    try {
      const res = await ownerAPI.createPromotion(newPromo);
      if (res.data.success) {
        alert('Promotional discount activated successfully!');
        setIsAddPromoOpen(false);
        loadDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create promotion.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-charcoal-900 text-white rounded-3xl p-6 sm:p-8 border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center font-black text-2xl text-white shadow-md">
            🏟️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">Owner Command Center</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Verified Owner
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {user?.name} • Manage venues, real-time occupancy, and algorithmic slot optimisation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddGroundOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Ground</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Analytics Overview', icon: TrendingUp },
          { id: 'venues', label: `My Grounds (${myVenues.length})`, icon: Building },
          { id: 'bookings', label: `Bookings (${myBookings.length})`, icon: CalendarCheck },
          { id: 'optimisation', label: 'Smart Slot Optimisation', icon: Sparkles, badge: 'Smart' },
          { id: 'promotions', label: `Promotions (${promotions.length})`, icon: Tag },
          { id: 'maintenance', label: `Slot Maintenance (${blockedSlots.length})`, icon: Clock },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                activeTab === tab.id
                  ? 'bg-charcoal-900 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-brand-600 text-white font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW & ANALYTICS TAB */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Total Bookings
              </span>
              <span className="text-2xl font-black text-gray-900 block">{analytics.totalBookings}</span>
              <span className="text-[10px] text-emerald-600 font-medium">
                {analytics.confirmedCount} Confirmed • {analytics.cancelledCount} Cancelled
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Simulated Revenue
              </span>
              <span className="text-2xl font-black text-brand-600 block">
                ₹{analytics.totalSimulatedRevenueInr?.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-amber-600 font-semibold">
                ⚠️ Academic Demo Mode
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Occupancy Rate
              </span>
              <span className="text-2xl font-black text-emerald-600 block">
                {analytics.occupancyPercent}%
              </span>
              <span className="text-[10px] text-gray-500">
                Booked Hours / Bookable Hours
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Peak Demand Window
              </span>
              <span className="text-2xl font-black text-gray-900 block">{analytics.peakHour}</span>
              <span className="text-[10px] text-gray-500">
                Low Demand: {analytics.lowDemandHour}
              </span>
            </div>
          </div>

          {/* Recharts Hourly Demand Graph */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-gray-900">
                  Hourly Booking Distribution (Operating Hours 06:00 – 23:00)
                </h3>
                <p className="text-xs text-gray-500">
                  Aggregated in O(1) time using our Custom Hash Map algorithm
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.hourlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#e11d48" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 2. MY GROUNDS TAB */}
      {activeTab === 'venues' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-gray-900">Registered Sports Turfs</h3>
            <button
              onClick={() => setIsAddGroundOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-bold"
            >
              + Add Venue
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myVenues.map(venue => (
              <div key={venue._id} className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3 shadow-sm">
                <div className="flex items-start justify-between">
                  <h4 className="font-black text-base text-gray-900">{venue.name}</h4>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      venue.approvalStatus === 'approved'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {venue.approvalStatus}
                  </span>
                </div>

                <p className="text-xs text-gray-500">
                  {venue.locality}, {venue.city} • {venue.surface}
                </p>

                <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                  <span className="font-bold text-brand-600">₹{venue.baseHourlyPricePaise / 100}/hr</span>
                  <span className="text-gray-500">{venue.playingAreas?.length || 1} Playing Areas</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. BOOKINGS TAB */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-base text-gray-900">Customer Reservations</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                <tr>
                  <th className="p-3.5">Booking ID</th>
                  <th className="p-3.5">Venue & Area</th>
                  <th className="p-3.5">Sport</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Slot Date & Time</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myBookings.map(b => (
                  <tr key={b._id} className="hover:bg-gray-50/70">
                    <td className="p-3.5 font-mono font-bold text-gray-900">{b.bookingId}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-gray-900 block">{b.venue?.name}</span>
                      <span className="text-gray-400 text-[10px]">{b.playingArea?.name}</span>
                    </td>
                    <td className="p-3.5 font-medium">{b.sport}</td>
                    <td className="p-3.5">
                      <span className="font-medium text-gray-900 block">{b.customer?.name}</span>
                      <span className="text-gray-400 text-[10px]">{b.customer?.phone}</span>
                    </td>
                    <td className="p-3.5 font-semibold text-brand-600">
                      {b.date} ({b.startTime} - {b.endTime})
                    </td>
                    <td className="p-3.5 font-black text-gray-900">₹{b.totalAmountInr}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold uppercase text-[9px]">
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. SMART SLOT OPTIMISATION TAB */}
      {activeTab === 'optimisation' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-charcoal-900 text-white border border-gray-800 space-y-2">
            <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Feature 4: Smart Slot Optimisation Engine</span>
            </div>
            <h3 className="text-xl font-bold">Data-Driven Revenue & Occupancy Recommendations</h3>
            <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
              Analyzes historical booking patterns to identify low-demand lulls, unbooked windows, and peak periods.
              Prices are never changed automatically; recommendations require explicit owner confirmation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {optimisation?.suggestions?.map(sug => (
              <div
                key={sug.id}
                className="p-6 rounded-3xl bg-white border border-gray-200 space-y-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                      {sug.type}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      Confidence: {sug.confidence}
                    </span>
                  </div>

                  <h4 className="font-black text-lg text-gray-900 mt-2">{sug.targetWindow}</h4>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {sug.rationale}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600">
                    Suggested Discount: {sug.suggestedDiscount || 15}%
                  </span>
                  <button
                    onClick={() => {
                      setNewPromo(prev => ({
                        ...prev,
                        title: sug.actionRecommended,
                        discountPercentage: sug.suggestedDiscount || 15,
                      }));
                      setIsAddPromoOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition"
                  >
                    Apply Suggestion
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. PROMOTIONS TAB */}
      {activeTab === 'promotions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-gray-900">Active Dynamic Promotions</h3>
            <button
              onClick={() => setIsAddPromoOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-bold"
            >
              + Create Promotion
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map(promo => (
              <div key={promo._id} className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-black text-base text-gray-900">{promo.title}</h4>
                    <span className="text-xs text-gray-500">{promo.venue?.name}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 font-black text-xs">
                    {promo.discountPercentage}% OFF
                  </span>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <p>Applicable Window: {promo.startHour} - {promo.endHour}</p>
                  <p>Days: Weekdays (Mon-Fri)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. SLOT MAINTENANCE TAB */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-base text-gray-900">
                Ground Maintenance & Blocked Inventory ({blockedSlots.length})
              </h2>
              <p className="text-xs text-gray-500">
                Block specific time slots for pitch leveling, floodlight servicing, or private tournaments.
              </p>
            </div>
            <button
              onClick={() => setIsAddBlockOpen(true)}
              className="px-4 py-2 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-bold transition flex items-center gap-1.5 w-fit"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Block Slot for Maintenance</span>
            </button>
          </div>

          {blockedSlots.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-gray-200 text-center space-y-2">
              <Clock className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="font-bold text-gray-800">No Blocked Slots</h3>
              <p className="text-xs text-gray-500">
                All operating hours across your sports grounds are currently open for public booking.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {blockedSlots.map(rule => (
                <div
                  key={rule._id}
                  className="p-5 rounded-2xl bg-white border border-amber-200/90 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-sm text-gray-900">{rule.venue?.name || 'Your Ground'}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                        Maintenance
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 space-y-0.5">
                      <p className="font-semibold text-gray-800">
                        Date: {rule.specificDate || (rule.dayOfWeek !== undefined ? `Every Day ${rule.dayOfWeek}` : 'All Days')}
                      </p>
                      <p>Time Window: {rule.openTime} – {rule.closeTime}</p>
                      <p className="text-gray-500 italic">"{rule.blockReason || 'Routine turf care'}"</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUnblockSlot(rule._id)}
                    className="w-full py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
                  >
                    Unblock / Restore Slot
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BLOCK SLOT FOR MAINTENANCE MODAL */}
      {isAddBlockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-100 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-gray-900">Block Slot for Maintenance</h3>
              <button onClick={() => setIsAddBlockOpen(false)} className="text-gray-400">✕</button>
            </div>

            <form onSubmit={handleBlockSlot} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Select Venue</label>
                <select
                  value={newBlock.venueId}
                  onChange={e => setNewBlock({ ...newBlock, venueId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                >
                  {myVenues.map(v => (
                    <option key={v._id} value={v._id}>{v.name} ({v.locality})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={newBlock.specificDate}
                  onChange={e => setNewBlock({ ...newBlock, specificDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Start Hour</label>
                  <input
                    type="time"
                    required
                    value={newBlock.openTime}
                    onChange={e => setNewBlock({ ...newBlock, openTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">End Hour</label>
                  <input
                    type="time"
                    required
                    value={newBlock.closeTime}
                    onChange={e => setNewBlock({ ...newBlock, closeTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Reason for Maintenance</label>
                <input
                  type="text"
                  required
                  value={newBlock.blockReason}
                  onChange={e => setNewBlock({ ...newBlock, blockReason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  placeholder="e.g. Turf Brushing, Floodlight Wiring, Rain Drainage"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBlockOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-charcoal-900 text-white font-bold"
                >
                  Confirm Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE GROUND MODAL */}
      {isAddGroundOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-gray-900">List a New Sports Ground</h3>
              <button onClick={() => setIsAddGroundOpen(false)} className="text-gray-400">✕</button>
            </div>

            <form onSubmit={handleCreateGround} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Venue Name</label>
                <input
                  type="text"
                  required
                  value={newGround.name}
                  onChange={e => setNewGround({ ...newGround, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  placeholder="e.g. Apex Football Turf Bandra"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newGround.city}
                    onChange={e => setNewGround({ ...newGround, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Locality</label>
                  <input
                    type="text"
                    required
                    value={newGround.locality}
                    onChange={e => setNewGround({ ...newGround, locality: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  required
                  value={newGround.address}
                  onChange={e => setNewGround({ ...newGround, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Base Price / hr (₹)</label>
                  <input
                    type="number"
                    required
                    value={newGround.baseHourlyPriceInr}
                    onChange={e => setNewGround({ ...newGround, baseHourlyPriceInr: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Surface Type</label>
                  <select
                    value={newGround.surface}
                    onChange={e => setNewGround({ ...newGround, surface: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  >
                    <option value="Artificial Turf">Artificial Turf</option>
                    <option value="Natural Grass">Natural Grass</option>
                    <option value="Indoor Mat">Indoor Mat</option>
                    <option value="Synthetic Turf">Synthetic Turf</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md mt-2"
              >
                Submit Ground for Admin Approval
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PROMO MODAL */}
      {isAddPromoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-100 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-gray-900">Create Dynamic Promotion</h3>
              <button onClick={() => setIsAddPromoOpen(false)} className="text-gray-400">✕</button>
            </div>

            <form onSubmit={handleCreatePromo} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Promotion Title</label>
                <input
                  type="text"
                  required
                  value={newPromo.title}
                  onChange={e => setNewPromo({ ...newPromo, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Discount (%)</label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  required
                  value={newPromo.discountPercentage}
                  onChange={e => setNewPromo({ ...newPromo, discountPercentage: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Start Hour</label>
                  <input
                    type="time"
                    value={newPromo.startHour}
                    onChange={e => setNewPromo({ ...newPromo, startHour: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">End Hour</label>
                  <input
                    type="time"
                    value={newPromo.endHour}
                    onChange={e => setNewPromo({ ...newPromo, endHour: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md mt-2"
              >
                Activate Promotional Discount Rule
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
