"use client";

export function TabSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse p-4">
      {/* Left Column Skeleton */}
      <div className="lg:col-span-4 space-y-6">
        <div className="h-[400px] bg-slate-200/50 rounded-3xl" />
        <div className="h-[200px] bg-slate-200/30 rounded-3xl" />
      </div>

      {/* Right Column Skeleton */}
      <div className="lg:col-span-8 space-y-6">
        <div className="h-[250px] bg-blue-100/30 rounded-3xl" />
        <div className="h-[500px] bg-slate-200/40 rounded-3xl" />
      </div>
    </div>
  );
}
