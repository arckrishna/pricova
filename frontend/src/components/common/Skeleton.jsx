import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 animate-pulse">
    <div className="h-44 bg-slate-100 rounded-2xl w-full" />
    <div className="space-y-2">
      <div className="h-3 bg-slate-100 rounded w-1/4" />
      <div className="h-4 bg-slate-100 rounded w-3/4" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
    </div>
    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
      <div className="h-6 bg-slate-100 rounded w-1/3" />
      <div className="h-8 bg-slate-100 rounded-xl w-1/3" />
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 animate-pulse">
    <div className="h-6 bg-slate-100 rounded w-1/4 mb-4" />
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="h-14 bg-slate-50 rounded-2xl w-full flex items-center justify-between px-4">
        <div className="h-6 bg-slate-200 rounded w-24" />
        <div className="h-6 bg-slate-200 rounded w-16" />
        <div className="h-6 bg-slate-200 rounded w-20" />
      </div>
    ))}
  </div>
);

export default { CardSkeleton, TableSkeleton };
