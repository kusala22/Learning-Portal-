import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import api from '../services/api';
import { getInitials, formatDate } from '../utils/helpers';
import { FiSearch, FiUsers, FiToggleLeft, FiToggleRight, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line
  }, [page, search]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      const { data } = await api.get('/admin/students', { params });
      setStudents(data.students || []);
      setTotal(data.total || 0);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await api.put(`/admin/students/${id}/toggle`);
      setStudents((prev) => prev.map((s) => s._id === id ? { ...s, isActive: data.user.isActive } : s));
      toast.success(data.message);
    } catch {
      toast.error('Failed to update student');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/students/${id}`);
      setStudents((prev) => prev.filter((s) => s._id !== id));
      setDeleteModal(null);
      toast.success('Student deleted');
    } catch {
      toast.error('Failed to delete student');
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Manage Students</h1>
          <p className="text-gray-500 text-sm">{total} registered student{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-md">
        <FiSearch className="absolute left-3.5 top-3.5 text-gray-500" size={16} />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-field pl-10"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : students.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <FiUsers className="mx-auto text-gray-600 mb-3" size={40} />
          <p className="text-gray-400 font-medium">No students found</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-gray-400 font-medium px-4 py-3">Student</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3 hidden md:table-cell">Email</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3 hidden lg:table-cell">Joined</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
                  <th className="text-right text-gray-400 font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {getInitials(student.name)}
                        </div>
                        <p className="text-white font-medium truncate max-w-36">{student.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{student.email}</td>
                    <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">{formatDate(student.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                        ${student.isActive ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggle(student._id)}
                          className={`p-1.5 rounded-lg transition-all ${student.isActive ? 'text-green-400 hover:bg-green-500/10' : 'text-gray-500 hover:bg-white/5'}`}
                          title={student.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {student.isActive ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                        </button>
                        <button
                          onClick={() => setDeleteModal(student)}
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

      {/* Delete Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Student" size="sm">
        <p className="text-gray-400 mb-5">
          Delete student <span className="text-white font-medium">"{deleteModal?.name}"</span>? This will also delete their bookmarks and progress. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={() => handleDelete(deleteModal?._id)} className="btn-danger flex-1">Delete</button>
          <button onClick={() => setDeleteModal(null)} className="btn-secondary flex-1">Cancel</button>
        </div>
      </Modal>
    </Layout>
  );
};

export default AdminStudents;
