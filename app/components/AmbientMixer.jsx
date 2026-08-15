import React, { useEffect } from 'react';
import { CloudRain, Flame, Wind, Coffee, X, VolumeX } from 'lucide-react';
import { ambientEngine } from '../lib/ambient';

const SOUNDS = [
  { id: 'rain', name: 'Rain', icon: CloudRain, color: 'bg-blue-400', ring: 'focus:ring-blue-400' },
  { id: 'crackle', name: 'Fire', icon: Flame, color: 'bg-orange-400', ring: 'focus:ring-orange-400' },
  { id: 'wind', name: 'Wind', icon: Wind, color: 'bg-teal-400', ring: 'focus:ring-teal-400' },
  { id: 'cafe', name: 'Cafe', icon: Coffee, color: 'bg-amber-600', ring: 'focus:ring-amber-600' }
];

export default function AmbientMixer({ isOpen, onClose, volumes, onVolumeChange }) {
  
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleChange = (id, val) => {
    onVolumeChange(id, val);
    ambientEngine.setVolume(id, val);
  };

  const handleMuteAll = () => {
    ambientEngine.stopAll();
    Object.keys(volumes).forEach(id => onVolumeChange(id, 0));
  };

  const isAnyPlaying = Object.values(volumes).some(v => v > 0);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      <div 
        className="w-full max-w-sm bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl relative slide-in-up"
        style={{ animation: 'slide-in-up 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards' }}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-white tracking-tight mb-1">Ambient Mixer</h2>
          <p className="text-white/50 text-sm">Blend sounds to create your perfect environment</p>
        </div>

        <div className="space-y-6">
          {SOUNDS.map(sound => {
            const Icon = sound.icon;
            const volume = volumes[sound.id] || 0;
            const isActive = volume > 0;
            
            return (
              <div key={sound.id} className="group flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${isActive ? `${sound.color} bg-opacity-20 shadow-[0_0_15px_rgba(255,255,255,0.1)]` : 'bg-white/5 group-hover:bg-white/10'}`}>
                  <Icon className={`w-6 h-6 transition-colors ${isActive ? sound.color.replace('bg-', 'text-') : 'text-white/50'}`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/80 font-medium text-sm">{sound.name}</span>
                    <span className="text-white/40 text-xs font-mono">{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => handleChange(sound.id, parseFloat(e.target.value))}
                    className={`w-full h-2 rounded-full appearance-none bg-white/10 outline-none transition-all duration-300 ${sound.ring}`}
                    style={{
                      background: `linear-gradient(to right, var(--tw-gradient-stops))`,
                      '--tw-gradient-from': isActive ? 'currentColor' : 'rgba(255,255,255,0.2)',
                      '--tw-gradient-to': 'rgba(255,255,255,0.1)',
                      '--tw-gradient-stops': `var(--tw-gradient-from) ${volume * 100}%, var(--tw-gradient-to) ${volume * 100}%`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex justify-center">
          <button
            onClick={handleMuteAll}
            disabled={!isAnyPlaying}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              isAnyPlaying 
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' 
                : 'bg-white/5 text-white/30 cursor-not-allowed border border-transparent'
            }`}
          >
            <VolumeX className="w-4 h-4" />
            Mute All
          </button>
        </div>
      </div>
    </div>
  );
}
