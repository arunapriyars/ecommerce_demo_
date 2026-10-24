import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm animate-pulse flex flex-col justify-between h-[410px]">
      <div>
        <div className="w-full h-48 bg-slate-200 rounded-2xl mb-4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
        <div className="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
      </div>
      <div>
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-10 bg-slate-200 rounded-xl w-10"></div>
        </div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
};
