import React from 'react';

interface VibeBadgeProps {
  vibeName?: string;
  icon?: string;
  className?: string;
}

const vibeColorMap: Record<string, { bg: string; text: string; border: string }> = {
  'Main Character': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  'Study Mode': { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
  'Gym Beast': { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' },
  'Gamer Mode': { bg: 'bg-fuchsia-50', text: 'text-fuchsia-800', border: 'border-fuchsia-200' },
  'Chill Mode': { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  'Creative Mode': { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
};

export const VibeBadge: React.FC<VibeBadgeProps> = ({ vibeName = 'Chill Mode', icon, className = '' }) => {
  const style = vibeColorMap[vibeName] || { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border} ${className}`}>
      {icon && <span>{icon}</span>}
      <span>{vibeName}</span>
    </span>
  );
};
