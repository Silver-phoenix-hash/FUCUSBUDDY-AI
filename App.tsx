
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppMode, Task, StudySession, PomodoroPhase } from './types';
import FocusTimer from './components/FocusTimer';
import ChatWindow from './components/ChatWindow';
import TaskList from './components/TaskList';
import FlashcardTools from './components/FlashcardTools';
import SummaryTool from './components/SummaryTool';
import DistractionList from './components/DistractionList';
import StudyMapTool from './components/StudyMapTool';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type StudyTab = 'timer' | 'flashcards' | 'summary' | 'roadmap' | 'blocking';

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

  const chartData = [
    { day: 'Mon', mins: 45 }, { day: 'Tue', mins: 30 }, { day: 'Wed', mins: 60 },
    { day: 'Thu', mins: 25 }, { day: 'Fri', mins: 90 }, { day: 'Sat', mins: 120 },
    { day: 'Sun', mins: 15 },
  ];

  const toggleLockdown = async () => {
    if (!isLocked) {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        setIsLocked(true);
        setMode(AppMode.STUDYING);
        setStudyTab('timer');
        setIsTimerActive(true);
        setDistractionCount(0);
      } catch (err) {
        console.error("Fullscreen failed:", err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
      setIsLocked(false);
      setIsTimerActive(false);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isLocked && pomodoroPhase === 'work' && isTimerActive) {
        setDistractionCount(prev => prev + 1);
        console.warn("Distraction detected! Stay focused on your goals.");
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsLocked(false);
        setMode(AppMode.DASHBOARD);
        setIsTimerActive(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isLocked, pomodoroPhase, isTimerActive]);

  const handleTimerComplete = useCallback(() => {
    if (pomodoroPhase === 'work') {
      const focusScore = Math.max(0, 100 - (distractionCount * 10));
      alert(`Work session complete! Focus Score: ${focusScore}%. Distractions: ${distractionCount}`);
      setPomodoroPhase('break');
      const newSession: StudySession = {
        id: Math.random().toString(),
        startTime: Date.now() - (studyTime * 60000),
        endTime: Date.now(),
        durationMinutes: studyTime,
        tasksCompleted: tasks.filter(t => t.completed).length,
        distractionCount: distractionCount,
        subject: "General Study"
      };
      setSessions(prev => [newSession, ...prev]);
    } else {
      alert("Break's over! Ready to lock back in?");
      setPomodoroPhase('work');
      setDistractionCount(0);
    }
    setIsTimerActive(false);
  }, [pomodoroPhase, studyTime, tasks, distractionCount]);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <i className="fas fa-brain text-white text-2xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              FocusBuddy <span className="text-blue-500">AI</span>
            </h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Digital Sanctuary</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {!isLocked && (
            <div className="flex space-x-2 bg-slate-800/50 p-1 rounded-xl">
              <button 
                onClick={() => setMode(AppMode.DASHBOARD)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mode === AppMode.DASHBOARD ? 'bg-slate-700 text-white shadow-inner' : 'text-slate-400 hover:text-white'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setMode(AppMode.STUDYING)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${mode === AppMode.STUDYING ? 'bg-slate-700 text-white shadow-inner' : 'text-slate-400 hover:text-white'}`}
              >
                Study
              </button>
            </div>
          )}
          
          <button 
            onClick={toggleLockdown}
            className={`px-6 py-2 rounded-xl font-bold transition-all flex items-center shadow-lg ${
              isLocked 
                ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20' 
                : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/25'
            }`}
          >
            <i className={`fas ${isLocked ? 'fa-lock-open' : 'fa-lock'} mr-2`}></i>
            {isLocked ? 'Exit Focus' : 'Enter Focus'}
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        <div className="lg:col-span-8 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {mode === AppMode.DASHBOARD ? (
            <>
              <div className="glass rounded-3xl p-8 bg-gradient-to-br from-blue-600/10 to-indigo-600/10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Welcome back, Scholar.</h2>
                    <p className="text-slate-400">You've completed <span className="text-blue-400 font-bold">{sessions.length || 12} sessions</span> this week.</p>
                  </div>
                  <div className="flex space-x-4">
                    <div className="bg-slate-800/80 p-4 rounded-2xl border border-white/5">
                      <p className="text-xs text-slate-500 uppercase font-bold">Total Hours</p>
                      <p className="text-2xl font-bold">24.5h</p>
                    </div>
                    <div className="bg-slate-800/80 p-4 rounded-2xl border border-white/5">
                      <p className="text-xs text-slate-500 uppercase font-bold">Focus Score</p>
                      <p className="text-2xl font-bold text-blue-400">92%</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorMins" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis dataKey="day" stroke="#64748b" axisLine={false} tickLine={false} />
                      <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="mins" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMins)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass rounded-3xl p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center">
                    <i className="fas fa-history mr-3 text-slate-500"></i> Recent Sessions
                  </h3>
                  <div className="space-y-4">
                    {sessions.length === 0 ? (
                      <p className="text-slate-500 text-sm italic">Start studying to see your history!</p>
                    ) : (
                      sessions.slice(0, 3).map(session => (
                        <div key={session.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                          <div>
                            <p className="font-semibold text-sm">{session.subject}</p>
                            <p className="text-xs text-slate-500">{session.durationMinutes} mins • {session.distractionCount} distractions</p>
                          </div>
                          <div className={`text-xs font-bold px-2 py-1 rounded ${session.distractionCount === 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                            {session.distractionCount === 0 ? 'Perfect' : `${100 - (session.distractionCount * 10)}% Focus`}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="glass rounded-3xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-blue-500/20"></div>
                  <h3 className="font-bold text-lg mb-4 text-blue-400">Study Roadmap</h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    Turn your goal and materials into a visual journey. Gemini will chart your path to mastery.
                  </p>
                  <button onClick={() => {setMode(AppMode.STUDYING); setStudyTab('roadmap');}} className="text-blue-400 text-sm font-bold flex items-center hover:text-blue-300 transition-colors">
                    Start Mapping <i className="fas fa-arrow-right ml-2"></i>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col h-full space-y-6">
              {!isLocked && (
                <div className="flex space-x-4 border-b border-white/5 pb-2 overflow-x-auto no-scrollbar">
                  {(['timer', 'roadmap', 'flashcards', 'summary', 'blocking'] as StudyTab[]).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setStudyTab(tab)}
                      className={`pb-2 px-1 text-sm font-bold capitalize transition-all border-b-2 whitespace-nowrap ${
                        studyTab === tab ? 'text-blue-400 border-blue-400' : 'text-slate-500 border-transparent hover:text-slate-300'
                      }`}
                    >
                      {tab === 'blocking' ? 'Blocking' : tab}
                    </button>
                  ))}
                </div>
              )}

              {studyTab === 'timer' && (
                <div className="flex flex-col space-y-6">
                  <div className="flex-1 glass rounded-3xl p-8 flex flex-col items-center justify-center relative min-h-[500px]">
                    {isLocked && (
                      <div className="absolute top-6 left-6 flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-red-500 animate-pulse">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span className="text-xs font-bold uppercase tracking-widest">Phone Locked</span>
                        </div>
                        {distractionCount > 0 && (
                          <div className="text-xs font-bold bg-red-500/20 text-red-400 px-3 py-1 rounded-full border border-red-500/30">
                            {distractionCount} {distractionCount === 1 ? 'Distraction' : 'Distractions'}!
                          </div>
                        )}
                      </div>
                    )}
                    
                    <FocusTimer 
                      durationMinutes={pomodoroPhase === 'work' ? studyTime : breakTime} 
                      isActive={isTimerActive} 
                      onComplete={handleTimerComplete}
                      phase={pomodoroPhase}
                    />

                    <div className="mt-12 flex flex-col items-center space-y-6 w-full">
                      {!isLocked && (
                        <div className="flex flex-col md:flex-row gap-6 w-full justify-center">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] uppercase font-bold text-slate-500 mb-2">Work Interval</span>
                            <div className="flex items-center bg-slate-800/50 rounded-2xl p-2 border border-white/5">
                              {[15, 25, 45, 60].map(m => (
                                <button key={m} onClick={() => setStudyTime(m)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${studyTime === m ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
                                  {m}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] uppercase font-bold text-slate-500 mb-2">Break duration</span>
                            <div className="flex items-center bg-slate-800/50 rounded-2xl p-2 border border-white/5">
                              {[5, 10, 15].map(m => (
                                <button key={m} onClick={() => setBreakTime(m)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${breakTime === m ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
                                  {m}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <button 
                        onClick={() => setIsTimerActive(!isTimerActive)}
                        className={`px-12 py-4 rounded-2xl font-black text-xl transition-all shadow-xl tracking-wider ${
                          isTimerActive 
                            ? 'bg-slate-700 text-white hover:bg-slate-600' 
                            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20'
                        }`}
                      >
                        {isTimerActive ? 'PAUSE' : 'START SESSION'}
                      </button>
                    </div>
                  </div>
                  <TaskList tasks={tasks} setTasks={setTasks} />
                </div>
              )}

              {studyTab === 'flashcards' && <FlashcardTools />}
              {studyTab === 'summary' && <SummaryTool />}
              {studyTab === 'roadmap' && <StudyMapTool />}
              {studyTab === 'blocking' && <DistractionList blacklist={blacklist} setBlacklist={setBlacklist} />}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col h-full max-h-[calc(100vh-200px)]">
          <ChatWindow />
        </div>
      </main>

      <footer className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-slate-500 text-xs">
        <p>&copy; 2024 FocusBuddy AI. Your distraction-free study zone.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Methodology</a>
          <a href="#" className="hover:text-white transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
