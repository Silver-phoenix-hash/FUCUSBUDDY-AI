
import React, { useState } from 'react';
import { SummaryResult } from '../types';
import { summarizeMaterial } from '../services/geminiService';

const SummaryTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSummarize = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    try {
      const data = await summarizeMaterial(input);
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <i className="fas fa-compress mr-3 text-indigo-400"></i>
          Smart Summarizer
        </h3>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste complex text or lecture notes here..."
          className="w-full h-32 bg-slate-800/50 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-blue-500 transition-colors mb-4 resize-none"
        />
        <button
          onClick={handleSummarize}
          disabled={isLoading || !input.trim()}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/20"
        >
          {isLoading ? <i className="fas fa-circle-notch animate-spin mr-2"></i> : <i className="fas fa-sparkles mr-2"></i>}
          Summarize Material
        </button>
      </div>

      {summary && (
        <div className="glass rounded-3xl p-8 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 border-indigo-500/20">
          <h4 className="text-2xl font-bold text-white mb-2">{summary.title}</h4>
          <p className="text-slate-300 mb-6 leading-relaxed italic">{summary.content}</p>
          
          <div className="space-y-3">
            <h5 className="font-bold text-sm uppercase tracking-widest text-indigo-400">Key Takeaways</h5>
            <ul className="space-y-2">
              {summary.keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start">
                  <i className="fas fa-check-circle text-indigo-500 mt-1 mr-3 text-xs"></i>
                  <span className="text-slate-200 text-sm">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!summary && !isLoading && (
        <div className="text-center py-10 opacity-30">
          <i className="fas fa-file-alt text-5xl mb-3"></i>
          <p>Summary will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default SummaryTool;
