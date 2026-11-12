import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Volume2, 
  Trash2, 
  Download, 
  RotateCcw, 
  Layers, 
  CheckCircle2, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ReframeCard, CategoryId } from '../types/reframe';
import { CATEGORIES } from '../data/defaultCards';
import { soundEffects } from '../utils/soundEffects';
import { speechEngine } from '../utils/speechSynthesis';

interface LeitnerVaultProps {
  cards: ReframeCard[];
  onAddCard: (card: Omit<ReframeCard, 'id' | 'box' | 'intervalDays' | 'lastReviewedAt' | 'nextDueAt' | 'timesReviewed' | 'timesCorrect' | 'streak' | 'isCustom'>) => void;
  onDeleteCard: (cardId: string) => void;
  onResetDeck: () => void;
  onExportJson: () => void;
  onImportJson: (json: string) => boolean;
}

export const LeitnerVault: React.FC<LeitnerVaultProps> = ({
  cards,
  onAddCard,
  onDeleteCard,
  onResetDeck,
  onExportJson,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBoxFilter, setSelectedBoxFilter] = useState<number | 'all'>('all');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New card form state
  const [newDangerPhrase, setNewDangerPhrase] = useState('');
  const [newPowerPhrase, setNewPowerPhrase] = useState('');
  const [newContext, setNewContext] = useState('');
  const [newCategory, setNewCategory] = useState<CategoryId>('gratitude');
  const [newPsychShift, setNewPsychShift] = useState('');
  const [newRationale, setNewRationale] = useState('');
  const [newDeliveryTip, setNewDeliveryTip] = useState('');

  // Box distribution counts
  const boxDistribution = useMemo(() => {
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    cards.forEach(c => {
      const b = Math.min(5, Math.max(1, c.box || 1));
      dist[b] = (dist[b] || 0) + 1;
    });
    return dist;
  }, [cards]);

  // Filtered cards
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      const matchesSearch =
        searchQuery === '' ||
        card.dangerPhrase.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.powerPhrase.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.context.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory;
      const matchesBox = selectedBoxFilter === 'all' || card.box === selectedBoxFilter;

      return matchesSearch && matchesCategory && matchesBox;
    });
  }, [cards, searchQuery, selectedCategory, selectedBoxFilter]);

  const handleSpeak = (text: string) => {
    soundEffects.playKeyClick();
    speechEngine.speak(text);
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDangerPhrase.trim() || !newPowerPhrase.trim()) return;

    soundEffects.playSuccessTone();
    const categoryObj = CATEGORIES.find(c => c.id === newCategory);

    onAddCard({
      category: newCategory,
      categoryLabel: categoryObj?.name || 'Custom Reframe',
      dangerPhrase: newDangerPhrase.trim(),
      powerPhrase: newPowerPhrase.trim(),
      context: newContext.trim() || 'Custom communication scenario',
      psychologicalShift: newPsychShift.trim() || 'Strategic Reframe',
      rationale: newRationale.trim() || 'Reframing subconscious defaults into constructive leadership communication.',
      deliveryTip: newDeliveryTip.trim() || 'Speak with calm authority and steady pacing.',
    });

    // Reset form
    setNewDangerPhrase('');
    setNewPowerPhrase('');
    setNewContext('');
    setNewPsychShift('');
    setNewRationale('');
    setNewDeliveryTip('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 font-mono">
      {/* Header & Vault Summary */}
      <div className="border border-zinc-800 bg-zinc-950 rounded-lg p-5 sm:p-6 mb-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-zinc-100 mb-1">
              <Layers className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg sm:text-xl font-bold tracking-wider text-zinc-100">
                LEITNER RETENTION VAULT
              </h2>
            </div>
            <p className="text-xs text-zinc-400">
              Systematic 5-tier spaced repetition storage. Cards migrate to higher intervals as recall strengthens over time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEffects.playKeyClick();
                setIsAddModalOpen(true);
              }}
              className="px-3.5 py-2 rounded bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-sm"
            >
              <Plus className="w-4 h-4 text-amber-600" />
              <span>ADD REFRAME</span>
            </button>
            <button
              onClick={() => {
                soundEffects.playKeyClick();
                onExportJson();
              }}
              title="Export backup JSON"
              className="p-2 rounded border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 text-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 5-Box Leitner Grid Distribution Visualizer (Monochrome with subtle amber accent indicator) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-4">
          {[1, 2, 3, 4, 5].map(boxNum => {
            const count = boxDistribution[boxNum] || 0;
            const isSelected = selectedBoxFilter === boxNum;
            const intervals: Record<number, string> = { 1: '1 DAY', 2: '2 DAYS', 3: '4 DAYS', 4: '7 DAYS', 5: '14 DAYS' };
            const labels: Record<number, string> = { 1: 'NOVICE', 2: 'RECALL', 3: 'ANCHOR', 4: 'FLUENT', 5: 'MASTERED' };

            return (
              <button
                key={boxNum}
                onClick={() => {
                  soundEffects.playKeyClick();
                  setSelectedBoxFilter(prev => prev === boxNum ? 'all' : boxNum);
                }}
                className={`p-3 rounded border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-zinc-400 bg-zinc-900 shadow-sm'
                    : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className={`font-bold ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                    BOX {boxNum}
                  </span>
                  <span className="text-[10px] text-zinc-500">{intervals[boxNum]}</span>
                </div>
                <div className="text-xl font-bold text-zinc-100 tabular-nums mb-1">
                  {count}
                </div>
                <div className="text-[10px] text-zinc-500 tracking-wider">
                  {labels[boxNum]}
                </div>
              </button>
            );
          })}
        </div>

        {selectedBoxFilter !== 'all' && (
          <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800">
            <span>FILTERING BY BOX {selectedBoxFilter}</span>
            <button
              onClick={() => setSelectedBoxFilter('all')}
              className="text-zinc-200 hover:underline cursor-pointer"
            >
              SHOW ALL BOXES
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar (Monochrome) */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search phrases, scenarios, or keywords..."
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none font-mono"
          />
        </div>

        {/* Category Pills (Clean monochrome segmented buttons) */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => {
              soundEffects.playKeyClick();
              setSelectedCategory('all');
            }}
            className={`px-2.5 py-1.5 text-xs rounded border transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:text-zinc-200'
            }`}
          >
            ALL ({cards.length})
          </button>
          {CATEGORIES.map(cat => {
            const count = cards.filter(c => c.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  soundEffects.playKeyClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-2.5 py-1.5 text-xs rounded border transition-colors cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:text-zinc-200'
                }`}
              >
                {cat.name.split(' ')[0].toUpperCase()} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards List (Monochrome rows) */}
      <div className="space-y-3">
        {filteredCards.length === 0 ? (
          <div className="border border-zinc-800 bg-zinc-950 p-8 rounded text-center text-zinc-500">
            <p className="text-sm mb-2">NO REFRAMES MATCH CRITERIA</p>
            <p className="text-xs">Adjust search query or filter parameters to inspect cards.</p>
          </div>
        ) : (
          filteredCards.map((card) => {
            const isExpanded = expandedCardId === card.id;

            return (
              <div
                key={card.id}
                className="border border-zinc-800 hover:border-zinc-700 bg-zinc-950 rounded-lg transition-all overflow-hidden"
              >
                {/* Header row */}
                <div 
                  onClick={() => {
                    soundEffects.playKeyClick();
                    setExpandedCardId(prev => prev === card.id ? null : card.id);
                  }}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 mb-1">
                      <span className="text-zinc-200 font-bold">[BOX {card.box}]</span>
                      <span>·</span>
                      <span>{card.categoryLabel.toUpperCase()}</span>
                      <span>·</span>
                      <span className="hidden sm:inline">STREAK: {card.streak}</span>
                      {card.isCustom && (
                        <span className="text-amber-400 font-bold">[CUSTOM]</span>
                      )}
                    </div>

                    {/* Compact preview comparison */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm">
                      <div className="text-zinc-400 line-through truncate">
                        "{card.dangerPhrase}"
                      </div>
                      <span className="hidden sm:inline text-zinc-600">→</span>
                      <div className="text-zinc-100 font-bold truncate">
                        "{card.powerPhrase}"
                      </div>
                    </div>
                  </div>

                  {/* Actions & expand toggle */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(card.powerPhrase);
                      }}
                      className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                      title="Listen to reframe"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <div className="text-zinc-500">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-zinc-850 bg-zinc-900/30 text-xs space-y-3">
                    
                    {/* Scenario */}
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-zinc-500 mb-1 font-bold">
                        SITUATION CONTEXT:
                      </div>
                      <div className="text-zinc-300 italic">
                        "{card.context}"
                      </div>
                    </div>

                    {/* Psychological Shift & Rationale */}
                    <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded">
                      <div className="text-[11px] uppercase tracking-wider text-zinc-200 mb-1 font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                        <span>THE PSYCHOLOGY: {card.psychologicalShift}</span>
                      </div>
                      <p className="text-zinc-300 leading-relaxed">
                        {card.rationale}
                      </p>
                    </div>

                    {/* Delivery Advice */}
                    <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded">
                      <div className="text-[11px] uppercase tracking-wider text-zinc-200 mb-1 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                        <span>VOCAL DELIVERY TIP:</span>
                      </div>
                      <p className="text-zinc-300 leading-relaxed">
                        {card.deliveryTip}
                      </p>
                    </div>

                    {/* Leitner metadata footer */}
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800">
                      <div>
                        NEXT DUE: {card.lastReviewedAt ? new Date(card.nextDueAt).toLocaleDateString() : 'IMMEDIATE'} · REVIEWS: {card.timesReviewed}
                      </div>
                      
                      {card.isCustom && (
                        <button
                          onClick={() => {
                            soundEffects.playAgainTone();
                            onDeleteCard(card.id);
                          }}
                          className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>DELETE CARD</span>
                        </button>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Utility Options */}
      <div className="mt-8 pt-4 border-t border-zinc-850 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
        <div>
          STORAGE: LOCAL STORAGE PERSISTENCE · {cards.length} TOTAL CARDS
        </div>
        <button
          onClick={() => {
            if (window.confirm('Reset all cards to initial defaults? Custom reframes will be cleared.')) {
              soundEffects.playKeyClick();
              onResetDeck();
            }
          }}
          className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET DECK TO DEFAULTS</span>
        </button>
      </div>

      {/* Add Custom Reframe Modal (Monochrome) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-750 rounded-lg max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
              <div className="text-sm font-bold text-zinc-100 tracking-wider">
                [+] CREATE STRATEGIC REFRAME CARD
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-200 cursor-pointer"
              >
                [ESC]
              </button>
            </div>

            <form onSubmit={handleCreateCard} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-zinc-400 mb-1 font-bold">
                  COMMUNICATION CATEGORY:
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as CategoryId)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:border-zinc-500 focus:outline-none cursor-pointer"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-bold">
                  DON'T SAY (THE DANGER PHRASE):
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sorry to bother you with this..."
                  value={newDangerPhrase}
                  onChange={(e) => setNewDangerPhrase(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:border-zinc-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-bold">
                  SAY INSTEAD (THE POWER REFRAME):
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Do you have 2 minutes for a quick alignment?"
                  value={newPowerPhrase}
                  onChange={(e) => setNewPowerPhrase(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white focus:border-zinc-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">
                  SITUATIONAL CONTEXT TRIGGER:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Approaching a teammate on Slack or at their workstation."
                  value={newContext}
                  onChange={(e) => setNewContext(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:border-zinc-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">
                  PSYCHOLOGICAL SHIFT:
                </label>
                <input
                  type="text"
                  placeholder="e.g. From Inconvenience to Respectful Request"
                  value={newPsychShift}
                  onChange={(e) => setNewPsychShift(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:border-zinc-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded border border-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-bold cursor-pointer"
                >
                  SAVE REFRAME CARD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
