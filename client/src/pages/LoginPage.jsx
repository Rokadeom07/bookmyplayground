import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, ShieldAlert, User, Building, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await login({ email, password });
      if (data.role === 'admin') {
        navigate('/dashboard/admin');
      } else if (data.role === 'owner') {
        navigate('/dashboard/owner');
      } else {
        navigate('/dashboard/customer');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Viva Quick Fill Buttons
  const fillCredentials = (e, p) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
          BM
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-3">
          Sign In to BookMyPlayground
        </h1>
        <p className="text-xs text-gray-500">
          Access your ground bookings, owner turfs, or admin panel
        </p>
      </div>

      {/* 1-Click Viva Demo Quick Fillers */}
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2.5">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
          ⚡ 1-Click Quick Demo Accounts:
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => fillCredentials('rahul.verma@gmail.com', 'Customer@123456')}
            className="p-2 rounded-xl bg-white border border-gray-200 hover:border-brand-500 text-left text-xs transition"
          >
            <span className="font-bold text-gray-900 block truncate">Customer</span>
            <span className="text-[10px] text-gray-400">Rahul V.</span>
          </button>

          <button
            type="button"
            onClick={() => fillCredentials('rohit.sharma@mumbaiturfs.in', 'Owner@123456')}
            className="p-2 rounded-xl bg-white border border-gray-200 hover:border-brand-500 text-left text-xs transition"
          >
            <span className="font-bold text-gray-900 block truncate">Owner</span>
            <span className="text-[10px] text-gray-400">Rohit S.</span>
          </button>

          <button
            type="button"
            onClick={() => fillCredentials('admin@bookmyplayground.in', 'Admin@123456')}
            className="p-2 rounded-xl bg-white border border-gray-200 hover:border-purple-500 text-left text-xs transition"
          >
            <span className="font-bold text-gray-900 block truncate">Admin</span>
            <span className="text-[10px] text-purple-600">Super Admin</span>
          </button>
        </div>
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
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-brand-500"
            placeholder="e.g. rahul.verma@gmail.com"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-brand-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition flex items-center justify-center gap-2"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>

        <div className="pt-2 text-center text-xs text-gray-500 space-y-1">
          <p>
            New to BookMyPlayground?{' '}
            <Link to="/register-customer" className="font-bold text-brand-600 hover:underline">
              Register as Customer
            </Link>
          </p>
          <p>
            Are you a ground facility owner?{' '}
            <Link to="/register-owner" className="font-bold text-brand-600 hover:underline">
              Register as Ground Owner
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
