import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { FiUsers, FiVideo, FiBookmark, FiTrendingUp, FiArrowRight } from 'react-icons/fi';

const StatCard = ({ icon: Icon, label, value, color, link }) => (
  <div className={`glass-card p-5 border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold text-white">{value ?? '—'}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.replace('border-', 'bg-').replace('-500', '-500/20')}`}>
        <Icon size={22} className={color.replace('border-', 'text-')} />
      </div>
    </div>
    {link && (
      <Link to={link} className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-400 mt-3 transition-colors">
        View details <FiArrowRight size={11} />
      </Link>
    )}
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Admin Overview</h1>
        <p className="text-gray-500 text-sm">GVCC Learning Portal Management</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={FiUsers} label="Total Students" value={stats?.totalUsers} color="border-blue-500" link="/admin/students" />
          <StatCard icon={FiVideo} label="Total Videos" value={stats?.totalVideos} color="border-primary-500" link="/admin/videos" />
          <StatCard icon={FiBookmark} label="Total Bookmarks" value={stats?.totalBookmarks} color="border-purple-500" />
          <StatCard icon={FiTrendingUp} label="Watch Sessions" value={stats?.totalProgress} color="border-green-500" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Link to="/admin/videos" className="glass-card-hover p-6 flex items-center gap-4 group">
          <div className="w-14 h-14 rounded-xl bg-primary-600/20 border border-primary-600/30 flex items-center justify-center">
            <FiVideo className="text-primary-400" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">Manage Videos</h3>
            <p className="text-gray-500 text-sm">Upload, edit, and delete course videos</p>
          </div>
          <FiArrowRight className="text-gray-500 group-hover:text-primary-400 transition-colors" size={18} />
        </Link>

        <Link to="/admin/students" className="glass-card-hover p-6 flex items-center gap-4 group">
          <div className="w-14 h-14 rounded-xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center">
            <FiUsers className="text-blue-400" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">Manage Students</h3>
            <p className="text-gray-500 text-sm">View and manage student accounts</p>
          </div>
          <FiArrowRight className="text-gray-500 group-hover:text-primary-400 transition-colors" size={18} />
        </Link>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
