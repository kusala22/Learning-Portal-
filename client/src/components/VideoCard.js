import React from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiPlay, FiEye } from 'react-icons/fi';
import { formatDuration, truncate, getThumbnail } from '../utils/helpers';

const VideoCard = ({ video, progress }) => {
  const progressPercent = progress?.progressPercentage || 0;
  const lastWatched = progress?.lastWatchedFormatted;
  const isCompleted = progress?.completed;

  return (
    <Link to={`/videos/${video._id}`} className="group block">
      <div className="glass-card-hover overflow-hidden">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden rounded-t-2xl bg-dark-600">
          <img
            src={getThumbnail(video.thumbnail, video.title)}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/640x360/1c1c30/6470ee?text=${encodeURIComponent(video.title)}`;
            }}
          />

          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-primary-600/90 flex items-center justify-center shadow-lg shadow-primary-600/40">
              <FiPlay className="text-white ml-1" size={22} />
            </div>
          </div>

          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-2 py-0.5 rounded-md backdrop-blur-sm">
            {video.durationFormatted || formatDuration(video.duration)}
          </div>

          {/* Category badge */}
          <div className="absolute top-2 left-2 bg-primary-600/80 text-white text-xs font-medium px-2 py-0.5 rounded-md backdrop-blur-sm">
            {video.category}
          </div>

          {/* Completion badge */}
          {isCompleted && (
            <div className="absolute top-2 right-2 bg-green-500/80 text-white text-xs font-medium px-2 py-0.5 rounded-md backdrop-blur-sm">
              ✓ Done
            </div>
          )}
        </div>

        {/* Progress bar */}
        {progressPercent > 0 && (
          <div className="h-1 bg-dark-500">
            <div
              className={`h-full rounded-none transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-primary-500'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <h3 className="text-white font-semibold text-sm leading-snug mb-1 group-hover:text-primary-400 transition-colors">
            {truncate(video.title, 60)}
          </h3>
          <p className="text-gray-500 text-xs mb-3 line-clamp-2">
            {truncate(video.description, 80)}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs flex items-center gap-1">
              <FiClock size={11} />
              {video.instructor}
            </span>

            {progressPercent > 0 ? (
              <span className={`text-xs font-medium ${isCompleted ? 'text-green-400' : 'text-primary-400'}`}>
                {isCompleted ? 'Completed' : `${progressPercent}% • ${lastWatched}`}
              </span>
            ) : (
              <span className="text-gray-600 text-xs flex items-center gap-1">
                <FiEye size={11} />
                {video.views || 0}
              </span>
            )}
          </div>

          {/* Continue button for in-progress videos */}
          {progressPercent > 0 && !isCompleted && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <span className="text-primary-400 text-xs font-medium flex items-center gap-1">
                <FiPlay size={12} />
                Continue from {lastWatched}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
