import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, ShoppingBag, Heart, Search, User as UserIcon, 
  Menu, X, ShieldAlert, LogOut, Package, Compass, ChevronDown 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all">
      {/* Top vibe announcement banner */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 text-white text-xs py-1.5 px-4 text-center font-medium">
        <span>✨ Discover your personality aesthetic — Take the 60-second </span>
        <Link to="/quiz" className="underline font-bold hover:text-yellow-200 ml-1">
          "What's Your Vibe?" Quiz →
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-vibe-sm group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="font-display font-extrabold text-2xl tracking-tight bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent">
                Vibe<span className="text-purple-600">Cart</span>
              </span>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-600 -mt-1">
                Shop Your Vibe
              </p>
            </div>
          </Link>

          {/* Search bar (Desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by vibe, mood, desk setup, apparel..."
              className="w-full bg-slate-100/80 border border-transparent focus:border-purple-300 focus:bg-white text-sm rounded-full pl-11 pr-4 py-2.5 transition-all outline-none text-slate-800 placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              to="/catalog"
              className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/catalog') ? 'text-purple-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore Catalog</span>
            </Link>

            <Link
              to="/quiz"
              className="text-sm font-semibold px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors flex items-center gap-1.5 border border-purple-200/60"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Vibe Quiz</span>
            </Link>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              aria-label="Shopping Cart"
              className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Account / Dropdown */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full bg-purple-100 object-cover"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 pr-1" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    onMouseLeave={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        {user.favorite_vibe || 'Chill Mode'}
                      </span>
                    </div>

                    <Link
                      to="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      <span>Order History</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                    >
                      <UserIcon className="w-4 h-4" />
                      <span>Manage Profile</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-600 bg-amber-50 hover:bg-amber-100 font-semibold transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-semibold px-3 py-2 text-slate-700 hover:text-purple-600 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-full bg-slate-900 text-white hover:bg-purple-600 transition-colors shadow-sm"
                >
                  Join
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 animate-in slide-in-from-top-2">
            <form onSubmit={handleSearchSubmit} className="mb-4 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog by vibe or product..."
                className="w-full bg-slate-100 border border-transparent focus:bg-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            <div className="flex flex-col gap-2">
              <Link
                to="/catalog"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Explore Catalog
              </Link>
              <Link
                to="/quiz"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-semibold bg-purple-50 text-purple-700 border border-purple-200"
              >
                ✨ What's Your Vibe? (Quiz)
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Order History
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    My Profile
                  </Link>
                </>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-sm font-bold bg-amber-500 text-white"
                >
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
