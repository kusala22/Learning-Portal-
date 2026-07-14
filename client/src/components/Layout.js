import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiVideo, FiBookmark, FiLogOut, FiMenu, FiX,
  FiShield, FiUsers, FiChevronRight
} from 'react-icons/fi';
import { getInitials } from '../utils/helpers';

const Layout = ({ children }) => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const studentNav = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/videos', icon: FiVideo, label: 'All Courses' },
    { to: '/bookmarks', icon: FiBookmark, label: 'Bookmarks' },
  ];

  const adminNav = [
    { to: '/admin', icon: FiShield, label: 'Admin Overview' },
    { to: '/admin/videos', icon: FiVideo, label: 'Manage Videos' },
    { to: '/admin/students', icon: FiUsers, label: 'Manage Students' },
    { to: '/dashboard', icon: FiHome, label: 'Student View' },
  ];

  const navLinks = isAdmin ? adminNav : studentNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-dark-900 flex gradient-bg">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-dark-800 border-r border-white/5 z-40 
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/5">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-primary-600/30">
              GV
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">GVCC Learning</p>
              <p className="text-gray-500 text-xs">Portal</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-5 right-4 lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 flex-1 sidebar-gradient">
          {isAdmin && (
            <p className="text-xs text-primary-400 font-semibold uppercase tracking-widest px-3 mb-2">Admin</p>
          )}
          {navLinks.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all duration-200 group
                ${isActive(to)
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <Icon size={18} className={isActive(to) ? 'text-primary-400' : 'text-gray-500 group-hover:text-gray-300'} />
              {label}
              {isActive(to) && <FiChevronRight className="ml-auto text-primary-400" size={14} />}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 bg-dark-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-gray-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl text-sm transition-all duration-200"
          >
            <FiLogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-dark-900/80 backdrop-blur-md border-b border-white/5 px-4 lg:px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white transition-colors p-1"
          >
            <FiMenu size={22} />
          </button>

          <div className="flex items-center gap-3 ml-auto">
            {isAdmin && (
              <span className="text-xs bg-primary-600/20 text-primary-400 border border-primary-600/30 px-2.5 py-1 rounded-full font-medium">
                Admin
              </span>
            )}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-xs font-bold text-white">
              {getInitials(user?.name)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
