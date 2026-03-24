import React, { useState, useRef, useEffect } from 'react';
import { Play, Maximize, RotateCcw } from 'lucide-react';

// Extract YouTube video ID from various URL formats
const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const trimmed = url.trim();

  // Match /embed/VIDEO_ID
  let match = trimmed.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  // Match ?v=VIDEO_ID
  match = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  // Match youtu.be/VIDEO_ID
  match = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (match) return match[1];

  return null;
};

const VideoPlayer = ({ url, onEnded }) => {
  const videoId = getYouTubeVideoId(url);
  const iframeRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  useEffect(() => {
    if (videoId) {
      // Use highest quality thumbnail available
      setThumbnailUrl(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
    }
  }, [videoId]);

  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  if (!url || !videoId) {
    return (
      <div className="w-full aspect-video bg-gray-900 flex items-center justify-center rounded-xl border border-white/5">
        <p className="text-gray-500 font-bold text-sm">ไม่พบลิงก์วิดีโอ</p>
      </div>
    );
  }

  // Show thumbnail with play button before starting
  if (!hasStarted) {
    return (
      <div
        className="relative w-full aspect-video bg-slate-900 rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] cursor-pointer group"
        onClick={() => setHasStarted(true)}
        onContextMenu={handleContextMenu}
      >
        {/* Thumbnail with subtle zoom on hover */}
        <img
          src={thumbnailUrl}
          alt="Video thumbnail"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => { e.target.style.display = 'none'; }}
        />

        {/* Graduated dark overlay for cinematic depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:bg-black/10 transition-colors duration-500"></div>

        {/* Premium Play Button - Glassmorphism Style */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Outer Pulse Ring */}
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            
            {/* Main Button Container */}
            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl border border-white/30 text-white rounded-full flex items-center justify-center pl-1 shadow-[0_0_40px_rgba(255,255,255,0.2)] transform group-hover:scale-110 group-hover:bg-white/30 transition-all duration-500">
              <Play size={44} fill="currentColor" className="drop-shadow-lg" />
            </div>
          </div>
        </div>

        {/* Subtle Label - Elegant & Professional */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 glass px-5 py-2 rounded-full text-[11px] font-bold text-white uppercase tracking-[0.2em] opacity-80 group-hover:opacity-100 transition-all border border-white/20 shadow-xl">
          Start Learning
        </div>
      </div>
    );
  }

  // After clicking play, show the iframe
  return (
    <div
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10"
      onContextMenu={handleContextMenu}
    >
      <iframe
        ref={iframeRef}
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
        title="วิดีโอบทเรียน"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{ border: 0 }}
      ></iframe>
    </div>
  );
};

export default VideoPlayer;
