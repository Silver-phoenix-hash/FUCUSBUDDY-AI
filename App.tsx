
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppMode, Task, StudySession, PomodoroPhase, UserStats, Badge, AppNotification, StudyEvent } from './types';
import FocusTimer from './components/FocusTimer';
import ChatWindow from './components/ChatWindow';
import TaskList from './components/TaskList';
import FlashcardTools from './components/FlashcardTools';
import SummaryTool from './components/SummaryTool';
import DistractionList from './components/DistractionList';
import StudyMapTool from './components/StudyMapTool';
import BadgeGallery from './components/BadgeGallery';
import NotificationSystem from './components/NotificationSystem';
import StudyCalendar from './components/StudyCalendar';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type StudyTab = 'timer' | 'roadmap' | 'flashcards' | 'summary' | 'blocking';

const INITIAL_BADGES: Badge[] = [
  { id: 'first_step', name: 'First Step', description: 'Complete your first study session', icon: 'fa-shoe-prints', color: 'bg-blue-500 text-white', unlocked: false },
  { id: 'focus_king', name: 'Focus King', description: 'Perfect session with 0 distractions', icon: 'fa-crown', color: 'bg-yellow-500 text-white', unlocked: false },
  { id: 'century', name: 'Century Club', description: 'Earn 100 Focus Points', icon: 'fa-hundred-points', color: 'bg-indigo-500 text-white', unlocked: false },
  { id: 'streak_3', name: 'On Fire', description: 'Maintain a 3-day study streak', icon: 'fa-fire', color: 'bg-orange-500 text-white', unlocked: false },
  { id: 'marathon', name: 'Marathoner', description: 'Complete a 60-min session', icon: 'fa-bolt', color: 'bg-purple-500 text-white', unlocked: false },
  { id: 'polymath', name: 'Polymath', description: 'Create a study roadmap', icon: 'fa-brain', color: 'bg-green-500 text-white', unlocked: false },
];

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.DASHBOARD);
  const [studyTab, setStudyTab] = useState<StudyTab>('timer');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [studyTime, setStudyTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>('work');
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [blacklist, setBlacklist] = useState<string[]>(['Instagram', 'TikTok', 'YouTube']);
  const [distractionCount, setDistractionCount] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<StudyEvent[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Resize listener for responsive shell
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Gamification State
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('focusbuddy_stats');
    return saved ? JSON.parse(saved) : { totalPoints: 0, streak: 0, unlockedBadges: [] };
  });
  
  const [badges, setBadges] = useState<Badge[]>(() => {
    return INITIAL_BADGES.map(b => ({
      ...b,
      unlocked: stats.unlockedBadges.includes(b.id)
    }));
  });

  useEffect(() => {
    localStorage.setItem('focusbuddy_stats', JSON.stringify(stats));
    setBadges(prev => prev.map(b => ({ ...b, unlocked: stats.unlockedBadges.includes(b.id) })));
  }, [stats]);

  const addNotification = (title: string, message: string, type: AppNotification['type'] = 'info', icon: string = 'fa-bell') => {
    const newNote: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      type,
      icon
    };
    setNotifications(prev => [newNote, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unlockBadge = (id: string) => {
    if (!stats.unlockedBadges.includes(id)) {
      setStats(prev => ({
        ...prev,
        unlockedBadges: [...prev.unlockedBadges, id]
      }));
      const badge = INITIAL_BADGES.find(b => b.id === id);
      if (badge) {
        addNotification('Badge Unlocked!', badge.name, 'achievement', badge.icon);
      }
    }
  };

  const handleTimerComplete = useCallback(() => {
    if (pomodoroPhase === 'work') {
      const focusScore = Math.max(0, 100 - (distractionCount * 10));
      const pointsEarned = Math.floor((studyTime * (focusScore / 100)));
      
      const today = new Date().toISOString().split('T')[0];
      let newStreak = stats.streak;
      if (stats.lastActiveDay !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        newStreak = stats.lastActiveDay === yesterdayStr ? stats.streak + 1 : 1;
      }

      setStats(prev => ({
        ...prev,
        totalPoints: prev.totalPoints + pointsEarned,
        streak: newStreak,
        lastActiveDay: today
      }));

      addNotification('Session Complete!', `Earned ${pointsEarned} points. Streak: ${newStreak} days.`, 'success', 'fa-trophy');

      unlockBadge('first_step');
      if (distractionCount === 0) unlockBadge('focus_king');
      if (stats.totalPoints + pointsEarned >= 100) unlockBadge('century');
      if (newStreak >= 3) unlockBadge('streak_3');

      setPomodoroPhase('break');
      const newSession: StudySession = {
        id: Math.random().toString(),
        startTime: Date.now() - (studyTime * 60000),
        endTime: Date.now(),
        durationMinutes: studyTime,
        tasksCompleted: tasks.filter(t => t.completed).length,
        distractionCount: distractionCount,
        subject: "Study Session"
      };
      setSessions(prev => [newSession, ...prev]);
    } else {
      addNotification("Break Over", "Time to lock back in!", 'warning', 'fa-hourglass-start');
      setPomodoroPhase('work');
      setDistractionCount(0);
    }
    setIsTimerActive(false);
  }, [pomodoroPhase, studyTime, tasks, distractionCount, stats]);

  const toggleLockdown = async () => {
    if (!isLocked) {
      try {
        if (!isMobile && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        setIsLocked(true);
        setMode(AppMode.STUDYING);
        setStudyTab('timer');
        setIsTimerActive(true);
        addNotification('Focus Mode Active', 'Sanctuary locked. Points deducted if you leave.', 'info', 'fa-lock');
      } catch (err) {
        setIsLocked(true);
      }
    } else {
      if (!isMobile && document.exitFullscreen) {
        await document.exitFullscreen();
      }
      setIsLocked(false);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isLocked && pomodoroPhase === 'work' && isTimerActive) {
        setDistractionCount(prev => prev + 1);
        addNotification('Distraction!', 'Stay in the app to maintain your points!', 'warning', 'fa-triangle-exclamation');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isLocked, pomodoroPhase, isTimerActive]);

  const chartData = [
    { day: 'Mon', mins: 45 }, { day: 'Tue', mins: 30 }, { day: 'Wed', mins: 60 },
    { day: 'Thu', mins: 25 }, { day: 'Fri', mins: 90 }, { day: 'Sat', mins: 120 },
    { day: 'Sun', mins: 15 },
  ];

  return (
    <div className={`min-h-screen flex flex-col ${isLocked ? 'overflow-hidden' : ''}`}>
      <NotificationSystem notifications={notifications} removeNotification={removeNotification} />
      
      {/* Desktop Navigation Header */}
      {!isMobile && (
        <header className="px-8 py-6 flex justify-between items-center glass sticky top-0 z-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <i className="fas fa-brain text-white text-lg"></i>
            </div>
            <h1 className="text-xl font-black tracking-tight">FocusBuddy <span className="text-blue-500">AI</span></h1>
          </div>
          
          <div className="flex items-center space-x-6">
            <nav className="flex bg-slate-800/50 p-1 rounded-xl">
              <button 
                onClick={() => setMode(AppMode.DASHBOARD)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === AppMode.DASHBOARD ? 'bg-slate-700 text-white shadow-inner' : 'text-slate-400'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setMode(AppMode.STUDYING)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === AppMode.STUDYING ? 'bg-slate-700 text-white shadow-inner' : 'text-slate-400'}`}
              >
                Study Center
              </button>
            </nav>
            <button onClick={toggleLockdown} className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center ${isLocked ? 'bg-red-500/10 text-red-500 border border-red-500/50' : 'bg-blue-600 text-white'}`}>
              <i className={`fas ${isLocked ? 'fa-lock-open' : 'fa-lock'} mr-2`}></i>
              {isLocked ? 'Exit Focus' : 'Focus Mode'}
            </button>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 ${isMobile ? 'pb-24' : ''}`}>
        <div className="lg:col-span-8 space-y-6 overflow-y-auto custom-scrollbar">
          
          {isMobile && mode === AppMode.DASHBOARD && (
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black">Dashboard</h2>
              <div className="flex space-x-2">
                 <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-white/5 text-center">
                    <span className="text-[10px] text-orange-400 font-black"><i className="fas fa-fire"></i> {stats.streak}</span>
                 </div>
                 <div className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-white/5 text-center">
                    <span className="text-[10px] text-blue-400 font-black">LVL {Math.floor(stats.totalPoints / 100) + 1}</span>
                 </div>
              </div>
            </div>
          )}

          {mode === AppMode.DASHBOARD ? (
            <>
              <div className="glass rounded-3xl p-6 md:p-8 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 animate-slide-up">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold mb-1">Stay Sharp.</h2>
                      <p className="text-slate-400 text-sm">Total Mastery: <span className="text-blue-400 font-bold">{stats.totalPoints} EXP</span></p>
                    </div>
                    {!isMobile && (
                      <div className="flex space-x-3 mt-4 md:mt-0">
                         <div className="bg-slate-800/80 p-3 rounded-2xl border border-white/5 text-center min-w-[80px]">
                            <p className="text-[9px] text-slate-500 uppercase font-bold">Streak</p>
                            <p className="text-lg font-bold text-orange-400">{stats.streak}D</p>
                         </div>
                         <div className="bg-slate-800/80 p-3 rounded-2xl border border-white/5 text-center min-w-[80px]">
                            <p className="text-[9px] text-slate-500 uppercase font-bold">Points</p>
                            <p className="text-lg font-bold text-blue-400">{stats.totalPoints}</p>
                         </div>
                      </div>
                    )}
                 </div>
                 
                 <div className="h-48 md:h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis dataKey="day" stroke="#64748b" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                      <Area type="monotone" dataKey="mins" stroke="#3b82f6" strokeWidth={3} fillOpacity={0.1} fill="#3b82f6" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <StudyCalendar 
                events={calendarEvents} 
                onAddEvent={(e) => setCalendarEvents(prev => [...prev, e])} 
                onRemoveEvent={(id) => setCalendarEvents(prev => prev.filter(e => e.id !== id))}
              />

              <BadgeGallery badges={badges} />
            </>
          ) : (
            <div className="space-y-6 animate-slide-up">
              {!isLocked && (
                <div className="flex space-x-2 p-1 bg-slate-800/40 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
                  {(['timer', 'roadmap', 'flashcards', 'summary', 'blocking'] as StudyTab[]).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setStudyTab(tab)}
                      className={`px-4 py-2 text-xs font-black uppercase rounded-xl transition-all whitespace-nowrap ${
                        studyTab === tab ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              )}

              {studyTab === 'timer' && (
                <div className="space-y-6">
                  <div className="glass rounded-3xl p-6 md:p-12 flex flex-col items-center justify-center relative min-h-[400px]">
                    {isLocked && (
                      <div className="absolute top-4 left-4 flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                        <span className="text-[10px] font-black uppercase tracking-tighter text-red-500">Locked Focus Zone</span>
                      </div>
                    )}
                    
                    <FocusTimer 
                      durationMinutes={pomodoroPhase === 'work' ? studyTime : breakTime} 
                      isActive={isTimerActive} 
                      onComplete={handleTimerComplete}
                      phase={pomodoroPhase}
                    />

                    <div className="mt-8 flex flex-col items-center w-full max-w-sm">
                      {!isLocked && (
                        <div className="flex flex-wrap gap-2 justify-center mb-8">
                          {[15, 25, 45, 60].map(m => (
                            <button key={m} onClick={() => setStudyTime(m)} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${studyTime === m ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-white/5 text-slate-400'}`}>
                              {m}m
                            </button>
                          ))}
                        </div>
                      )}
                      
                      <button 
                        onClick={() => setIsTimerActive(!isTimerActive)}
                        className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95 ${
                          isTimerActive ? 'bg-slate-700 text-white' : 'bg-blue-600 text-white shadow-blue-500/20'
                        }`}
                      >
                        {isTimerActive ? 'PAUSE SESSION' : 'START JOURNEY'}
                      </button>
                      
                      {isMobile && !isLocked && (
                        <button onClick={toggleLockdown} className="mt-4 text-xs font-bold text-slate-500 flex items-center">
                          <i className="fas fa-lock mr-2"></i> Enable Full App Lockdown
                        </button>
                      )}
                    </div>
                  </div>
                  <TaskList tasks={tasks} setTasks={setTasks} />
                </div>
              )}

              {studyTab === 'roadmap' && <StudyMapTool onMilestoneAchieved={(t) => addNotification('Milestone!', t, 'success', 'fa-flag')} onScheduleMilestone={(e) => setCalendarEvents(prev => [...prev, e])} />}
              {studyTab === 'flashcards' && <FlashcardTools />}
              {studyTab === 'summary' && <SummaryTool />}
              {studyTab === 'blocking' && <DistractionList blacklist={blacklist} setBlacklist={setBlacklist} />}
            </div>
          )}
        </div>

        {/* AI Chat Side Panel (Desktop) / Hidden on Mobile (Accessible via Nav) */}
        {!isMobile ? (
          <div className="lg:col-span-4 flex flex-col h-[calc(100vh-160px)] sticky top-28">
            <ChatWindow />
          </div>
        ) : (
          mode === AppMode.VOICE_LIVE && (
            <div className="fixed inset-0 z-[100] bg-slate-950 p-4 pb-safe">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black">FocusBuddy AI</h3>
                  <button onClick={() => setMode(AppMode.DASHBOARD)} className="text-slate-500"><i className="fas fa-times"></i></button>
               </div>
               <ChatWindow />
            </div>
          )
        )}
      </main>

      {/* Cross-Platform Bottom Navigation (Mobile Only) */}
      {isMobile && !isLocked && (
        <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 px-6 py-3 flex justify-between items-center z-[90] pb-safe">
          <button onClick={() => setMode(AppMode.DASHBOARD)} className={`flex flex-col items-center ${mode === AppMode.DASHBOARD ? 'text-blue-500' : 'text-slate-500'}`}>
            <i className="fas fa-house text-lg"></i>
            <span className="text-[10px] font-bold mt-1">Home</span>
          </button>
          <button onClick={() => {setMode(AppMode.STUDYING); setStudyTab('timer');}} className={`flex flex-col items-center ${mode === AppMode.STUDYING && studyTab === 'timer' ? 'text-blue-500' : 'text-slate-500'}`}>
            <i className="fas fa-hourglass-half text-lg"></i>
            <span className="text-[10px] font-bold mt-1">Focus</span>
          </button>
          <button onClick={() => setMode(AppMode.VOICE_LIVE)} className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center -mt-10 shadow-xl shadow-blue-500/30 border-4 border-slate-900">
            <i className="fas fa-robot text-white text-xl"></i>
          </button>
          <button onClick={() => {setMode(AppMode.STUDYING); setStudyTab('roadmap');}} className={`flex flex-col items-center ${mode === AppMode.STUDYING && studyTab === 'roadmap' ? 'text-blue-500' : 'text-slate-500'}`}>
            <i className="fas fa-route text-lg"></i>
            <span className="text-[10px] font-bold mt-1">Plan</span>
          </button>
          <button onClick={() => {setMode(AppMode.STUDYING); setStudyTab('flashcards');}} className={`flex flex-col items-center ${mode === AppMode.STUDYING && studyTab === 'flashcards' ? 'text-blue-500' : 'text-slate-500'}`}>
            <i className="fas fa-layer-group text-lg"></i>
            <span className="text-[10px] font-bold mt-1">Study</span>
          </button>
        </nav>
      )}

      {/* App Shell Footer (Desktop) */}
      {!isMobile && (
        <footer className="px-8 py-6 border-t border-white/5 flex justify-between items-center text-slate-500 text-[10px] uppercase font-bold tracking-widest">
          <p>FocusBuddy AI &copy; 2024 • Cross-Platform Study Sanctuary</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-blue-400">Android App</a>
            <a href="#" className="hover:text-blue-400">iOS App</a>
            <a href="#" className="hover:text-blue-400">Desktop Client</a>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
