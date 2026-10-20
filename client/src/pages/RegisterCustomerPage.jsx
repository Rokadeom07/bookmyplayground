import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCity } from '../context/CityContext';

export default function RegisterCustomerPage() {
  const { registerCustomer } = useAuth();
  const { selectedCity } = useCity();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [preferredCity, setPreferredCity] = useState(selectedCity || 'Mumbai');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await registerCustomer({
        name,
        email,
        phone,
        password,
        preferredCity,
      });
      navigate('/dashboard/customer');
    } catch (err) {
      setError(err.response?.data?.message || 'Customer registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Create Player Account
        </h1>
        <p className="text-xs text-gray-500">
          Book sports grounds and turfs across India in seconds
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium"
            placeholder="e.g. Arjun Nair"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium"
            placeholder="e.g. arjun@gmail.com"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Mobile Number (10 Digits)
          </label>
          <input
            type="tel"
            required
            pattern="[6-9][0-9]{9}"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium font-mono"
            placeholder="e.g. 9876543210"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            City Preference
          </label>
          <input
            type="text"
            required
            value={preferredCity}
            onChange={e => setPreferredCity(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Password (Min 6 Characters)
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition flex items-center justify-center gap-2"
        >
          {loading ? 'Creating Player Account...' : 'Register as Customer'}
        </button>

        <p className="text-center text-xs text-gray-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:underline">
            Sign In here
          </Link>
        </p>
      </form>
    </div>
  );
}
