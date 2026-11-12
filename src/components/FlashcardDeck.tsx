import React, { useState, useEffect, useCallback } from 'react';
import { 
  Volume2, 
  RotateCw, 
  Sparkles, 
  Trophy, 
  Layers, 
  CheckCircle2, 
  RefreshCcw,
  SlidersHorizontal
} from 'lucide-react';
import { ReframeCard, LeitnerRating, ReviewSessionStats } from '../types/reframe';
import { CATEGORIES } from '../data/defaultCards';
import { soundEffects } from '../utils/soundEffects';
import { speechEngine } from '../utils/speechSynthesis';

interface FlashcardDeckProps {
  cards: ReframeCard[];
  onRateCard: (cardId: string, rating: LeitnerRating) => { updatedCard: ReframeCard; promotedToBox5: boolean };
  onSessionComplete: (stats: ReviewSessionStats) => void;
  onOpenVault: () => void;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({
  cards,
  onRateCard,
  onSessionComplete,
  onOpenVault,
}) => {
  // Session queue state
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [studyMode, setStudyMode] = useState<'due' | 'all'>('due');
  const [activeQueue, setActiveQueue] = useState<ReframeCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Session analytics
  const [sessionStats, setSessionStats] = useState<ReviewSessionStats>({
    cardsReviewed: 0,
    againCount: 0,
    hardCount: 0,
    goodCount: 0,
    easyCount: 0,
    promotedToBox5: 0,
    startTime: Date.now(),
  });
  const [isSessionFinished, setIsSessionFinished] = useState<boolean>(false);

  // Initialize or re-filter queue
  const buildQueue = useCallback(() => {
    let pool = [...cards];
    if (filterCategory !== 'all') {
      pool = pool.filter(c => c.category === filterCategory);
    }

    if (studyMode === 'due') {
      const now = Date.now();
      const dueCards = pool.filter(c => !c.lastReviewedAt || c.timesReviewed === 0 || new Date(c.nextDueAt).getTime() <= now);
      if (dueCards.length > 0) {
        pool = dueCards;
      } else {
        // Fallback to lowest boxes first so user is never stranded
        pool = pool.sort((a, b) => a.box - b.box).slice(0, 10);
      }
    }

    setActiveQueue(pool);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsSessionFinished(false);
    setSessionStats({
      cardsReviewed: 0,
      againCount: 0,
      hardCount: 0,
      goodCount: 0,
      easyCount: 0,
      promotedToBox5: 0,
      startTime: Date.now(),
    });
  }, [cards, filterCategory, studyMode]);

  useEffect(() => {
    buildQueue();
  }, [buildQueue]);

  const currentCard: ReframeCard | undefined = activeQueue[currentIndex];

  // Flip card handler
  const handleFlip = useCallback(() => {
    soundEffects.playCardFlip();
    setIsFlipped(prev => !prev);
  }, []);

  // Voice playback handler
  const handleSpeak = useCallback((text: string) => {
    soundEffects.playKeyClick();
    setIsSpeaking(true);
    speechEngine.speak(text, {
      rate: speechRate,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  }, [speechRate]);

  // Rate card handler
  const handleRate = useCallback((rating: LeitnerRating) => {
    if (!currentCard) return;

    if (rating === 'again') {
      soundEffects.playAgainTone();
    } else {
      soundEffects.playSuccessTone();
    }

    const { promotedToBox5 } = onRateCard(currentCard.id, rating);

    setSessionStats(prev => ({
      ...prev,
      cardsReviewed: prev.cardsReviewed + 1,
      againCount: prev.againCount + (rating === 'again' ? 1 : 0),
      hardCount: prev.hardCount + (rating === 'hard' ? 1 : 0),
      goodCount: prev.goodCount + (rating === 'good' ? 1 : 0),
      easyCount: prev.easyCount + (rating === 'easy' ? 1 : 0),
      promotedToBox5: prev.promotedToBox5 + (promotedToBox5 ? 1 : 0),
    }));

    if (promotedToBox5) {
      setTimeout(() => soundEffects.playGraduationChime(), 200);
    }

    // If rated 'again', re-append to the session queue for reinforcement
    let nextQueue = [...activeQueue];
    if (rating === 'again') {
      nextQueue.push(currentCard);
    }

    if (currentIndex + 1 < nextQueue.length) {
      setActiveQueue(nextQueue);
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setIsSessionFinished(true);
      onSessionComplete({
        ...sessionStats,
        cardsReviewed: sessionStats.cardsReviewed + 1,
      });
    }
  }, [currentCard, onRateCard, activeQueue, currentIndex, sessionStats, onSessionComplete]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped) {
        if (e.key === '1') {
          e.preventDefault();
          handleRate('again');
        } else if (e.key === '2') {
          e.preventDefault();
          handleRate('hard');
        } else if (e.key === '3') {
          e.preventDefault();
          handleRate('good');
        } else if (e.key === '4') {
          e.preventDefault();
          handleRate('easy');
        } else if (e.key.toLowerCase() === 'a' && currentCard) {
          e.preventDefault();
          handleSpeak(currentCard.powerPhrase);
        }
      } else {
        if (e.key.toLowerCase() === 'a' && currentCard) {
          e.preventDefault();
          handleSpeak(currentCard.dangerPhrase);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleRate, handleSpeak, isFlipped, currentCard]);

  // Session summary view
  if (isSessionFinished || activeQueue.length === 0 || !currentCard) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 font-mono">
        <div className="border border-zinc-800 bg-zinc-950 rounded-lg p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 text-zinc-100 mb-4">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-wider text-zinc-100">
              SESSION DISPATCH: COMPLETE
            </h2>
          </div>

          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            Spaced repetition cycle executed. Your neuromuscular speech circuits and subconscious communication defaults have been reinforced through deliberate reframing.
          </p>

          {/* Metrics grid (Monochrome with accent focus) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div className="border border-zinc-800 bg-zinc-900/50 p-3 rounded text-center">
              <div className="text-xs text-zinc-500 mb-1">TOTAL DRILLS</div>
              <div className="text-2xl font-bold text-zinc-100 tabular-nums">
                {sessionStats.cardsReviewed}
              </div>
            </div>
            <div className="border border-zinc-800 bg-zinc-900/50 p-3 rounded text-center">
              <div className="text-xs text-zinc-500 mb-1">ADVANCED [BOX+]</div>
              <div className="text-2xl font-bold text-amber-400 tabular-nums">
                {sessionStats.goodCount + sessionStats.easyCount}
              </div>
            </div>
            <div className="border border-zinc-800 bg-zinc-900/50 p-3 rounded text-center">
              <div className="text-xs text-zinc-500 mb-1">REPEATS [AGAIN]</div>
              <div className="text-2xl font-bold text-zinc-400 tabular-nums">
                {sessionStats.againCount}
              </div>
            </div>
            <div className="border border-zinc-800 bg-zinc-900/50 p-3 rounded text-center">
              <div className="text-xs text-zinc-500 mb-1">BOX 5 GRADUATES</div>
              <div className="text-2xl font-bold text-zinc-100 tabular-nums">
                {sessionStats.promotedToBox5}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-zinc-800">
            <button
              onClick={() => {
                soundEffects.playKeyClick();
                setStudyMode('all');
                buildQueue();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4 text-amber-600" />
              <span>DRILL ALL 22+ REFRAMES</span>
            </button>
            <button
              onClick={() => {
                soundEffects.playKeyClick();
                onOpenVault();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded border border-zinc-700 hover:border-zinc-500 bg-zinc-900 text-zinc-200 text-xs tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Layers className="w-4 h-4" />
              <span>INSPECT LEITNER VAULT</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / activeQueue.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 font-mono">
      {/* HUD Toolbar: Monochrome with single-line controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border border-zinc-800/90 bg-zinc-950 p-3 rounded">
        {/* Left: Study Mode & Queue Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded border border-zinc-800">
            <button
              onClick={() => {
                soundEffects.playKeyClick();
                setStudyMode('due');
              }}
              className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                studyMode === 'due'
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              DUE CARDS
            </button>
            <button
              onClick={() => {
                soundEffects.playKeyClick();
                setStudyMode('all');
              }}
              className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                studyMode === 'all'
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              FREE DRILL
            </button>
          </div>

          <div className="text-xs text-zinc-400 hidden sm:block">
            CARD <span className="text-zinc-100 font-bold tabular-nums">{currentIndex + 1}</span> / {activeQueue.length}
          </div>
        </div>

        {/* Right: Filter Category & Speech Rate */}
        <div className="flex items-center gap-2">
          {/* Category Selector */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={filterCategory}
              onChange={(e) => {
                soundEffects.playKeyClick();
                setFilterCategory(e.target.value);
              }}
              className="bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded px-2 py-1 focus:outline-none focus:border-zinc-600 cursor-pointer"
            >
              <option value="all">ALL CATEGORIES</option>
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Voice Speed Toggle */}
          <button
            onClick={() => {
              soundEffects.playKeyClick();
              setSpeechRate(prev => (prev === 0.8 ? 1.0 : prev === 1.0 ? 1.2 : 0.8));
            }}
            title="Adjust Speech Cadence"
            className="text-[11px] px-2 py-1 rounded border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            VOICE: <span className="text-zinc-100 font-bold">{speechRate}x</span>
          </button>
        </div>
      </div>

      {/* Progress Track (Monochrome) */}
      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mb-6 border border-zinc-800">
        <div
          className="bg-zinc-300 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3D Spaced Repetition Flashcard */}
      <div className="perspective-1000 min-h-[420px] mb-6">
        <div 
          onClick={handleFlip}
          className={`w-full min-h-[420px] rounded-lg transition-transform duration-500 transform-style-3d cursor-pointer relative select-none ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* ================= CARD FRONT (Danger Phrase & Scenario Context) ================= */}
          <div className="absolute inset-0 w-full h-full rounded-lg border border-zinc-800 hover:border-zinc-600 bg-zinc-950 p-6 sm:p-8 flex flex-col justify-between backface-hidden shadow-2xl transition-all">
            
            {/* Top metadata strip (Zero-pill clean typography) */}
            <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-zinc-100 font-bold">[BOX {currentCard.box}]</span>
                <span>·</span>
                <span>{currentCard.categoryLabel.toUpperCase()}</span>
                <span>·</span>
                <span className="hidden sm:inline">STREAK: {currentCard.streak}</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                <span>TRIGGER STATE</span>
              </div>
            </div>

            {/* Middle: Scenario & Danger Phrase */}
            <div className="py-4 my-auto">
              <div className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
                SITUATION / CONVERSATIONAL TRIGGER:
              </div>
              <div className="text-sm sm:text-base text-zinc-300 mb-6 leading-relaxed italic border-l-2 border-zinc-700 pl-3">
                "{currentCard.context}"
              </div>

              <div className="text-xs uppercase tracking-wider text-zinc-400 mb-2 font-bold flex items-center justify-between">
                <span>DON'T SAY (DANGER PHRASE):</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(currentCard.dangerPhrase);
                  }}
                  className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-900 transition-colors"
                  title="Listen to trigger phrase"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-wide font-mono leading-snug">
                "{currentCard.dangerPhrase}"
              </div>
            </div>

            {/* Bottom prompt to flip */}
            <div className="pt-4 border-t border-zinc-850 flex items-center justify-between text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-750 text-[10px]">
                  SPACE
                </span>
                <span>PRESS SPACEBAR OR CLICK TO REVEAL REFRAME</span>
              </div>
              <div className="flex items-center gap-1 text-zinc-300 hover:text-white">
                <span>REVEAL</span>
                <RotateCw className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>

          {/* ================= CARD BACK (Power Reframe, Psychology, Delivery) ================= */}
          <div className="absolute inset-0 w-full h-full rounded-lg border border-zinc-700 bg-zinc-950 p-6 sm:p-8 flex flex-col justify-between backface-hidden rotate-y-180 shadow-2xl transition-all">
            
            {/* Top metadata strip */}
            <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-850 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-zinc-100 font-bold">[BOX {currentCard.box}]</span>
                <span>·</span>
                <span className="text-zinc-300">{currentCard.psychologicalShift.toUpperCase()}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(currentCard.powerPhrase);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer border ${
                    isSpeaking 
                      ? 'bg-zinc-100 text-zinc-950 border-white font-bold'
                      : 'bg-zinc-900 text-zinc-200 border-zinc-750 hover:bg-zinc-800'
                  }`}
                  title="Listen to Strategic Pronunciation [A]"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isSpeaking ? 'SPEAKING...' : 'SPEAK [A]'}</span>
                </button>
              </div>
            </div>

            {/* Middle: Power Phrase, Psychological Rationale, Delivery Tip */}
            <div className="py-2 my-auto">
              {/* Say Instead with focused amber accent title */}
              <div className="text-xs uppercase tracking-wider text-amber-400 font-bold mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>SAY INSTEAD (POWER REFRAME):</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white tracking-wide font-mono mb-4 leading-snug">
                "{currentCard.powerPhrase}"
              </div>

              {/* Rationale & Psychological Mechanism (Clean monochrome card) */}
              <div className="mb-3 bg-zinc-900/60 border border-zinc-800 p-3 rounded">
                <div className="text-[11px] uppercase tracking-wider text-zinc-300 font-bold mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                  <span>THE PSYCHOLOGICAL MECHANISM (THE "WHY"):</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {currentCard.rationale}
                </p>
              </div>

              {/* Delivery and Cadence Advice */}
              <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded">
                <div className="text-[11px] uppercase tracking-wider text-zinc-300 font-bold mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>DELIVERY & VOCAL CADENCE:</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {currentCard.deliveryTip}
                </p>
              </div>
            </div>

            {/* Bottom: Instructions */}
            <div className="pt-2 border-t border-zinc-850 flex items-center justify-between text-xs text-zinc-500">
              <span>GRADE YOUR RECALL READINESS BELOW</span>
              <span className="text-zinc-300 font-mono">[HOTKEYS 1–4]</span>
            </div>

          </div>
        </div>
      </div>

      {/* Leitner Rating Decision Console (Clean monochrome buttons with subtle accent focus) */}
      <div className="border border-zinc-800 bg-zinc-950 p-4 rounded-lg">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
          <span className="font-bold uppercase tracking-wider text-zinc-200">
            LEITNER RETENTION RATING:
          </span>
          <span className="text-[11px] text-zinc-500">
            {isFlipped ? 'CHOOSE RETENTION QUALITY' : 'FLIP CARD [SPACE] BEFORE RATING'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Rating 1: Again */}
          <button
            onClick={() => handleRate('again')}
            className="px-3 py-2.5 rounded border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-600 text-zinc-300 text-xs font-mono font-medium tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group"
          >
            <div className="flex items-center gap-1.5 font-bold">
              <span className="text-[10px] px-1 py-0.2 rounded bg-zinc-800 border border-zinc-700 text-zinc-200">1</span>
              <span>AGAIN</span>
            </div>
            <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400">
              Reset to Box 1 (1d)
            </span>
          </button>

          {/* Rating 2: Hard */}
          <button
            onClick={() => handleRate('hard')}
            className="px-3 py-2.5 rounded border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-600 text-zinc-300 text-xs font-mono font-medium tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group"
          >
            <div className="flex items-center gap-1.5 font-bold">
              <span className="text-[10px] px-1 py-0.2 rounded bg-zinc-800 border border-zinc-700 text-zinc-200">2</span>
              <span>HARD</span>
            </div>
            <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400">
              Maintain ({currentCard.intervalDays}d)
            </span>
          </button>

          {/* Rating 3: Good */}
          <button
            onClick={() => handleRate('good')}
            className="px-3 py-2.5 rounded border border-zinc-750 bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-500 text-zinc-100 text-xs font-mono font-medium tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group"
          >
            <div className="flex items-center gap-1.5 font-bold">
              <span className="text-[10px] px-1 py-0.2 rounded bg-zinc-800 border border-zinc-600 text-white">3</span>
              <span>GOOD</span>
            </div>
            <span className="text-[10px] text-zinc-400 group-hover:text-zinc-300">
              Advance +1 ({Math.min(5, currentCard.box + 1) * 2}d)
            </span>
          </button>

          {/* Rating 4: Easy */}
          <button
            onClick={() => handleRate('easy')}
            className="px-3 py-2.5 rounded border border-zinc-750 bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-500 text-zinc-100 text-xs font-mono font-medium tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group"
          >
            <div className="flex items-center gap-1.5 font-bold">
              <span className="text-[10px] px-1 py-0.2 rounded bg-zinc-800 border border-zinc-600 text-white">4</span>
              <span>EASY</span>
            </div>
            <span className="text-[10px] text-zinc-400 group-hover:text-zinc-300">
              Fast-track +2 Boxes
            </span>
          </button>
        </div>
      </div>

    </div>
  );
};
