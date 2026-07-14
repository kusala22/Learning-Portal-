import React from 'react';

const VideoCardSkeleton = () => (
  <div className="glass-card overflow-hidden animate-pulse">
    <div className="aspect-video skeleton rounded-t-2xl" />
    <div className="p-4 space-y-2">
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3 w-full rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
      <div className="flex justify-between mt-3">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-3 w-16 rounded" />
      </div>
    </div>
  </div>
);

export default VideoCardSkeleton;
