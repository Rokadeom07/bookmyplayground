import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCity } from '../context/CityContext';
import { authAPI } from '../services/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const { cities, setSelectedCity } = useCity();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [preferredCity, setPreferredCityState] = useState(user?.preferredCity || 'Mumbai');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async e => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const res = await authAPI.updateProfile({ name, phone, preferredCity });
      if (res.data.success) {
        setSelectedCity(preferredCity);
        setSuccess(true);
      }
    } catch (err) {
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white font-black text-2xl flex items-center justify-center uppercase shadow-md">
            {user?.name?.[0] || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">{user?.name}</h1>
            <p className="text-xs text-gray-400">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
              Role: {user?.role}
            </span>
          </div>
        </div>

        {success && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs">
            Profile preferences updated successfully!
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-medium"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-medium font-mono"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
              Preferred City
            </label>
            <select
              value={preferredCity}
              onChange={e => setPreferredCityState(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-medium bg-white"
            >
              {cities.map(c => (
                <option key={c._id} value={c.name}>
                  {c.name} ({c.stateName})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition"
          >
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
