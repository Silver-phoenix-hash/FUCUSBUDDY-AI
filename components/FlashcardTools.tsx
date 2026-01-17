
import React, { useState } from 'react';
import { Flashcard } from '../types';
import { generateFlashcards } from '../services/geminiService';

const FlashcardTools: React.FC = () => {
  const [input, setInput] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [flippedIds, setFlippedIds] = useState<Set<string>>(new Set());

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    try {
      const data = await generateFlashcards(input);
      const cardsWithIds = data.map((c: any) => ({ ...c, id: Math.random().toString(36).substr(2, 9) }));
      setFlashcards(cardsWithIds);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFlip = (id: string) => {
    setFlippedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <i className="fas fa-bolt mr-3 text-yellow-400"></i>
          Flashcard Generator
        </h3>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your notes or topics here to generate study cards..."
          className="w-full h-32 bg-slate-800/50 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-blue-500 transition-colors mb-4 resize-none"
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !input.trim()}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20"
        >
          {isLoading ? <i className="fas fa-circle-notch animate-spin mr-2"></i> : <i className="fas fa-wand-magic-sparkles mr-2"></i>}
          Generate Flashcards
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flashcards.map((card) => (
          <div 
            key={card.id}
            onClick={() => toggleFlip(card.id)}
            className="group h-48 [perspective:1000px] cursor-pointer"
          >
            <div className={`relative h-full w-full transition-all duration-500 [transform-style:preserve-3d] ${flippedIds.has(card.id) ? '[transform:rotateY(180deg)]' : ''}`}>
              {/* Front */}
              <div className="absolute inset-0 bg-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-white/10 [backface-visibility:hidden]">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2">Question</p>
                <p className="text-slate-100 font-medium leading-relaxed">{card.question}</p>
                <div className="absolute bottom-4 right-4 text-slate-600">
                  <i className="fas fa-rotate"></i>
                </div>
              </div>
              {/* Back */}
              <div className="absolute inset-0 bg-blue-600 rounded-2xl p-6 flex flex-col items-center justify-center text-center border border-white/10 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <p className="text-sm font-semibold text-blue-200 uppercase tracking-widest mb-2">Answer</p>
                <p className="text-white font-bold leading-relaxed">{card.answer}</p>
                <div className="absolute bottom-4 left-4 text-blue-400">
                   <i className="fas fa-rotate"></i>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {flashcards.length === 0 && !isLoading && (
        <div className="text-center py-10 opacity-30">
          <i className="fas fa-layer-group text-5xl mb-3"></i>
          <p>Your cards will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default FlashcardTools;
