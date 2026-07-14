import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { bookmarkService } from '../services/bookmarkService';
import { getThumbnail, timeAgo } from '../utils/helpers';
import { FiBookmark, FiPlay, FiTrash2, FiEdit2, FiCheck, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: '', note: '' });

  useEffect(() => {
    fetchBookmarks();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(bookmarks);
    } else {
      const q = search.toLowerCase();
      setFiltered(bookmarks.filter(
        (b) => b.title?.toLowerCase().includes(q) || b.note?.toLowerCase().includes(q) || b.videoId?.title?.toLowerCase().includes(q)
      ));
    }
  }, [search, bookmarks]);

  const fetchBookmarks = async () => {
    try {
      const { data } = await bookmarkService.getAllBookmarks();
      setBookmarks(data.bookmarks || []);
    } catch {
      toast.error('Could not load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await bookmarkService.deleteBookmark(id);
      setBookmarks((prev) => prev.filter((b) => b._id !== id));
      setDeleteModal(null);
      toast.success('Bookmark deleted');
    } catch {
      toast.error('Failed to delete bookmark');
    }
  };

  const handleEdit = (bookmark) => {
    setEditingId(bookmark._id);
    setEditData({ title: bookmark.title, note: bookmark.note || '' });
  };

  const handleSaveEdit = async () => {
    try {
      const { data } = await bookmarkService.updateBookmark(editingId, editData);
      setBookmarks((prev) => prev.map((b) => b._id === editingId ? { ...b, ...data.bookmark } : b));
      setEditingId(null);
      toast.success('Bookmark updated!');
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  // Group bookmarks by video
  const grouped = filtered.reduce((acc, bookmark) => {
    const videoId = bookmark.videoId?._id || 'unknown';
    if (!acc[videoId]) {
      acc[videoId] = { video: bookmark.videoId, bookmarks: [] };
    }
    acc[videoId].bookmarks.push(bookmark);
    return acc;
  }, {});

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <FiBookmark className="text-primary-400" size={22} />
          <h1 className="text-2xl font-bold text-white">My Bookmarks</h1>
        </div>
        <p className="text-gray-500 text-sm">{bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''} across all courses</p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <FiSearch className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
        <input
          type="text"
          placeholder="Search bookmarks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="glass-card p-16 text-center">
          <FiBookmark className="mx-auto text-gray-600 mb-3" size={40} />
          <p className="text-gray-400 font-medium text-lg">No bookmarks yet</p>
          <p className="text-gray-600 text-sm mt-1 mb-5">
            {search ? 'No bookmarks match your search.' : 'Start watching videos and add bookmarks to important moments.'}
          </p>
          <Link to="/videos" className="btn-primary inline-flex items-center gap-2">
            <FiPlay size={14} />
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.values(grouped).map(({ video, bookmarks: vBookmarks }) => (
            <div key={video?._id || 'unknown'} className="glass-card overflow-hidden">
              {/* Video header */}
              <div className="flex items-center gap-4 p-4 border-b border-white/5">
                {video && (
                  <img
                    src={getThumbnail(video.thumbnail, video.title)}
                    alt={video.title}
                    className="w-20 h-12 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">{video?.title || 'Unknown Video'}</h3>
                  <p className="text-gray-500 text-xs">{vBookmarks.length} bookmark{vBookmarks.length !== 1 ? 's' : ''}</p>
                </div>
                {video && (
                  <Link
                    to={`/videos/${video._id}`}
                    className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 flex-shrink-0"
                  >
                    <FiPlay size={12} />
                    Watch
                  </Link>
                )}
              </div>

              {/* Bookmarks list */}
              <div className="divide-y divide-white/5">
                {vBookmarks
                  .sort((a, b) => a.timestamp - b.timestamp)
                  .map((bookmark) => (
                    <div key={bookmark._id} className="flex items-start gap-3 p-4 hover:bg-white/2 transition-colors group">
                      {/* Timestamp */}
                      {video && (
                        <Link
                          to={`/videos/${video._id}?t=${bookmark.timestamp}`}
                          className="flex-shrink-0 font-mono text-xs bg-primary-600/20 text-primary-400 hover:bg-primary-600/40 px-2.5 py-1.5 rounded-lg border border-primary-600/30 transition-all flex items-center gap-1.5 mt-0.5"
                        >
                          <FiPlay size={10} />
                          {bookmark.timestampFormatted}
                        </Link>
                      )}

                      {/* Content */}
                      {editingId === bookmark._id ? (
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={editData.title}
                            onChange={(e) => setEditData((p) => ({ ...p, title: e.target.value }))}
                            className="input-field text-sm py-1.5 w-full"
                            autoFocus
                          />
                          <textarea
                            value={editData.note}
                            onChange={(e) => setEditData((p) => ({ ...p, note: e.target.value }))}
                            className="input-field text-sm py-1.5 resize-none h-16 w-full"
                            placeholder="Notes..."
                          />
                          <div className="flex gap-2">
                            <button onClick={handleSaveEdit} className="btn-primary text-xs py-1 px-3 flex items-center gap-1">
                              <FiCheck size={12} /> Save
                            </button>
                            <button onClick={() => setEditingId(null)} className="btn-secondary text-xs py-1 px-3">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium">{bookmark.title}</p>
                          {bookmark.note && (
                            <p className="text-gray-500 text-xs mt-1 line-clamp-2">{bookmark.note}</p>
                          )}
                          <p className="text-gray-600 text-xs mt-1">{timeAgo(bookmark.createdAt)}</p>
                        </div>
                      )}

                      {/* Actions */}
                      {editingId !== bookmark._id && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button
                            onClick={() => handleEdit(bookmark)}
                            className="text-gray-500 hover:text-primary-400 p-1.5 rounded-lg hover:bg-white/5 transition-all"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteModal(bookmark)}
                            className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Bookmark" size="sm">
        <p className="text-gray-400 mb-5">
          Delete <span className="text-white font-medium">"{deleteModal?.title}"</span>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={() => handleDelete(deleteModal?._id)} className="btn-danger flex-1">
            Delete
          </button>
          <button onClick={() => setDeleteModal(null)} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </Modal>
    </Layout>
  );
};

export default Bookmarks;
