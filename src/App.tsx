import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Palette, RotateCcw } from 'lucide-react';
import { Header } from './components/Header';
import { FlashcardDeck } from './components/FlashcardDeck';
import { ScenarioQuiz } from './components/ScenarioQuiz';
import { LeitnerVault } from './components/LeitnerVault';
import { ThemesAndPsychology } from './components/ThemesAndPsychology';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ClearProgressModal } from './components/ClearProgressModal';
import { ReframeCard, LeitnerRating, ReviewSessionStats } from './types/reframe';
import { leitnerStorage, GlobalStats, AppTab } from './utils/leitnerStorage';
import { soundEffects } from './utils/soundEffects';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const { theme, setTheme, isSkeuomorphic, isCyberpunk, isMaterial, isEditorial, isSlate, isClay, isSaas, isNordic, isGlass, isBrutal, isObsidian } = useTheme();
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

  const switcherInactiveClass = isSkeuomorphic
    ? 'px-2.5 py-1 text-[11px] font-semibold tracking-wide rounded-md skeuo-leather-btn border border-[#5B3926] text-[#E6D6B8] hover:text-[#FFE39A] hover:border-[#C89E3A]/60 cursor-pointer whitespace-nowrap'
    : isCyberpunk
    ? 'px-2.5 py-1 text-[11px] font-cyber font-semibold uppercase tracking-wider rounded-sm bg-[#0C122B]/90 text-cyan-200/80 border border-cyan-400/25 hover:border-[#00F0FF] hover:text-[#00F0FF] hover:shadow-[0_0_12px_rgba(0,240,255,0.28)] cursor-pointer whitespace-nowrap transition-all'
    : isMaterial
    ? 'px-3 py-1 text-[11px] font-semibold rounded-md bg-white text-[#334155] border border-[#CBD5E1] hover:border-[#1565C0] hover:text-[#1565C0] shadow-[0_1px_2px_rgba(15,23,42,0.06)] cursor-pointer whitespace-nowrap transition-all'
    : isEditorial
    ? 'px-2.5 py-1 text-[11px] font-medium rounded-none bg-[#FAF5EA] text-[#433A31] border border-[#C9BFA9] hover:border-[#1D1814] hover:text-[#1D1814] cursor-pointer whitespace-nowrap transition-colors'
    : isSlate
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
          isSkeuomorphic
            ? 'border-b border-[#160B05] bg-[#2D190F]/95 shadow-[inset_0_1px_0_rgba(255,224,175,0.12),0_6px_16px_-6px_rgba(0,0,0,0.65)]'
            : isCyberpunk
            ? 'border-b border-cyan-400/25 bg-[#080C20]/90 backdrop-blur-md shadow-[0_6px_24px_-12px_rgba(0,240,255,0.28)]'
            : isMaterial
            ? 'border-b border-[#D5DCE6] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(15,23,42,0.06)]'
            : isEditorial
            ? 'border-b border-[#1D1814]/35 bg-[#EAE1D0]/75'
            : isSlate
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
              isSkeuomorphic
                ? 'flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[#E6D6B8] font-semibold'
                : isCyberpunk
                ? 'flex items-center gap-2 text-[11px] font-cyber uppercase tracking-[0.14em] text-[#00F0FF] font-semibold'
                : isMaterial
                ? 'flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] text-[#334155] font-bold'
                : isEditorial
                ? 'flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[#433A31] font-semibold'
                : isSlate
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
            <Palette className={isSkeuomorphic ? 'w-3.5 h-3.5 text-[#E8C978]' : isCyberpunk ? 'w-3.5 h-3.5 text-[#FF2A85]' : isMaterial ? 'w-3.5 h-3.5 text-[#1565C0]' : isEditorial ? 'w-3.5 h-3.5 text-[#9B2226]' : isSlate ? 'w-3.5 h-3.5 text-teal-400' : isClay ? 'w-3.5 h-3.5 text-indigo-600' : isSaas ? 'w-3.5 h-3.5 text-indigo-600' : isNordic ? 'w-3.5 h-3.5 text-[#527360]' : isBrutal ? 'w-3.5 h-3.5 text-black' : isObsidian ? 'w-3.5 h-3.5 text-[#D4AF37]' : isGlass ? 'w-3.5 h-3.5 text-sky-300' : 'w-3.5 h-3.5 text-amber-400'} />
            <span className="uppercase">
              {isSkeuomorphic
                ? 'THEME #09 · SKEUOMORPHIC PHYSICAL DESK'
                : isCyberpunk
                ? 'THEME #08 · CYBERPUNK NEON GRID'
                : isMaterial
                ? 'THEME #07 · FLAT DESIGN 2.0 / MATERIAL'
                : isEditorial
                ? "THEME #05 · EDITORIAL NEWSPAPER ('50s BROADSHEET)"
                : isSlate
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
                setTheme('skeuomorphic');
              }}
              className={
                isSkeuomorphic
                  ? 'px-2.5 py-1 text-[11px] font-bold tracking-[0.06em] uppercase rounded-md skeuo-brass-btn border border-[#7A5915] cursor-pointer whitespace-nowrap'
                  : switcherInactiveClass
              }
            >
              #09 SKEUOMORPHIC DESK
            </button>
            <button
              type="button"
              onClick={() => {
                soundEffects.playKeyClick();
                setTheme('cyberpunk');
              }}
              className={
                isCyberpunk
                  ? 'px-2.5 py-1 text-[11px] font-cyber font-bold tracking-[0.08em] uppercase rounded-sm bg-gradient-to-r from-[#00F0FF] to-[#FF2A85] text-[#060714] border border-cyan-200/80 cursor-pointer whitespace-nowrap cyber-btn'
                  : switcherInactiveClass
              }
            >
              #08 CYBERPUNK NEON
            </button>
            <button
              type="button"
              onClick={() => {
                soundEffects.playKeyClick();
                setTheme('material');
              }}
              className={
                isMaterial
                  ? 'px-3 py-1 text-[11px] font-bold tracking-[0.06em] uppercase rounded-md bg-[#1565C0] text-white border border-[#0D47A1] cursor-pointer whitespace-nowrap material-btn'
                  : switcherInactiveClass
              }
            >
              #07 MATERIAL 2.0
            </button>
            <button
              type="button"
              onClick={() => {
                soundEffects.playKeyClick();
                setTheme('editorial');
              }}
              className={
                isEditorial
                  ? "px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] uppercase rounded-none bg-[#9B2226] text-[#FAF5EA] border border-[#1D1814] cursor-pointer whitespace-nowrap shadow-[1px_1px_0_#1D1814]"
                  : switcherInactiveClass
              }
            >
              #05 EDITORIAL '50s
            </button>
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
