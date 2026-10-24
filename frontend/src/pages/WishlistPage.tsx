import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { VibeBadge } from '../components/common/Badge';

export const WishlistPage: React.FC = () => {
  const { items, moveToCart, removeFromWishlist, wishlistCount, loading } = useWishlist();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto text-2xl">
          ❤️
        </div>
        <h2 className="font-display font-extrabold text-2xl text-slate-900">Your Vibe Shelf</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Log in to view and manage products saved to your aesthetic collection.
        </p>
        <Link
          to="/login"
          className="inline-block px-8 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-vibe transition-all"
        >
          Log In
        </Link>
      </div>
    );
  }

  if (wishlistCount === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto text-3xl">
          ❤️
        </div>
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mb-2">
            Your vibe shelf is empty.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Save items that match your dream room aesthetic, desk goals, or gym routine by clicking the heart button on any product!
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/catalog"
            className="px-6 py-3 rounded-2xl bg-purple-600 text-white font-bold text-xs sm:text-sm shadow-vibe hover:bg-purple-700 transition-all"
          >
            Explore Catalog
          </Link>
          <Link
            to="/quiz"
            className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 transition-all"
          >
            Discover Your Vibe ✨
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-display font-extrabold text-3xl text-slate-900 tracking-tight">
          Your Vibe Shelf ❤️ ({wishlistCount} {wishlistCount === 1 ? 'saved item' : 'saved items'})
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Pieces you've bookmarked for your future aesthetic upgrades.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((product) => (
          <div
            key={product.id}
            className="group relative bg-white rounded-3xl p-4 border border-slate-100 shadow-sm hover:shadow-vibe hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Remove button */}
            <button
              onClick={() => removeFromWishlist(product.id)}
              className="absolute top-6 right-6 z-10 w-8 h-8 rounded-full bg-white/90 text-slate-400 hover:text-rose-500 flex items-center justify-center shadow-sm transition-colors"
              aria-label="Remove from shelf"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Thumbnail */}
            <Link to={`/products/${product.slug || product.id}`} className="block overflow-hidden rounded-2xl mb-4 bg-slate-50 aspect-square">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </Link>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="mb-2">
                  <VibeBadge vibeName={product.vibe_name} icon={product.vibe_icon} />
                </div>
                <Link to={`/products/${product.slug || product.id}`}>
                  <h3 className="font-bold text-slate-900 text-sm hover:text-purple-600 transition-colors line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-xs text-slate-400 mb-3">{product.category_name}</p>
              </div>

              {/* Price & Move to Cart action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="font-extrabold text-slate-900 text-sm">₹{product.price.toLocaleString()}</span>

                <button
                  onClick={() => moveToCart(product.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span>Move to Cart</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
