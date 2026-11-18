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
import { useTheme } from '../context/ThemeContext';

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
  const { isMaterial, isEditorial, isSlate, isClay, isSaas, isGlass, isBrutal, isObsidian, isNordic, isCyberpunk } = useTheme();
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

    setNewDangerPhrase('');
    setNewPowerPhrase('');
    setNewContext('');
    setNewPsychShift('');
    setNewRationale('');
    setNewDeliveryTip('');
    setIsAddModalOpen(false);
  };

  const brutalBoxColors: Record<number, string> = {
    1: 'bg-[#FFE4E6]',
    2: 'bg-[#FEF9C3]',
    3: 'bg-[#E0F2FE]',
    4: 'bg-[#DCFCE7]',
    5: 'bg-[#FFE500]',
  };

  return (
    <div className={`max-w-5xl mx-auto px-4 py-6 ${isMaterial ? 'font-material' : isEditorial ? 'font-editorial-body' : isSlate || isBrutal || isObsidian || isGlass || isNordic || isSaas || isClay || isCyberpunk ? 'font-sans' : 'font-mono'}`}>
      {/* Header & Vault Summary */}
      <div
        className={
          isMaterial
            ? 'border border-slate-200/80 border-t-4 border-t-[#1565C0] material-card-elevated rounded-xl p-5 sm:p-6 mb-6'
            : isCyberpunk
            ? 'border border-cyan-400/40 border-t-2 border-t-[#00F0FF] cyber-card-elevated rounded-sm p-5 sm:p-6 mb-6'
            : isEditorial
            ? 'border-2 border-[#1D1814] editorial-card rounded-none p-5 sm:p-6 mb-6'
            : isSlate
            ? 'border border-slate-700/80 slate-card rounded-lg p-5 sm:p-6 mb-6'
            : isClay
            ? 'border border-white/90 clay-card rounded-3xl p-5 sm:p-6 mb-6'
            : isSaas
            ? 'border border-slate-200 saas-card rounded-xl p-5 sm:p-6 mb-6'
            : isNordic
            ? 'border border-[#DDD7C8] nordic-card rounded-2xl p-5 sm:p-6 mb-6'
            : isGlass
            ? 'border border-white/20 glass-panel rounded-2xl p-5 sm:p-6 mb-6'
            : isBrutal
            ? 'border-2 border-black bg-white p-5 sm:p-6 mb-6 brutal-shadow-lg'
            : isObsidian
            ? 'border border-[#D4AF37]/25 obsidian-surface p-5 sm:p-6 mb-6'
            : 'border border-zinc-800 bg-zinc-950 rounded-lg p-5 sm:p-6 mb-6 shadow-xl'
        }
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className={isMaterial ? 'w-5 h-5 text-[#1565C0]' : isCyberpunk ? 'w-5 h-5 text-[#00F0FF]' : isEditorial ? 'w-5 h-5 text-[#9B2226]' : isSlate ? 'w-5 h-5 text-teal-400' : isClay ? 'w-5 h-5 text-indigo-500' : isSaas ? 'w-5 h-5 text-indigo-600' : isNordic ? 'w-5 h-5 text-[#527360]' : isGlass ? 'w-5 h-5 text-sky-300' : isBrutal ? 'w-5 h-5 text-black' : isObsidian ? 'w-5 h-5 text-[#D4AF37]' : 'w-5 h-5 text-amber-400'} />
              <h2
                className={
                  isMaterial
                    ? 'text-lg sm:text-xl font-bold tracking-tight text-[#111827]'
                    : isCyberpunk
                    ? 'font-cyber text-lg sm:text-xl font-bold uppercase tracking-wider text-[#E6F4FF]'
                    : isEditorial
                    ? 'font-editorial-display text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1814]'
                    : isSlate
                    ? 'text-lg sm:text-xl font-bold tracking-tight text-slate-100'
                    : isClay
                    ? 'text-lg sm:text-xl font-bold tracking-tight text-[#1E2547]'
                    : isSaas
                    ? 'text-lg sm:text-xl font-bold tracking-tight text-slate-900'
                    : isNordic
                    ? 'text-lg sm:text-xl font-bold tracking-tight text-[#242E28]'
                    : isGlass
                    ? 'text-lg sm:text-xl font-bold tracking-tight text-white'
                    : isBrutal
                    ? 'text-lg sm:text-xl font-black tracking-tight text-black'
                    : isObsidian
                    ? 'font-luxury text-2xl sm:text-3xl font-semibold tracking-wide text-[#F5F0E6]'
                    : 'text-lg sm:text-xl font-bold tracking-wider text-zinc-100'
                }
              >
                LEITNER RETENTION VAULT
              </h2>
            </div>
            <p className={isMaterial ? 'text-xs text-[#475569]' : isCyberpunk ? 'text-xs text-[#9BB8D3]' : isEditorial ? 'text-xs text-[#433A31]' : isSlate ? 'text-xs text-slate-300' : isClay ? 'text-xs text-[#4B5478]' : isSaas ? 'text-xs text-slate-500' : isNordic ? 'text-xs text-[#4E5A53]' : isGlass ? 'text-xs text-slate-300' : isBrutal ? 'text-xs text-zinc-700 font-medium' : isObsidian ? 'text-xs text-[#A39E93]' : 'text-xs text-zinc-400'}>
              Systematic 5-tier spaced repetition storage. Cards migrate to higher intervals as recall strengthens over time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEffects.playKeyClick();
                setIsAddModalOpen(true);
              }}
              className={
                isMaterial
                  ? 'px-4 py-2 rounded-lg bg-[#1565C0] hover:bg-[#0D47A1] text-white border border-[#0D47A1] text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 material-btn'
                  : isCyberpunk
                  ? 'px-4 py-2 rounded-sm bg-gradient-to-r from-[#00F0FF] to-[#FF2A85] text-[#060714] border border-cyan-200/80 font-cyber text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 cyber-btn'
                  : isEditorial
                  ? 'px-4 py-2 rounded-none bg-[#9B2226] hover:bg-[#7F1D1D] text-[#FAF5EA] border border-[#1D1814] shadow-[2px_2px_0_#1D1814] font-mono text-xs font-semibold tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap'
                  : isSlate
                  ? 'px-4 py-2 rounded-md bg-teal-400 hover:bg-teal-300 text-slate-950 border border-teal-300 text-xs font-semibold tracking-wide transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-xs'
                  : isClay
                  ? 'px-4 py-2 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white border border-indigo-400/60 text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 clay-btn'
                  : isSaas
                  ? 'px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600 text-xs font-semibold tracking-wide transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-xs'
                  : isNordic
                  ? 'px-4 py-2 rounded-xl bg-[#527360] hover:bg-[#425F4E] text-[#FDFBF7] border border-[#425F4E] text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-sm'
                  : isGlass
                  ? 'px-4 py-2 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 border border-sky-300 text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-lg shadow-sky-500/20'
                  : isBrutal
                  ? 'px-3.5 py-2 bg-[#FFE500] hover:bg-[#FACC15] text-black border-2 border-black text-xs font-black cursor-pointer flex items-center gap-1.5 whitespace-nowrap brutal-btn'
                  : isObsidian
                  ? 'px-4 py-2 bg-[#D4AF37] hover:bg-[#E5C77B] text-[#070709] border border-[#E5C77B] text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap'
                  : 'px-3.5 py-2 rounded bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shadow-sm'
              }
            >
              <Plus className={isMaterial ? 'w-4 h-4 text-white' : isCyberpunk ? 'w-4 h-4 text-[#060714]' : isEditorial ? 'w-4 h-4 text-[#FAF5EA]' : isSlate ? 'w-4 h-4 text-slate-950' : isClay || isSaas ? 'w-4 h-4 text-white' : isNordic ? 'w-4 h-4 text-[#FDFBF7]' : isGlass ? 'w-4 h-4 text-slate-950' : isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#070709]' : 'w-4 h-4 text-amber-600'} />
              <span>ADD REFRAME</span>
            </button>
            <button
              onClick={() => {
                soundEffects.playKeyClick();
                onExportJson();
              }}
              title="Export backup JSON"
              className={
                isMaterial
                  ? 'p-2 rounded-lg material-well border border-slate-200/80 text-[#475569] hover:text-[#1565C0] hover:bg-[#D5DCE6] text-xs transition-all cursor-pointer material-btn'
                  : isCyberpunk
                  ? 'p-2 rounded-sm bg-[#061926] border border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#0B2A3E] hover:border-[#00F0FF] text-xs transition-all cursor-pointer'
                  : isEditorial
                  ? 'p-2 rounded-none bg-[#FFFDF7] border border-[#1D1814]/60 text-[#1D1814] hover:bg-[#EAE1D0] text-xs transition-colors cursor-pointer'
                  : isSlate
                  ? 'p-2 rounded-md bg-[#0B1220] border border-slate-700 text-slate-300 hover:text-white hover:border-teal-400/50 text-xs transition-colors cursor-pointer'
                  : isClay
                  ? 'p-2 rounded-2xl bg-white border border-white/90 text-[#4B5478] hover:text-[#1E2547] text-xs transition-all cursor-pointer clay-btn-soft'
                  : isSaas
                  ? 'p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 text-xs transition-colors cursor-pointer'
                  : isNordic
                  ? 'p-2 rounded-xl nordic-well border border-[#DDD7C8] text-[#4E5A53] hover:text-[#242E28] hover:border-[#B8CBBF] text-xs transition-all cursor-pointer'
                  : isGlass
                  ? 'p-2 rounded-xl glass-well border border-white/20 text-slate-200 hover:text-white hover:border-sky-300/45 text-xs transition-all cursor-pointer'
                  : isBrutal
                  ? 'p-2 border-2 border-black bg-white text-black hover:bg-[#F4F1EA] text-xs font-bold cursor-pointer brutal-btn'
                  : isObsidian
                  ? 'p-2 border border-[#2A241A] bg-[#070709] text-[#A39E93] hover:text-[#E5C77B] hover:border-[#D4AF37]/40 text-xs transition-colors cursor-pointer'
                  : 'p-2 rounded border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 text-xs transition-colors cursor-pointer'
              }
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 5-Box Leitner Grid Distribution Visualizer */}
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
                className={
                  isMaterial
                    ? `p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E3F2FD] border-[#1565C0] ring-2 ring-[#1565C0]'
                          : 'material-well border-slate-200/80 hover:bg-[#DAE2EE] hover:border-[#1565C0]/40'
                      }`
                    : isCyberpunk
                    ? `p-3 rounded-sm border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#061926] border-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.22)]'
                          : 'cyber-well border-cyan-400/25 hover:border-[#00F0FF]/65'
                      }`
                    : isEditorial
                    ? `p-3 rounded-none border text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'editorial-card-elevated border-2 border-[#9B2226]'
                          : 'editorial-well border-[#B8AD96] hover:border-[#1D1814]'
                      }`
                    : isSlate
                    ? `p-3 rounded-md border text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-teal-950/35 border-teal-400'
                          : 'slate-well border-slate-800 hover:border-teal-400/50'
                      }`
                    : isClay
                    ? `p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E5E9FF] border-indigo-300 shadow-sm'
                          : 'clay-well border-white/70 hover:border-indigo-200'
                      }`
                    : isSaas
                    ? `p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500/15'
                          : 'bg-slate-50/75 border-slate-200 hover:border-indigo-300 hover:bg-white'
                      }`
                    : isNordic
                    ? `p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E7EFEA] border-[#527360] shadow-sm'
                          : 'nordic-well border-[#E2DDD0] hover:border-[#B8CBBF]'
                      }`
                    : isGlass
                    ? `p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'glass-panel-elevated border-sky-300/65'
                          : 'glass-well border-white/15 hover:border-sky-300/40'
                      }`
                    : isBrutal
                    ? `p-3 border-2 border-black text-left cursor-pointer brutal-btn ${
                        isSelected
                          ? `${brutalBoxColors[boxNum]} ring-2 ring-black`
                          : 'bg-[#FFFDF5] hover:bg-[#FEF9C3]'
                      }`
                    : isObsidian
                    ? `p-3 border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#D4AF37] bg-[#14110C] brass-hairline-glow'
                          : 'border-[#2A241A] bg-[#070709] hover:border-[#D4AF37]/40'
                      }`
                    : `p-3 rounded border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-zinc-400 bg-zinc-900 shadow-sm'
                          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                      }`
                }
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span
                    className={
                      isMaterial
                        ? `font-mono uppercase tracking-wider ${isSelected ? 'text-[#1565C0] font-bold' : 'text-[#111827] font-semibold'}`
                        : isCyberpunk
                        ? `font-cyber uppercase tracking-wider ${isSelected ? 'text-[#00F0FF] font-bold' : 'text-[#E6F4FF] font-semibold'}`
                        : isEditorial
                        ? `font-mono uppercase tracking-wider ${isSelected ? 'text-[#9B2226] font-bold' : 'text-[#1D1814] font-semibold'}`
                        : isSlate
                        ? `font-mono uppercase tracking-wider ${isSelected ? 'text-teal-300 font-semibold' : 'text-slate-200 font-medium'}`
                        : isClay
                        ? `font-mono uppercase tracking-wider ${isSelected ? 'text-indigo-600 font-semibold' : 'text-[#1E2547] font-medium'}`
                        : isSaas
                        ? `font-mono uppercase tracking-wider ${isSelected ? 'text-indigo-700 font-semibold' : 'text-slate-700 font-medium'}`
                        : isNordic
                        ? `font-mono uppercase tracking-wider ${isSelected ? 'text-[#2D4739] font-semibold' : 'text-[#242E28] font-medium'}`
                        : isGlass
                        ? `font-mono uppercase tracking-wider ${isSelected ? 'text-sky-300 font-semibold' : 'text-slate-200 font-medium'}`
                        : isBrutal
                        ? 'font-black text-black'
                        : isObsidian
                        ? `font-mono uppercase tracking-wider ${isSelected ? 'text-[#E5C77B] font-semibold' : 'text-[#DDD6C8]'}`
                        : `font-bold ${isSelected ? 'text-white' : 'text-zinc-300'}`
                    }
                  >
                    BOX {boxNum}
                  </span>
                  <span className={isMaterial ? 'text-[10px] font-mono text-[#475569]' : isCyberpunk ? 'text-[10px] font-mono text-[#9BB8D3]' : isEditorial ? 'text-[10px] font-mono text-[#574D42]' : isSlate ? 'text-[10px] font-mono text-slate-400' : isClay ? 'text-[10px] font-mono text-[#647094]' : isSaas ? 'text-[10px] font-mono text-slate-500' : isNordic ? 'text-[10px] font-mono text-[#5C6962]' : isGlass ? 'text-[10px] font-mono text-slate-400' : isBrutal ? 'text-[10px] font-bold text-zinc-700 font-mono' : isObsidian ? 'text-[10px] font-mono text-[#8E877A]' : 'text-[10px] text-zinc-500'}>
                    {intervals[boxNum]}
                  </span>
                </div>
                <div className={isMaterial ? 'text-xl font-bold font-mono text-[#111827] tabular-nums mb-1' : isCyberpunk ? `text-xl font-bold font-mono tabular-nums mb-1 ${boxNum === 5 ? 'text-[#00F5D4]' : isSelected ? 'text-[#00F0FF]' : 'text-[#E6F4FF]'}` : isEditorial ? 'text-xl font-bold font-mono text-[#1D1814] tabular-nums mb-1' : isSlate ? 'text-xl font-bold font-mono text-slate-100 tabular-nums mb-1' : isClay ? 'text-xl font-bold font-mono text-[#1E2547] tabular-nums mb-1' : isSaas ? 'text-xl font-bold font-mono text-slate-900 tabular-nums mb-1' : isNordic ? 'text-xl font-bold font-mono text-[#242E28] tabular-nums mb-1' : isGlass ? 'text-xl font-bold font-mono text-white tabular-nums mb-1' : isBrutal ? 'text-xl font-black text-black tabular-nums mb-1' : isObsidian ? 'text-xl font-mono font-semibold text-[#F5F0E6] tabular-nums mb-1' : 'text-xl font-bold text-zinc-100 tabular-nums mb-1'}>
                  {count}
                </div>
                <div className={isMaterial ? 'text-[10px] font-semibold uppercase tracking-wider text-[#475569]' : isCyberpunk ? `font-cyber text-[10px] font-semibold uppercase tracking-wider ${boxNum === 5 ? 'text-[#5EEAD4]' : 'text-[#9BB8D3]'}` : isEditorial ? 'font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#574D42]' : isSlate ? 'text-[10px] font-medium uppercase tracking-wider text-slate-400' : isClay ? 'text-[10px] font-medium uppercase tracking-wider text-[#647094]' : isSaas ? 'text-[10px] font-medium uppercase tracking-wider text-slate-500' : isNordic ? 'text-[10px] font-medium uppercase tracking-wider text-[#5C6962]' : isGlass ? 'text-[10px] font-medium uppercase tracking-wider text-slate-400' : isBrutal ? 'text-[10px] font-extrabold text-zinc-800 tracking-wider' : isObsidian ? 'text-[10px] uppercase tracking-[0.16em] text-[#A39E93]' : 'text-[10px] text-zinc-500 tracking-wider'}>
                  {labels[boxNum]}
                </div>
              </button>
            );
          })}
        </div>

        {selectedBoxFilter !== 'all' && (
          <div className={isMaterial ? 'flex items-center justify-between text-[11px] uppercase tracking-wider text-[#475569] pt-2.5 border-t border-slate-200 font-semibold' : isCyberpunk ? 'flex items-center justify-between text-[11px] uppercase tracking-wider text-[#9BB8D3] pt-2.5 border-t border-cyan-400/25 font-semibold' : isEditorial ? 'flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-[#574D42] pt-2.5 border-t border-[#C9BFA9]' : isSlate ? 'flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400 pt-2.5 border-t border-slate-800' : isClay ? 'flex items-center justify-between text-[11px] uppercase tracking-wider text-[#647094] pt-2.5 border-t border-indigo-900/10' : isSaas ? 'flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-500 pt-2.5 border-t border-slate-200' : isNordic ? 'flex items-center justify-between text-[11px] uppercase tracking-wider text-[#4E5A53] pt-2.5 border-t border-[#E4DFD4]' : isGlass ? 'flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-300 pt-2.5 border-t border-white/15' : isBrutal ? 'flex items-center justify-between text-xs font-bold text-black pt-2 border-t-2 border-black' : isObsidian ? 'flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-[#A39E93] pt-2.5 border-t border-[#2A241A]' : 'flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800'}>
            <span>FILTERING BY BOX {selectedBoxFilter}</span>
            <button
              onClick={() => setSelectedBoxFilter('all')}
              className={isMaterial ? 'text-[#1565C0] hover:underline cursor-pointer font-bold' : isCyberpunk ? 'text-[#00F0FF] hover:underline cursor-pointer font-cyber font-bold' : isEditorial ? 'text-[#9B2226] hover:underline cursor-pointer font-semibold' : isSlate ? 'text-teal-300 hover:underline cursor-pointer font-semibold' : isClay ? 'text-indigo-600 hover:underline cursor-pointer font-semibold' : isSaas ? 'text-indigo-600 hover:underline cursor-pointer font-semibold' : isNordic ? 'text-[#3B5948] hover:underline cursor-pointer font-semibold' : isGlass ? 'text-sky-300 hover:underline cursor-pointer font-semibold' : isBrutal ? 'text-black underline font-black cursor-pointer' : isObsidian ? 'text-[#E5C77B] hover:underline cursor-pointer font-semibold' : 'text-zinc-200 hover:underline cursor-pointer'}
            >
              SHOW ALL BOXES
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className={isMaterial ? 'w-4 h-4 text-[#1565C0] absolute left-3 top-1/2 -translate-y-1/2' : isCyberpunk ? 'w-4 h-4 text-[#00F0FF] absolute left-3 top-1/2 -translate-y-1/2' : isEditorial ? 'w-4 h-4 text-[#9B2226] absolute left-3 top-1/2 -translate-y-1/2' : isSlate ? 'w-4 h-4 text-teal-400 absolute left-3 top-1/2 -translate-y-1/2' : isClay ? 'w-4 h-4 text-[#647094] absolute left-3.5 top-1/2 -translate-y-1/2' : isSaas ? 'w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2' : isNordic ? 'w-4 h-4 text-[#527360] absolute left-3 top-1/2 -translate-y-1/2' : isGlass ? 'w-4 h-4 text-sky-300 absolute left-3 top-1/2 -translate-y-1/2' : isBrutal ? 'w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2' : isObsidian ? 'w-4 h-4 text-[#C5A059] absolute left-3 top-1/2 -translate-y-1/2' : 'w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2'} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search phrases, scenarios, or keywords..."
            className={
              isMaterial
                ? 'w-full material-card border border-slate-200/80 focus:border-[#1565C0] rounded-lg pl-9 pr-3 py-2 text-xs text-[#111827] placeholder-[#64748B] focus:outline-none'
                : isCyberpunk
                ? 'w-full cyber-well border border-cyan-400/35 focus:border-[#00F0FF] rounded-sm pl-9 pr-3 py-2 text-xs text-[#E6F4FF] placeholder-[#7A95B0] focus:outline-none'
                : isEditorial
                ? 'w-full editorial-card border border-[#1D1814]/50 focus:border-[#9B2226] rounded-none pl-9 pr-3 py-2 text-xs text-[#1D1814] placeholder-[#6E6356] focus:outline-none'
                : isSlate
                ? 'w-full slate-well border border-slate-700/80 focus:border-teal-400 rounded-md pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none'
                : isClay
                ? 'w-full clay-card border border-white/90 focus:border-indigo-300 rounded-2xl pl-10 pr-3.5 py-2 text-xs text-[#1E2547] placeholder-[#647094] focus:outline-none'
                : isSaas
                ? 'w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none shadow-2xs'
                : isNordic
                ? 'w-full nordic-card border border-[#DDD7C8] focus:border-[#527360] rounded-xl pl-9 pr-3 py-2 text-xs text-[#242E28] placeholder-[#7B867F] focus:outline-none'
                : isGlass
                ? 'w-full glass-panel border border-white/20 focus:border-sky-300/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none'
                : isBrutal
                ? 'w-full bg-white border-2 border-black pl-9 pr-3 py-2 text-xs font-bold text-black placeholder-zinc-500 focus:outline-none brutal-shadow-sm'
                : isObsidian
                ? 'w-full bg-[#0B0B0E] border border-[#2A241A] focus:border-[#D4AF37]/60 pl-9 pr-3 py-2 text-xs text-[#F5F0E6] placeholder-[#736D63] focus:outline-none'
                : 'w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-600 rounded pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none font-mono'
            }
          />
        </div>

        {/* Category Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => {
              soundEffects.playKeyClick();
              setSelectedCategory('all');
            }}
            className={
              isMaterial
                ? `px-3 py-1.5 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer whitespace-nowrap shrink-0 material-btn ${
                    selectedCategory === 'all'
                      ? 'bg-[#1565C0] text-white border-[#0D47A1]'
                      : 'material-card text-[#475569] border-slate-200/80 hover:text-[#111827] hover:border-[#1565C0]/40'
                  }`
                : isCyberpunk
                ? `px-3 py-1.5 font-cyber text-[11px] font-semibold uppercase tracking-wider rounded-sm border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedCategory === 'all'
                      ? 'bg-[#061926] text-[#00F0FF] border-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.22)]'
                      : 'cyber-well text-[#9BB8D3] border-cyan-400/25 hover:text-[#E6F4FF] hover:border-[#00F0FF]/60'
                  }`
                : isEditorial
                ? `px-3 py-1.5 font-mono text-[11px] font-semibold rounded-none border transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-[#9B2226] text-[#FAF5EA] border-[#1D1814] shadow-[2px_2px_0_#1D1814]'
                      : 'bg-[#FFFDF7] text-[#433A31] border-[#B8AD96] hover:text-[#1D1814] hover:border-[#1D1814]'
                  }`
                : isSlate
                ? `px-3 py-1.5 text-[11px] font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-teal-400 text-slate-950 border-teal-300 font-semibold'
                      : 'bg-[#0B1220] text-slate-300 border-slate-700/80 hover:text-white hover:border-teal-400/50'
                  }`
                : isClay
                ? `px-3 py-1.5 text-[11px] font-semibold rounded-2xl border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedCategory === 'all'
                      ? 'bg-indigo-500 text-white border-indigo-400/60 clay-btn'
                      : 'clay-card clay-btn-soft text-[#4B5478] border-white/90 hover:text-[#1E2547]'
                  }`
                : isSaas
                ? `px-3 py-1.5 text-[11px] font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300'
                  }`
                : isNordic
                ? `px-3 py-1.5 text-[11px] font-medium rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-[#527360] text-[#FDFBF7] border-[#425F4E] font-semibold shadow-sm'
                      : 'nordic-card text-[#4E5A53] border-[#DDD7C8] hover:text-[#242E28] hover:border-[#B8CBBF]'
                  }`
                : isGlass
                ? `px-3 py-1.5 text-[11px] font-medium rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-sky-400 text-slate-950 border-sky-300 font-semibold shadow-sm'
                      : 'glass-panel text-slate-200 border-white/15 hover:text-white hover:border-white/35'
                  }`
                : isBrutal
                ? `px-2.5 py-1.5 text-xs font-extrabold border-2 border-black cursor-pointer whitespace-nowrap brutal-btn ${
                    selectedCategory === 'all'
                      ? 'bg-[#FFE500] text-black'
                      : 'bg-white text-black hover:bg-[#FEF9C3]'
                  }`
                : isObsidian
                ? `px-2.5 py-1.5 text-[11px] uppercase tracking-[0.12em] border transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-[#D4AF37] text-[#070709] border-[#E5C77B] font-semibold'
                      : 'bg-[#0B0B0E] text-[#A39E93] border-[#2A241A] hover:text-[#F5F0E6] hover:border-[#D4AF37]/40'
                  }`
                : `px-2.5 py-1.5 text-xs rounded border transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === 'all'
                      ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:text-zinc-200'
                  }`
            }
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
                className={
                  isMaterial
                    ? `px-3 py-1.5 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer whitespace-nowrap shrink-0 material-btn ${
                        isSelected
                          ? 'bg-[#1565C0] text-white border-[#0D47A1]'
                          : 'material-card text-[#475569] border-slate-200/80 hover:text-[#111827] hover:border-[#1565C0]/40'
                      }`
                    : isCyberpunk
                    ? `px-3 py-1.5 font-cyber text-[11px] font-semibold uppercase tracking-wider rounded-sm border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        isSelected
                          ? 'bg-[#061926] text-[#00F0FF] border-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.22)]'
                          : 'cyber-well text-[#9BB8D3] border-cyan-400/25 hover:text-[#E6F4FF] hover:border-[#00F0FF]/60'
                      }`
                    : isEditorial
                    ? `px-3 py-1.5 font-mono text-[11px] font-semibold rounded-none border transition-colors cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#9B2226] text-[#FAF5EA] border-[#1D1814] shadow-[2px_2px_0_#1D1814]'
                          : 'bg-[#FFFDF7] text-[#433A31] border-[#B8AD96] hover:text-[#1D1814] hover:border-[#1D1814]'
                      }`
                    : isSlate
                    ? `px-3 py-1.5 text-[11px] font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-teal-400 text-slate-950 border-teal-300 font-semibold'
                          : 'bg-[#0B1220] text-slate-300 border-slate-700/80 hover:text-white hover:border-teal-400/50'
                      }`
                    : isClay
                    ? `px-3 py-1.5 text-[11px] font-semibold rounded-2xl border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                        isSelected
                          ? 'bg-indigo-500 text-white border-indigo-400/60 clay-btn'
                          : 'clay-card clay-btn-soft text-[#4B5478] border-white/90 hover:text-[#1E2547]'
                      }`
                    : isSaas
                    ? `px-3 py-1.5 text-[11px] font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300'
                      }`
                    : isNordic
                    ? `px-3 py-1.5 text-[11px] font-medium rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#527360] text-[#FDFBF7] border-[#425F4E] font-semibold shadow-sm'
                          : 'nordic-card text-[#4E5A53] border-[#DDD7C8] hover:text-[#242E28] hover:border-[#B8CBBF]'
                      }`
                    : isGlass
                    ? `px-3 py-1.5 text-[11px] font-medium rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-sky-400 text-slate-950 border-sky-300 font-semibold shadow-sm'
                          : 'glass-panel text-slate-200 border-white/15 hover:text-white hover:border-white/35'
                      }`
                    : isBrutal
                    ? `px-2.5 py-1.5 text-xs font-extrabold border-2 border-black cursor-pointer whitespace-nowrap brutal-btn ${
                        isSelected
                          ? 'bg-[#FFE500] text-black'
                          : 'bg-white text-black hover:bg-[#FEF9C3]'
                      }`
                    : isObsidian
                    ? `px-2.5 py-1.5 text-[11px] uppercase tracking-[0.12em] border transition-colors cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#D4AF37] text-[#070709] border-[#E5C77B] font-semibold'
                          : 'bg-[#0B0B0E] text-[#A39E93] border-[#2A241A] hover:text-[#F5F0E6] hover:border-[#D4AF37]/40'
                      }`
                    : `px-2.5 py-1.5 text-xs rounded border transition-colors cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-zinc-800 text-zinc-100 border-zinc-700'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-850 hover:text-zinc-200'
                      }`
                }
              >
                {cat.name.split(' ')[0].toUpperCase()} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {filteredCards.length === 0 ? (
          <div
            className={
              isMaterial
                ? 'border border-slate-200/80 material-card rounded-xl p-8 text-center text-[#475569]'
                : isCyberpunk
                ? 'border border-cyan-400/35 cyber-card rounded-sm p-8 text-center text-[#9BB8D3]'
                : isEditorial
                ? 'border-2 border-[#1D1814] editorial-card rounded-none p-8 text-center text-[#574D42]'
                : isClay
                ? 'border border-white/90 clay-card rounded-3xl p-8 text-center text-[#647094]'
                : isSaas
                ? 'border border-slate-200 saas-card rounded-xl p-8 text-center text-slate-500'
                : isNordic
                ? 'border border-[#DDD7C8] nordic-card rounded-2xl p-8 text-center text-[#5C6962]'
                : isGlass
                ? 'border border-white/20 glass-panel rounded-2xl p-8 text-center text-slate-300'
                : isBrutal
                ? 'border-2 border-black bg-white p-8 text-center text-black brutal-shadow'
                : isObsidian
                ? 'border border-[#2A241A] bg-[#0B0B0E] p-8 text-center text-[#A39E93]'
                : isSlate
                ? 'border border-slate-700/80 slate-card rounded-lg p-8 text-center text-slate-400'
                : 'border border-zinc-800 bg-zinc-950 p-8 rounded text-center text-zinc-500'
            }
          >
            <p className="text-sm font-semibold mb-2">NO REFRAMES MATCH CRITERIA</p>
            <p className="text-xs">Adjust search query or filter parameters to inspect cards.</p>
          </div>
        ) : (
          filteredCards.map((card) => {
            const isExpanded = expandedCardId === card.id;

            return (
              <div
                key={card.id}
                className={
                  isMaterial
                    ? 'border border-slate-200/80 hover:border-[#1565C0]/45 material-card rounded-xl transition-all overflow-hidden'
                    : isCyberpunk
                    ? 'border border-cyan-400/30 hover:border-[#00F0FF]/70 cyber-card rounded-sm transition-all overflow-hidden'
                    : isEditorial
                    ? 'border border-[#C9BFA9] hover:border-[#1D1814] editorial-card rounded-none transition-colors overflow-hidden'
                    : isClay
                    ? 'border border-white/90 hover:border-indigo-200 clay-card rounded-3xl transition-all overflow-hidden'
                    : isSaas
                    ? 'border border-slate-200 hover:border-indigo-300 saas-card rounded-xl transition-all overflow-hidden'
                    : isNordic
                    ? 'border border-[#DDD7C8] hover:border-[#B8CBBF] nordic-card rounded-2xl transition-all overflow-hidden'
                    : isGlass
                    ? 'border border-white/18 hover:border-sky-300/40 glass-panel rounded-2xl transition-all overflow-hidden'
                    : isBrutal
                    ? 'border-2 border-black bg-white brutal-shadow-sm transition-all overflow-hidden'
                    : isObsidian
                    ? 'border border-[#2A241A] hover:border-[#D4AF37]/40 bg-[#0B0B0E] transition-all overflow-hidden'
                    : isSlate
                    ? 'border border-slate-700/80 hover:border-teal-400/50 slate-card rounded-lg transition-all overflow-hidden'
                    : 'border border-zinc-800 hover:border-zinc-700 bg-zinc-950 rounded-lg transition-all overflow-hidden'
                }
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
                    <div
                      className={
                        isMaterial
                          ? 'flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-[#475569] mb-1.5 font-semibold'
                          : isCyberpunk
                          ? 'flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[#9BB8D3] mb-1.5 font-semibold'
                          : isEditorial
                          ? 'flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#574D42] mb-1.5'
                          : isClay
                          ? 'flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[#647094] mb-1.5'
                          : isSaas
                          ? 'flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-slate-500 mb-1.5'
                          : isNordic
                          ? 'flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[#5C6962] mb-1.5'
                          : isGlass
                          ? 'flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-slate-400 mb-1.5'
                          : isBrutal
                          ? 'flex items-center gap-2 text-[11px] font-bold text-zinc-700 mb-1'
                          : isObsidian
                          ? 'flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[#8E877A] mb-1.5'
                          : isSlate
                          ? 'flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-slate-400 mb-1.5'
                          : 'flex items-center gap-2 text-[11px] text-zinc-500 mb-1'
                      }
                    >
                      <span className={isMaterial ? 'text-[#1565C0] font-mono font-bold tabular-nums' : isCyberpunk ? 'text-[#00F0FF] font-mono font-bold tabular-nums' : isEditorial ? 'text-[#9B2226] font-mono font-bold tabular-nums' : isClay ? 'text-indigo-600 font-mono font-semibold tabular-nums' : isSaas ? 'text-indigo-600 font-mono font-semibold tabular-nums' : isNordic ? 'text-[#3B5948] font-mono font-semibold' : isGlass ? 'text-sky-300 font-mono font-semibold' : isBrutal ? 'bg-[#FFE500] border border-black px-1 py-0.2 text-black font-black font-mono' : isObsidian ? 'text-[#D4AF37] font-mono font-semibold' : isSlate ? 'text-teal-300 font-mono font-semibold tabular-nums' : 'text-zinc-200 font-bold'}>
                        [BOX {card.box}]
                      </span>
                      <span>·</span>
                      <span>{card.categoryLabel.toUpperCase()}</span>
                      <span>·</span>
                      <span className="hidden sm:inline font-mono tabular-nums">STREAK: {card.streak}</span>
                      {card.isCustom && (
                        <>
                          <span>·</span>
                          <span className={isMaterial ? 'text-[#00695C] font-bold' : isCyberpunk ? 'text-[#FF66B3] font-bold' : isEditorial ? 'text-[#9B2226] font-semibold' : isClay ? 'text-indigo-600 font-semibold' : isSaas ? 'text-indigo-700 font-semibold' : isNordic ? 'text-[#3B5948] font-semibold' : isGlass ? 'text-sky-200 font-semibold' : isBrutal ? 'bg-[#7DD3FC] border border-black px-1 text-black font-black' : isObsidian ? 'text-[#E5C77B] font-semibold' : isSlate ? 'text-teal-200 font-semibold' : 'text-amber-400 font-bold'}>
                            [CUSTOM]
                          </span>
                        </>
                      )}
                    </div>

                    {/* Compact preview comparison */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm">
                      <div className={isMaterial ? 'text-[#64748B] line-through truncate' : isCyberpunk ? 'text-[#FF85C0]/80 line-through truncate' : isEditorial ? 'text-[#6E6356] line-through truncate' : isClay ? 'text-[#647094] line-through truncate' : isSaas ? 'text-slate-400 line-through truncate' : isNordic ? 'text-[#5C6962] line-through truncate' : isGlass ? 'text-slate-400 line-through truncate' : isBrutal ? 'text-zinc-600 line-through truncate font-medium' : isObsidian ? 'text-[#8E877A] line-through truncate' : isSlate ? 'text-slate-400 line-through truncate' : 'text-zinc-400 line-through truncate'}>
                        "{card.dangerPhrase}"
                      </div>
                      <span className={isMaterial ? 'hidden sm:inline text-[#1565C0] font-bold' : isCyberpunk ? 'hidden sm:inline text-[#00F0FF] font-bold' : isEditorial ? 'hidden sm:inline text-[#9B2226] font-bold' : isClay ? 'hidden sm:inline text-indigo-500' : isSaas ? 'hidden sm:inline text-indigo-500' : isNordic ? 'hidden sm:inline text-[#527360]' : isGlass ? 'hidden sm:inline text-sky-300' : isBrutal ? 'hidden sm:inline text-black font-black' : isObsidian ? 'hidden sm:inline text-[#D4AF37]' : isSlate ? 'hidden sm:inline text-teal-400' : 'hidden sm:inline text-zinc-600'}>→</span>
                      <div className={isMaterial ? 'text-[#111827] font-bold truncate' : isCyberpunk ? 'font-cyber text-[#E6F4FF] font-semibold tracking-wide truncate' : isEditorial ? 'font-editorial-display text-base text-[#1D1814] font-bold truncate' : isClay ? 'text-[#1E2547] font-semibold truncate' : isSaas ? 'text-slate-900 font-semibold truncate' : isNordic ? 'text-[#242E28] font-semibold truncate' : isGlass ? 'text-white font-semibold truncate' : isBrutal ? 'text-black font-black truncate' : isObsidian ? 'text-[#F3E5AB] font-medium truncate' : isSlate ? 'text-slate-100 font-semibold truncate' : 'text-zinc-100 font-bold truncate'}>
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
                      className={
                        isMaterial
                          ? 'p-1.5 rounded-lg material-well border border-slate-200/80 text-[#475569] hover:text-[#1565C0] hover:border-[#1565C0]/40 transition-all cursor-pointer material-btn'
                          : isCyberpunk
                          ? 'p-1.5 rounded-sm bg-[#061926] border border-[#00F0FF]/35 text-[#00F0FF] hover:bg-[#0B2A3E] hover:border-[#00F0FF] transition-all cursor-pointer'
                          : isEditorial
                          ? 'p-1.5 rounded-none bg-[#FFFDF7] border border-[#1D1814]/50 text-[#1D1814] hover:text-[#9B2226] hover:border-[#9B2226] transition-colors cursor-pointer'
                          : isClay
                          ? 'p-2 rounded-2xl clay-well border border-white/80 text-[#4B5478] hover:text-indigo-600 hover:border-indigo-200 transition-all cursor-pointer clay-btn-soft'
                          : isSaas
                          ? 'p-1.5 rounded-lg saas-well border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-all cursor-pointer'
                          : isNordic
                          ? 'p-1.5 rounded-xl nordic-well border border-[#DDD7C8] text-[#4E5A53] hover:text-[#2D4739] hover:border-[#B8CBBF] transition-all cursor-pointer'
                          : isGlass
                          ? 'p-1.5 rounded-xl glass-well border border-white/15 text-slate-300 hover:text-sky-300 hover:border-sky-300/45 transition-all cursor-pointer'
                          : isBrutal
                          ? 'p-1.5 border-2 border-black bg-[#F4F1EA] hover:bg-[#7DD3FC] text-black transition-colors cursor-pointer'
                          : isObsidian
                          ? 'p-1.5 border border-[#2A241A] bg-[#070709] text-[#A39E93] hover:text-[#E5C77B] hover:border-[#D4AF37]/40 transition-colors cursor-pointer'
                          : isSlate
                          ? 'p-1.5 rounded-md slate-well border border-slate-700/80 text-slate-300 hover:text-teal-300 hover:border-teal-400/50 transition-colors cursor-pointer'
                          : 'p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer'
                      }
                      title="Listen to reframe"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <div className={isMaterial ? 'text-[#475569]' : isCyberpunk ? 'text-[#00F0FF]' : isEditorial ? 'text-[#574D42]' : isClay ? 'text-[#647094]' : isSaas ? 'text-slate-400' : isNordic ? 'text-[#5C6962]' : isGlass ? 'text-slate-300' : isBrutal ? 'text-black' : isObsidian ? 'text-[#A39E93]' : isSlate ? 'text-slate-400' : 'text-zinc-500'}>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div
                    className={
                      isMaterial
                        ? 'px-4 pb-4 pt-3 border-t border-slate-200 bg-[#F8FAFC] text-xs space-y-3'
                        : isCyberpunk
                        ? 'px-4 pb-4 pt-3 border-t border-cyan-400/25 bg-[#050816]/90 text-xs space-y-3'
                        : isEditorial
                        ? 'px-4 pb-4 pt-3 border-t border-[#C9BFA9] bg-[#F3ECE0]/85 text-xs space-y-3'
                        : isClay
                        ? 'px-4 pb-4 pt-3 border-t border-indigo-900/10 bg-[#EEF2FA]/80 text-xs space-y-3'
                        : isSaas
                        ? 'px-4 pb-4 pt-3 border-t border-slate-200 bg-slate-50/90 text-xs space-y-3'
                        : isNordic
                        ? 'px-4 pb-4 pt-3 border-t border-[#E4DFD4] bg-[#F6F3EC]/75 text-xs space-y-3'
                        : isGlass
                        ? 'px-4 pb-4 pt-3 border-t border-white/15 bg-slate-950/35 text-xs space-y-3'
                        : isBrutal
                        ? 'px-4 pb-4 pt-3 border-t-2 border-black bg-[#FFFDF5] text-xs space-y-3'
                        : isObsidian
                        ? 'px-4 pb-4 pt-3 border-t border-[#2A241A] bg-[#070709] text-xs space-y-3'
                        : isSlate
                        ? 'px-4 pb-4 pt-3 border-t border-slate-800 bg-[#0B1220]/90 text-xs space-y-3'
                        : 'px-4 pb-4 pt-1 border-t border-zinc-850 bg-zinc-900/30 text-xs space-y-3'
                    }
                  >
                    
                    {/* Scenario */}
                    <div>
                      <div className={isMaterial ? 'text-[10px] uppercase tracking-[0.12em] text-[#475569] mb-1 font-bold' : isCyberpunk ? 'font-cyber text-[10px] uppercase tracking-[0.14em] text-[#9BB8D3] mb-1 font-semibold' : isEditorial ? 'font-mono text-[10px] uppercase tracking-[0.14em] text-[#574D42] mb-1 font-semibold' : isClay ? 'text-[10px] uppercase tracking-[0.14em] text-[#647094] mb-1 font-semibold' : isSaas ? 'text-[10px] uppercase tracking-[0.14em] text-slate-500 mb-1 font-semibold' : isNordic ? 'text-[10px] uppercase tracking-[0.14em] text-[#5C6962] mb-1 font-semibold' : isGlass ? 'text-[10px] uppercase tracking-[0.14em] text-slate-400 mb-1 font-semibold' : isBrutal ? 'text-[11px] uppercase tracking-wider text-zinc-700 mb-1 font-black' : isObsidian ? 'text-[10px] uppercase tracking-[0.16em] text-[#8E877A] mb-1 font-semibold' : isSlate ? 'text-[10px] uppercase tracking-[0.14em] text-slate-400 mb-1 font-semibold' : 'text-[11px] uppercase tracking-wider text-zinc-500 mb-1 font-bold'}>
                        SITUATION CONTEXT:
                      </div>
                      <div className={isMaterial ? 'text-[#334155] italic' : isCyberpunk ? 'text-[#E6F4FF] italic' : isEditorial ? 'text-[#433A31] italic' : isClay ? 'text-[#4B5478] italic' : isSaas ? 'text-slate-600 italic' : isNordic ? 'text-[#4E5A53] italic' : isGlass ? 'text-slate-200 italic' : isBrutal ? 'text-zinc-900 font-semibold italic' : isObsidian ? 'text-[#DDD6C8] italic' : isSlate ? 'text-slate-300 italic' : 'text-zinc-300 italic'}>
                        "{card.context}"
                      </div>
                    </div>

                    {/* Psychological Shift & Rationale */}
                    <div className={isMaterial ? 'material-card border border-slate-200/80 rounded-lg p-3.5' : isCyberpunk ? 'cyber-card border border-cyan-400/30 rounded-sm p-3.5' : isEditorial ? 'editorial-card border border-[#B8AD96] rounded-none p-3.5' : isClay ? 'bg-white border border-white/90 rounded-2xl p-3.5 shadow-xs' : isSaas ? 'bg-white border border-slate-200 rounded-lg p-3.5' : isNordic ? 'nordic-card border border-[#DDD7C8] rounded-xl p-3.5' : isGlass ? 'glass-well border border-white/12 rounded-xl p-3.5' : isBrutal ? 'bg-white border-2 border-black p-3' : isObsidian ? 'bg-[#0B0B0E] border border-[#2A241A] p-3.5' : isSlate ? 'slate-card border border-slate-700/80 rounded-lg p-3.5' : 'bg-zinc-900/60 border border-zinc-800 p-3 rounded'}>
                      <div className={isMaterial ? 'text-[11px] uppercase tracking-[0.08em] text-[#1565C0] mb-1.5 font-bold flex items-center gap-1.5' : isCyberpunk ? 'font-cyber text-[11px] uppercase tracking-wider text-[#00F0FF] mb-1.5 font-semibold flex items-center gap-1.5' : isEditorial ? 'font-mono text-[11px] uppercase tracking-[0.14em] text-[#9B2226] mb-1.5 font-semibold flex items-center gap-1.5' : isClay ? 'text-[11px] uppercase tracking-wider text-indigo-700 mb-1.5 font-semibold flex items-center gap-1.5' : isSaas ? 'text-[11px] uppercase tracking-wider text-indigo-700 mb-1.5 font-semibold flex items-center gap-1.5' : isNordic ? 'text-[11px] uppercase tracking-wider text-[#3B5948] mb-1.5 font-semibold flex items-center gap-1.5' : isGlass ? 'text-[11px] uppercase tracking-wider text-sky-200 mb-1.5 font-semibold flex items-center gap-1.5' : isBrutal ? 'text-[11px] uppercase tracking-wider text-black mb-1 font-black flex items-center gap-1.5' : isObsidian ? 'text-[11px] uppercase tracking-[0.14em] text-[#E5C77B] mb-1.5 font-semibold flex items-center gap-1.5' : isSlate ? 'text-[11px] uppercase tracking-wider text-teal-300 mb-1.5 font-semibold flex items-center gap-1.5' : 'text-[11px] uppercase tracking-wider text-zinc-200 mb-1 font-bold flex items-center gap-1.5'}>
                        <Sparkles className={isMaterial ? 'w-3.5 h-3.5 text-[#1565C0]' : isCyberpunk ? 'w-3.5 h-3.5 text-[#00F0FF]' : isEditorial ? 'w-3.5 h-3.5 text-[#9B2226]' : isClay ? 'w-3.5 h-3.5 text-indigo-600' : isSaas ? 'w-3.5 h-3.5 text-indigo-600' : isNordic ? 'w-3.5 h-3.5 text-[#527360]' : isGlass ? 'w-3.5 h-3.5 text-sky-300' : isBrutal ? 'w-3.5 h-3.5 text-black' : isObsidian ? 'w-3.5 h-3.5 text-[#D4AF37]' : isSlate ? 'w-3.5 h-3.5 text-teal-400' : 'w-3.5 h-3.5 text-zinc-400'} />
                        <span>THE PSYCHOLOGY: {card.psychologicalShift}</span>
                      </div>
                      <p className={isMaterial ? 'text-[#334155] leading-relaxed' : isCyberpunk ? 'text-[#D6EEFF] leading-relaxed' : isEditorial ? 'text-[#1D1814] leading-relaxed' : isClay ? 'text-[#4B5478] leading-relaxed' : isSaas ? 'text-slate-600 leading-relaxed' : isNordic ? 'text-[#4E5A53] leading-relaxed' : isGlass ? 'text-slate-200 leading-relaxed' : isBrutal ? 'text-zinc-900 font-medium leading-relaxed' : isObsidian ? 'text-[#DDD6C8] leading-relaxed' : isSlate ? 'text-slate-300 leading-relaxed' : 'text-zinc-300 leading-relaxed'}>
                        {card.rationale}
                      </p>
                    </div>

                    {/* Delivery Advice */}
                    <div className={isMaterial ? 'bg-[#E0F2F1] border border-[#B2DFDB] rounded-lg p-3.5' : isCyberpunk ? 'bg-[#051F20] border border-[#00F5D4]/40 rounded-sm p-3.5' : isEditorial ? 'bg-[#E6EDE9] border border-[#1E4D40]/40 rounded-none p-3.5' : isClay ? 'bg-[#E3FCEC] border border-white/80 rounded-2xl p-3.5 shadow-xs' : isSaas ? 'bg-emerald-50/70 border border-emerald-200 rounded-lg p-3.5' : isNordic ? 'nordic-card border border-[#B8CBBF] rounded-xl p-3.5' : isGlass ? 'glass-well border border-white/12 rounded-xl p-3.5' : isBrutal ? 'bg-[#DCFCE7] border-2 border-black p-3' : isObsidian ? 'bg-[#0B0B0E] border border-[#2A241A] p-3.5' : isSlate ? 'bg-teal-950/35 border border-teal-400/35 rounded-lg p-3.5' : 'bg-zinc-900/60 border border-zinc-800 p-3 rounded'}>
                      <div className={isMaterial ? 'text-[11px] uppercase tracking-[0.08em] text-[#00695C] mb-1.5 font-bold flex items-center gap-1.5' : isCyberpunk ? 'font-cyber text-[11px] uppercase tracking-wider text-[#5EEAD4] mb-1.5 font-semibold flex items-center gap-1.5' : isEditorial ? 'font-mono text-[11px] uppercase tracking-[0.14em] text-[#1E4D40] mb-1.5 font-semibold flex items-center gap-1.5' : isClay ? 'text-[11px] uppercase tracking-wider text-[#065F46] mb-1.5 font-semibold flex items-center gap-1.5' : isSaas ? 'text-[11px] uppercase tracking-wider text-emerald-800 mb-1.5 font-semibold flex items-center gap-1.5' : isNordic ? 'text-[11px] uppercase tracking-wider text-[#2D4739] mb-1.5 font-semibold flex items-center gap-1.5' : isGlass ? 'text-[11px] uppercase tracking-wider text-sky-200 mb-1.5 font-semibold flex items-center gap-1.5' : isBrutal ? 'text-[11px] uppercase tracking-wider text-black mb-1 font-black flex items-center gap-1.5' : isObsidian ? 'text-[11px] uppercase tracking-[0.14em] text-[#E5C77B] mb-1.5 font-semibold flex items-center gap-1.5' : isSlate ? 'text-[11px] uppercase tracking-wider text-teal-300 mb-1.5 font-semibold flex items-center gap-1.5' : 'text-[11px] uppercase tracking-wider text-zinc-200 mb-1 font-bold flex items-center gap-1.5'}>
                        <CheckCircle2 className={isMaterial ? 'w-3.5 h-3.5 text-[#00897B]' : isCyberpunk ? 'w-3.5 h-3.5 text-[#00F5D4]' : isEditorial ? 'w-3.5 h-3.5 text-[#1E4D40]' : isClay ? 'w-3.5 h-3.5 text-[#065F46]' : isSaas ? 'w-3.5 h-3.5 text-emerald-600' : isNordic ? 'w-3.5 h-3.5 text-[#527360]' : isGlass ? 'w-3.5 h-3.5 text-sky-300' : isBrutal ? 'w-3.5 h-3.5 text-black' : isObsidian ? 'w-3.5 h-3.5 text-[#D4AF37]' : isSlate ? 'w-3.5 h-3.5 text-teal-400' : 'w-3.5 h-3.5 text-zinc-400'} />
                        <span>VOCAL DELIVERY TIP:</span>
                      </div>
                      <p className={isMaterial ? 'text-[#004D40] leading-relaxed' : isCyberpunk ? 'text-[#E6FFFA] leading-relaxed' : isEditorial ? 'text-[#18382F] leading-relaxed' : isClay ? 'text-[#1E3B2F] leading-relaxed' : isSaas ? 'text-slate-700 leading-relaxed' : isNordic ? 'text-[#242E28] leading-relaxed' : isGlass ? 'text-slate-200 leading-relaxed' : isBrutal ? 'text-zinc-900 font-medium leading-relaxed' : isObsidian ? 'text-[#DDD6C8] leading-relaxed' : isSlate ? 'text-teal-50 leading-relaxed' : 'text-zinc-300 leading-relaxed'}>
                        {card.deliveryTip}
                      </p>
                    </div>

                    {/* Leitner metadata footer */}
                    <div className={isMaterial ? 'flex items-center justify-between text-[10px] uppercase tracking-wider text-[#475569] pt-2.5 border-t border-slate-200 tabular-nums font-medium' : isCyberpunk ? 'flex items-center justify-between text-[10px] uppercase tracking-wider text-[#9BB8D3] pt-2.5 border-t border-cyan-400/25 tabular-nums font-medium' : isEditorial ? 'flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-[#574D42] pt-2.5 border-t border-[#C9BFA9] tabular-nums' : isClay ? 'flex items-center justify-between text-[10px] uppercase tracking-wider text-[#647094] pt-2.5 border-t border-indigo-900/10 tabular-nums' : isSaas ? 'flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500 pt-2.5 border-t border-slate-200 tabular-nums' : isNordic ? 'flex items-center justify-between text-[10px] uppercase tracking-wider text-[#5C6962] pt-2.5 border-t border-[#E4DFD4]' : isGlass ? 'flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400 pt-2.5 border-t border-white/15' : isBrutal ? 'flex items-center justify-between text-[11px] font-bold text-zinc-700 pt-2 border-t-2 border-black' : isObsidian ? 'flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-[#8E877A] pt-2.5 border-t border-[#2A241A]' : isSlate ? 'flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400 pt-2.5 border-t border-slate-800 tabular-nums' : 'flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800'}>
                      <div>
                        NEXT DUE: {card.lastReviewedAt ? new Date(card.nextDueAt).toLocaleDateString() : 'IMMEDIATE'} · REVIEWS: {card.timesReviewed}
                      </div>
                      
                      {card.isCustom && (
                        <button
                          onClick={() => {
                            soundEffects.playAgainTone();
                            onDeleteCard(card.id);
                          }}
                          className={
                            isMaterial
                              ? 'text-[#C62828] hover:text-[#7F1D1D] border border-[#FFCDD2] bg-[#FFEBEE] hover:bg-[#FFCDD2]/60 rounded-lg px-2.5 py-0.5 flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 font-semibold'
                              : isCyberpunk
                              ? 'text-[#FFB3D9] hover:text-white border border-[#FF2A85]/45 bg-[#19091E] hover:bg-[#2A0E31] hover:border-[#FF2A85] rounded-sm px-2.5 py-0.5 flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 font-cyber font-semibold'
                              : isEditorial
                              ? 'text-[#7F1D1D] hover:text-[#1D1814] border border-[#9B2226]/40 bg-[#F6E5E2] hover:bg-[#EED3CE] rounded-none px-2.5 py-0.5 flex items-center gap-1 cursor-pointer font-semibold'
                              : isClay
                              ? 'text-[#9F1239] hover:text-rose-900 border border-white/80 bg-[#FFE8EC] hover:bg-[#FFD8DF] rounded-xl px-2.5 py-1 flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 clay-btn-soft font-semibold'
                              : isSaas
                              ? 'text-rose-700 hover:text-rose-900 border border-rose-200 bg-rose-50 hover:bg-rose-100 rounded-lg px-2.5 py-0.5 flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0'
                              : isNordic
                              ? 'text-[#7D3B29] hover:text-[#242E28] border border-[#E4C5B9] bg-[#FAF0EC] hover:bg-[#F3E1DA] rounded-lg px-2.5 py-0.5 flex items-center gap-1 cursor-pointer'
                              : isGlass
                              ? 'text-rose-200 hover:text-white border border-rose-300/30 bg-rose-950/35 rounded-lg px-2.5 py-0.5 flex items-center gap-1 cursor-pointer'
                              : isBrutal
                              ? 'text-black bg-[#FDA4AF] border border-black px-2 py-0.5 font-black flex items-center gap-1 cursor-pointer'
                              : isObsidian
                              ? 'text-[#E8A5A5] hover:text-white border border-[#3D2225] bg-[#140D0E] px-2.5 py-0.5 flex items-center gap-1 cursor-pointer'
                              : isSlate
                              ? 'text-rose-300 hover:text-white border border-rose-500/35 bg-rose-950/35 hover:bg-rose-900/50 rounded-md px-2.5 py-0.5 flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0'
                              : 'text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer'
                          }
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
      <div
        className={
          isMaterial
            ? 'mt-8 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-wider text-[#475569] tabular-nums font-medium'
            : isCyberpunk
            ? 'mt-8 pt-4 border-t border-cyan-400/25 flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-wider text-[#9BB8D3] tabular-nums font-medium'
            : isEditorial
            ? 'mt-8 pt-4 border-t-2 border-double border-[#1D1814]/60 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[#574D42] tabular-nums'
            : isClay
            ? 'mt-8 pt-4 border-t border-indigo-900/10 flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-wider text-[#647094] tabular-nums'
            : isSaas
            ? 'mt-8 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-wider text-slate-500 tabular-nums'
            : isNordic
            ? 'mt-8 pt-4 border-t border-[#E4DFD4] flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-wider text-[#5C6962]'
            : isGlass
            ? 'mt-8 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-wider text-slate-400'
            : isBrutal
            ? 'mt-8 pt-4 border-t-2 border-black flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-zinc-700'
            : isObsidian
            ? 'mt-8 pt-4 border-t border-[#2A241A] flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-[0.14em] text-[#8E877A]'
            : isSlate
            ? 'mt-8 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-wider text-slate-400 tabular-nums'
            : 'mt-8 pt-4 border-t border-zinc-850 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500'
        }
      >
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
          className={
            isMaterial
              ? 'text-[#475569] hover:text-[#C62828] transition-colors flex items-center gap-1.5 cursor-pointer font-semibold whitespace-nowrap shrink-0'
              : isCyberpunk
              ? 'text-[#9BB8D3] hover:text-[#FF66B3] transition-colors flex items-center gap-1.5 cursor-pointer font-cyber font-semibold whitespace-nowrap shrink-0'
              : isEditorial
              ? 'text-[#574D42] hover:text-[#9B2226] transition-colors flex items-center gap-1.5 cursor-pointer font-semibold whitespace-nowrap shrink-0'
              : isClay
              ? 'text-[#4B5478] hover:text-[#9F1239] transition-colors flex items-center gap-1.5 cursor-pointer font-medium whitespace-nowrap shrink-0'
              : isSaas
              ? 'text-slate-600 hover:text-rose-600 transition-colors flex items-center gap-1.5 cursor-pointer font-medium whitespace-nowrap shrink-0'
              : isNordic
              ? 'text-[#4E5A53] hover:text-[#2D4739] transition-colors flex items-center gap-1.5 cursor-pointer font-medium'
              : isGlass
              ? 'text-slate-300 hover:text-sky-300 transition-colors flex items-center gap-1.5 cursor-pointer'
              : isBrutal
              ? 'text-black hover:underline font-black flex items-center gap-1 cursor-pointer'
              : isObsidian
              ? 'text-[#A39E93] hover:text-[#E5C77B] transition-colors flex items-center gap-1.5 cursor-pointer'
              : isSlate
              ? 'text-slate-400 hover:text-teal-300 transition-colors flex items-center gap-1.5 cursor-pointer font-medium whitespace-nowrap shrink-0'
              : 'text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer'
          }
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET DECK TO DEFAULTS</span>
        </button>
      </div>

      {/* Add Custom Reframe Modal */}
      {isAddModalOpen && (
        <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4 ${isMaterial ? 'bg-slate-900/40' : isCyberpunk ? 'bg-[#060714]/80' : isEditorial ? 'bg-[#1D1814]/45' : isClay ? 'bg-[#1E2547]/30' : isSaas ? 'bg-slate-900/35' : isNordic ? 'bg-[#242E28]/35' : isSlate ? 'bg-slate-950/75' : 'bg-black/75'}`}>
          <div
            className={
              isMaterial
                ? 'material-card-elevated border border-slate-200/80 border-t-4 border-t-[#1565C0] rounded-xl max-w-lg w-full p-6'
                : isCyberpunk
                ? 'cyber-card-elevated border border-cyan-400/45 border-t-2 border-t-[#00F0FF] rounded-sm max-w-lg w-full p-6'
                : isEditorial
                ? 'editorial-card-elevated border-2 border-[#1D1814] rounded-none max-w-lg w-full p-6'
                : isClay
                ? 'clay-card-elevated border border-white/95 rounded-3xl max-w-lg w-full p-6'
                : isSaas
                ? 'saas-card-elevated border border-slate-200 rounded-xl max-w-lg w-full p-6'
                : isNordic
                ? 'nordic-card-elevated border border-[#DDD7C8] rounded-2xl max-w-lg w-full p-6'
                : isGlass
                ? 'glass-panel-elevated border border-white/25 rounded-2xl max-w-lg w-full p-6'
                : isBrutal
                ? 'bg-[#FFFDF5] border-2 border-black max-w-lg w-full p-6 brutal-shadow-lg'
                : isObsidian
                ? 'obsidian-surface border border-[#D4AF37]/35 max-w-lg w-full p-6'
                : isSlate
                ? 'slate-card-elevated border border-teal-400/35 rounded-lg max-w-lg w-full p-6'
                : 'bg-zinc-950 border border-zinc-750 rounded-lg max-w-lg w-full p-6 shadow-2xl'
            }
          >
            <div className={`flex items-center justify-between mb-4 pb-3 ${isMaterial ? 'border-b border-slate-200' : isCyberpunk ? 'border-b border-cyan-400/25' : isEditorial ? 'border-b-2 border-double border-[#1D1814]/60' : isClay ? 'border-b border-indigo-900/10' : isSaas ? 'border-b border-slate-200' : isNordic ? 'border-b border-[#E4DFD4]' : isGlass ? 'border-b border-white/15' : isBrutal ? 'border-b-2 border-black' : isObsidian ? 'border-b border-[#2A241A]' : isSlate ? 'border-b border-slate-800' : 'border-b border-zinc-800'}`}>
              <div
                className={
                  isMaterial
                    ? 'text-base font-bold text-[#111827] tracking-tight'
                    : isCyberpunk
                    ? 'font-cyber text-base font-bold uppercase tracking-wider text-[#E6F4FF]'
                    : isEditorial
                    ? 'font-editorial-display text-lg font-bold text-[#1D1814] tracking-tight'
                    : isClay
                    ? 'text-base font-bold text-[#1E2547] tracking-tight'
                    : isSaas
                    ? 'text-base font-bold text-slate-900 tracking-tight'
                    : isNordic
                    ? 'text-base font-bold text-[#242E28] tracking-tight'
                    : isGlass
                    ? 'text-base font-bold text-white tracking-tight'
                    : isBrutal
                    ? 'text-sm font-black text-black tracking-tight'
                    : isObsidian
                    ? 'font-luxury text-lg font-semibold text-[#F5F0E6] tracking-wide'
                    : isSlate
                    ? 'text-base font-bold text-slate-100 tracking-tight'
                    : 'text-sm font-bold text-zinc-100 tracking-wider'
                }
              >
                [+] CREATE STRATEGIC REFRAME CARD
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className={
                  isMaterial
                    ? 'text-[#64748B] hover:text-[#1565C0] font-mono text-xs font-semibold cursor-pointer'
                    : isCyberpunk
                    ? 'text-[#9BB8D3] hover:text-[#00F0FF] font-mono text-xs font-semibold cursor-pointer'
                    : isEditorial
                    ? 'text-[#574D42] hover:text-[#9B2226] font-mono text-xs font-semibold cursor-pointer'
                    : isClay
                    ? 'text-[#647094] hover:text-[#1E2547] font-mono text-xs cursor-pointer'
                    : isSaas
                    ? 'text-slate-500 hover:text-slate-900 font-mono text-xs cursor-pointer'
                    : isNordic
                    ? 'text-[#5C6962] hover:text-[#242E28] font-mono text-xs cursor-pointer'
                    : isGlass
                    ? 'text-slate-300 hover:text-sky-300 font-mono text-xs cursor-pointer'
                    : isBrutal
                    ? 'text-black font-black border-2 border-black bg-[#FFE500] px-2 py-0.5 text-xs cursor-pointer'
                    : isObsidian
                    ? 'text-[#A39E93] hover:text-[#E5C77B] font-mono text-xs cursor-pointer'
                    : isSlate
                    ? 'text-slate-400 hover:text-teal-300 font-mono text-xs cursor-pointer'
                    : 'text-zinc-500 hover:text-zinc-200 cursor-pointer'
                }
              >
                [ESC]
              </button>
            </div>

            <form onSubmit={handleCreateCard} className={`space-y-4 text-xs ${isMaterial ? 'font-material' : isEditorial ? 'font-editorial-body' : isBrutal || isObsidian || isGlass || isNordic || isSaas || isClay || isSlate || isCyberpunk ? 'font-sans' : 'font-mono'}`}>
              <div>
                <label className={isMaterial ? 'block text-[10px] uppercase tracking-wider text-[#475569] mb-1.5 font-bold' : isCyberpunk ? 'block font-cyber text-[10px] uppercase tracking-wider text-[#9BB8D3] mb-1.5 font-semibold' : isEditorial ? 'block font-mono text-[10px] uppercase tracking-[0.14em] text-[#574D42] mb-1.5 font-semibold' : isClay ? 'block text-[10px] uppercase tracking-wider text-[#647094] mb-1.5 font-semibold' : isSaas ? 'block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 font-semibold' : isNordic ? 'block text-[10px] uppercase tracking-wider text-[#5C6962] mb-1.5 font-semibold' : isGlass ? 'block text-[10px] uppercase tracking-wider text-slate-300 mb-1.5 font-semibold' : isBrutal ? 'block text-black mb-1 font-extrabold' : isObsidian ? 'block text-[10px] uppercase tracking-[0.14em] text-[#A39E93] mb-1.5 font-semibold' : isSlate ? 'block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-semibold' : 'block text-zinc-400 mb-1 font-bold'}>
                  COMMUNICATION CATEGORY:
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as CategoryId)}
                  className={
                    isMaterial
                      ? 'w-full material-well border border-slate-200/80 rounded-lg px-3 py-2 text-[#111827] font-medium focus:border-[#1565C0] focus:outline-none cursor-pointer'
                      : isCyberpunk
                      ? 'w-full cyber-well border border-cyan-400/35 rounded-sm px-3 py-2 text-[#E6F4FF] focus:border-[#00F0FF] focus:outline-none cursor-pointer'
                      : isEditorial
                      ? 'w-full editorial-well border border-[#B8AD96] rounded-none px-3 py-2 text-[#1D1814] focus:border-[#9B2226] focus:outline-none cursor-pointer'
                      : isClay
                      ? 'w-full clay-well border border-white/80 rounded-2xl px-3.5 py-2.5 text-[#1E2547] focus:border-indigo-400 focus:outline-none cursor-pointer'
                      : isSaas
                      ? 'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none cursor-pointer'
                      : isNordic
                      ? 'w-full nordic-well border border-[#DDD7C8] rounded-xl px-3 py-2 text-[#242E28] focus:border-[#527360] focus:outline-none cursor-pointer'
                      : isGlass
                      ? 'w-full glass-well border border-white/15 rounded-xl px-3 py-2 text-white focus:border-sky-300/60 focus:outline-none cursor-pointer'
                      : isBrutal
                      ? 'w-full bg-white border-2 border-black px-3 py-2 text-black font-bold focus:outline-none cursor-pointer'
                      : isObsidian
                      ? 'w-full bg-[#070709] border border-[#2A241A] px-3 py-2 text-[#F5F0E6] focus:border-[#D4AF37]/60 focus:outline-none cursor-pointer'
                      : isSlate
                      ? 'w-full slate-well border border-slate-700/80 rounded-md px-3 py-2 text-slate-100 focus:border-teal-400 focus:outline-none cursor-pointer'
                      : 'w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:border-zinc-500 focus:outline-none cursor-pointer'
                  }
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id} className={isMaterial ? 'bg-white text-[#111827]' : isCyberpunk ? 'bg-[#060714] text-[#E6F4FF]' : isEditorial ? 'bg-[#FAF5EA] text-[#1D1814]' : isClay ? 'bg-white text-[#1E2547]' : isSaas ? 'bg-white text-slate-900' : isNordic ? 'bg-[#FDFBF7] text-[#242E28]' : isGlass ? 'bg-[#0B192C] text-slate-100' : isSlate ? 'bg-[#0B1220] text-slate-100' : ''}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={isMaterial ? 'block text-[10px] uppercase tracking-wider text-[#C62828] mb-1.5 font-bold' : isCyberpunk ? 'block font-cyber text-[10px] uppercase tracking-wider text-[#FF66B3] mb-1.5 font-semibold' : isEditorial ? 'block font-mono text-[10px] uppercase tracking-[0.14em] text-[#9B2226] mb-1.5 font-semibold' : isClay ? 'block text-[10px] uppercase tracking-wider text-[#9F1239] mb-1.5 font-semibold' : isSaas ? 'block text-[10px] uppercase tracking-wider text-rose-700 mb-1.5 font-semibold' : isNordic ? 'block text-[10px] uppercase tracking-wider text-[#964B36] mb-1.5 font-semibold' : isGlass ? 'block text-[10px] uppercase tracking-wider text-rose-200 mb-1.5 font-semibold' : isBrutal ? 'block text-black mb-1 font-extrabold' : isObsidian ? 'block text-[10px] uppercase tracking-[0.14em] text-[#E8A5A5] mb-1.5 font-semibold' : isSlate ? 'block text-[10px] uppercase tracking-wider text-rose-300 mb-1.5 font-semibold' : 'block text-zinc-300 mb-1 font-bold'}>
                  DON'T SAY (THE DANGER PHRASE):
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sorry to bother you with this..."
                  value={newDangerPhrase}
                  onChange={(e) => setNewDangerPhrase(e.target.value)}
                  className={
                    isMaterial
                      ? 'w-full material-well border border-slate-200/80 rounded-lg px-3 py-2 text-[#111827] placeholder-[#64748B] focus:border-[#1565C0] focus:outline-none'
                      : isCyberpunk
                      ? 'w-full cyber-well border border-[#FF2A85]/40 rounded-sm px-3 py-2 text-[#E6F4FF] placeholder-[#7A95B0] focus:border-[#FF2A85] focus:outline-none'
                      : isEditorial
                      ? 'w-full editorial-well border border-[#B8AD96] rounded-none px-3 py-2 text-[#1D1814] placeholder-[#6E6356] focus:border-[#9B2226] focus:outline-none'
                      : isClay
                      ? 'w-full clay-well border border-white/80 rounded-2xl px-3.5 py-2.5 text-[#1E2547] placeholder-[#647094] focus:border-indigo-400 focus:outline-none'
                      : isSaas
                      ? 'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none'
                      : isNordic
                      ? 'w-full nordic-well border border-[#DDD7C8] rounded-xl px-3 py-2 text-[#242E28] placeholder-[#7B867F] focus:border-[#527360] focus:outline-none'
                      : isGlass
                      ? 'w-full glass-well border border-white/15 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:border-sky-300/60 focus:outline-none'
                      : isBrutal
                      ? 'w-full bg-white border-2 border-black px-3 py-2 text-black font-medium focus:outline-none'
                      : isObsidian
                      ? 'w-full bg-[#070709] border border-[#2A241A] px-3 py-2 text-[#F5F0E6] placeholder-[#736D63] focus:border-[#D4AF37]/60 focus:outline-none'
                      : isSlate
                      ? 'w-full slate-well border border-slate-700/80 rounded-md px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-teal-400 focus:outline-none'
                      : 'w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:border-zinc-500 focus:outline-none'
                  }
                />
              </div>

              <div>
                <label className={isMaterial ? 'block text-[10px] uppercase tracking-wider text-[#00695C] mb-1.5 font-bold' : isCyberpunk ? 'block font-cyber text-[10px] uppercase tracking-wider text-[#00F0FF] mb-1.5 font-semibold' : isEditorial ? 'block font-mono text-[10px] uppercase tracking-[0.14em] text-[#1E4D40] mb-1.5 font-semibold' : isClay ? 'block text-[10px] uppercase tracking-wider text-indigo-700 mb-1.5 font-semibold' : isSaas ? 'block text-[10px] uppercase tracking-wider text-indigo-700 mb-1.5 font-semibold' : isNordic ? 'block text-[10px] uppercase tracking-wider text-[#3B5948] mb-1.5 font-semibold' : isGlass ? 'block text-[10px] uppercase tracking-wider text-sky-300 mb-1.5 font-semibold' : isBrutal ? 'block text-black mb-1 font-extrabold' : isObsidian ? 'block text-[10px] uppercase tracking-[0.14em] text-[#E5C77B] mb-1.5 font-semibold' : isSlate ? 'block text-[10px] uppercase tracking-wider text-teal-300 mb-1.5 font-semibold' : 'block text-zinc-300 mb-1 font-bold'}>
                  SAY INSTEAD (THE POWER REFRAME):
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Do you have 2 minutes for a quick alignment?"
                  value={newPowerPhrase}
                  onChange={(e) => setNewPowerPhrase(e.target.value)}
                  className={
                    isMaterial
                      ? 'w-full material-well border border-slate-200/80 rounded-lg px-3 py-2 text-[#111827] placeholder-[#64748B] focus:border-[#1565C0] focus:outline-none'
                      : isCyberpunk
                      ? 'w-full cyber-well border border-[#00F0FF]/40 rounded-sm px-3 py-2 text-[#E6F4FF] placeholder-[#7A95B0] focus:border-[#00F0FF] focus:outline-none'
                      : isEditorial
                      ? 'w-full editorial-well border border-[#B8AD96] rounded-none px-3 py-2 text-[#1D1814] placeholder-[#6E6356] focus:border-[#9B2226] focus:outline-none'
                      : isClay
                      ? 'w-full clay-well border border-white/80 rounded-2xl px-3.5 py-2.5 text-[#1E2547] placeholder-[#647094] focus:border-indigo-400 focus:outline-none'
                      : isSaas
                      ? 'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none'
                      : isNordic
                      ? 'w-full nordic-well border border-[#DDD7C8] rounded-xl px-3 py-2 text-[#242E28] placeholder-[#7B867F] focus:border-[#527360] focus:outline-none'
                      : isGlass
                      ? 'w-full glass-well border border-white/15 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:border-sky-300/60 focus:outline-none'
                      : isBrutal
                      ? 'w-full bg-white border-2 border-black px-3 py-2 text-black font-bold focus:outline-none'
                      : isObsidian
                      ? 'w-full bg-[#070709] border border-[#2A241A] px-3 py-2 text-[#F3E5AB] placeholder-[#736D63] focus:border-[#D4AF37]/60 focus:outline-none'
                      : isSlate
                      ? 'w-full slate-well border border-slate-700/80 rounded-md px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-teal-400 focus:outline-none'
                      : 'w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white focus:border-zinc-500 focus:outline-none'
                  }
                />
              </div>

              <div>
                <label className={isMaterial ? 'block text-[10px] uppercase tracking-wider text-[#475569] mb-1.5 font-bold' : isCyberpunk ? 'block font-cyber text-[10px] uppercase tracking-wider text-[#9BB8D3] mb-1.5 font-semibold' : isEditorial ? 'block font-mono text-[10px] uppercase tracking-[0.14em] text-[#574D42] mb-1.5 font-semibold' : isClay ? 'block text-[10px] uppercase tracking-wider text-[#647094] mb-1.5 font-semibold' : isSaas ? 'block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 font-semibold' : isNordic ? 'block text-[10px] uppercase tracking-wider text-[#5C6962] mb-1.5 font-semibold' : isGlass ? 'block text-[10px] uppercase tracking-wider text-slate-300 mb-1.5 font-semibold' : isBrutal ? 'block text-black mb-1 font-extrabold' : isObsidian ? 'block text-[10px] uppercase tracking-[0.14em] text-[#A39E93] mb-1.5 font-semibold' : isSlate ? 'block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-semibold' : 'block text-zinc-400 mb-1 font-bold'}>
                  SITUATIONAL CONTEXT TRIGGER:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Approaching a teammate on Slack or at their workstation."
                  value={newContext}
                  onChange={(e) => setNewContext(e.target.value)}
                  className={
                    isMaterial
                      ? 'w-full material-well border border-slate-200/80 rounded-lg px-3 py-2 text-[#111827] placeholder-[#64748B] focus:border-[#1565C0] focus:outline-none'
                      : isCyberpunk
                      ? 'w-full cyber-well border border-cyan-400/35 rounded-sm px-3 py-2 text-[#E6F4FF] placeholder-[#7A95B0] focus:border-[#00F0FF] focus:outline-none'
                      : isEditorial
                      ? 'w-full editorial-well border border-[#B8AD96] rounded-none px-3 py-2 text-[#1D1814] placeholder-[#6E6356] focus:border-[#9B2226] focus:outline-none'
                      : isClay
                      ? 'w-full clay-well border border-white/80 rounded-2xl px-3.5 py-2.5 text-[#1E2547] placeholder-[#647094] focus:border-indigo-400 focus:outline-none'
                      : isSaas
                      ? 'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none'
                      : isNordic
                      ? 'w-full nordic-well border border-[#DDD7C8] rounded-xl px-3 py-2 text-[#242E28] placeholder-[#7B867F] focus:border-[#527360] focus:outline-none'
                      : isGlass
                      ? 'w-full glass-well border border-white/15 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:border-sky-300/60 focus:outline-none'
                      : isBrutal
                      ? 'w-full bg-white border-2 border-black px-3 py-2 text-black font-medium focus:outline-none'
                      : isObsidian
                      ? 'w-full bg-[#070709] border border-[#2A241A] px-3 py-2 text-[#F5F0E6] placeholder-[#736D63] focus:border-[#D4AF37]/60 focus:outline-none'
                      : isSlate
                      ? 'w-full slate-well border border-slate-700/80 rounded-md px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-teal-400 focus:outline-none'
                      : 'w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:border-zinc-500 focus:outline-none'
                  }
                />
              </div>

              <div>
                <label className={isMaterial ? 'block text-[10px] uppercase tracking-wider text-[#475569] mb-1.5 font-bold' : isCyberpunk ? 'block font-cyber text-[10px] uppercase tracking-wider text-[#9BB8D3] mb-1.5 font-semibold' : isEditorial ? 'block font-mono text-[10px] uppercase tracking-[0.14em] text-[#574D42] mb-1.5 font-semibold' : isClay ? 'block text-[10px] uppercase tracking-wider text-[#647094] mb-1.5 font-semibold' : isSaas ? 'block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 font-semibold' : isNordic ? 'block text-[10px] uppercase tracking-wider text-[#5C6962] mb-1.5 font-semibold' : isGlass ? 'block text-[10px] uppercase tracking-wider text-slate-300 mb-1.5 font-semibold' : isBrutal ? 'block text-black mb-1 font-extrabold' : isObsidian ? 'block text-[10px] uppercase tracking-[0.14em] text-[#A39E93] mb-1.5 font-semibold' : isSlate ? 'block text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-semibold' : 'block text-zinc-400 mb-1 font-bold'}>
                  PSYCHOLOGICAL SHIFT:
                </label>
                <input
                  type="text"
                  placeholder="e.g. From Inconvenience to Respectful Request"
                  value={newPsychShift}
                  onChange={(e) => setNewPsychShift(e.target.value)}
                  className={
                    isMaterial
                      ? 'w-full material-well border border-slate-200/80 rounded-lg px-3 py-2 text-[#111827] placeholder-[#64748B] focus:border-[#1565C0] focus:outline-none'
                      : isCyberpunk
                      ? 'w-full cyber-well border border-cyan-400/35 rounded-sm px-3 py-2 text-[#E6F4FF] placeholder-[#7A95B0] focus:border-[#00F0FF] focus:outline-none'
                      : isEditorial
                      ? 'w-full editorial-well border border-[#B8AD96] rounded-none px-3 py-2 text-[#1D1814] placeholder-[#6E6356] focus:border-[#9B2226] focus:outline-none'
                      : isClay
                      ? 'w-full clay-well border border-white/80 rounded-2xl px-3.5 py-2.5 text-[#1E2547] placeholder-[#647094] focus:border-indigo-400 focus:outline-none'
                      : isSaas
                      ? 'w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none'
                      : isNordic
                      ? 'w-full nordic-well border border-[#DDD7C8] rounded-xl px-3 py-2 text-[#242E28] placeholder-[#7B867F] focus:border-[#527360] focus:outline-none'
                      : isGlass
                      ? 'w-full glass-well border border-white/15 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:border-sky-300/60 focus:outline-none'
                      : isBrutal
                      ? 'w-full bg-white border-2 border-black px-3 py-2 text-black font-medium focus:outline-none'
                      : isObsidian
                      ? 'w-full bg-[#070709] border border-[#2A241A] px-3 py-2 text-[#F5F0E6] placeholder-[#736D63] focus:border-[#D4AF37]/60 focus:outline-none'
                      : isSlate
                      ? 'w-full slate-well border border-slate-700/80 rounded-md px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-teal-400 focus:outline-none'
                      : 'w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-200 focus:border-zinc-500 focus:outline-none'
                  }
                />
              </div>

              <div className={`flex items-center justify-end gap-3 pt-3 ${isMaterial ? 'border-t border-slate-200' : isCyberpunk ? 'border-t border-cyan-400/25' : isEditorial ? 'border-t-2 border-double border-[#1D1814]/60' : isClay ? 'border-t border-indigo-900/10' : isSaas ? 'border-t border-slate-200' : isNordic ? 'border-t border-[#E4DFD4]' : isGlass ? 'border-t border-white/15' : isBrutal ? 'border-t-2 border-black' : isObsidian ? 'border-t border-[#2A241A]' : isSlate ? 'border-t border-slate-800' : 'border-t border-zinc-800'}`}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className={
                    isMaterial
                      ? 'px-4 py-2 rounded-lg bg-white border border-slate-200 text-[#475569] hover:text-[#111827] hover:border-slate-300 text-xs font-semibold cursor-pointer material-btn whitespace-nowrap shrink-0'
                      : isCyberpunk
                      ? 'px-4 py-2 rounded-sm bg-[#061926] border border-cyan-400/35 text-[#9BB8D3] hover:text-[#00F0FF] hover:border-[#00F0FF] font-cyber text-xs font-semibold uppercase tracking-wider cursor-pointer whitespace-nowrap shrink-0'
                      : isEditorial
                      ? 'px-4 py-2 rounded-none bg-[#FFFDF7] border border-[#1D1814]/60 text-[#1D1814] hover:bg-[#EAE1D0] font-mono text-xs font-semibold cursor-pointer'
                      : isClay
                      ? 'px-4 py-2 rounded-2xl bg-white border border-white/90 text-[#4B5478] hover:text-[#1E2547] text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0 clay-btn-soft'
                      : isSaas
                      ? 'px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 text-xs font-medium cursor-pointer whitespace-nowrap shrink-0'
                      : isNordic
                      ? 'px-4 py-2 rounded-xl nordic-well border border-[#DDD7C8] text-[#4E5A53] hover:text-[#242E28] hover:border-[#B8CBBF] text-xs font-medium cursor-pointer'
                      : isGlass
                      ? 'px-4 py-2 rounded-xl glass-well border border-white/15 text-slate-200 hover:text-white hover:border-white/35 text-xs font-medium cursor-pointer'
                      : isBrutal
                      ? 'px-4 py-2 border-2 border-black bg-white text-black font-extrabold cursor-pointer brutal-btn'
                      : isObsidian
                      ? 'px-4 py-2 border border-[#2A241A] bg-[#070709] text-[#A39E93] hover:text-[#F5F0E6] uppercase tracking-[0.14em] text-[11px] cursor-pointer'
                      : isSlate
                      ? 'px-4 py-2 rounded-md bg-[#0B1220] border border-slate-700 text-slate-200 hover:text-white hover:border-teal-400/50 text-xs font-medium cursor-pointer whitespace-nowrap shrink-0'
                      : 'px-4 py-2 rounded border border-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer'
                  }
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className={
                    isMaterial
                      ? 'px-5 py-2 rounded-lg bg-[#1565C0] hover:bg-[#0D47A1] text-white border border-[#0D47A1] text-xs font-semibold cursor-pointer material-btn whitespace-nowrap shrink-0'
                      : isCyberpunk
                      ? 'px-5 py-2 rounded-sm bg-gradient-to-r from-[#00F0FF] to-[#FF2A85] text-[#060714] border border-cyan-200/80 font-cyber text-xs font-bold uppercase tracking-wider cursor-pointer cyber-btn whitespace-nowrap shrink-0'
                      : isEditorial
                      ? 'px-5 py-2 rounded-none bg-[#9B2226] hover:bg-[#7F1D1D] text-[#FAF5EA] border border-[#1D1814] shadow-[2px_2px_0_#1D1814] font-mono text-xs font-semibold cursor-pointer'
                      : isClay
                      ? 'px-5 py-2 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white border border-indigo-400/60 text-xs font-semibold cursor-pointer clay-btn whitespace-nowrap shrink-0'
                      : isSaas
                      ? 'px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600 text-xs font-semibold cursor-pointer shadow-sm whitespace-nowrap shrink-0'
                      : isNordic
                      ? 'px-5 py-2 rounded-xl bg-[#527360] hover:bg-[#425F4E] text-[#FDFBF7] border border-[#425F4E] text-xs font-semibold cursor-pointer shadow-sm'
                      : isGlass
                      ? 'px-5 py-2 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 border border-sky-300 text-xs font-semibold cursor-pointer shadow-lg shadow-sky-500/20'
                      : isBrutal
                      ? 'px-5 py-2 border-2 border-black bg-[#86EFAC] hover:bg-[#4ADE80] text-black font-black cursor-pointer brutal-btn'
                      : isObsidian
                      ? 'px-5 py-2 bg-[#D4AF37] hover:bg-[#E5C77B] text-[#070709] border border-[#E5C77B] uppercase tracking-[0.16em] text-[11px] font-semibold cursor-pointer'
                      : isSlate
                      ? 'px-5 py-2 rounded-md bg-teal-400 hover:bg-teal-300 text-slate-950 border border-teal-300 text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0'
                      : 'px-5 py-2 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-bold cursor-pointer'
                  }
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
