import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { videoService } from '../services/videoService';
import { formatDuration, getThumbnail } from '../utils/helpers';
import { FiPlus, FiEdit2, FiTrash2, FiVideo, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const emptyForm = {
  title: '', description: '', videoUrl: '', thumbnail: '',
  duration: '', category: 'General', tags: '', instructor: 'GVCC Instructor', isPublished: true
};

const AdminVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchVideos(); }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const { data } = await videoService.getVideos({ limit: 50, sort: '-createdAt' });
      setVideos(data.videos || []);
    } catch {
      toast.error('Could not load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingVideo(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const handleOpenEdit = (video) => {
    setEditingVideo(video);
    setForm({
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnail: video.thumbnail || '',
      duration: video.duration || '',
      category: video.category || 'General',
      tags: video.tags?.join(', ') || '',
      instructor: video.instructor || 'GVCC Instructor',
      isPublished: video.isPublished,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.videoUrl) {
      toast.error('Title and Video URL are required');
      return;
    }
    setSaving(true);
    try {
      if (editingVideo) {
        const { data } = await videoService.updateVideo(editingVideo._id, form);
        setVideos((prev) => prev.map((v) => v._id === editingVideo._id ? data.video : v));
        toast.success('Video updated!');
      } else {
        const { data } = await videoService.createVideo(form);
        setVideos((prev) => [data.video, ...prev]);
        toast.success('Video created!');
      }
      setShowModal(false);
    } catch {
      toast.error('Failed to save video');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await videoService.deleteVideo(id);
      setVideos((prev) => prev.filter((v) => v._id !== id));
      setDeleteModal(null);
      toast.success('Video deleted');
    } catch {
      toast.error('Failed to delete video');
    }
  };

  const setField = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Manage Videos</h1>
          <p className="text-gray-500 text-sm">{videos.length} videos</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-primary flex items-center gap-2">
          <FiPlus size={16} />
          Add Video
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
        </div>
      ) : videos.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <FiVideo className="mx-auto text-gray-600 mb-3" size={40} />
          <p className="text-gray-400 font-medium">No videos yet</p>
          <button onClick={handleOpenAdd} className="btn-primary mt-4 inline-flex items-center gap-2">
            <FiPlus size={14} /> Add First Video
          </button>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-gray-400 font-medium px-4 py-3">Video</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Category</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3 hidden lg:table-cell">Duration</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3 hidden lg:table-cell">Views</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
                  <th className="text-right text-gray-400 font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <tr key={video._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={getThumbnail(video.thumbnail, video.title)}
                          alt={video.title}
                          className="w-16 h-10 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-white font-medium truncate max-w-48">{video.title}</p>
                          <p className="text-gray-500 text-xs">{video.instructor}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs bg-primary-600/20 text-primary-400 px-2 py-0.5 rounded-full">
                        {video.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">
                      {video.durationFormatted || formatDuration(video.duration)}
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">{video.views}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 w-fit
                        ${video.isPublished ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'}`}>
                        {video.isPublished ? <><FiCheck size={10} /> Published</> : <><FiX size={10} /> Draft</>}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(video)}
                          className="text-gray-500 hover:text-primary-400 p-1.5 rounded-lg hover:bg-white/5 transition-all"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteModal(video)}
                          className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingVideo ? 'Edit Video' : 'Add New Video'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-gray-400 text-sm mb-1 block">Title *</label>
              <input type="text" value={form.title} onChange={setField('title')} className="input-field" placeholder="Video title" required />
            </div>
            <div className="sm:col-span-2">
              <label className="text-gray-400 text-sm mb-1 block">Description *</label>
              <textarea value={form.description} onChange={setField('description')} className="input-field resize-none h-20" placeholder="Description" required />
            </div>
            <div className="sm:col-span-2">
              <label className="text-gray-400 text-sm mb-1 block">Video URL *</label>
              <input type="url" value={form.videoUrl} onChange={setField('videoUrl')} className="input-field" placeholder="https://..." required />
            </div>
            <div className="sm:col-span-2">
              <label className="text-gray-400 text-sm mb-1 block">Thumbnail URL</label>
              <input type="url" value={form.thumbnail} onChange={setField('thumbnail')} className="input-field" placeholder="https://..." />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Category</label>
              <input type="text" value={form.category} onChange={setField('category')} className="input-field" placeholder="e.g. JavaScript" />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Duration (seconds)</label>
              <input type="number" value={form.duration} onChange={setField('duration')} className="input-field" placeholder="e.g. 3600" />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Instructor</label>
              <input type="text" value={form.instructor} onChange={setField('instructor')} className="input-field" />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Tags (comma-separated)</label>
              <input type="text" value={form.tags} onChange={setField('tags')} className="input-field" placeholder="react, js, web" />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="published"
                checked={form.isPublished}
                onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))}
                className="w-4 h-4 accent-primary-600"
              />
              <label htmlFor="published" className="text-gray-400 text-sm">Published (visible to students)</label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              {editingVideo ? 'Save Changes' : 'Add Video'}
            </button>
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Video" size="sm">
        <p className="text-gray-400 mb-5">
          Delete <span className="text-white font-medium">"{deleteModal?.title}"</span>? This will remove all associated bookmarks and progress.
        </p>
        <div className="flex gap-3">
          <button onClick={() => handleDelete(deleteModal?._id)} className="btn-danger flex-1">Delete</button>
          <button onClick={() => setDeleteModal(null)} className="btn-secondary flex-1">Cancel</button>
        </div>
      </Modal>
    </Layout>
  );
};

export default AdminVideos;
