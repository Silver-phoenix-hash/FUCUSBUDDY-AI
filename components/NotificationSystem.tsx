
import React, { useEffect } from 'react';
import { AppNotification } from '../types';

interface NotificationSystemProps {
  notifications: AppNotification[];
  removeNotification: (id: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col space-y-4 max-w-sm w-full pointer-events-none">
      {notifications.map((note) => (
        <NotificationToast 
          key={note.id} 
          notification={note} 
          onClose={() => removeNotification(note.id)} 
        />
      ))}
    </div>
  );
};

const NotificationToast: React.FC<{ notification: AppNotification, onClose: () => void }> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeStyles = {
    info: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
    success: 'border-green-500/50 bg-green-500/10 text-green-400',
    warning: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400',
    achievement: 'border-purple-500/50 bg-purple-500/10 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
  };

  return (
    <div className={`pointer-events-auto glass border p-4 rounded-2xl flex items-start space-x-4 animate-in slide-in-from-right-full duration-300 shadow-2xl ${typeStyles[notification.type]}`}>
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
        <i className={`fas ${notification.icon}`}></i>
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-sm text-white">{notification.title}</h4>
        <p className="text-xs text-slate-300 mt-1 leading-tight">{notification.message}</p>
      </div>
      <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
        <i className="fas fa-times text-xs"></i>
      </button>
    </div>
  );
};

export default NotificationSystem;
