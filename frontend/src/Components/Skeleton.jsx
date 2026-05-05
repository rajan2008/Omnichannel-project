import React from "react";

const Skeleton = ({ className, variant = "box" }) => {
  const baseClass = "animate-pulse bg-slate-200 dark:bg-white/10 rounded-xl";
  
  if (variant === "stats") {
    return (
      <div className={`p-5 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center gap-4 ${className}`}>
        <div className="w-12 h-12 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-2 w-16 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-10 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={`bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-4 space-y-4 ${className}`}>
        <div className="aspect-square bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
        <div className="space-y-2">
          <div className="h-3 w-3/4 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
          <div className="h-2 w-1/2 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-4 w-16 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
          <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-white/10 animate-pulse" />
        </div>
      </div>
    );
  }

  return <div className={`${baseClass} ${className}`} />;
};

export default Skeleton;
