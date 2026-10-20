import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterOwnerPage() {
  const { registerOwner } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [panOrGst, setPanOrGst] = useState('');
  const [declarationSigned, setDeclarationSigned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!declarationSigned) {
      setError('You must confirm ownership/operational declaration.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await registerOwner({
        name,
        email,
        phone,
        password,
        businessName,
        businessAddress,
        panOrGst,
        declarationSigned: true,
      });
      navigate('/dashboard/owner');
    } catch (err) {
      setError(err.response?.data?.message || 'Owner registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-2xl bg-charcoal-900 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
          🏟️
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-2">
          Become a Ground Owner Partner
        </h1>
        <p className="text-xs text-gray-500">
          List your sports turfs, manage slots, and view algorithmic occupancy insights
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
              Owner Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium"
              placeholder="e.g. Vikram Patil"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
              Business / Venue Entity Name
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium"
              placeholder="e.g. Urban Sports Park LLP"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium"
              placeholder="e.g. vikram@thanesports.in"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
              Mobile Number (10 Digits)
            </label>
            <input
              type="tel"
              required
              pattern="[6-9][0-9]{9}"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium font-mono"
              placeholder="e.g. 9820234567"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
            Registered Ground / Business Address
          </label>
          <input
            type="text"
            required
            value={businessAddress}
            onChange={e => setBusinessAddress(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium"
            placeholder="e.g. Pokhran Road No 2, Thane West, Maharashtra"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
              GSTIN or PAN (Optional)
            </label>
            <input
              type="text"
              value={panOrGst}
              onChange={e => setPanOrGst(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono uppercase"
              placeholder="27AABCU5678R1ZX"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1">
              Account Password
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
        </div>

        {/* Declaration */}
        <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80">
          <label className="flex items-start gap-2 text-xs text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={declarationSigned}
              onChange={e => setDeclarationSigned(e.target.checked)}
              className="rounded border-gray-300 text-brand-600 mt-0.5"
            />
            <span className="leading-relaxed">
              I declare that I am the authorized owner or legal operator of this sports facility and have the right to accept player reservations through BookMyPlayground.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition flex items-center justify-center gap-2"
        >
          {loading ? 'Submitting Partner Application...' : 'Submit Ground Owner Application'}
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
