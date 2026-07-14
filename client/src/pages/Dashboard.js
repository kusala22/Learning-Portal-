import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import VideoCard from '../components/VideoCard';
import VideoCardSkeleton from '../components/VideoCardSkeleton';
import { videoService } from '../services/videoService';
import { progressService } from '../services/progressService';
import api from '../services/api';
import { FiPlay, FiClock, FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import { timeAgo, getThumbnail } from '../utils/helpers';

const Dashboard = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [recentlyWatched, setRecentlyWatched] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [videosRes, recentRes, progressRes] = await Promise.all([
          videoService.getVideos({ limit: 8, sort: '-createdAt' }),
          api.get('/recently-watched?limit=5'),
          progressService.getAllProgress(),
        ]);
        setVideos(videosRes.data.videos || []);
        setRecentlyWatched(recentRes.data.recentlyWatched || []);

        // Build progress map
        const pMap = {};
        (progressRes.data.progressList || []).forEach((p) => {
          if (p.videoId) pMap[p.videoId._id] = p;
        });
        setProgressMap(pMap);
      } catch {
        // errors handled globally
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const inProgressVideos = recentlyWatched.filter(
    (rw) => rw.videoId && progressMap[rw.videoId._id]?.progressPercentage > 0 && !progressMap[rw.videoId._id]?.completed
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <Layout>
      {/* Hero welcome */}
      <div className="glass-card p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-primary-600/10 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <p className="text-gray-400 text-sm mb-1">{greeting},</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            {user?.name} 👋
          </h1>
          <p className="text-gray-400 text-sm">
            Ready to continue your learning journey? You have{' '}
            <span className="text-primary-400 font-medium">{inProgressVideos.length} course{inProgressVideos.length !== 1 ? 's' : ''}</span> in progress.
          </p>
          <Link to="/videos" className="inline-flex items-center gap-2 mt-4 btn-primary text-sm">
            <FiPlay size={14} />
            Browse Courses
          </Link>
        </div>
      </div>

      {/* Continue Watching */}
      {inProgressVideos.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiPlay className="text-primary-400" size={18} />
              <h2 className="text-lg font-semibold text-white">Continue Watching</h2>
            </div>
            <Link to="/videos" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">
              See all <FiArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {inProgressVideos.slice(0, 4).map((rw) => (
              <VideoCard key={rw._id} video={rw.videoId} progress={progressMap[rw.videoId._id]} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Watched */}
      {recentlyWatched.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FiClock className="text-primary-400" size={18} />
            <h2 className="text-lg font-semibold text-white">Recently Watched</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {recentlyWatched.map((rw) => {
              if (!rw.videoId) return null;
              return (
                <Link
                  key={rw._id}
                  to={`/videos/${rw.videoId._id}`}
                  className="flex-shrink-0 w-52 glass-card-hover overflow-hidden group"
                >
                  <div className="relative aspect-video">
                    <img
                      src={getThumbnail(rw.videoId.thumbnail, rw.videoId.title)}
                      alt={rw.videoId.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <FiPlay className="text-white" size={24} />
                    </div>
                    {rw.progressPercentage > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-dark-600">
                        <div className="h-full bg-primary-500" style={{ width: `${rw.progressPercentage}%` }} />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-white text-xs font-medium truncate">{rw.videoId.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{timeAgo(rw.watchedAt)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* All Videos */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FiTrendingUp className="text-primary-400" size={18} />
            <h2 className="text-lg font-semibold text-white">Available Courses</h2>
          </div>
          <Link to="/videos" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors">
            View all <FiArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <VideoCardSkeleton key={i} />)}
          </div>
        ) : videos.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-gray-400">No courses available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} progress={progressMap[video._id]} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Dashboard;
