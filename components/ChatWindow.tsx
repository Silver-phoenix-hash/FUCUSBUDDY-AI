
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AIPersona } from '../types';
import { getGeminiResponse } from '../services/geminiService';

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hey there! I'm your FocusBuddy. Ready to dive deep into your studies?", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [persona, setPersona] = useState<AIPersona>('Standard');
  const [showSettings, setShowSettings] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      history.push({ role: 'user', parts: [{ text: input }] });

      const aiResult = await getGeminiResponse(input, history, {
        useSearch,
        useThinking,
        persona
      });

      setMessages(prev => [...prev, { 
        role: 'model', 
        text: aiResult.text, 
        sources: aiResult.sources,
        timestamp: Date.now() 
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting right now. Let's try again in a moment.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full glass rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-slate-800/80 p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <i className="fas fa-robot text-white"></i>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-slate-800"></div>
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">FocusBuddy <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded ml-1">{persona}</span></h3>
            <p className="text-[10px] text-slate-400">
              {useThinking ? 'Deep Reason Active' : useSearch ? 'Web Search Active' : 'Online'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
           <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${showSettings ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}
          >
            <i className="fas fa-cog"></i>
          </button>
        </div>
      </div>

      {/* Settings Overlay */}
      {showSettings && (
        <div className="bg-slate-800 border-b border-white/10 p-4 animate-in slide-in-from-top duration-200">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">AI Mode</p>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {setUseSearch(!useSearch); setUseThinking(false);}}
                  className={`flex-1 p-2 rounded-xl text-xs font-bold border transition-all ${useSearch ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-slate-900 border-white/5 text-slate-500'}`}
                >
                  <i className="fas fa-search mr-2"></i>Search
                </button>
                <button 
                  onClick={() => {setUseThinking(!useThinking); setUseSearch(false);}}
                  className={`flex-1 p-2 rounded-xl text-xs font-bold border transition-all ${useThinking ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-white/5 text-slate-500'}`}
                >
                  <i className="fas fa-brain mr-2"></i>Deep Reason
                </button>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">Persona & Tone</p>
              <div className="grid grid-cols-2 gap-2">
                {(['Standard', 'Socratic', 'Strict Coach', 'Supportive'] as AIPersona[]).map(p => (
                  <button 
                    key={p}
                    onClick={() => setPersona(p)}
                    className={`p-2 rounded-xl text-[10px] font-bold border transition-all ${persona === p ? 'bg-slate-700 border-slate-400 text-white' : 'bg-slate-900 border-white/5 text-slate-500'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-100 rounded-tl-none border border-white/5'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
              
              {m.sources && m.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Sources:</p>
                  <div className="flex flex-wrap gap-2">
                    {m.sources.map((source, sIdx) => (
                      <a 
                        key={sIdx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] bg-white/5 hover:bg-white/10 text-blue-400 px-2 py-1 rounded-md border border-white/5 transition-colors"
                      >
                        {source.title.length > 20 ? source.title.substring(0, 20) + '...' : source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-600 mt-1 uppercase font-bold tracking-tighter">
              {m.role === 'user' ? 'You' : 'FocusBuddy'} • {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="bg-slate-800 rounded-2xl p-4 flex flex-col items-center space-y-2">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-.5s]"></div>
              </div>
              {useThinking && <p className="text-[10px] text-indigo-400 font-bold uppercase animate-pulse">Running Deep Reasoning...</p>}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-900/50 border-t border-white/10">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={useThinking ? "Ask a complex question..." : "Type your study query..."}
            className="flex-1 bg-slate-800 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder-slate-600"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-blue-500/20"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
        <div className="mt-2 flex justify-center space-x-4">
           {useSearch && (
             <span className="text-[10px] text-blue-400 flex items-center">
               <i className="fas fa-globe mr-1.5"></i> Search Enabled
             </span>
           )}
           {useThinking && (
             <span className="text-[10px] text-indigo-400 flex items-center">
               <i className="fas fa-microchip mr-1.5"></i> Deep Reason Enabled
             </span>
           )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
