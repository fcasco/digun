import React, { useState, useEffect, useCallback } from 'react';
import { 
  Volume2, 
  RotateCw, 
  ArrowRight, 
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
      // If no cards are strictly due, fallback to lowest boxes first so user is never stuck
      if (dueCards.length > 0) {
        pool = dueCards;
      } else {
        // Sort by box ascending (prioritize Box 1 & 2)
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

    // If rated 'again', re-append to the end of the current session queue for reinforcement
    let nextQueue = [...activeQueue];
    if (rating === 'again') {
      nextQueue.push(currentCard);
    }

    if (currentIndex + 1 < nextQueue.length) {
      setActiveQueue(nextQueue);
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      // Session finished
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
      // Ignore if inside input/textarea
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
  if (isSessionFinished || activeQueue.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 font-mono">
        <div className="border border-emerald-500/40 bg-[#0c1611] rounded-lg p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center gap-3 text-emerald-400 mb-4">
            <Trophy className="w-6 h-6 glow-emerald" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-wider glow-emerald">
              SESSION DISPATCH: COMPLETE
            </h2>
          </div>

          <p className="text-sm text-[#8fa397] mb-6 leading-relaxed">
            Spaced repetition cycle executed. Your neuromuscular speech circuits and subconscious communication defaults have been updated through deliberate reframing.
          </p>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div className="border border-[#1d3126] bg-[#09100c] p-3 rounded text-center">
              <div className="text-xs text-[#708579] mb-1">TOTAL DRILLS</div>
              <div className="text-2xl font-bold text-emerald-400 tabular-nums">
                {sessionStats.cardsReviewed}
              </div>
            </div>
            <div className="border border-[#1d3126] bg-[#09100c] p-3 rounded text-center">
              <div className="text-xs text-[#708579] mb-1">ADVANCED [BOX+]</div>
              <div className="text-2xl font-bold text-sky-400 tabular-nums">
                {sessionStats.goodCount + sessionStats.easyCount}
              </div>
            </div>
            <div className="border border-[#1d3126] bg-[#09100c] p-3 rounded text-center">
              <div className="text-xs text-[#708579] mb-1">REPEATS [AGAIN]</div>
              <div className="text-2xl font-bold text-amber-400 tabular-nums">
                {sessionStats.againCount}
              </div>
            </div>
            <div className="border border-[#1d3126] bg-[#09100c] p-3 rounded text-center">
              <div className="text-xs text-[#708579] mb-1">BOX 5 GRADUATES</div>
              <div className="text-2xl font-bold text-fuchsia-400 tabular-nums">
                {sessionStats.promotedToBox5}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[#1a2c22]">
            <button
              onClick={() => {
                soundEffects.playKeyClick();
                setStudyMode('all');
                buildQueue();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 glow-box-emerald"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>DRILL ALL 22+ REFRAMES</span>
            </button>
            <button
              onClick={() => {
                soundEffects.playKeyClick();
                onOpenVault();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded border border-[#243d2f] hover:border-emerald-500/50 bg-[#0e1813] text-emerald-300 hover:text-emerald-200 text-xs tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
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
      {/* HUD Toolbar: Mode Selection, Category Filter, and Rate Speed */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border border-[#1b2c22] bg-[#09110d] p-3 rounded">
        {/* Left: Study Mode & Queue Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#0f1b15] p-0.5 rounded border border-[#1e3025]">
            <button
              onClick={() => {
                soundEffects.playKeyClick();
                setStudyMode('due');
              }}
              className={`px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                studyMode === 'due'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-[#7d9185] hover:text-emerald-400'
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
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-[#7d9185] hover:text-emerald-400'
              }`}
            >
              FREE DRILL
            </button>
          </div>

          <div className="text-xs text-[#718579] hidden sm:block">
            CARD <span className="text-emerald-400 font-bold tabular-nums">{currentIndex + 1}</span> / {activeQueue.length}
          </div>
        </div>

        {/* Right: Filter Category & Speech Rate */}
        <div className="flex items-center gap-2">
          {/* Category Selector */}
          <div className="flex items-center gap-1.5 text-xs text-[#82968a]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#5e7467]" />
            <select
              value={filterCategory}
              onChange={(e) => {
                soundEffects.playKeyClick();
                setFilterCategory(e.target.value);
              }}
              className="bg-[#0e1713] border border-[#203428] text-xs text-[#9eb5a8] rounded px-2 py-1 focus:outline-none focus:border-emerald-500 cursor-pointer"
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
            className="text-[11px] px-2 py-1 rounded border border-[#203428] bg-[#0e1713] text-[#8fa396] hover:text-emerald-300 hover:border-emerald-500/40 transition-colors cursor-pointer whitespace-nowrap"
          >
            VOICE: <span className="text-emerald-400">{speechRate}x</span>
          </button>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-[#101b15] h-1.5 rounded-full overflow-hidden mb-6 border border-[#1b2b22]">
        <div
          className="bg-emerald-500 h-full transition-all duration-300 glow-emerald"
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
          <div className="absolute inset-0 w-full h-full rounded-lg border-2 border-[#203629] hover:border-emerald-500/40 bg-gradient-to-b from-[#0b1410] to-[#070c09] p-6 sm:p-8 flex flex-col justify-between backface-hidden shadow-2xl transition-all">
            
            {/* Top metadata strip: Unboxed text separated by dots/brackets (Anti-slop) */}
            <div className="flex items-center justify-between text-xs text-[#718679] border-b border-[#18281f] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">[BOX {currentCard.box}]</span>
                <span>·</span>
                <span>{currentCard.categoryLabel.toUpperCase()}</span>
                <span>·</span>
                <span className="hidden sm:inline">STREAK: {currentCard.streak}</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400/90">
                <span className="w-2 h-2 rounded-full bg-amber-400/70" />
                <span>TRIGGER STATE</span>
              </div>
            </div>

            {/* Middle: Scenario & Danger Phrase */}
            <div className="py-4 my-auto">
              {/* Context prompt */}
              <div className="text-xs uppercase tracking-wider text-[#698072] mb-3">
                SITUATION / CONVERSATIONAL TRIGGER:
              </div>
              <div className="text-sm sm:text-base text-[#c1d1c8] mb-6 leading-relaxed italic border-l-2 border-amber-500/40 pl-3">
                "{currentCard.context}"
              </div>

              {/* The Danger Phrase */}
              <div className="text-xs uppercase tracking-wider text-amber-400/90 mb-2 font-bold flex items-center justify-between">
                <span>DON'T SAY (DANGER PHRASE):</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(currentCard.dangerPhrase);
                  }}
                  className="text-amber-400 hover:text-amber-300 p-1 rounded hover:bg-amber-950/40 transition-colors"
                  title="Listen to trigger phrase"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-amber-300 tracking-wide font-mono glow-amber leading-snug">
                "{currentCard.dangerPhrase}"
              </div>
            </div>

            {/* Bottom prompt to flip */}
            <div className="pt-4 border-t border-[#18281f] flex items-center justify-between text-xs text-[#6e8577]">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-[#13221a] text-emerald-400 border border-emerald-500/30 text-[10px]">
                  SPACE
                </span>
                <span>PRESS SPACEBAR OR CLICK TO REVEAL REFRAME</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300">
                <span>REVEAL</span>
                <RotateCw className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>

          {/* ================= CARD BACK (Power Reframe, Psychology, Delivery) ================= */}
          <div className="absolute inset-0 w-full h-full rounded-lg border-2 border-emerald-500/50 bg-gradient-to-b from-[#0c1812] to-[#070e0a] p-6 sm:p-8 flex flex-col justify-between backface-hidden rotate-y-180 shadow-2xl transition-all glow-box-emerald">
            
            {/* Top metadata strip */}
            <div className="flex items-center justify-between text-xs text-[#718679] border-b border-[#1c3325] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">[BOX {currentCard.box}]</span>
                <span>·</span>
                <span className="text-emerald-300">{currentCard.psychologicalShift.toUpperCase()}</span>
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
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                      : 'bg-[#12241b] text-emerald-300 border-emerald-500/40 hover:bg-[#193225]'
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
              <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold mb-1.5">
                SAY INSTEAD (POWER REFRAME):
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-300 tracking-wide font-mono glow-emerald mb-4 leading-snug">
                "{currentCard.powerPhrase}"
              </div>

              {/* Rationale & Psychological Mechanism */}
              <div className="mb-3 bg-[#0a130f] border border-[#1b3124] p-3 rounded">
                <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>THE PSYCHOLOGICAL MECHANISM (THE "WHY"):</span>
                </div>
                <p className="text-xs text-[#a9c0b2] leading-relaxed">
                  {currentCard.rationale}
                </p>
              </div>

              {/* Delivery and Cadence Advice */}
              <div className="bg-[#0a130f] border border-[#1b3124] p-3 rounded">
                <div className="text-[11px] uppercase tracking-wider text-sky-400 font-bold mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>DELIVERY & VOCAL CADENCE:</span>
                </div>
                <p className="text-xs text-[#a9c0b2] leading-relaxed">
                  {currentCard.deliveryTip}
                </p>
              </div>
            </div>

            {/* Bottom: Instructions */}
            <div className="pt-2 border-t border-[#1c3325] flex items-center justify-between text-xs text-[#718679]">
              <span>GRADE YOUR RECALL READINESS BELOW</span>
              <span className="text-emerald-400 font-mono">[HOTKEYS 1–4]</span>
            </div>

          </div>
        </div>
      </div>

      {/* Leitner Rating Decision Console (Shows after flip, or can be triggered anytime) */}
      <div className="border border-[#1e3226] bg-[#0a130f] p-4 rounded-lg">
        <div className="flex items-center justify-between text-xs text-[#758a7d] mb-3">
          <span className="font-bold uppercase tracking-wider text-emerald-400/90">
            LEITNER RETENTION RATING:
          </span>
          <span className="text-[11px]">
            {isFlipped ? 'CHOOSE RETENTION QUALITY' : 'FLIP CARD [SPACE] BEFORE RATING'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Rating 1: Again */}
          <button
            onClick={() => handleRate('again')}
            className="px-3 py-2.5 rounded border border-rose-900/60 bg-[#170e10] hover:bg-rose-950/80 hover:border-rose-500 text-rose-400 text-xs font-mono font-medium tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group"
          >
            <div className="flex items-center gap-1.5 font-bold">
              <span className="text-[10px] px-1 py-0.2 rounded bg-rose-950 border border-rose-800 text-rose-300">1</span>
              <span>AGAIN</span>
            </div>
            <span className="text-[10px] text-rose-500/80 group-hover:text-rose-400">
              Reset to Box 1 (1d)
            </span>
          </button>

          {/* Rating 2: Hard */}
          <button
            onClick={() => handleRate('hard')}
            className="px-3 py-2.5 rounded border border-amber-900/60 bg-[#16120b] hover:bg-amber-950/80 hover:border-amber-500 text-amber-400 text-xs font-mono font-medium tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group"
          >
            <div className="flex items-center gap-1.5 font-bold">
              <span className="text-[10px] px-1 py-0.2 rounded bg-amber-950 border border-amber-800 text-amber-300">2</span>
              <span>HARD</span>
            </div>
            <span className="text-[10px] text-amber-500/80 group-hover:text-amber-400">
              Maintain Box ({currentCard.intervalDays}d)
            </span>
          </button>

          {/* Rating 3: Good */}
          <button
            onClick={() => handleRate('good')}
            className="px-3 py-2.5 rounded border border-emerald-900/60 bg-[#0e1712] hover:bg-emerald-950/80 hover:border-emerald-500 text-emerald-400 text-xs font-mono font-medium tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group"
          >
            <div className="flex items-center gap-1.5 font-bold">
              <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">3</span>
              <span>GOOD</span>
            </div>
            <span className="text-[10px] text-emerald-500/80 group-hover:text-emerald-400">
              Advance Box +1 ({Math.min(5, currentCard.box + 1) * 2}d)
            </span>
          </button>

          {/* Rating 4: Easy */}
          <button
            onClick={() => handleRate('easy')}
            className="px-3 py-2.5 rounded border border-sky-900/60 bg-[#0c1518] hover:bg-sky-950/80 hover:border-sky-500 text-sky-400 text-xs font-mono font-medium tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group"
          >
            <div className="flex items-center gap-1.5 font-bold">
              <span className="text-[10px] px-1 py-0.2 rounded bg-sky-950 border border-sky-800 text-sky-300">4</span>
              <span>EASY</span>
            </div>
            <span className="text-[10px] text-sky-500/80 group-hover:text-sky-400">
              Fast-track +2 Boxes
            </span>
          </button>
        </div>
      </div>

    </div>
  );
};
