import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { X, Lock, Mail, User, Phone, MapPin, Building2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialMode, onClose }) => {
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<'ROLE_CUSTOMER' | 'ROLE_DEALER'>('ROLE_CUSTOMER');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [dealershipName, setDealershipName] = useState('');
  const [dealershipLicense, setDealershipLicense] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.auth.login({ email, password });
        login(res.token, {
          id: res.id,
          email: res.email,
          fullName: res.fullName,
          city: res.city,
          dealershipName: res.dealershipName,
          verifiedDealer: res.verifiedDealer,
          roles: res.roles,
        });
        onClose();
      } else {
        const res = await api.auth.register({
          email,
          password,
          fullName,
          phone,
          city,
          dealershipName: role === 'ROLE_DEALER' ? dealershipName : undefined,
          dealershipLicense: role === 'ROLE_DEALER' ? dealershipLicense : undefined,
          roles: [role],
        });
        login(res.token, {
          id: res.id,
          email: res.email,
          fullName: res.fullName,
          city: res.city,
          dealershipName: res.dealershipName,
          verifiedDealer: res.verifiedDealer,
          roles: res.roles,
        });
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              {mode === 'login' ? 'Sign in to AutoDeal' : 'Create an Account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <div className="flex rounded-lg bg-stone-100 p-1 mb-2">
              <button
                type="button"
                onClick={() => setRole('ROLE_CUSTOMER')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  role === 'ROLE_CUSTOMER' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Car Buyer
              </button>
              <button
                type="button"
                onClick={() => setRole('ROLE_DEALER')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  role === 'ROLE_DEALER' ? 'bg-white shadow-xs text-blue-700' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Dealership Partner
              </button>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">City</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>
            </div>
          )}

          {mode === 'register' && role === 'ROLE_DEALER' && (
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Dealership Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={dealershipName}
                    onChange={(e) => setDealershipName(e.target.value)}
                    placeholder="Authorized Dealership Name"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Dealer License / Registration ID</label>
                <input
                  type="text"
                  required
                  value={dealershipLicense}
                  onChange={(e) => setDealershipLicense(e.target.value)}
                  placeholder="Dealer License Number"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 bg-stone-900 text-white text-sm font-semibold rounded-md hover:bg-stone-800 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <div className="text-center pt-2">
            {mode === 'login' ? (
              <p className="text-xs text-stone-500">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p className="text-xs text-stone-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
