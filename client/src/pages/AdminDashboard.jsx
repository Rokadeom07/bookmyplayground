import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  MapPin,
  TrendingUp,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { adminAPI, locationAPI } from '../services/api';

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [activeTab, setActiveTab] = useState('owners');
  const [owners, setOwners] = useState([]);
  const [venues, setVenues] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add city modal
  const [isAddCityOpen, setIsAddCityOpen] = useState(false);
  const [newCity, setNewCity] = useState({
    name: '',
    stateName: 'Maharashtra',
    isPopular: true,
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    setLoading(true);
    try {
      const [ovRes, ownRes, venRes, usrRes] = await Promise.all([
        adminAPI.getOverview(),
        adminAPI.getOwners(),
        adminAPI.getPendingVenues(),
        adminAPI.getUsers(),
      ]);

      if (ovRes.data.success) setOverview(ovRes.data.stats);
      if (ownRes.data.success) setOwners(ownRes.data.owners);
      if (venRes.data.success) setVenues(venRes.data.venues);
      if (usrRes.data.success) setUsers(usrRes.data.users);
    } catch (err) {
      console.warn('Admin load error:', err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleReviewOwner = async (profileId, status) => {
    try {
      const res = await adminAPI.reviewOwner(profileId, { status });
      if (res.data.success) {
        alert(res.data.message);
        loadAdminData();
      }
    } catch (err) {
      alert('Review action failed.');
    }
  };

  const handleReviewVenue = async (venueId, status, type) => {
    try {
      const res = await adminAPI.reviewVenue(venueId, { status, type });
      if (res.data.success) {
        alert(res.data.message);
        loadAdminData();
      }
    } catch (err) {
      alert('Review action failed.');
    }
  };

  const handleCreateCity = async e => {
    e.preventDefault();
    try {
      const res = await locationAPI.createCity(newCity);
      if (res.data.success) {
        alert(`City ${newCity.name} added to MongoDB location database.`);
        setIsAddCityOpen(false);
        loadAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add city.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-charcoal-900 to-charcoal-900 text-white rounded-3xl p-6 sm:p-8 border border-purple-900/50 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center font-black text-2xl text-white shadow-md">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">Super Admin Command Center</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                System Administrator
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Role-based platform moderation, owner verifications, venue approvals, and Indian location hierarchy
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddCityOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Indian City</span>
        </button>
      </div>

      {/* Metrics Row */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Registered Players</span>
            <span className="text-2xl font-black text-gray-900 block">{overview.totalUsers}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ground Owners</span>
            <span className="text-2xl font-black text-gray-900 block">{overview.totalOwners}</span>
            <span className="text-[10px] text-amber-600 font-bold">{overview.pendingOwners} Pending Review</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Grounds</span>
            <span className="text-2xl font-black text-brand-600 block">{overview.approvedVenues}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Bookings</span>
            <span className="text-2xl font-black text-gray-900 block">{overview.totalBookings}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Simulated Revenue</span>
            <span className="text-2xl font-black text-emerald-600 block">
              ₹{overview.totalSimulatedRevenueInr?.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('owners')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'owners' ? 'bg-purple-900 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Owner Applications ({owners.length})
        </button>

        <button
          onClick={() => setActiveTab('venues')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'venues' ? 'bg-purple-900 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Ground Moderation ({venues.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'users' ? 'bg-purple-900 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          All Users ({users.length})
        </button>
      </div>

      {/* 1. OWNER APPROVALS */}
      {activeTab === 'owners' && (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-base text-gray-900">Ground Owner Business Registrations</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b">
                <tr>
                  <th className="p-3.5">Owner Name</th>
                  <th className="p-3.5">Business Name</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">GST / PAN</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {owners.map(o => (
                  <tr key={o._id} className="hover:bg-gray-50">
                    <td className="p-3.5 font-bold text-gray-900">{o.user?.name}</td>
                    <td className="p-3.5">
                      <span className="font-medium text-gray-800 block">{o.businessName}</span>
                      <span className="text-[10px] text-gray-400">{o.businessAddress}</span>
                    </td>
                    <td className="p-3.5 text-gray-600">
                      {o.user?.email}<br />{o.user?.phone}
                    </td>
                    <td className="p-3.5 font-mono text-gray-700">{o.panOrGst || 'N/A'}</td>
                    <td className="p-3.5">
                      <span
                        className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          o.approvalStatus === 'approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : o.approvalStatus === 'pending'
                            ? 'bg-amber-50 text-amber-700 font-bold'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {o.approvalStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      {o.approvalStatus !== 'approved' && (
                        <button
                          onClick={() => handleReviewOwner(o._id, 'approved')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition"
                        >
                          Approve Owner
                        </button>
                      )}
                      {o.approvalStatus !== 'rejected' && (
                        <button
                          onClick={() => handleReviewOwner(o._id, 'rejected')}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. VENUE APPROVALS & MODERATION */}
      {activeTab === 'venues' && (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-base text-gray-900">Ground Listings Moderation</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b">
                <tr>
                  <th className="p-3.5">Ground Name</th>
                  <th className="p-3.5">Sports</th>
                  <th className="p-3.5">City & Locality</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {venues.map(v => (
                  <tr key={v._id} className="hover:bg-gray-50">
                    <td className="p-3.5 font-bold text-gray-900">{v.name}</td>
                    <td className="p-3.5">{v.sports?.join(', ')}</td>
                    <td className="p-3.5 text-gray-600">{v.locality}, {v.city}</td>
                    <td className="p-3.5">
                      <span className="font-mono text-[10px] uppercase font-bold text-gray-700">
                        {v.type}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          v.approvalStatus === 'approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {v.approvalStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      {v.approvalStatus !== 'approved' && (
                        <button
                          onClick={() => handleReviewVenue(v._id, 'approved', 'bookable')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px]"
                        >
                          Approve & Publish
                        </button>
                      )}
                      <button
                        onClick={() => handleReviewVenue(v._id, 'approved', v.type === 'bookable' ? 'discovery' : 'bookable')}
                        className="px-2.5 py-1 rounded-lg border border-gray-300 text-gray-700 font-bold text-[10px]"
                      >
                        Toggle Type ({v.type})
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. USER ROSTER */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-base text-gray-900">User Roster</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b">
                <tr>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">City Preference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="p-3.5 font-bold text-gray-900">{u.name}</td>
                    <td className="p-3.5 text-gray-600">{u.email}</td>
                    <td className="p-3.5 text-gray-600">{u.phone}</td>
                    <td className="p-3.5">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-700">{u.preferredCity || 'Mumbai'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD CITY MODAL */}
      {isAddCityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-gray-100 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-gray-900">Add Indian City</h3>
              <button onClick={() => setIsAddCityOpen(false)} className="text-gray-400">✕</button>
            </div>

            <form onSubmit={handleCreateCity} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">City Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nagpur"
                  value={newCity.name}
                  onChange={e => setNewCity({ ...newCity, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">State Name</label>
                <input
                  type="text"
                  required
                  value={newCity.stateName}
                  onChange={e => setNewCity({ ...newCity, stateName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md mt-2"
              >
                Save City in Database
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
