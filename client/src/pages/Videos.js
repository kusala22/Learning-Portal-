import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import VideoCard from '../components/VideoCard';
import VideoCardSkeleton from '../components/VideoCardSkeleton';
import { videoService } from '../services/videoService';
import { progressService } from '../services/progressService';
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';

const Videos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [searchInput, setSearchInput] = useState(search);
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (search) params.search = search;
      if (category !== 'All') params.category = category;

      const { data } = await videoService.getVideos(params);
      setVideos(data.videos || []);
      setPagination({ total: data.total, pages: data.pages });
    } catch {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, page]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    videoService.getCategories().then(({ data }) => setCategories(data.categories || ['All'])).catch(() => {});
    progressService.getAllProgress().then(({ data }) => {
      const pMap = {};
      (data.progressList || []).forEach((p) => { if (p.videoId) pMap[p.videoId._id] = p; });
      setProgressMap(pMap);
    }).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
    setSearchParams(searchInput ? { search: searchInput } : {});
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">All Courses</h1>
        <p className="text-gray-500 text-sm">{pagination.total} course{pagination.total !== 1 ? 's' : ''} available</p>
      </div>

      {/* Search & Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="input-field pl-10 py-2.5"
              />
            </div>
            <button type="submit" className="btn-primary px-4 py-2.5">
              Search
            </button>
          </form>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="input-field py-2.5 w-full sm:w-44"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="title">A-Z</option>
            <option value="-views">Most Viewed</option>
          </select>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200
                ${category === cat
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <VideoCardSkeleton key={i} />)}
        </div>
      ) : videos.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <FiSearch className="mx-auto text-gray-600 mb-3" size={36} />
          <p className="text-gray-400 font-medium">No courses found</p>
          <p className="text-gray-600 text-sm mt-1">Try adjusting your search or filter</p>
          <button
            onClick={() => { setSearch(''); setSearchInput(''); setCategory('All'); setPage(1); }}
            className="btn-secondary text-sm mt-4 inline-block"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} progress={progressMap[video._id]} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary px-3 py-2 disabled:opacity-40"
          >
            <FiChevronLeft size={16} />
          </button>
          <span className="text-gray-400 text-sm">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="btn-secondary px-3 py-2 disabled:opacity-40"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      )}
    </Layout>
  );
};

export default Videos;
