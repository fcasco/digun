import React, { useState, useCallback } from 'react';
import { Palette } from 'lucide-react';
import { Header } from './components/Header';
import { FlashcardDeck } from './components/FlashcardDeck';
import { ScenarioQuiz } from './components/ScenarioQuiz';
import { LeitnerVault } from './components/LeitnerVault';
import { ThemesAndPsychology } from './components/ThemesAndPsychology';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ReframeCard, LeitnerRating, ReviewSessionStats } from './types/reframe';
import { leitnerStorage, GlobalStats } from './utils/leitnerStorage';
import { soundEffects } from './utils/soundEffects';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const { theme, setTheme, isSlate, isClay, isSaas, isNordic, isGlass, isBrutal, isObsidian } = useTheme();
  const [cards, setCards] = useState<ReframeCard[]>(() => {
    try {
      return leitnerStorage.loadCards();
    } catch {
      return [];
    }
  });
  const [globalStats, setGlobalStats] = useState<GlobalStats>(() => {
    try {
      return leitnerStorage.loadStats();
    } catch {
      return { totalReviews: 0, completedSessions: 0, currentStreakDays: 1, lastActiveDate: new Date().toISOString() };
    }
  });
  const [currentTab, setCurrentTab] = useState<'flashcards' | 'quiz' | 'vault' | 'psychology'>('flashcards');
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isCrtScanlinesEnabled, setIsCrtScanlinesEnabled] = useState<boolean>(true);

  // Calculate due count
  const dueCount = React.useMemo(() => {
    const now = Date.now();
    return cards.filter(c => !c.lastReviewedAt || c.timesReviewed === 0 || new Date(c.nextDueAt).getTime() <= now).length;
  }, [cards]);

  // Rate a card in flashcard mode
  const handleRateCard = useCallback((cardId: string, rating: LeitnerRating) => {
    const result = leitnerStorage.rateCard(cardId, rating);
    setCards(prevCards => prevCards.map(c => c.id === cardId ? result.updatedCard : c));
    return result;
  }, []);

  // Record session completion
  const handleSessionComplete = useCallback((stats: ReviewSessionStats) => {
    leitnerStorage.recordSessionComplete(stats);
    setGlobalStats(leitnerStorage.loadStats());
  }, []);

  // Add custom card
  const handleAddCard = useCallback((newCard: Omit<ReframeCard, 'id' | 'box' | 'intervalDays' | 'lastReviewedAt' | 'nextDueAt' | 'timesReviewed' | 'timesCorrect' | 'streak' | 'isCustom'>) => {
    const created = leitnerStorage.addCard(newCard);
    setCards(prev => [created, ...prev]);
  }, []);

  // Delete card
  const handleDeleteCard = useCallback((cardId: string) => {
    leitnerStorage.deleteCard(cardId);
    setCards(prev => prev.filter(c => c.id !== cardId));
  }, []);

  // Reset to defaults
  const handleResetDeck = useCallback(() => {
    leitnerStorage.resetToDefault();
    const defaults = leitnerStorage.loadCards();
    setCards(defaults);
  }, []);

  // Export JSON backup
  const handleExportJson = useCallback(() => {
    const jsonStr = leitnerStorage.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `articulation-training-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Import JSON backup
  const handleImportJson = useCallback((jsonStr: string) => {
    const success = leitnerStorage.importBackupJson(jsonStr);
    if (success) {
      setCards(leitnerStorage.loadCards());
      setGlobalStats(leitnerStorage.loadStats());
    }
    return success;
  }, []);

  const rootClass = isSlate
    ? 'min-h-screen slate-canvas text-slate-100 flex flex-col relative font-sans selection:bg-teal-400/25 selection:text-teal-100'
    : isClay
    ? 'min-h-screen clay-canvas text-[#1E2547] flex flex-col relative font-sans selection:bg-indigo-500/20 selection:text-indigo-950'
    : isSaas
    ? 'min-h-screen saas-canvas text-[#0F172A] flex flex-col relative font-sans selection:bg-indigo-600/15 selection:text-indigo-950'
    : isNordic
    ? 'min-h-screen nordic-canvas text-[#242E28] flex flex-col relative font-sans selection:bg-[#527360]/20 selection:text-[#242E28]'
    : isBrutal
    ? 'min-h-screen bg-[#FFFDF5] text-zinc-950 flex flex-col relative font-sans selection:bg-[#FFE500] selection:text-black'
    : isObsidian
    ? 'min-h-screen bg-[#070709] text-[#F5F0E6] flex flex-col relative font-sans selection:bg-[#D4AF37]/30 selection:text-[#F3E5AB]'
    : isGlass
    ? 'min-h-screen glass-canvas text-slate-100 flex flex-col relative font-sans selection:bg-sky-400/30 selection:text-sky-100'
    : `min-h-screen bg-[#09090b] text-[#e4e4e7] flex flex-col relative selection:bg-zinc-800 selection:text-zinc-100 ${
        isCrtScanlinesEnabled ? 'crt-scanlines' : ''
      }`;

  const switcherInactiveClass = isSlate
    ? 'px-2.5 py-1 text-[11px] font-medium rounded-md bg-[#1E293B] text-slate-300 border border-slate-700/80 hover:border-teal-400/50 hover:text-white cursor-pointer whitespace-nowrap transition-colors'
    : isClay
    ? 'px-2.5 py-1 text-[11px] font-semibold rounded-xl clay-card clay-btn-soft text-[#4B5478] border border-white/80 hover:text-[#1E2547] cursor-pointer whitespace-nowrap transition-all'
    : isSaas
    ? 'px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900 cursor-pointer whitespace-nowrap transition-colors'
    : isNordic
    ? 'px-2.5 py-1 text-[11px] font-medium rounded-lg bg-[#FDFBF7] text-[#4E5A53] border border-[#DDD7C8] hover:border-[#527360]/50 hover:text-[#242E28] cursor-pointer whitespace-nowrap transition-colors'
    : isBrutal
    ? 'px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide bg-white text-zinc-950 border-2 border-black hover:bg-zinc-100 cursor-pointer whitespace-nowrap brutal-btn'
    : isObsidian
    ? 'px-2.5 py-1 text-[11px] tracking-[0.12em] uppercase bg-[#121216] text-[#A39E93] border border-[#2A241A] hover:text-[#F5F0E6] hover:border-[#D4AF37]/50 cursor-pointer whitespace-nowrap transition-colors'
    : isGlass
    ? 'px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white/[0.06] text-slate-300 border border-white/15 hover:bg-white/[0.12] hover:text-white cursor-pointer whitespace-nowrap transition-colors'
    : 'px-2.5 py-1 text-[11px] font-mono rounded bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-100 hover:border-zinc-600 cursor-pointer whitespace-nowrap';

  return (
    <div className={rootClass}>
      {/* Top Bar Contract adhering to Header specifications */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        dueCount={dueCount}
        totalCards={cards.length}
      />

      {/* Workspace Theme Strip (outside top header to preserve 3-zone contract) */}
      <div
        className={
          isSlate
            ? 'border-b border-slate-800 bg-[#0B1220]/90'
            : isClay
            ? 'border-b border-white/70 bg-[#E6ECFA]/80 backdrop-blur-md'
            : isSaas
            ? 'border-b border-slate-200 bg-white/80 backdrop-blur-sm'
            : isNordic
            ? 'border-b border-[#E4DFD4] bg-[#EFECE3]/75 backdrop-blur-sm'
            : isBrutal
            ? 'border-b-2 border-black bg-[#F4F1EA]'
            : isObsidian
            ? 'border-b border-[#2A241A] bg-[#0B0B0E]'
            : isGlass
            ? 'border-b border-white/12 bg-white/[0.03] backdrop-blur-xl'
            : 'border-b border-zinc-800/70 bg-zinc-950/60'
        }
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div
            className={
              isSlate
                ? 'flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-slate-400 font-semibold'
                : isClay
                ? 'flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-[#4B5478] font-bold'
                : isSaas
                ? 'flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-slate-500 font-semibold'
                : isNordic
                ? 'flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-[#4E5A53] font-semibold'
                : isBrutal
                ? 'flex items-center gap-2 font-bold text-zinc-900'
                : isObsidian
                ? 'flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#C5A059] font-medium'
                : isGlass
                ? 'flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-sky-200/90 font-medium'
                : 'flex items-center gap-2 font-mono text-zinc-400'
            }
          >
            <Palette className={isSlate ? 'w-3.5 h-3.5 text-teal-400' : isClay ? 'w-3.5 h-3.5 text-indigo-600' : isSaas ? 'w-3.5 h-3.5 text-indigo-600' : isNordic ? 'w-3.5 h-3.5 text-[#527360]' : isBrutal ? 'w-3.5 h-3.5 text-black' : isObsidian ? 'w-3.5 h-3.5 text-[#D4AF37]' : isGlass ? 'w-3.5 h-3.5 text-sky-300' : 'w-3.5 h-3.5 text-amber-400'} />
            <span className="uppercase">
              {isSlate
                ? 'THEME #02 · MODERN SLATE DARK MODE'
                : isClay
                ? 'THEME #06 · CLAYMORPHISM / SOFT 3D'
                : isSaas
                ? 'THEME #01 · CLEAN SAAS MINIMALIST'
                : isNordic
                ? 'THEME #11 · NORDIC ORGANIC PASTEL'
                : isBrutal
                ? 'THEME #04 · NEO-BRUTALISM'
                : isObsidian
                ? 'THEME #10 · LUXURY OBSIDIAN & WARM BRASS'
                : isGlass
                ? 'THEME #03 · GLASSMORPHISM / FROSTED GLASS'
                : 'THEME #12 · MONOCHROME TERMINAL'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                soundEffects.playKeyClick();
                setTheme('slate');
              }}
              className={
                isSlate
                  ? 'px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase rounded-md bg-teal-400 text-slate-950 border border-teal-300 cursor-pointer whitespace-nowrap shadow-xs'
                  : switcherInactiveClass
              }
            >
              #02 SLATE DARK
            </button>
            <button
              type="button"
              onClick={() => {
                soundEffects.playKeyClick();
                setTheme('clay');
              }}
              className={
                isClay
                  ? 'px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase rounded-xl bg-indigo-500 text-white border border-indigo-400 cursor-pointer whitespace-nowrap clay-btn'
                  : switcherInactiveClass
              }
            >
              #06 CLAYMORPHISM
            </button>
            <button
              type="button"
              onClick={() => {
                soundEffects.playKeyClick();
                setTheme('saas');
              }}
              className={
                isSaas
                  ? 'px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase rounded-lg bg-indigo-600 text-white border border-indigo-600 cursor-pointer whitespace-nowrap shadow-xs'
                  : switcherInactiveClass
              }
            >
              #01 SAAS MINIMALIST
            </button>
            <button
              type="button"
              onClick={() => {
                soundEffects.playKeyClick();
                setTheme('nordic');
              }}
              className={
                isNordic
                  ? 'px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase rounded-lg bg-[#527360] text-[#FDFBF7] border border-[#425F4E] cursor-pointer whitespace-nowrap shadow-sm'
                  : switcherInactiveClass
              }
            >
              #11 NORDIC PASTEL
            </button>
            <button
              type="button"
              onClick={() => {
                soundEffects.playKeyClick();
                setTheme('glassmorphism');
              }}
              className={
                isGlass
                  ? 'px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase rounded-lg bg-sky-400 text-slate-950 border border-sky-300 cursor-pointer whitespace-nowrap shadow-sm shadow-sky-400/25'
                  : switcherInactiveClass
              }
            >
              #03 FROSTED GLASS
            </button>
            <button
              type="button"
              onClick={() => {
                soundEffects.playKeyClick();
                setTheme('obsidian');
              }}
              className={
                isObsidian
                  ? 'px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase bg-[#D4AF37] text-[#070709] border border-[#E5C77B] cursor-pointer whitespace-nowrap'
                  : switcherInactiveClass
              }
            >
              #10 OBSIDIAN & BRASS
            </button>
            <button
              type="button"
              onClick={() => {
                soundEffects.playKeyClick();
                setTheme('neobrutalism');
              }}
              className={
                isBrutal
                  ? 'px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide bg-[#FFE500] text-black border-2 border-black cursor-pointer whitespace-nowrap brutal-shadow-sm'
                  : switcherInactiveClass
              }
            >
              #04 NEO-BRUTALISM
            </button>
            <button
              type="button"
              onClick={() => {
                soundEffects.playKeyClick();
                setTheme('terminal');
              }}
              className={
                theme === 'terminal'
                  ? 'px-2.5 py-1 text-[11px] font-mono font-bold rounded bg-zinc-800 text-zinc-100 border border-zinc-600 cursor-pointer whitespace-nowrap'
                  : switcherInactiveClass
              }
            >
              #12 TERMINAL
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {currentTab === 'flashcards' && (
          <FlashcardDeck
            cards={cards}
            onRateCard={handleRateCard}
            onSessionComplete={handleSessionComplete}
            onOpenVault={() => setCurrentTab('vault')}
          />
        )}

        {currentTab === 'quiz' && (
          <ScenarioQuiz />
        )}

        {currentTab === 'vault' && (
          <LeitnerVault
            cards={cards}
            onAddCard={handleAddCard}
            onDeleteCard={handleDeleteCard}
            onResetDeck={handleResetDeck}
            onExportJson={handleExportJson}
            onImportJson={handleImportJson}
          />
        )}

        {currentTab === 'psychology' && (
          <ThemesAndPsychology />
        )}
      </main>

      {/* Bottom Status & Theme Information Footer */}
      <footer
        className={
          isSlate
            ? 'border-t border-slate-800 bg-[#0B1220] py-4 px-4 text-xs text-slate-400'
            : isClay
            ? 'border-t border-white/75 bg-[#F4F7FF]/90 py-4 px-4 text-xs text-[#4B5478]'
            : isSaas
            ? 'border-t border-slate-200 bg-white py-4 px-4 text-xs text-slate-500'
            : isNordic
            ? 'border-t border-[#E4DFD4] bg-[#FDFBF7]/90 py-4 px-4 text-xs text-[#5C6962]'
            : isBrutal
            ? 'border-t-2 border-black bg-white py-4 px-4 text-xs text-zinc-900'
            : isObsidian
            ? 'border-t border-[#2A241A] bg-[#070709] py-5 px-4 text-xs text-[#A39E93]'
            : isGlass
            ? 'border-t border-white/15 bg-slate-950/45 backdrop-blur-2xl py-4 px-4 text-xs text-slate-300'
            : 'border-t border-zinc-800/80 bg-zinc-950 py-4 px-4 text-xs font-mono text-zinc-500'
        }
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div
            className={
              isSlate
                ? 'flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-slate-400'
                : isClay
                ? 'flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-[#4B5478] font-medium'
                : isSaas
                ? 'flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-slate-500'
                : isNordic
                ? 'flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] text-[#4E5A53]'
                : isBrutal
                ? 'flex items-center gap-2 font-bold text-zinc-900'
                : isObsidian
                ? 'flex items-center gap-2.5 tracking-[0.16em] text-[11px] uppercase text-[#A39E93]'
                : isGlass
                ? 'flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-slate-300'
                : 'flex items-center gap-2 text-zinc-400'
            }
          >
            <span
              className={
                isSlate
                  ? 'text-teal-400 font-semibold'
                  : isClay
                  ? 'text-indigo-600 font-bold'
                  : isSaas
                  ? 'text-indigo-600 font-semibold'
                  : isNordic
                  ? 'text-[#3D5B4A] font-semibold'
                  : isBrutal
                  ? 'bg-[#FFE500] border-2 border-black px-1.5 py-0.5 text-black font-black'
                  : isObsidian
                  ? 'text-[#E5C77B] font-semibold'
                  : isGlass
                  ? 'text-sky-300 font-semibold'
                  : 'text-zinc-200 font-bold'
              }
            >
              {theme === 'slate'
                ? 'THEME #02'
                : theme === 'clay'
                ? 'THEME #06'
                : theme === 'saas'
                ? 'THEME #01'
                : theme === 'nordic'
                ? 'THEME #11'
                : theme === 'neobrutalism'
                ? 'THEME #04'
                : theme === 'obsidian'
                ? 'THEME #10'
                : theme === 'glassmorphism'
                ? 'THEME #03'
                : 'THEME #12'}
            </span>
            <span>
              {theme === 'slate'
                ? 'MODERN SLATE DARK MODE'
                : theme === 'clay'
                ? 'CLAYMORPHISM / SOFT 3D'
                : theme === 'saas'
                ? 'CLEAN SAAS MINIMALIST'
                : theme === 'nordic'
                ? 'NORDIC ORGANIC PASTEL'
                : theme === 'neobrutalism'
                ? 'NEO-BRUTALISM'
                : theme === 'obsidian'
                ? 'LUXURY OBSIDIAN & WARM BRASS'
                : theme === 'glassmorphism'
                ? 'GLASSMORPHISM / FROSTED GLASS'
                : 'MONOCHROME RETRO TERMINAL'}
            </span>
            <span>·</span>
            <span>RESPONSIBILITY EXCHANGE THEORY</span>
          </div>

          <div
            className={
              isSlate
                ? 'flex flex-wrap items-center justify-center gap-3 text-[11px] tracking-[0.08em] uppercase text-slate-400'
                : isClay
                ? 'flex flex-wrap items-center justify-center gap-3 text-[11px] tracking-[0.08em] uppercase text-[#4B5478] font-medium'
                : isSaas
                ? 'flex flex-wrap items-center justify-center gap-3 text-[11px] tracking-[0.08em] uppercase text-slate-500'
                : isNordic
                ? 'flex flex-wrap items-center justify-center gap-3 text-[11px] tracking-[0.1em] uppercase text-[#5C6962]'
                : isBrutal
                ? 'flex flex-wrap items-center justify-center gap-3 text-[11px] font-bold text-zinc-900'
                : isObsidian
                ? 'flex flex-wrap items-center justify-center gap-3 text-[11px] tracking-[0.15em] uppercase text-[#A39E93]'
                : isGlass
                ? 'flex flex-wrap items-center justify-center gap-3 text-[11px] tracking-[0.12em] uppercase text-slate-300'
                : 'flex items-center gap-4 text-[11px] text-zinc-500'
            }
          >
            {theme === 'terminal' && (
              <>
                <button
                  onClick={() => setIsCrtScanlinesEnabled(prev => !prev)}
                  className="text-zinc-400 hover:text-zinc-200 cursor-pointer underline decoration-dotted"
                >
                  SCANLINES: {isCrtScanlinesEnabled ? 'ON' : 'OFF'}
                </button>
                <span className="hidden sm:inline">·</span>
              </>
            )}
            <span>LEITNER SYSTEM: 5 ACTIVE BOXES</span>
            <span className="hidden sm:inline">·</span>
            <span
              className={
                isSlate
                  ? 'text-teal-400 font-semibold font-mono tabular-nums'
                  : isClay
                  ? 'text-indigo-600 font-bold font-mono tabular-nums'
                  : isSaas
                  ? 'text-indigo-600 font-semibold font-mono tabular-nums'
                  : isNordic
                  ? 'text-[#3D5B4A] font-semibold font-mono tabular-nums'
                  : isBrutal
                  ? 'bg-[#86EFAC] border-2 border-black px-1.5 py-0.5 text-black font-black'
                  : isObsidian
                  ? 'text-[#E5C77B] font-semibold font-mono tabular-nums'
                  : isGlass
                  ? 'text-sky-300 font-semibold font-mono tabular-nums'
                  : 'text-amber-400 font-bold'
              }
            >
              STREAK: {globalStats?.currentStreakDays ?? 1}D
            </span>
          </div>
        </div>
      </footer>

      {/* Keyboard shortcuts modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
