import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Heart, ShoppingBag, Zap, Star, ShieldCheck, 
  Truck, RefreshCw, CheckCircle2, ChevronRight, MessageSquare, ArrowLeft, Sparkles 
} from 'lucide-react';
import { Product, Review } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { VibeBadge } from '../components/common/Badge';
import { ProductCard } from '../components/common/ProductCard';
import toast from 'react-hot-toast';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Review Form state
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  useEffect(() => {
    async function fetchProductData() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await api.getProductById(id);
        setProduct(data.product);
        setReviews(data.reviews || []);
        setSelectedImage(data.product.image);
        setQuantity(1);

        // Fetch similar products
        const simData = await api.getSimilarProducts(data.product.id);
        setSimilarProducts(simData.products);
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProductData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading aesthetic details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">The product you are looking for does not exist or has been retired.</p>
        <Link to="/catalog" className="px-6 py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-sm">
          Browse Catalog
        </Link>
      </div>
    );
  }

  const isSaved = isWishlisted(product.id);

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
  };

  const handleBuyNow = async () => {
    await addToCart(product.id, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to leave a review.');
      return;
    }
    if (!newComment.trim()) {
      toast.error('Please enter a comment.');
      return;
    }
    try {
      setSubmittingReview(true);
      const res = await api.addReview(product.id, newRating, newComment);
      toast.success(res.message);
      setReviews(prev => [res.review, ...prev]);
      setProduct(prev => prev ? { ...prev, rating: res.productRating, review_count: res.productReviewCount } : null);
      setNewComment('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to post review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-purple-600 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/catalog" className="hover:text-purple-600 transition-colors">Catalog</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to={`/catalog?vibe=${product.vibe_slug}`} className="hover:text-purple-600 transition-colors">
          {product.vibe_name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-800 truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Product Imagery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm p-4">
            <img
              src={selectedImage || product.image}
              alt={product.name}
              className="w-full h-full object-cover rounded-2xl"
            />
            {product.discount > 0 && (
              <span className="absolute top-6 left-6 bg-rose-500 text-white font-bold text-xs px-3 py-1 rounded-full shadow-md">
                {product.discount}% OFF
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-6 right-6 p-3 rounded-full backdrop-blur-md transition-all ${
                isSaved ? 'bg-rose-50 text-rose-500 shadow-md' : 'bg-white/90 text-slate-400 hover:text-rose-500 shadow-sm'
              }`}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-500 scale-110' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === img ? 'border-purple-600 ring-2 ring-purple-100' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Actions */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Vibe & Rating Row */}
          <div className="flex flex-wrap items-center gap-3">
            <VibeBadge vibeName={product.vibe_name} icon={product.vibe_icon} />
            <span className="text-xs text-slate-400 font-semibold">•</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{product.category_name}</span>
            <div className="flex items-center gap-1 text-xs text-amber-500 font-bold ml-auto">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-slate-400 font-normal">({product.review_count} verified reviews)</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 leading-tight">
            {product.name}
          </h1>

          {/* Pricing */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-slate-900">₹{product.price.toLocaleString()}</span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-lg text-slate-400 line-through">₹{product.original_price.toLocaleString()}</span>
            )}
            {product.discount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Save ₹{(product.original_price! - product.price).toLocaleString()}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/* "Why you'll like it" Section */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Why you'll like it</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {product.why_like && product.why_like.length > 0 ? (
                product.why_like.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Curated for {product.vibe_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Aesthetic minimalist build</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Stock Indicator */}
          <div className="flex items-center gap-2 text-xs">
            {product.stock > 5 ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                In Stock ({product.stock} units ready to dispatch)
              </span>
            ) : product.stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-amber-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                Low Stock — Only {product.stock} remaining!
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-rose-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Currently Sold Out
              </span>
            )}
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-600">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 font-bold transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-bold text-slate-900 min-w-[36px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 font-bold transition-colors disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 py-4 px-6 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-vibe flex items-center justify-center gap-2 transition-all active:scale-95 disabled:bg-slate-200 disabled:text-slate-400"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Your Vibe</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="flex-1 py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:bg-slate-200 disabled:text-slate-400"
              >
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Buy Now with 1-Click</span>
              </button>
            </div>
          </div>

          {/* Delivery & Assurance badges */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-500">
            <div className="p-2.5 rounded-xl bg-slate-50">
              <Truck className="w-4 h-4 text-purple-600 mx-auto mb-1" />
              <p className="font-bold text-slate-800">Free Delivery</p>
              <p>Over ₹999 orders</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <p className="font-bold text-slate-800">100% Genuine</p>
              <p>Vibe verified</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50">
              <RefreshCw className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
              <p className="font-bold text-slate-800">7-Day Return</p>
              <p>Zero questions</p>
            </div>
          </div>

        </div>

      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h3 className="font-display font-extrabold text-2xl text-slate-900">
              Vibe Community Feedback
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Real opinions from verified owners and aesthetic creators.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-extrabold text-slate-900 leading-none">{product.rating} / 5</p>
              <p className="text-[10px] text-slate-400">{reviews.length} total reviews</p>
            </div>
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400" />
              ))}
            </div>
          </div>
        </div>

        {/* Leave a review form */}
        <form onSubmit={handleReviewSubmit} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
          <h4 className="font-bold text-sm text-slate-900">Leave Your Rating & Review</h4>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600">Your Rating:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setNewRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star className={`w-5 h-5 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
          </div>

          <textarea
            required
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="How does this product feel in your daily routine? Does it match your vibe?"
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-purple-500"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingReview}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-colors disabled:opacity-50"
            >
              {submittingReview ? 'Posting...' : 'Post Vibe Review ✨'}
            </button>
          </div>
        </form>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((r) => (
              <div key={r.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={r.user_avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${r.user_name}`}
                      alt={r.user_name}
                      className="w-7 h-7 rounded-full bg-purple-100 object-cover"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{r.user_name}</span>
                      {r.user_vibe && (
                        <span className="text-[10px] text-purple-600 font-semibold">{r.user_vibe} Enthusiast</span>
                      )}
                    </div>
                  </div>
                  <div className="flex text-amber-400">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-9">
                  "{r.comment}"
                </p>
              </div>
            ))
          ) : (
            <p className="text-center py-6 text-xs text-slate-400">No reviews yet. Be the first to share your vibe feedback!</p>
          )}
        </div>
      </div>

      {/* Similar Products Recommendation */}
      {similarProducts.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-extrabold text-2xl text-slate-900">
                You May Also Vibe With
              </h3>
              <p className="text-xs text-slate-500">Complementary pieces sharing category or mood characteristics.</p>
            </div>
            <Link to={`/catalog?vibe=${product.vibe_slug}`} className="text-xs font-bold text-purple-600 hover:underline">
              Explore More {product.vibe_name} →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
