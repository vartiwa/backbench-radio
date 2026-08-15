import React, { useEffect, useState, useRef } from 'react';
import { Timer, X, Play, Square } from 'lucide-react';

const TIMER_OPTIONS = [
  { label: '15m', seconds: 15 * 60 },
  { label: '30m', seconds: 30 * 60 },
  { label: '45m', seconds: 45 * 60 },
  { label: '1h', seconds: 60 * 60 },
  { label: '2h', seconds: 120 * 60 }
];

export default function SleepTimer({
  isOpen,
  onClose,
  onTimerExpire,
  activeTimerSeconds,
  setActiveTimerSeconds
}) {
  const [timeLeft, setTimeLeft] = useState(activeTimerSeconds);
  const timerRef = useRef(null);

  // Sync state with props when modal opens or activeTimerSeconds changes
  useEffect(() => {
    setTimeLeft(activeTimerSeconds);
  }, [activeTimerSeconds, isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Internal countdown mechanism if activeTimerSeconds is set
  useEffect(() => {
    if (activeTimerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            onTimerExpire();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setTimeLeft(0);
    }

    return () => clearInterval(timerRef.current);
  }, [activeTimerSeconds, onTimerExpire]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleStartTimer = (seconds) => {
    setActiveTimerSeconds(seconds);
    setTimeLeft(seconds);
    onClose();
  };

  const handleStopTimer = () => {
    setActiveTimerSeconds(0);
    setTimeLeft(0);
    onClose();
  };

  const formatTime = (seconds) => {
    if (!seconds) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isTimerActive = activeTimerSeconds > 0;
  
  // Calculate stroke dasharray for circular progress
  // Circumference = 2 * Math.PI * r (r=60 -> ~377)
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const progress = isTimerActive ? (timeLeft / activeTimerSeconds) : 0;
  const strokeDashoffset = isTimerActive ? circumference - (progress * circumference) : 0;

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

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Timer className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-semibold text-white tracking-tight mb-1">Sleep Timer</h2>
          <p className="text-white/50 text-sm">Music and ambient sounds will stop automatically</p>
        </div>

        {isTimerActive ? (
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-40 h-40 flex items-center justify-center mb-6">
              {/* Background circle */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle 
                  cx="80" 
                  cy="80" 
                  r={radius} 
                  stroke="currentColor" 
                  strokeWidth="6" 
                  fill="transparent" 
                  className="text-white/10" 
                />
                {/* Progress circle */}
                <circle 
                  cx="80" 
                  cy="80" 
                  r={radius} 
                  stroke="currentColor" 
                  strokeWidth="6" 
                  fill="transparent" 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="text-indigo-400 transition-all duration-1000 ease-linear" 
                />
              </svg>
              <div className="text-3xl font-light text-white font-mono tracking-tight">
                {formatTime(timeLeft)}
              </div>
            </div>
            
            <button
              onClick={handleStopTimer}
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
            >
              <Square className="w-4 h-4 fill-current" />
              Stop Timer
            </button>
          </div>
        ) : (
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-2 gap-3">
              {TIMER_OPTIONS.slice(0, 4).map(option => (
                <button
                  key={option.seconds}
                  onClick={() => handleStartTimer(option.seconds)}
                  className="py-3 px-4 rounded-xl bg-white/5 hover:bg-indigo-500/20 border border-transparent hover:border-indigo-500/30 text-white/80 hover:text-indigo-300 transition-all duration-300 font-medium"
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => handleStartTimer(TIMER_OPTIONS[4].seconds)}
              className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-indigo-500/20 border border-transparent hover:border-indigo-500/30 text-white/80 hover:text-indigo-300 transition-all duration-300 font-medium flex items-center justify-center gap-2"
            >
              <Timer className="w-4 h-4" />
              {TIMER_OPTIONS[4].label}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
