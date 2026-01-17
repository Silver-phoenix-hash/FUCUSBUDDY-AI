
import React, { useState, useEffect } from 'react';
import { PomodoroPhase } from '../types';

interface FocusTimerProps {
  durationMinutes: number;
  onComplete: () => void;
  isActive: boolean;
  phase: PomodoroPhase;
}

const FocusTimer: React.FC<FocusTimerProps> = ({ durationMinutes, onComplete, isActive, phase }) => {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    setSecondsLeft(durationMinutes * 60);
  }, [durationMinutes]);

  useEffect(() => {
    let interval: number | undefined;
    if (isActive && secondsLeft > 0) {
      interval = window.setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      onComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, onComplete]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((durationMinutes * 60 - secondsLeft) / (durationMinutes * 60)) * 100;
  const phaseColor = phase === 'work' ? 'text-blue-500' : 'text-green-500';
  const phaseBg = phase === 'work' ? 'bg-blue-500/10' : 'bg-green-500/10';

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-72 h-72 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="144"
            cy="144"
            r="132"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-800"
          />
          <circle
            cx="144"
            cy="144"
            r="132"
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={829}
            strokeDashoffset={829 - (829 * progress) / 100}
            strokeLinecap="round"
            className={`${phaseColor} transition-all duration-1000`}
          />
        </svg>
        <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-full ${phaseBg} m-4 backdrop-blur-sm`}>
          <span className="text-6xl font-black tracking-tighter text-white font-mono">
            {formatTime(secondsLeft)}
          </span>
          <span className={`text-sm font-bold uppercase tracking-widest mt-2 ${phaseColor}`}>
            {phase === 'work' ? 'Focusing' : 'Resting'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;
