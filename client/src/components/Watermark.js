import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Watermark = () => {
  const { user } = useAuth();
  const [position, setPosition] = useState({ top: '10%', left: '10%' });

  // Move watermark randomly every 5 seconds
  useEffect(() => {
    const randomPos = () => ({
      top: `${Math.random() * 70 + 5}%`,
      left: `${Math.random() * 60 + 5}%`,
    });

    const interval = setInterval(() => {
      setPosition(randomPos());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className="watermark"
      style={{
        top: position.top,
        left: position.left,
        opacity: 0.35,
        transform: 'rotate(-20deg)',
        transition: 'top 3s ease, left 3s ease',
      }}
    >
      <p className="text-sm font-semibold">{user?.name}</p>
      <p className="text-xs">{user?.email}</p>
      <p className="text-xs">{dateStr} {timeStr}</p>
    </div>
  );
};

export default Watermark;
