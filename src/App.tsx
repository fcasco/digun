import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { FlashcardDeck } from './components/FlashcardDeck';
import { ScenarioQuiz } from './components/ScenarioQuiz';
import { LeitnerVault } from './components/LeitnerVault';
import { ThemesAndPsychology } from './components/ThemesAndPsychology';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { ReframeCard, LeitnerRating, ReviewSessionStats } from './types/reframe';
import { leitnerStorage, GlobalStats } from './utils/leitnerStorage';
import { soundEffects } from './utils/soundEffects';

export default function App() {
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

  return (
    <div className={`min-h-screen bg-[#070b09] text-[#d4ded8] flex flex-col relative selection:bg-emerald-500/30 selection:text-emerald-200 ${
      isCrtScanlinesEnabled ? 'crt-scanlines' : ''
    }`}>
      {/* Top Bar Contract adhering to Header specifications */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
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
      <footer className="border-t border-[#16251d] bg-[#060a08] py-4 px-4 text-xs font-mono text-[#62776a]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold">THEME #12:</span>
            <span>RETRO TERMINAL CONSOLE</span>
            <span>·</span>
            <span>RESPONSIBILITY EXCHANGE THEORY</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsCrtScanlinesEnabled(prev => !prev)}
              className="text-[#788e81] hover:text-emerald-300 cursor-pointer underline decoration-dotted"
            >
              SCANLINES: {isCrtScanlinesEnabled ? 'ON' : 'OFF'}
            </button>
            <span className="hidden sm:inline">·</span>
            <span>LEITNER SYSTEM: 5 ACTIVE BOXES</span>
            <span className="hidden sm:inline">·</span>
            <span className="text-emerald-400">
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
