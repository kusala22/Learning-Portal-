import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import Layout from '../components/Layout';
import BookmarkPanel from '../components/BookmarkPanel';
import Watermark from '../components/Watermark';
import Modal from '../components/Modal';
import useProgress from '../hooks/useProgress';
import useVideoProtection from '../hooks/useVideoProtection';
import { videoService } from '../services/videoService';
import { formatDuration } from '../utils/helpers';
import {
  FiArrowLeft, FiAlertTriangle, FiPlay,
  FiPause, FiVolume2, FiVolumeX,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const VideoPlayer = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume] = useState(1);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState('bookmarks');
  const [resumeModal, setResumeModal] = useState(false);
  const [resumeTime, setResumeTime] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);
  const controlsTimerRef = useRef(null);

  // Progress hook
  const { progress, loadingProgress, saveProgress, startAutoSave, stopAutoSave } = useProgress(videoId);

  // Screenshot protection
  useVideoProtection({ playerRef, setIsBlurred });

  // Fetch video data
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const { data } = await videoService.getVideo(videoId);
        setVideo(data.video);
      } catch {
        toast.error('Video not found');
        navigate('/videos');
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [videoId, navigate]);

  // Show resume modal after progress loads
  useEffect(() => {
    if (!loadingProgress && progress && progress.lastWatchedTime > 10 && !hasInitialized) {
      setResumeTime(progress.lastWatchedTime);
      setResumeModal(true);
    }
  }, [loadingProgress, progress, hasInitialized]);

  // Auto-save setup
  const handleReady = useCallback(() => {
    startAutoSave(
      () => playerRef.current?.getCurrentTime() || 0,
      () => playerRef.current?.getDuration() || 0
    );
  }, [startAutoSave]);

  // Handle progress update
  const handleProgress = useCallback((state) => {
    setPlayed(state.played);
    setCurrentTime(state.playedSeconds);
  }, []);

  const handleDuration = useCallback((d) => {
    setDuration(d);
  }, []);

  // Hide controls after 3s inactivity
  const resetControlsTimer = useCallback(() => {
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    if (isPlaying) {
      controlsTimerRef.current = setTimeout(() => {}, 3000);
    }
  }, [isPlaying]);

  // Seek to specific timestamp (from bookmarks)
  const handleSeek = useCallback((time) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, 'seconds');
      setCurrentTime(time);
      setIsPlaying(true);
    }
  }, []);

  // Resume from saved position
  const handleResume = useCallback(() => {
    setHasInitialized(true);
    setResumeModal(false);
    setTimeout(() => {
      handleSeek(resumeTime);
    }, 500);
  }, [handleSeek, resumeTime]);

  const handleStartOver = useCallback(() => {
    setHasInitialized(true);
    setResumeModal(false);
    handleSeek(0);
    setIsPlaying(true);
  }, [handleSeek]);

  // Save on pause/end
  const handlePause = useCallback(() => {
    setIsPlaying(false);
    saveProgress(currentTime, duration);
  }, [currentTime, duration, saveProgress]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    saveProgress(duration, duration);
    toast.success('🎉 Lesson complete!', { duration: 4000 });
  }, [duration, saveProgress]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopAutoSave();
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [stopAutoSave]);

  const progressPercent = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-primary-600/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!video) return null;

  return (
    <Layout>
      {/* Back navigation */}
      <button
        onClick={() => { saveProgress(currentTime, duration); navigate(-1); }}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors text-sm group"
      >
        <FiArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Courses
      </button>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left: Video + Info */}
        <div className="flex-1 min-w-0">
          {/* Video Player Container */}
          <div
            ref={containerRef}
            className="relative bg-black rounded-2xl overflow-hidden group select-none"
            onMouseMove={resetControlsTimer}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            {/* Blur overlay when tab is hidden or devtools open */}
            {isBlurred && (
              <div className="absolute inset-0 z-30 bg-dark-900/95 backdrop-blur-xl flex flex-col items-center justify-center gap-3">
                <FiAlertTriangle className="text-yellow-500" size={36} />
                <p className="text-white font-semibold text-lg">Playback Paused</p>
                <p className="text-gray-400 text-sm text-center px-8">
                  Video paused because you switched away from this tab or window.
                </p>
                <button
                  onClick={() => { setIsBlurred(false); setIsPlaying(true); }}
                  className="btn-primary flex items-center gap-2 mt-2"
                >
                  <FiPlay size={15} />
                  Resume Playback
                </button>
              </div>
            )}

            {/* Dynamic Watermark */}
            <Watermark />

            {/* Invisible click shield (partial, allows player controls) */}
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{ background: 'transparent' }}
            />

            {/* React Player */}
            <div className="aspect-video">
              <ReactPlayer
                ref={playerRef}
                url={video.videoUrl}
                playing={isPlaying}
                volume={volume}
                muted={isMuted}
                width="100%"
                height="100%"
                onReady={handleReady}
                onProgress={handleProgress}
                onDuration={handleDuration}
                onPause={handlePause}
                onEnded={handleEnded}
                onPlay={() => setIsPlaying(true)}
                config={{
                  file: {
                    attributes: {
                      controlsList: 'nodownload noplaybackrate',
                      disablePictureInPicture: true,
                      onContextMenu: (e) => e.preventDefault(),
                    },
                  },
                }}
              />
            </div>

            {/* Custom progress bar */}
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-3 pt-6">
              {/* Seek bar */}
              <input
                type="range"
                min={0}
                max={1}
                step={0.001}
                value={played}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setPlayed(val);
                  playerRef.current?.seekTo(val);
                }}
                className="w-full h-1 accent-primary-500 cursor-pointer mb-2"
              />
              {/* Controls row */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white hover:text-primary-400 transition-colors"
                >
                  {isPlaying ? <FiPause size={18} /> : <FiPlay size={18} />}
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white hover:text-primary-400 transition-colors"
                >
                  {isMuted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
                </button>
                <span className="text-white text-xs font-mono">
                  {formatDuration(currentTime)} / {formatDuration(duration)}
                </span>
                <div className="flex-1" />
                <span className="text-gray-300 text-xs">{progressPercent}%</span>
              </div>
            </div>

            {/* Center play button */}
            {!isPlaying && !isBlurred && (
              <button
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 flex items-center justify-center z-15"
              >
                <div className="w-16 h-16 rounded-full bg-primary-600/90 flex items-center justify-center shadow-2xl shadow-primary-600/50 hover:scale-110 transition-transform">
                  <FiPlay className="text-white ml-1" size={24} />
                </div>
              </button>
            )}
          </div>

          {/* Video info */}
          <div className="glass-card p-5 mt-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <span className="text-xs bg-primary-600/20 text-primary-400 border border-primary-600/30 px-2 py-0.5 rounded-full mb-2 inline-block">
                  {video.category}
                </span>
                <h1 className="text-xl font-bold text-white mb-2">{video.title}</h1>
                <p className="text-gray-400 text-sm leading-relaxed">{video.description}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 mt-4 pt-4 border-t border-white/5 text-sm text-gray-500">
              <span>{video.instructor}</span>
              <span>•</span>
              <span>{formatDuration(video.duration)}</span>
              <span>•</span>
              <span>{video.views} views</span>
              {progress?.completed && (
                <>
                  <span>•</span>
                  <span className="text-green-400 font-medium">✓ Completed</span>
                </>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span className="text-primary-400 font-medium">{progressPercent}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-fill ${progress?.completed ? 'bg-green-500' : ''}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Side panel */}
        <div className="xl:w-80 flex-shrink-0">
          {/* Tabs */}
          <div className="flex mb-4 glass-card p-1 rounded-xl">
            {['bookmarks', 'notes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-primary-600/30 text-primary-400'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="glass-card p-4 xl:h-[calc(100vh-16rem)] overflow-y-auto">
            {activeTab === 'bookmarks' ? (
              <BookmarkPanel
                videoId={videoId}
                onSeek={handleSeek}
                getCurrentTime={() => currentTime}
              />
            ) : (
              <NotesPanel videoId={videoId} />
            )}
          </div>
        </div>
      </div>

      {/* Resume Modal */}
      <Modal isOpen={resumeModal} onClose={() => { setResumeModal(false); setHasInitialized(true); }} title="Resume Playback" size="sm">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-primary-600/20 border border-primary-600/30 flex items-center justify-center mx-auto mb-4">
            <FiPlay className="text-primary-400 ml-1" size={22} />
          </div>
          <p className="text-gray-300 mb-2">
            You left off at <span className="text-primary-400 font-bold font-mono text-lg">{formatDuration(resumeTime)}</span>
          </p>
          <p className="text-gray-500 text-sm mb-6">Want to pick up from where you left off?</p>
          <div className="flex gap-3">
            <button onClick={handleResume} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <FiPlay size={14} />
              Resume
            </button>
            <button onClick={handleStartOver} className="btn-secondary flex-1">
              Start Over
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

// Simple notes panel component
const NotesPanel = ({ videoId }) => {
  const key = `notes_${videoId}`;
  const [notes, setNotes] = useState(() => localStorage.getItem(key) || '');

  const handleChange = (e) => {
    setNotes(e.target.value);
    localStorage.setItem(key, e.target.value);
  };

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        📝 Personal Notes
      </h3>
      <textarea
        value={notes}
        onChange={handleChange}
        placeholder="Take notes while watching... they're saved automatically."
        className="input-field flex-1 resize-none text-sm min-h-64"
      />
      <p className="text-gray-600 text-xs mt-2">Notes are saved locally in your browser.</p>
    </div>
  );
};

export default VideoPlayer;
