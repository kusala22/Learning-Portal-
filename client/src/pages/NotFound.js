import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const NotFound = () => (
  <div className="min-h-screen bg-dark-900 flex items-center justify-center text-center p-4 gradient-bg">
    <div className="animate-slide-up">
      <p className="text-8xl font-black text-primary-600/30 mb-4">404</p>
      <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
      <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
        <FiArrowLeft size={15} />
        Go to Dashboard
      </Link>
    </div>
  </div>
);

export default NotFound;
