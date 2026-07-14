import React, { useState, useEffect } from 'react';
import { FiBookmark, FiPlus, FiEdit2, FiTrash2, FiPlay, FiX, FiCheck } from 'react-icons/fi';
import { bookmarkService } from '../services/bookmarkService';
import Modal from './Modal';
import toast from 'react-hot-toast';

const BookmarkPanel = ({ videoId, onSeek, getCurrentTime }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [formData, setFormData] = useState({ title: '', note: '' });

  useEffect(() => {
    fetchBookmarks();
    // eslint-disable-next-line
  }, [videoId]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const { data } = await bookmarkService.getBookmarks(videoId);
      setBookmarks(data.bookmarks || []);
    } catch {
      toast.error('Could not load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBookmark = async () => {
    const timestamp = getCurrentTime();
    try {
      const { data } = await bookmarkService.createBookmark({
        videoId,
        timestamp,
        title: formData.title || `Bookmark at ${formatTime(timestamp)}`,
        note: formData.note,
      });
      setBookmarks((prev) => [...prev, data.bookmark].sort((a, b) => a.timestamp - b.timestamp));
      setFormData({ title: '', note: '' });
      setShowAddForm(false);
      toast.success('Bookmark added!');
    } catch {
      toast.error('Could not add bookmark');
    }
  };

  const handleEdit = (bookmark) => {
    setEditingId(bookmark._id);
    setFormData({ title: bookmark.title, note: bookmark.note || '' });
  };

  const handleSaveEdit = async (id) => {
    try {
      const { data } = await bookmarkService.updateBookmark(id, formData);
      setBookmarks((prev) => prev.map((b) => (b._id === id ? data.bookmark : b)));
      setEditingId(null);
      setFormData({ title: '', note: '' });
      toast.success('Bookmark updated!');
    } catch {
      toast.error('Could not update bookmark');
    }
  };

  const handleDelete = async (id) => {
    try {
      await bookmarkService.deleteBookmark(id);
      setBookmarks((prev) => prev.filter((b) => b._id !== id));
      setDeleteModal(null);
      toast.success('Bookmark deleted');
    } catch {
      toast.error('Could not delete bookmark');
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiBookmark className="text-primary-400" size={18} />
          <h3 className="text-white font-semibold">Bookmarks</h3>
          <span className="text-xs bg-primary-600/20 text-primary-400 px-2 py-0.5 rounded-full">
            {bookmarks.length}
          </span>
        </div>
        <button
          onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); }}
          className="flex items-center gap-1.5 text-sm bg-primary-600/20 hover:bg-primary-600/40 text-primary-400 px-3 py-1.5 rounded-xl border border-primary-600/30 transition-all"
        >
          <FiPlus size={14} />
          Add Bookmark
        </button>
      </div>

      {/* Add Bookmark Form */}
      {showAddForm && (
        <div className="glass-card p-3 mb-3 animate-slide-up">
          <p className="text-xs text-gray-400 mb-2">
            Bookmarking at: <span className="text-primary-400 font-mono font-medium">{formatTime(getCurrentTime())}</span>
          </p>
          <input
            type="text"
            placeholder="Bookmark title (optional)"
            value={formData.title}
            onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
            className="input-field text-sm py-2 mb-2"
          />
          <textarea
            placeholder="Notes (optional)"
            value={formData.note}
            onChange={(e) => setFormData((p) => ({ ...p, note: e.target.value }))}
            className="input-field text-sm py-2 mb-2 resize-none h-16"
          />
          <div className="flex gap-2">
            <button onClick={handleAddBookmark} className="btn-primary text-sm py-1.5 px-4 flex-1">
              Save Bookmark
            </button>
            <button onClick={() => setShowAddForm(false)} className="btn-secondary text-sm py-1.5 px-3">
              <FiX size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Bookmarks List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-14 rounded-xl" />
          ))
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-10">
            <FiBookmark className="mx-auto text-gray-600 mb-2" size={28} />
            <p className="text-gray-500 text-sm">No bookmarks yet</p>
            <p className="text-gray-600 text-xs mt-1">Click "Add Bookmark" to save a moment</p>
          </div>
        ) : (
          bookmarks.map((bookmark) => (
            <div key={bookmark._id} className="glass-card p-3 group hover:border-primary-600/30 transition-all">
              {editingId === bookmark._id ? (
                /* Edit mode */
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                    className="input-field text-sm py-1.5"
                    autoFocus
                  />
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData((p) => ({ ...p, note: e.target.value }))}
                    className="input-field text-sm py-1.5 resize-none h-14"
                    placeholder="Notes..."
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(bookmark._id)} className="btn-primary text-xs py-1 px-3 flex items-center gap-1">
                      <FiCheck size={12} /> Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn-secondary text-xs py-1 px-3">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div className="flex items-start gap-2">
                  <button
                    onClick={() => onSeek(bookmark.timestamp)}
                    className="flex-shrink-0 mt-0.5 font-mono text-xs bg-primary-600/20 text-primary-400 hover:bg-primary-600/40 px-2 py-1 rounded-lg border border-primary-600/30 transition-all flex items-center gap-1"
                    title="Jump to this timestamp"
                  >
                    <FiPlay size={10} />
                    {bookmark.timestampFormatted}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{bookmark.title}</p>
                    {bookmark.note && (
                      <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{bookmark.note}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(bookmark)}
                      className="text-gray-500 hover:text-primary-400 p-1 rounded-lg hover:bg-white/5 transition-all"
                    >
                      <FiEdit2 size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteModal(bookmark)}
                      className="text-gray-500 hover:text-red-400 p-1 rounded-lg hover:bg-red-500/10 transition-all"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Bookmark"
        size="sm"
      >
        <p className="text-gray-400 mb-5">
          Are you sure you want to delete <span className="text-white font-medium">"{deleteModal?.title}"</span>? This action cannot be undone.
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
    </div>
  );
};

export default BookmarkPanel;
