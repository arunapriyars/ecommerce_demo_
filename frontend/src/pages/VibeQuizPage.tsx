import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, RotateCcw, Check, 
  ShoppingBag, Award, Heart, Compass, CheckCircle2 
} from 'lucide-react';
import { api } from '../services/api';
import { QuizRecommendationResult, Product } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const VibeQuizPage: React.FC = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<{
    activity?: string;
    aesthetic?: string;
    energy?: string;
    priority?: string;
  }>({});

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<QuizRecommendationResult | null>(null);

  const questions = [
    {
      id: 1,
      key: 'activity',
      title: 'What are you doing today?',
      subtitle: 'Tell us where your energy is focused right now.',
      options: [
        { label: 'Studying & Deep Focus', value: 'studying', icon: '🧠', tag: 'Study Mode' },
        { label: 'Crushing a Workout', value: 'working out', icon: '🏋️', tag: 'Gym Beast' },
        { label: 'Gaming & High FPS', value: 'gaming', icon: '🎮', tag: 'Gamer Mode' },
        { label: 'Going Out & Being Seen', value: 'going out', icon: '😎', tag: 'Main Character' },
        { label: 'Relaxing & Winding Down', value: 'relaxing', icon: '🌿', tag: 'Chill Mode' },
        { label: 'Creating Something New', value: 'creating', icon: '🎨', tag: 'Creative Mode' },
      ]
    },
    {
      id: 2,
      key: 'aesthetic',
      title: 'Pick your personal aesthetic:',
      subtitle: 'What visual style gives you that instant rush of dopamine?',
      options: [
        { label: 'Minimal & Clean', value: 'minimal', icon: '📐', tag: 'Nordic & Sleek' },
        { label: 'Street & Oversized', value: 'street', icon: '🕶️', tag: 'Statement Swag' },
        { label: 'Cozy & Warm', value: 'cozy', icon: '☕', tag: 'Earthy Stoneware' },
        { label: 'Sporty & Athletic', value: 'sporty', icon: '⚡', tag: 'Performance Grit' },
        { label: 'Tech & RGB Glowing', value: 'tech', icon: '💻', tag: 'Cyberpunk Glow' },
        { label: 'Colorful & Artistic', value: 'colorful', icon: '🌈', tag: 'Vibrant Hues' },
      ]
    },
    {
      id: 3,
      key: 'energy',
      title: 'Choose your current energy:',
      subtitle: 'How does your battery feel in this exact moment?',
      options: [
        { label: 'Chill & Peaceful', value: 'chill', icon: '🍵', tag: 'Low BPM, Soft Music' },
        { label: 'Balanced & Steady', value: 'balanced', icon: '⚖️', tag: 'In the Pocket' },
        { label: 'Energetic & Hyped', value: 'energetic', icon: '🔥', tag: 'Maximum Intensity' },
        { label: 'Chaotic & Spontaneous', value: 'chaotic', icon: '⚡', tag: 'Unpredictable Fire' },
      ]
    },
    {
      id: 4,
      key: 'priority',
      title: 'What matters most in your gear?',
      subtitle: 'What makes a purchase feel truly worth every rupee?',
      options: [
        { label: 'Statement Style', value: 'style', icon: '✨', tag: 'Turns heads effortlessly' },
        { label: 'Pure Comfort', value: 'comfort', icon: '☁️', tag: 'Feels like second skin' },
        { label: 'Laser Productivity', value: 'productivity', icon: '🎯', tag: 'Gets tasks done faster' },
        { label: 'Heavy Duty Performance', value: 'performance', icon: '🛡️', tag: 'Unbreakable resilience' },
        { label: 'Fun & Creative Flow', value: 'fun', icon: '🎨', tag: 'Spark pure joy' },
      ]
    }
  ];

  const handleSelectOption = async (optionValue: string) => {
    const activeQ = questions[currentStep];
    const newAnswers = { ...answers, [activeQ.key]: optionValue };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Last question answered! Submit to recommendation API
      await calculateVibe(newAnswers);
    }
  };

  const calculateVibe = async (finalAnswers: typeof answers) => {
    try {
      setLoading(true);
      const data = await api.recommendVibe(finalAnswers);
      setResult(data);
      toast.success('Your vibe has been decoded! ✨');
    } catch (err: any) {
      toast.error(err.message || 'Error decoding your vibe');
    } finally {
      setLoading(false);
    }
  };

  const handleResetQuiz = () => {
    setAnswers({});
    setCurrentStep(0);
    setResult(null);
  };

  const handleSaveVibeToProfile = async () => {
    if (!isAuthenticated) {
      toast.error('Log in to save this vibe as your primary account theme.');
      return;
    }
    if (result?.dominantVibe) {
      await updateProfile({ favorite_vibe: result.dominantVibe.name });
      toast.success(`Favorite vibe saved as ${result.dominantVibe.name}!`);
    }
  };

  const q = questions[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / questions.length) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Quiz Container */}
      {!result ? (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xl space-y-8">
          
          {/* Header & Step progress */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 text-purple-600">
                <Sparkles className="w-4 h-4" />
                "What's Your Vibe?" Interactive Quiz
              </span>
              <span>Question {currentStep + 1} of {questions.length}</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Title */}
          <div className="text-center sm:text-left">
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight mb-1">
              {q.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {q.subtitle}
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {q.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelectOption(option.value)}
                disabled={loading}
                className="group p-4 rounded-2xl border-2 border-slate-100 hover:border-purple-500 bg-slate-50 hover:bg-purple-50/50 text-left transition-all duration-200 active:scale-98 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-xl bg-white shadow-sm group-hover:scale-110 transition-transform">
                    {option.icon}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-purple-700 transition-colors">
                      {option.label}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {option.tag}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>

          {/* Back button */}
          {currentStep > 0 && (
            <div className="flex justify-start pt-2">
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
              >
                ← Previous Question
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-4 space-y-2">
              <div className="w-8 h-8 rounded-full border-2 border-purple-200 border-t-purple-600 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-500">Analyzing mood patterns & aesthetic tags...</p>
            </div>
          )}

        </div>
      ) : (
        /* QUIZ RESULT SHOWCASE */
        <div className="space-y-12 animate-in fade-in zoom-in-95 duration-500">
          
          {/* Result Highlight Card */}
          <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-8 sm:p-12 overflow-hidden shadow-2xl border border-purple-500/20 text-center">
            
            <div className="relative z-10 max-w-xl mx-auto space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-400/30">
                ✨ Vibe Decoded Successfully
              </span>

              <div className="text-6xl sm:text-7xl animate-bounce">
                {result.dominantVibe.icon}
              </div>

              <h2 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight text-white uppercase">
                {result.dominantVibe.name}
              </h2>

              <p className="text-lg text-purple-200 font-medium italic">
                "{result.dominantVibe.tagline}"
              </p>

              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                {result.dominantVibe.description}
              </p>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleSaveVibeToProfile}
                  className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-vibe transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Set as My Favorite Vibe</span>
                </button>

                <button
                  onClick={handleResetQuiz}
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs sm:text-sm transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Quiz</span>
                </button>
              </div>
            </div>

          </div>

          {/* Recommended Products Showcase */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-600 mb-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Personalized Matches</span>
                </div>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                  Recommended For Your Vibe ({result.dominantVibe.name})
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Products dynamically selected by tag intersection with your quiz answers.
                </p>
              </div>

              <Link
                to={`/catalog?vibe=${result.dominantVibe.slug}`}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-purple-600 hover:text-purple-800"
              >
                <span>View Entire Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {result.products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
