
import React, { useState } from 'react';
import { StudyEvent } from '../types';

interface StudyCalendarProps {
  events: StudyEvent[];
  onAddEvent: (event: StudyEvent) => void;
  onRemoveEvent: (id: string) => void;
}

const StudyCalendar: React.FC<StudyCalendarProps> = ({ events, onAddEvent, onRemoveEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const days = [];
  const totalDays = daysInMonth(year, month);
  const offset = firstDayOfMonth(year, month);

  // Padding for start of month
  for (let i = 0; i < offset; i++) {
    days.push(null);
  }
  for (let i = 1; i <= totalDays; i++) {
    days.push(i);
  }

  const handleDayClick = (day: number) => {
    const d = new Date(year, month, day);
    const iso = d.toISOString().split('T')[0];
    setSelectedDate(iso);
    setShowAddModal(true);
  };

  const saveEvent = () => {
    if (!newTitle.trim() || !selectedDate) return;
    onAddEvent({
      id: Math.random().toString(36).substr(2, 9),
      title: newTitle,
      date: selectedDate,
      type: 'session'
    });
    setNewTitle('');
    setShowAddModal(false);
  };

  const getEventsForDay = (day: number) => {
    const d = new Date(year, month, day);
    const iso = d.toISOString().split('T')[0];
    return events.filter(e => e.date === iso);
  };

  return (
    <div className="glass rounded-3xl p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg flex items-center">
          <i className="fas fa-calendar-days mr-3 text-blue-400"></i> Study Schedule
        </h3>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-bold text-slate-300">{monthName} {year}</span>
          <div className="flex space-x-1">
            <button onClick={prevMonth} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
              <i className="fas fa-chevron-left text-xs"></i>
            </button>
            <button onClick={nextMonth} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
              <i className="fas fa-chevron-right text-xs"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-[10px] font-black uppercase text-slate-500 py-1">{d}</div>
        ))}
        {days.map((day, idx) => {
          const dayEvents = day ? getEventsForDay(day) : [];
          const isToday = day && new Date().toDateString() === new Date(year, month, day).toDateString();
          
          return (
            <div 
              key={idx} 
              onClick={() => day && handleDayClick(day)}
              className={`min-h-[60px] p-1 rounded-xl border transition-all cursor-pointer flex flex-col ${
                day 
                  ? 'bg-slate-800/20 border-white/5 hover:border-blue-500/50 hover:bg-slate-800/40' 
                  : 'border-transparent'
              } ${isToday ? 'border-blue-500/50 bg-blue-500/5' : ''}`}
            >
              {day && (
                <>
                  <span className={`text-[10px] font-bold self-end mb-1 ${isToday ? 'text-blue-400' : 'text-slate-500'}`}>{day}</span>
                  <div className="flex flex-col space-y-1 overflow-hidden">
                    {dayEvents.map(e => (
                      <div 
                        key={e.id} 
                        className={`text-[8px] truncate px-1.5 py-0.5 rounded border ${
                          e.type === 'milestone' ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' : 
                          e.type === 'deadline' ? 'bg-red-500/20 border-red-500/30 text-red-300' : 
                          'bg-blue-500/20 border-blue-500/30 text-blue-300'
                        }`}
                      >
                        {e.title}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md rounded-3xl z-20 flex items-center justify-center p-6">
          <div className="w-full max-w-xs space-y-4">
            <h4 className="font-bold text-center">Schedule for {selectedDate}</h4>
            <input 
              autoFocus
              type="text" 
              placeholder="Session title..." 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-blue-500 outline-none"
            />
            <div className="flex space-x-2">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-bold transition-all">Cancel</button>
              <button onClick={saveEvent} className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold transition-all">Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyCalendar;
