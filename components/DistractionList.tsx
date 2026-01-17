
import React, { useState } from 'react';

interface DistractionListProps {
  blacklist: string[];
  setBlacklist: (list: string[]) => void;
}

const DistractionList: React.FC<DistractionListProps> = ({ blacklist, setBlacklist }) => {
  const [inputValue, setInputValue] = useState('');

  const addDistraction = () => {
    if (!inputValue.trim()) return;
    if (!blacklist.includes(inputValue.trim())) {
      setBlacklist([...blacklist, inputValue.trim()]);
    }
    setInputValue('');
  };

  const removeDistraction = (item: string) => {
    setBlacklist(blacklist.filter(i => i !== item));
  };

  const commonDistractions = ['Instagram', 'TikTok', 'Twitter', 'YouTube', 'Discord', 'Reddit'];

  return (
    <div className="glass rounded-3xl p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <i className="fas fa-ban mr-3 text-red-400"></i>
        Distraction Blacklist
      </h3>
      <p className="text-xs text-slate-400 mb-4">
        Specify apps or sites to "block". FocusBuddy will monitor your focus and penalize distractions.
      </p>

      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addDistraction()}
          placeholder="App or website name..."
          className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-500"
        />
        <button
          onClick={addDistraction}
          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 rounded-xl transition-colors border border-red-500/30"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {blacklist.map(item => (
          <span 
            key={item} 
            className="flex items-center bg-slate-800 border border-white/5 px-3 py-1 rounded-full text-xs text-slate-300"
          >
            {item}
            <button 
              onClick={() => removeDistraction(item)}
              className="ml-2 text-slate-500 hover:text-red-400"
            >
              <i className="fas fa-times"></i>
            </button>
          </span>
        ))}
      </div>

      <div className="pt-4 border-t border-white/5">
        <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Quick Add</p>
        <div className="flex flex-wrap gap-2">
          {commonDistractions.filter(d => !blacklist.includes(d)).map(d => (
            <button
              key={d}
              onClick={() => setBlacklist([...blacklist, d])}
              className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-400 px-2 py-1 rounded-md border border-white/5 transition-colors"
            >
              + {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DistractionList;
