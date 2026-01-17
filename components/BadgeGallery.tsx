
import React from 'react';
import { Badge } from '../types';

interface BadgeGalleryProps {
  badges: Badge[];
}

const BadgeGallery: React.FC<BadgeGalleryProps> = ({ badges }) => {
  return (
    <div className="glass rounded-3xl p-6">
      <h3 className="font-bold text-lg mb-6 flex items-center">
        <i className="fas fa-medal mr-3 text-yellow-500"></i> Achievement Gallery
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {badges.map(badge => (
          <div 
            key={badge.id} 
            className={`flex flex-col items-center p-4 rounded-2xl border transition-all duration-500 ${
              badge.unlocked 
                ? 'bg-slate-800/80 border-white/10 scale-100 opacity-100' 
                : 'bg-slate-900/30 border-white/5 opacity-40 grayscale scale-95'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 text-2xl shadow-lg ${
              badge.unlocked ? badge.color : 'bg-slate-800 text-slate-600'
            }`}>
              <i className={`fas ${badge.icon}`}></i>
            </div>
            <p className={`text-[11px] font-black text-center uppercase tracking-tight ${badge.unlocked ? 'text-white' : 'text-slate-600'}`}>
              {badge.name}
            </p>
            <p className="text-[9px] text-slate-500 text-center leading-tight mt-1">
              {badge.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgeGallery;
