import React, { useState, useEffect } from 'react';
import { PLAYLISTS, ALL_TRACKS, getYoutubeMusicUrl, getYoutubeSearchUrl } from '../lib/tracks';
import { Search, X, Play, Heart, Music, ExternalLink } from 'lucide-react';

export default function PlaylistDrawer({
  isOpen,
  onClose,
  currentTrackId,
  onSelectTrack,
  likedTrackIds,
  onToggleLike
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, playlists, liked

  // Escape key handler
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const filteredTracks = ALL_TRACKS.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const likedTracks = ALL_TRACKS.filter(t => likedTrackIds.includes(t.id));
  
  const displayTracks = activeTab === 'liked' ? likedTracks : filteredTracks;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      <div 
        className="w-full max-w-md h-full bg-white/10 backdrop-blur-2xl border-l border-white/20 shadow-2xl flex flex-col slide-in-right"
        style={{
          boxShadow: '-10px 0 30px rgba(0,0,0,0.3)',
          animation: 'slide-in-right 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
        }}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white tracking-tight flex items-center gap-2">
            <Music className="w-6 h-6 text-purple-400" />
            Library
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-purple-400 transition-colors" />
            <input 
              type="text"
              placeholder="Search tracks or artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/50 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 flex gap-2 mb-4">
          {['all', 'playlists', 'liked'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' 
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {activeTab === 'playlists' ? (
            <div className="space-y-4">
              {PLAYLISTS.map(playlist => (
                <div key={playlist.id} className="mb-8">
                  <h3 className="text-white/80 font-medium mb-3 uppercase tracking-wider text-xs">{playlist.name}</h3>
                  <div className="space-y-2">
                    {playlist.tracks.map(track => {
                      const isCurrent = currentTrackId === track.id;
                      const isLiked = likedTrackIds.includes(track.id);
                      return (
                        <TrackCard 
                          key={track.id}
                          track={track}
                          isCurrent={isCurrent}
                          isLiked={isLiked}
                          onSelect={() => onSelectTrack(track.id)}
                          onToggleLike={(e) => {
                            e.stopPropagation();
                            onToggleLike(track.id);
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {displayTracks.length > 0 ? (
                displayTracks.map(track => (
                  <TrackCard 
                    key={track.id}
                    track={track}
                    isCurrent={currentTrackId === track.id}
                    isLiked={likedTrackIds.includes(track.id)}
                    onSelect={() => onSelectTrack(track.id)}
                    onToggleLike={(e) => {
                      e.stopPropagation();
                      onToggleLike(track.id);
                    }}
                  />
                ))
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-white/50 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <Music className="w-8 h-8 opacity-50" />
                  </div>
                  <p>No tracks found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TrackCard({ track, isCurrent, isLiked, onSelect, onToggleLike }) {
  return (
    <div 
      onClick={onSelect}
      className={`group relative flex items-center p-3 rounded-xl cursor-pointer transition-all duration-300 border ${
        isCurrent 
          ? 'bg-purple-500/20 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
          : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
      }`}
    >
      <div className="w-12 h-12 rounded-lg bg-black/40 overflow-hidden mr-4 relative flex-shrink-0 flex items-center justify-center border border-white/5">
        <img src={track.cover} alt={track.title} className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500" />
        {isCurrent && (
          <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center backdrop-blur-[2px]">
            <div className="flex space-x-1 items-end h-4">
              <span className="w-1 bg-white h-full animate-[bounce_1s_infinite]"></span>
              <span className="w-1 bg-white h-2/3 animate-[bounce_1s_infinite_0.2s]"></span>
              <span className="w-1 bg-white h-4/5 animate-[bounce_1s_infinite_0.4s]"></span>
            </div>
          </div>
        )}
        {!isCurrent && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Play className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0 mr-4">
        <h4 className={`truncate font-medium transition-colors ${isCurrent ? 'text-purple-300' : 'text-white group-hover:text-purple-200'}`}>
          {track.title}
        </h4>
        <p className="text-white/50 text-sm truncate">{track.artist}</p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <a 
          href={getYoutubeMusicUrl(track.videoId)}
          target="_blank"
          rel="noreferrer"
          className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          onClick={e => e.stopPropagation()}
          title="Open in YouTube Music"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
        <button 
          onClick={onToggleLike}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white/50 hover:text-white'}`} />
        </button>
      </div>
    </div>
  );
}
