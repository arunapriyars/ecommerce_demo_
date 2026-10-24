import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { VibeBadge } from './Badge';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const isSaved = isWishlisted(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="group relative bg-white rounded-3xl p-4 border border-slate-100 shadow-sm hover:shadow-vibe hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Discount badge */}
      {product.discount > 0 && (
        <div className="absolute top-6 left-6 z-10 bg-rose-500 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-sm">
          {product.discount}% OFF
        </div>
      )}

      {/* Wishlist button */}
      <button
        onClick={handleToggleWishlist}
        aria-label="Save to Wishlist"
        className={`absolute top-6 right-6 z-10 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 ${
          isSaved
            ? 'bg-rose-50 text-rose-500 shadow-sm'
            : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm'
        }`}
      >
        <Heart className={`w-4 h-4 transition-transform duration-200 ${isSaved ? 'fill-rose-500 scale-110' : 'hover:scale-110'}`} />
      </button>

      {/* Product Image & Link */}
      <Link to={`/products/${product.slug || product.id}`} className="block overflow-hidden rounded-2xl mb-4 bg-slate-50 relative aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute bottom-2 left-2 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Only {product.stock} left!
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Vibe & Rating Row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <VibeBadge vibeName={product.vibe_name} icon={product.vibe_icon} />
            <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-slate-400 font-normal">({product.review_count})</span>
            </div>
          </div>

          {/* Title */}
          <Link to={`/products/${product.slug || product.id}`} className="block">
            <h3 className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-2 text-sm md:text-base leading-snug mb-1">
              {product.name}
            </h3>
          </Link>

          {/* Category */}
          <p className="text-xs text-slate-400 mb-3">{product.category_name || 'Curated Essential'}</p>
        </div>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-slate-900">₹{product.price.toLocaleString()}</span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-xs text-slate-400 line-through">₹{product.original_price.toLocaleString()}</span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95 ${
              product.stock > 0
                ? 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-vibe'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{product.stock > 0 ? 'Add' : 'Out of Stock'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
