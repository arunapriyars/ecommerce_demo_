import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, Compass, ShieldCheck, Zap, 
  Smile, Flame, Award, Heart, ShoppingBag, Star 
} from 'lucide-react';
import { Product, Vibe } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/common/ProductCard';
import { ProductGridSkeleton } from '../components/common/SkeletonLoader';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeMoodTab, setActiveMoodTab] = useState<string>('study-mode');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [prodData, vibeData] = await Promise.all([
          api.getProducts({ featured: true, limit: 8 }),
          api.getVibes()
        ]);
        setFeaturedProducts(prodData.products);
        setVibes(vibeData.vibes);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const trendingVibes = [
    {
      slug: 'main-character',
      name: 'Main Character',
      icon: '😎',
      tagline: 'Stand out. Own the room.',
      gradient: 'from-amber-500 via-orange-500 to-yellow-500',
      bgLight: 'bg-amber-50',
      borderLight: 'border-amber-200',
      count: '6 Products',
      highlightItem: 'Vanguard Bauhaus Steel Watch'
    },
    {
      slug: 'study-mode',
      name: 'Study Mode',
      icon: '🧠',
      tagline: 'Deep focus. Zero distractions.',
      gradient: 'from-indigo-600 via-violet-600 to-blue-500',
      bgLight: 'bg-indigo-50',
      borderLight: 'border-indigo-200',
      count: '6 Products',
      highlightItem: 'ANC Hybrid Headphones'
    },
    {
      slug: 'gym-beast',
      name: 'Gym Beast',
      icon: '🏋️',
      tagline: 'Crush limits. No excuses.',
      gradient: 'from-red-600 via-rose-600 to-orange-600',
      bgLight: 'bg-red-50',
      borderLight: 'border-red-200',
      count: '5 Products',
      highlightItem: 'Apex Loop Heavy Resistance'
    },
    {
      slug: 'gamer-mode',
      name: 'Gamer Mode',
      icon: '🎮',
      tagline: 'High FPS. High intensity.',
      gradient: 'from-fuchsia-600 via-purple-600 to-cyan-500',
      bgLight: 'bg-fuchsia-50',
      borderLight: 'border-fuchsia-200',
      count: '5 Products',
      highlightItem: 'Custom 75% Mechanical Keyboard'
    },
    {
      slug: 'chill-mode',
      name: 'Chill Mode',
      icon: '🌿',
      tagline: 'Breathe in. Unwind completely.',
      gradient: 'from-emerald-500 via-teal-500 to-green-600',
      bgLight: 'bg-emerald-50',
      borderLight: 'border-emerald-200',
      count: '6 Products',
      highlightItem: 'Handmade Sandstone Coffee Mug'
    },
    {
      slug: 'creative-mode',
      name: 'Creative Mode',
      icon: '🎨',
      tagline: 'Express yourself. Pure artistry.',
      gradient: 'from-orange-500 via-pink-500 to-rose-500',
      bgLight: 'bg-orange-50',
      borderLight: 'border-orange-200',
      count: '5 Products',
      highlightItem: 'ChromaFlow 60 Brush Markers'
    }
  ];

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden bg-gradient-to-b from-purple-50/70 via-white to-slate-50">
        {/* Decorative background glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-purple-200/40 via-pink-200/40 to-amber-200/40 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-purple-200/80 shadow-vibe-sm text-xs font-bold text-purple-700">
                <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                <span>The Mood-First Shopping Platform</span>
              </div>

              <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-slate-900 leading-[1.08]">
                Shop the way <br />
                <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 bg-clip-text text-transparent">
                  you feel.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Your mood. Your style. Your vibe. <br className="hidden sm:inline" />
                Discover products tailored to who you are today, not what a generic algorithm guessed yesterday.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  to="/catalog"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-base shadow-vibe hover:shadow-vibe-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Explore Products</span>
                </Link>

                <Link
                  to="/quiz"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-purple-50 text-purple-700 border-2 border-purple-200 font-bold text-base shadow-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-95"
                >
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span>Discover My Vibe</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Quick stats banner */}
              <div className="pt-6 border-t border-slate-200/60 flex items-center justify-center lg:justify-start gap-8 text-xs text-slate-500">
                <div>
                  <p className="font-bold text-slate-900 text-base">30+ Aesthetic</p>
                  <p>Curated Items</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <p className="font-bold text-slate-900 text-base">6 Core Vibes</p>
                  <p>Personality Tuned</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <p className="font-bold text-slate-900 text-base">100% Real API</p>
                  <p>Relational DB</p>
                </div>
              </div>
            </div>

            {/* Right Hero Composition (Floating Product Cards) */}
            <div className="lg:col-span-5 relative flex items-center justify-center min-h-[460px]">
              
              {/* Central Glowing Backing Circle */}
              <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 p-1 shadow-2xl opacity-90 animate-pulse-glow" />

              {/* Card 1: Study Mode Card (Floating Top Left) */}
              <div className="absolute -top-4 -left-2 sm:left-2 w-48 sm:w-56 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-slate-100 animate-float-slow">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-2 bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80"
                    alt="Study Headphones"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1 left-1 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    🧠 Study Mode
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 truncate">SilencePro ANC</h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-extrabold text-indigo-600">₹3,499</span>
                  <div className="flex items-center text-[10px] text-amber-500 font-bold">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 mr-0.5" />
                    4.9
                  </div>
                </div>
              </div>

              {/* Card 2: Main Character Card (Center Hero Focus) */}
              <div className="absolute w-52 sm:w-60 bg-white rounded-3xl p-4 shadow-2xl border-2 border-purple-200 z-20">
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80"
                    alt="Bauhaus Steel Watch"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    😎 Main Character
                  </span>
                  <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    -33% OFF
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-tight">Vanguard Bauhaus Watch</h4>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-sm font-extrabold text-slate-900">₹2,999</span>
                    <span className="text-[10px] text-slate-400 line-through ml-1">₹4,499</span>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold">
                    Curated Pick
                  </span>
                </div>
              </div>

              {/* Card 3: Chill Mode Card (Floating Bottom Right) */}
              <div className="absolute -bottom-6 -right-2 sm:right-2 w-48 sm:w-56 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-slate-100 z-10 animate-float-reverse">
                <div className="relative aspect-video rounded-xl overflow-hidden mb-2 bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80"
                    alt="Ceramic Mug"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    🌿 Chill Mode
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 truncate">Handmade Ceramic Mug</h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-extrabold text-emerald-600">₹499</span>
                  <span className="text-[9px] text-slate-400 font-semibold">110 Reviews</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 2. TRENDING VIBES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-600 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personality Matchmaking</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
              Trending Vibes 🔥
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-1">
              Select your current headspace to browse curated gear hand-matched for it.
            </p>
          </div>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-purple-600 hover:text-purple-800 transition-colors"
          >
            <span>View All Vibes & Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 6 Core Vibe Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingVibes.map((vibe) => (
            <Link
              key={vibe.slug}
              to={`/catalog?vibe=${vibe.slug}`}
              className="group relative bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-vibe hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              {/* Top gradient accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${vibe.gradient}`} />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl p-2.5 rounded-2xl bg-slate-50 group-hover:scale-110 transition-transform duration-200">
                    {vibe.icon}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    {vibe.count}
                  </span>
                </div>

                <h3 className="font-display font-bold text-xl text-slate-900 group-hover:text-purple-600 transition-colors mb-1">
                  {vibe.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium mb-4">
                  "{vibe.tagline}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 truncate max-w-[170px]">
                  Featured: <strong className="text-slate-700">{vibe.highlightItem}</strong>
                </span>
                <span className="font-bold text-purple-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                  Browse →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. INTERACTIVE QUIZ TEASER BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-12 overflow-hidden shadow-2xl">
          {/* Decorative background shapes */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-500/20 via-purple-500/10 to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-bold border border-yellow-400/30">
              ⚡ 60-Second Vibe Decoder
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight leading-tight">
              Not sure what vibe you're in today?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Answer 4 playful questions about your daily energy, aesthetic preference, and priorities. Our intelligent rule-based engine will decode your vibe and recommend your tailored setup!
            </p>
            <div className="pt-2">
              <Link
                to="/quiz"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-sm sm:text-base shadow-lg transition-transform active:scale-95"
              >
                <span>Take "What's Your Vibe?" Quiz</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS CATALOG PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-600 mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Handpicked Collection</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl text-slate-900 tracking-tight">
              Featured Vibe Essentials
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Top rated by students, creators, gamers, and athletes.
            </p>
          </div>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-1 text-sm font-bold text-purple-600 hover:text-purple-800"
          >
            <span>See All 30+ Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. VALUE PROPOSITION / TRUST BADGES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base mb-1">Mood-Matched Curation</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every single product is cataloged with psychology-informed aesthetic tags and utility attributes.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base mb-1">Vibe Guarantee</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                If the item doesn't fit your room aesthetic or workspace vibe, 7-day hassle-free exchange.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base mb-1">Express Vibe Dispatch</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Free shipping on orders over ₹999. Packaged with customized aesthetic stickers in every box.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
