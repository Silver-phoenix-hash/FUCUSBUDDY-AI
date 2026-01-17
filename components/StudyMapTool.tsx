
import React, { useState } from 'react';
import { StudyMap, StudyStep } from '../types';
import { generateStudyMap } from '../services/geminiService';

const StudyMapTool: React.FC = () => {
  const [goal, setGoal] = useState('');
  const [material, setMaterial] = useState('');
  const [map, setMap] = useState<StudyMap | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleGenerate = async () => {
    if (!goal.trim() || !material.trim()) return;
    setIsLoading(true);
    try {
      const data = await generateStudyMap(goal, material);
      setMap(data);
      setCompletedSteps(new Set());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStep = (index: number) => {
    const next = new Set(completedSteps);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setCompletedSteps(next);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="glass rounded-3xl p-6 border-blue-500/20">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <i className="fas fa-map-location-dot mr-3 text-blue-400"></i>
          Roadmap Generator
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Your Study Goal</label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Master React Fundamentals in 3 days"
              className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 mb-1 block">Study Material (Paste Text from PDFs/Slides)</label>
            <textarea
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="Paste your notes, transcriptions, or document contents here..."
              className="w-full h-32 bg-slate-800/50 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !goal.trim() || !material.trim()}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center space-x-2"
          >
            {isLoading ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-route"></i>}
            <span>GENERATE ROADMAP</span>
          </button>
        </div>
      </div>

      {map && (
        <div className="relative pl-8">
          <h4 className="text-2xl font-black text-white mb-10 flex items-center">
            <span className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded-md mr-3">TARGET</span>
            {map.goal}
          </h4>

          {/* Vertical Line */}
          <div className="absolute left-[15px] top-12 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-slate-800 border-l border-dashed border-white/10"></div>

          <div className="space-y-12">
            {map.milestones.map((step, idx) => {
              const isCompleted = completedSteps.has(idx);
              return (
                <div key={idx} className="relative group">
                  {/* Milestone Node */}
                  <div 
                    onClick={() => toggleStep(idx)}
                    className={`absolute -left-[41px] top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-500 z-10 ${
                      isCompleted 
                        ? 'bg-blue-500 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' 
                        : 'bg-slate-900 border-slate-700'
                    }`}
                  >
                    {isCompleted ? (
                      <i className="fas fa-check text-white text-xs"></i>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500">{idx + 1}</span>
                    )}
                  </div>

                  {/* Content Card */}
                  <div 
                    className={`glass rounded-2xl p-6 transition-all duration-300 border-l-4 cursor-pointer ${
                      isCompleted ? 'border-blue-500 bg-blue-500/5 opacity-60' : 'border-slate-700 hover:border-blue-500/50 bg-white/5'
                    }`}
                    onClick={() => toggleStep(idx)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h5 className={`font-bold text-lg ${isCompleted ? 'text-slate-400 line-through' : 'text-white'}`}>
                        {step.title}
                      </h5>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded-md border border-white/5 font-bold">
                        {step.estimatedHours}h EST
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Finish Node */}
            <div className="relative">
              <div className="absolute -left-[41px] top-0 w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center">
                <i className="fas fa-trophy text-slate-700 text-xs"></i>
              </div>
              <div className="p-6">
                <h5 className="font-bold text-slate-600">Goal Reached</h5>
              </div>
            </div>
          </div>
        </div>
      )}

      {!map && !isLoading && (
        <div className="text-center py-20 opacity-20 border-2 border-dashed border-white/5 rounded-3xl">
          <i className="fas fa-compass text-6xl mb-4 block"></i>
          <p className="font-medium">Define your goal to generate a path.</p>
        </div>
      )}
    </div>
  );
};

export default StudyMapTool;
