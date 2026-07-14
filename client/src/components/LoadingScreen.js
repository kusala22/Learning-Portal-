import React from 'react';

const LoadingScreen = () => (
  <div className="min-h-screen bg-dark-900 flex items-center justify-center">
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-primary-600/30"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin"></div>
      </div>
      <p className="text-gray-400 text-sm font-medium">Loading GVCC Learning Portal...</p>
    </div>
  </div>
);

export default LoadingScreen;
