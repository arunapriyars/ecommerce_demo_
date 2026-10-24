import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, ArrowRight, ShieldCheck, Truck, RefreshCw, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success('✨ You are on the Vibe List! Welcome to the squad.');
      setEmail('');
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      {/* College Project Submission Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/60 via-slate-800 to-indigo-900/60 border border-purple-500/20 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎓</span>
            <div>
              <h4 className="font-bold text-white text-base">Full-Stack Web Development Capstone Project</h4>
              <p className="text-xs text-slate-400">
                Architected with React, TypeScript, Tailwind CSS, Node.js, Express & Relational SQLite/PostgreSQL schema.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              ✓ Production-Style Architecture
            </span>
            <span className="text-xs px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
              ✓ Rule-Based Vibe AI
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
        {/* Brand column */}
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2.5 mb-4 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-vibe-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-extrabold text-2xl text-white tracking-tight">
                Vibe<span className="text-purple-400">Cart</span>
              </span>
            </div>
          </Link>
          <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
            Shop the way you feel. We curate aesthetics, study setups, gym gear, and daily essentials tuned specifically to your current mood and personality.
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Truck className="w-4 h-4 text-purple-400" /> Free Shipping &gt; ₹999</span>
            <span>•</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Vibe Verified</span>
            <span>•</span>
            <span className="flex items-center gap-1"><RefreshCw className="w-4 h-4 text-indigo-400" /> 7-Day Returns</span>
          </div>
        </div>

        {/* Explore Vibes */}
        <div>
          <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Explore Vibes</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/catalog?vibe=main-character" className="hover:text-purple-400 transition-colors">😎 Main Character</Link></li>
            <li><Link to="/catalog?vibe=study-mode" className="hover:text-purple-400 transition-colors">🧠 Study Mode</Link></li>
            <li><Link to="/catalog?vibe=gym-beast" className="hover:text-purple-400 transition-colors">🏋️ Gym Beast</Link></li>
            <li><Link to="/catalog?vibe=gamer-mode" className="hover:text-purple-400 transition-colors">🎮 Gamer Mode</Link></li>
            <li><Link to="/catalog?vibe=chill-mode" className="hover:text-purple-400 transition-colors">🌿 Chill Mode</Link></li>
            <li><Link to="/catalog?vibe=creative-mode" className="hover:text-purple-400 transition-colors">🎨 Creative Mode</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Categories</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/catalog?category=desk-tech" className="hover:text-purple-400 transition-colors">Desk & Tech Gear</Link></li>
            <li><Link to="/catalog?category=apparel-gear" className="hover:text-purple-400 transition-colors">Apparel & Gym Gear</Link></li>
            <li><Link to="/catalog?category=home-living" className="hover:text-purple-400 transition-colors">Home & Living</Link></li>
            <li><Link to="/catalog?category=creative-art" className="hover:text-purple-400 transition-colors">Creative & Art</Link></li>
            <li><Link to="/catalog?category=accessories" className="hover:text-purple-400 transition-colors">Accessories & Daily Carry</Link></li>
          </ul>
        </div>

        {/* Newsletter & Vibe Club */}
        <div>
          <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Join The Vibe Club</h4>
          <p className="text-xs text-slate-400 mb-3">
            Get curated mood drop alerts and secret 20% off promos.
          </p>
          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.vibe@email.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="absolute right-1 top-1 bottom-1 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
          <div className="mt-4">
            <Link
              to="/quiz"
              className="inline-flex items-center gap-1.5 text-xs text-purple-300 hover:text-white font-semibold underline"
            >
              Take the Vibe Quiz now →
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© 2026 VibeCart — Shop Your Vibe. Built for College Full-Stack Submission.</p>
        <div className="flex items-center gap-6">
          <span>Demo Credentials: user@vibecart.com / admin@vibecart.com</span>
          <span className="flex items-center gap-1 text-slate-400">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for your vibe
          </span>
        </div>
      </div>
    </footer>
  );
};
