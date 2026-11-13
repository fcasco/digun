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
  const { theme, setTheme, isBrutal, isObsidian } = useTheme();
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

  const rootClass = isBrutal
    ? 'min-h-screen bg-[#FFFDF5] text-zinc-950 flex flex-col relative font-sans selection:bg-[#FFE500] selection:text-black'
    : isObsidian
    ? 'min-h-screen bg-[#070709] text-[#F5F0E6] flex flex-col relative font-sans selection:bg-[#D4AF37]/30 selection:text-[#F3E5AB]'
    : `min-h-screen bg-[#09090b] text-[#e4e4e7] flex flex-col relative selection:bg-zinc-800 selection:text-zinc-100 ${
        isCrtScanlinesEnabled ? 'crt-scanlines' : ''
      }`;

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
          isBrutal
            ? 'border-b-2 border-black bg-[#F4F1EA]'
            : isObsidian
            ? 'border-b border-[#2A241A] bg-[#0B0B0E]'
            : 'border-b border-zinc-800/70 bg-zinc-950/60'
        }
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div
            className={
              isBrutal
                ? 'flex items-center gap-2 font-bold text-zinc-900'
                : isObsidian
                ? 'flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#C5A059] font-medium'
                : 'flex items-center gap-2 font-mono text-zinc-400'
            }
          >
            <Palette className={isBrutal ? 'w-3.5 h-3.5 text-black' : isObsidian ? 'w-3.5 h-3.5 text-[#D4AF37]' : 'w-3.5 h-3.5 text-amber-400'} />
            <span className="uppercase">
              {isBrutal
                ? 'THEME #04 · NEO-BRUTALISM'
                : isObsidian
                ? 'THEME #10 · LUXURY OBSIDIAN & WARM BRASS'
                : 'THEME #12 · MONOCHROME TERMINAL'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                soundEffects.playKeyClick();
                setTheme('obsidian');
              }}
              className={
                isObsidian
                  ? 'px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase bg-[#D4AF37] text-[#070709] border border-[#E5C77B] cursor-pointer whitespace-nowrap'
                  : isBrutal
                  ? 'px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide bg-white text-zinc-950 border-2 border-black hover:bg-zinc-100 cursor-pointer whitespace-nowrap brutal-btn'
                  : 'px-2.5 py-1 text-[11px] font-mono rounded bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-100 hover:border-zinc-600 cursor-pointer whitespace-nowrap'
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
                  : isObsidian
                  ? 'px-2.5 py-1 text-[11px] tracking-[0.12em] uppercase bg-[#121216] text-[#A39E93] border border-[#2A241A] hover:text-[#F5F0E6] hover:border-[#D4AF37]/50 cursor-pointer whitespace-nowrap transition-colors'
                  : 'px-2.5 py-1 text-[11px] font-mono rounded bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-100 hover:border-zinc-600 cursor-pointer whitespace-nowrap'
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
                  : isBrutal
                  ? 'px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide bg-white text-zinc-950 border-2 border-black hover:bg-zinc-100 cursor-pointer whitespace-nowrap brutal-btn'
                  : 'px-2.5 py-1 text-[11px] tracking-[0.12em] uppercase bg-[#121216] text-[#A39E93] border border-[#2A241A] hover:text-[#F5F0E6] hover:border-[#D4AF37]/50 cursor-pointer whitespace-nowrap transition-colors'
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
          isBrutal
            ? 'border-t-2 border-black bg-white py-4 px-4 text-xs text-zinc-900'
            : isObsidian
            ? 'border-t border-[#2A241A] bg-[#070709] py-5 px-4 text-xs text-[#A39E93]'
            : 'border-t border-zinc-800/80 bg-zinc-950 py-4 px-4 text-xs font-mono text-zinc-500'
        }
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div
            className={
              isBrutal
                ? 'flex items-center gap-2 font-bold text-zinc-900'
                : isObsidian
                ? 'flex items-center gap-2.5 tracking-[0.16em] text-[11px] uppercase text-[#A39E93]'
                : 'flex items-center gap-2 text-zinc-400'
            }
          >
            <span
              className={
                isBrutal
                  ? 'bg-[#FFE500] border-2 border-black px-1.5 py-0.5 text-black font-black'
                  : isObsidian
                  ? 'text-[#E5C77B] font-semibold'
                  : 'text-zinc-200 font-bold'
              }
            >
              {theme === 'neobrutalism' ? 'THEME #04' : theme === 'obsidian' ? 'THEME #10' : 'THEME #12'}
            </span>
            <span>
              {theme === 'neobrutalism'
                ? 'NEO-BRUTALISM'
                : theme === 'obsidian'
                ? 'LUXURY OBSIDIAN & WARM BRASS'
                : 'MONOCHROME RETRO TERMINAL'}
            </span>
            <span>·</span>
            <span>RESPONSIBILITY EXCHANGE THEORY</span>
          </div>

          <div
            className={
              isBrutal
                ? 'flex flex-wrap items-center justify-center gap-3 text-[11px] font-bold text-zinc-900'
                : isObsidian
                ? 'flex flex-wrap items-center justify-center gap-3 text-[11px] tracking-[0.15em] uppercase text-[#A39E93]'
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
                isBrutal
                  ? 'bg-[#86EFAC] border-2 border-black px-1.5 py-0.5 text-black font-black'
                  : isObsidian
                  ? 'text-[#E5C77B] font-semibold font-mono tabular-nums'
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
