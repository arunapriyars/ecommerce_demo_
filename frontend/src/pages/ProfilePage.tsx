import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User as UserIcon, Mail, Phone, MapPin, Sparkles, 
  Package, Heart, ShieldAlert, Check, LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Vibe } from '../types';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, updateProfile, logout, isAdmin } = useAuth();
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [stats, setStats] = useState<{ totalOrders: number; wishlistCount: number }>({ totalOrders: 0, wishlistCount: 0 });
  const [editing, setEditing] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [favoriteVibe, setFavoriteVibe] = useState(user?.favorite_vibe || 'Chill Mode');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [postalCode, setPostalCode] = useState(user?.postal_code || '');

  useEffect(() => {
    async function loadData() {
      try {
        const [profData, vibeData] = await Promise.all([
          api.getProfile(),
          api.getVibes()
        ]);
        setStats(profData.stats);
        setVibes(vibeData.vibes);
      } catch (err) {
        console.error('Error fetching profile data:', err);
      }
    }
    if (isAuthenticated) loadData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setFavoriteVibe(user.favorite_vibe || 'Chill Mode');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setCity(user.city || '');
      setState(user.state || '');
      setPostalCode(user.postal_code || '');
    }
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Please Log In</h2>
        <p className="text-sm text-slate-500">Sign in to manage your profile and favorite vibe.</p>
        <Link to="/login" className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-sm">
          Log In
        </Link>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        name,
        favorite_vibe: favoriteVibe,
        phone,
        address,
        city,
        state,
        postal_code: postalCode
      });
      setEditing(false);
    } catch (err) {
      // toast shown in context
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <img
            src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
            alt={user.name}
            className="w-24 h-24 rounded-full border-4 border-purple-100 object-cover bg-purple-50"
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="font-display font-extrabold text-2xl text-slate-900">{user.name}</h1>
              {isAdmin && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                  Administrator
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">{user.email}</p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Vibe Preference: {user.favorite_vibe || 'Chill Mode'}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
          <button
            onClick={() => setEditing(!editing)}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-colors text-center"
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
          <button
            onClick={logout}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Link to="/orders" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-purple-200 transition-colors">
          <Package className="w-5 h-5 text-purple-600 mb-2" />
          <p className="text-2xl font-extrabold text-slate-900">{stats.totalOrders}</p>
          <p className="text-xs text-slate-500">Total Vibe Orders</p>
        </Link>

        <Link to="/wishlist" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-purple-200 transition-colors">
          <Heart className="w-5 h-5 text-rose-500 mb-2" />
          <p className="text-2xl font-extrabold text-slate-900">{stats.wishlistCount}</p>
          <p className="text-xs text-slate-500">Saved Wishlist Items</p>
        </Link>

        {isAdmin ? (
          <Link to="/admin" className="bg-amber-500/10 p-5 rounded-2xl border border-amber-500/20 shadow-sm col-span-2 sm:col-span-1">
            <ShieldAlert className="w-5 h-5 text-amber-600 mb-2" />
            <p className="text-2xl font-extrabold text-amber-700">Admin</p>
            <p className="text-xs text-amber-800">Launch Management Portal →</p>
          </Link>
        ) : (
          <Link to="/quiz" className="bg-purple-50/50 p-5 rounded-2xl border border-purple-200 shadow-sm col-span-2 sm:col-span-1">
            <Sparkles className="w-5 h-5 text-purple-600 mb-2" />
            <p className="text-sm font-extrabold text-purple-900">Quiz Decoder</p>
            <p className="text-xs text-purple-700">Retake Quiz & Match →</p>
          </Link>
        )}
      </div>

      {/* Edit Form or Information Display */}
      {editing ? (
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-slate-900 pb-2 border-b border-slate-100">
            Edit Profile & Shipping Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Favorite Vibe Theme</label>
              <select
                value={favoriteVibe}
                onChange={(e) => setFavoriteVibe(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-purple-500 font-bold"
              >
                {vibes.map((v) => (
                  <option key={v.slug} value={v.name}>
                    {v.icon} {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 ..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Flat / Floor / Street"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Postal Code</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-vibe hover:bg-purple-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        /* Read-only profile cards */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
            Saved Delivery Coordinates
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">Phone</span>
              <p className="font-semibold text-slate-800">{user.phone || 'No phone number provided'}</p>
            </div>
            <div>
              <span className="text-slate-400 block">Street Address</span>
              <p className="font-semibold text-slate-800">{user.address || 'No street address on file'}</p>
            </div>
            <div>
              <span className="text-slate-400 block">City & State</span>
              <p className="font-semibold text-slate-800">
                {user.city && user.state ? `${user.city}, ${user.state}` : 'Not configured'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 block">Postal Code</span>
              <p className="font-semibold text-slate-800">{user.postal_code || 'Not configured'}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
