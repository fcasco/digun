import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { Header } from './components/Header';
import { FlashcardDeck } from './components/FlashcardDeck';
import { ScenarioQuiz } from './components/ScenarioQuiz';
import { LeitnerVault } from './components/LeitnerVault';
import { ThemesAndPsychology } from './components/ThemesAndPsychology';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ClearProgressModal } from './components/ClearProgressModal';
import { SettingsModal } from './components/SettingsModal';
import { ReframeCard, LeitnerRating, ReviewSessionStats } from './types/reframe';
import { leitnerStorage, GlobalStats, AppTab } from './utils/leitnerStorage';
import { soundEffects } from './utils/soundEffects';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const { theme, isSkeuomorphic, isCyberpunk, isMaterial, isEditorial, isSlate, isClay, isSaas, isNordic, isGlass, isBrutal, isObsidian } = useTheme();
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
  const [currentTab, setCurrentTab] = useState<AppTab>(() => leitnerStorage.loadActiveTab() ?? 'flashcards');
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isClearProgressOpen, setIsClearProgressOpen] = useState<boolean>(false);
  const [progressVersion, setProgressVersion] = useState<number>(0);
  const [progressClearedNotice, setProgressClearedNotice] = useState<boolean>(false);
  const [isCrtScanlinesEnabled, setIsCrtScanlinesEnabled] = useState<boolean>(true);

  useEffect(() => {
    leitnerStorage.saveActiveTab(currentTab);
  }, [currentTab]);

  useEffect(() => {
    if (!progressClearedNotice) return;
    const timer = window.setTimeout(() => setProgressClearedNotice(false), 4000);
    return () => window.clearTimeout(timer);
  }, [progressClearedNotice]);

  const progressSummary = useMemo(() => ({
    reviewedCardsCount: cards.filter(c => c.timesReviewed > 0 || c.box > 1).length,
    customCardsCount: cards.filter(c => c.isCustom).length,
    totalReviews: globalStats?.totalReviews ?? 0,
    streakDays: globalStats?.currentStreakDays ?? 1,
  }), [cards, globalStats]);

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

  // Reset to defaults / Clear all browser storage progress
  const handleResetDeck = useCallback(() => {
    const { cards: freshCards, stats: freshStats } = leitnerStorage.clearAllProgress();
    setCards(freshCards);
    setGlobalStats(freshStats);
    setProgressVersion(prev => prev + 1);
    setIsClearProgressOpen(false);
    setProgressClearedNotice(true);
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

  const rootClass = isSkeuomorphic
    ? 'min-h-screen skeuo-canvas text-[#F5ECD8] flex flex-col relative font-sans selection:bg-[#C89E3A]/30 selection:text-[#FFF8EA]'
    : isCyberpunk
    ? 'min-h-screen cyber-canvas text-[#E6F4FF] flex flex-col relative font-sans selection:bg-[#00F0FF]/25 selection:text-[#00F0FF]'
    : isMaterial
    ? 'min-h-screen material-canvas text-[#111827] flex flex-col relative font-material selection:bg-[#1565C0]/20 selection:text-[#0D47A1]'
    : isEditorial
    ? 'min-h-screen editorial-canvas text-[#1D1814] flex flex-col relative font-editorial-body selection:bg-[#9B2226]/20 selection:text-[#1D1814]'
    : isSlate
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

  return (
    <div className={rootClass}>
      {/* Top Bar Contract adhering to Header specifications */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        dueCount={dueCount}
        totalCards={cards.length}
      />

      {/* Main Interactive Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {currentTab === 'flashcards' && (
          <FlashcardDeck
            cards={cards}
            onRateCard={handleRateCard}
            onSessionComplete={handleSessionComplete}
            onOpenVault={() => setCurrentTab('vault')}
            resetSignal={progressVersion}
          />
        )}

        {currentTab === 'quiz' && (
          <ScenarioQuiz resetSignal={progressVersion} />
        )}

        {currentTab === 'vault' && (
          <LeitnerVault
            cards={cards}
            onAddCard={handleAddCard}
            onDeleteCard={handleDeleteCard}
            onResetDeck={handleResetDeck}
            onClearProgress={() => setIsClearProgressOpen(true)}
            onExportJson={handleExportJson}
            onImportJson={handleImportJson}
          />
        )}

        {currentTab === 'psychology' && (
          <ThemesAndPsychology cards={cards} />
        )}
      </main>

      {/* Bottom Status & Theme Information Footer */}
      <footer
        className={
          isSkeuomorphic
            ? 'border-t border-[#4B2C1B] skeuo-leather py-4 px-4 text-xs text-[#E6D6B8]'
            : isCyberpunk
            ? 'border-t border-cyan-400/25 bg-[#080C20]/90 backdrop-blur-md py-4 px-4 text-xs text-slate-300'
            : isMaterial
            ? 'border-t border-[#D5DCE6] bg-white py-4 px-4 text-xs text-[#475569]'
            : isEditorial
            ? 'border-t-2 border-[#1D1814] bg-[#FAF5EA] py-4 px-4 text-xs text-[#574D42]'
            : isSlate
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
              isSkeuomorphic
                ? 'flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-[#E6D6B8] font-medium'
                : isCyberpunk
                ? 'flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-slate-300 font-medium'
                : isMaterial
                ? 'flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-[#475569] font-medium'
                : isEditorial
                ? 'flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-[#574D42]'
                : isSlate
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
                isSkeuomorphic
                  ? 'text-[#E8C978] font-editorial-display font-bold tracking-wider'
                  : isCyberpunk
                  ? 'text-[#00F0FF] font-cyber font-bold tracking-wider'
                  : isMaterial
                  ? 'text-[#1565C0] font-bold tracking-wider'
                  : isEditorial
                  ? 'text-[#9B2226] font-editorial-display font-bold tracking-wider'
                  : isSlate
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
              {theme === 'skeuomorphic'
                ? 'THEME #09'
                : theme === 'cyberpunk'
                ? 'THEME #08'
                : theme === 'material'
                ? 'THEME #07'
                : theme === 'editorial'
                ? 'THEME #05'
                : theme === 'slate'
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
              {theme === 'skeuomorphic'
                ? 'SKEUOMORPHIC PHYSICAL DESK'
                : theme === 'cyberpunk'
                ? 'CYBERPUNK NEON GRID'
                : theme === 'material'
                ? 'FLAT DESIGN 2.0 / MATERIAL'
                : theme === 'editorial'
                ? "1950s EDITORIAL BROADSHEET & WARM SERIF"
                : theme === 'slate'
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
              isSkeuomorphic
                ? 'flex flex-wrap items-center justify-center gap-3 text-[11px] tracking-[0.12em] uppercase text-[#E6D6B8] font-medium'
                : isCyberpunk
                ? 'flex flex-wrap items-center justify-center gap-3 text-[11px] tracking-[0.12em] uppercase text-slate-300 font-medium'
                : isMaterial
                ? 'flex flex-wrap items-center justify-center gap-3 text-[11px] tracking-[0.08em] uppercase text-[#475569] font-medium'
                : isEditorial
                ? 'flex flex-wrap items-center justify-center gap-3 text-[11px] tracking-[0.12em] uppercase text-[#574D42]'
                : isSlate
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
                isSkeuomorphic
                  ? 'text-[#E8C978] font-mono font-bold tabular-nums'
                  : isCyberpunk
                  ? 'text-[#FF4DA6] font-mono font-bold tabular-nums'
                  : isMaterial
                  ? 'text-[#00695C] font-mono font-bold tabular-nums'
                  : isEditorial
                  ? 'text-[#9B2226] font-mono font-semibold tabular-nums'
                  : isSlate
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
            <span className="hidden sm:inline">·</span>
            {progressClearedNotice ? (
              <span
                className={
                  isSkeuomorphic
                    ? 'text-[#E8C978] font-mono font-bold'
                    : isMaterial
                    ? 'text-[#00695C] font-mono font-bold'
                    : isEditorial
                    ? 'text-[#1E4D40] font-mono font-semibold'
                    : isBrutal
                    ? 'bg-[#86EFAC] border-2 border-black px-1.5 py-0.5 text-black font-black'
                    : 'text-emerald-400 font-mono font-semibold'
                }
              >
                PROGRESS CLEARED
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  soundEffects.playKeyClick();
                  setIsClearProgressOpen(true);
                }}
                className={
                  isSkeuomorphic
                    ? 'text-[#E6D6B8] hover:text-[#FFE39A] transition-colors flex items-center gap-1 cursor-pointer underline decoration-dotted underline-offset-4'
                    : isCyberpunk
                    ? 'text-cyan-200/80 hover:text-[#FF4DA6] transition-colors flex items-center gap-1 cursor-pointer underline decoration-dotted underline-offset-4'
                    : isMaterial
                    ? 'text-[#475569] hover:text-[#C62828] transition-colors flex items-center gap-1 cursor-pointer underline decoration-dotted underline-offset-4'
                    : isEditorial
                    ? 'text-[#574D42] hover:text-[#9B2226] transition-colors flex items-center gap-1 cursor-pointer underline decoration-dotted underline-offset-4'
                    : isSlate
                    ? 'text-slate-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer underline decoration-dotted underline-offset-4'
                    : isClay
                    ? 'text-[#4B5478] hover:text-[#9F1239] transition-colors flex items-center gap-1 cursor-pointer underline decoration-dotted underline-offset-4'
                    : isSaas
                    ? 'text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer underline decoration-dotted underline-offset-4'
                    : isNordic
                    ? 'text-[#5C6962] hover:text-[#964B36] transition-colors flex items-center gap-1 cursor-pointer underline decoration-dotted underline-offset-4'
                    : isBrutal
                    ? 'bg-[#FFE4E6] hover:bg-[#FDA4AF] border-2 border-black px-1.5 py-0.5 text-black font-black flex items-center gap-1 cursor-pointer'
                    : isObsidian
                    ? 'text-[#A39E93] hover:text-[#E5C77B] transition-colors flex items-center gap-1 cursor-pointer underline decoration-dotted underline-offset-4'
                    : isGlass
                    ? 'text-slate-300 hover:text-rose-200 transition-colors flex items-center gap-1 cursor-pointer underline decoration-dotted underline-offset-4'
                    : 'text-zinc-400 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer underline decoration-dotted underline-offset-4'
                }
                title="Clear all saved progress from browser local storage"
              >
                <RotateCcw className="w-3 h-3" />
                <span>CLEAR PROGRESS</span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Settings menu modal (Theme Selection & Audio Options) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isCrtScanlinesEnabled={isCrtScanlinesEnabled}
        onToggleCrtScanlines={() => setIsCrtScanlinesEnabled(prev => !prev)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenClearProgress={() => setIsClearProgressOpen(true)}
      />

      {/* Keyboard shortcuts modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Clear browser progress confirmation modal */}
      <ClearProgressModal
        isOpen={isClearProgressOpen}
        onClose={() => setIsClearProgressOpen(false)}
        onConfirmClear={handleResetDeck}
        summary={progressSummary}
      />
    </div>
  );
}
