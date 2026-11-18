import React, { useState, useEffect, useCallback } from 'react';
import { 
  Volume2, 
  VolumeX,
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
import { useTheme } from '../context/ThemeContext';

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
  const { isSlate, isClay, isSaas, isNordic, isGlass, isBrutal, isObsidian } = useTheme();

  // Session queue state
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [studyMode, setStudyMode] = useState<'due' | 'all'>('due');
  const [activeQueue, setActiveQueue] = useState<ReframeCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);

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
    speechEngine.stop();
    setIsSpeaking(false);
    setSpeechNotice(null);

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

  // Stop speech when unmounting
  useEffect(() => {
    return () => {
      speechEngine.stop();
    };
  }, []);

  const currentCard: ReframeCard | undefined = activeQueue[currentIndex];

  // Flip card handler
  const handleFlip = useCallback(() => {
    soundEffects.playCardFlip();
    setSpeechNotice(null);
    setIsFlipped(prev => !prev);
  }, []);

  // Voice playback handler (toggles stop if already speaking)
  const handleSpeak = useCallback((text: string) => {
    if (isSpeaking) {
      speechEngine.stop();
      setIsSpeaking(false);
      return;
    }

    setSpeechNotice(null);
    setIsSpeaking(true);
    speechEngine.speak(text, {
      rate: speechRate,
      onStart: () => {
        setIsSpeaking(true);
        setSpeechNotice(null);
      },
      onEnd: () => {
        setIsSpeaking(false);
      },
      onError: (err) => {
        setIsSpeaking(false);
        setSpeechNotice(err.message || 'Browser speech synthesis unavailable.');
      },
    });
  }, [isSpeaking, speechRate]);

  // Rate card handler
  const handleRate = useCallback((rating: LeitnerRating) => {
    if (!currentCard) return;

    speechEngine.stop();
    setIsSpeaking(false);
    setSpeechNotice(null);

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
    const nextQueue = [...activeQueue];
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
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tagName = (e.target as HTMLElement)?.tagName;
      if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key.toLowerCase() === 'a' || e.code === 'KeyA') {
        if (currentCard) {
          e.preventDefault();
          handleSpeak(isFlipped ? currentCard.powerPhrase : currentCard.dangerPhrase);
        }
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
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleRate, handleSpeak, isFlipped, currentCard]);

  // Session summary view
  if (isSessionFinished || activeQueue.length === 0 || !currentCard) {
    return (
      <div className={`max-w-3xl mx-auto px-4 py-8 ${isSlate || isBrutal || isObsidian || isGlass || isNordic || isSaas || isClay ? 'font-sans' : 'font-mono'}`}>
        <div
          className={
            isSlate
              ? 'slate-card-elevated border border-teal-400/35 rounded-lg p-6 sm:p-8 relative overflow-hidden'
              : isClay
              ? 'clay-card-elevated border border-white/95 rounded-3xl p-6 sm:p-8 relative overflow-hidden'
              : isSaas
              ? 'saas-card-elevated border border-slate-200 rounded-xl p-6 sm:p-8 relative overflow-hidden'
              : isNordic
              ? 'nordic-card-elevated border border-[#DDD7C8] rounded-2xl p-6 sm:p-8 relative overflow-hidden'
              : isGlass
              ? 'glass-panel-elevated border border-white/25 rounded-2xl p-6 sm:p-8 relative overflow-hidden'
              : isBrutal
              ? 'border-2 border-black bg-white p-6 sm:p-8 brutal-shadow-lg relative overflow-hidden'
              : isObsidian
              ? 'border border-[#D4AF37]/30 obsidian-surface p-6 sm:p-8 relative overflow-hidden'
              : 'border border-zinc-800 bg-zinc-950 rounded-lg p-6 sm:p-8 shadow-2xl relative overflow-hidden'
          }
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className={isSlate ? 'p-2 rounded-md bg-teal-400/15 border border-teal-400/35 text-teal-300' : isClay ? 'p-2.5 rounded-2xl bg-[#E5E9FF] border border-white/80 text-indigo-600 shadow-sm' : isSaas ? 'p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600' : isNordic ? 'p-2 rounded-xl bg-[#E7EFEA] border border-[#B8CBBF] text-[#3B5948]' : isBrutal ? 'p-2 bg-[#FFE500] border-2 border-black text-black' : isGlass ? 'p-2 rounded-xl bg-sky-400/15 border border-sky-300/35 text-sky-300' : ''}>
              <Trophy className={isSlate ? 'w-5 h-5 text-teal-300' : isClay ? 'w-5 h-5 text-indigo-600' : isSaas ? 'w-5 h-5 text-indigo-600' : isNordic ? 'w-5 h-5 text-[#527360]' : isGlass ? 'w-5 h-5 text-sky-300' : isBrutal ? 'w-5 h-5 text-black' : isObsidian ? 'w-5 h-5 text-[#D4AF37]' : 'w-5 h-5 text-amber-400'} />
            </div>
            <h2
              className={
                isSlate
                  ? 'text-xl sm:text-2xl font-bold tracking-tight text-slate-100'
                  : isClay
                  ? 'text-xl sm:text-2xl font-bold tracking-tight text-[#1E2547]'
                  : isSaas
                  ? 'text-xl sm:text-2xl font-bold tracking-tight text-slate-900'
                  : isNordic
                  ? 'text-xl sm:text-2xl font-bold tracking-tight text-[#242E28]'
                  : isGlass
                  ? 'text-xl sm:text-2xl font-bold tracking-tight text-white'
                  : isBrutal
                  ? 'text-xl sm:text-2xl font-black tracking-tight text-black'
                  : isObsidian
                  ? 'font-luxury text-2xl sm:text-3xl font-semibold tracking-wide text-[#F5F0E6]'
                  : 'text-xl sm:text-2xl font-bold tracking-wider text-zinc-100'
              }
            >
              SESSION DISPATCH: COMPLETE
            </h2>
          </div>

          <p className={isSlate ? 'text-sm text-slate-300 mb-6 leading-relaxed' : isClay ? 'text-sm text-[#4B5478] mb-6 leading-relaxed' : isSaas ? 'text-sm text-slate-600 mb-6 leading-relaxed' : isNordic ? 'text-sm text-[#4E5A53] mb-6 leading-relaxed' : isGlass ? 'text-sm text-slate-300 mb-6 leading-relaxed' : isBrutal ? 'text-sm text-zinc-700 font-medium mb-6 leading-relaxed' : isObsidian ? 'text-sm text-[#A39E93] mb-6 leading-relaxed' : 'text-sm text-zinc-400 mb-6 leading-relaxed'}>
            Spaced repetition cycle executed. Your neuromuscular speech circuits and subconscious communication defaults have been reinforced through deliberate reframing.
          </p>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-8">
            <div
              className={
                isSlate
                  ? 'slate-well border border-slate-800 rounded-md p-3.5 text-center'
                  : isClay
                  ? 'clay-well border border-white/70 rounded-2xl p-3.5 text-center'
                  : isSaas
                  ? 'saas-well border border-slate-200 rounded-lg p-3.5 text-center'
                  : isNordic
                  ? 'nordic-well border border-[#E2DDD0] rounded-xl p-3.5 text-center'
                  : isGlass
                  ? 'glass-well border border-white/15 rounded-xl p-3.5 text-center'
                  : isBrutal
                  ? 'border-2 border-black bg-[#F4F1EA] p-3 text-center brutal-shadow-sm'
                  : isObsidian
                  ? 'border border-[#2A241A] bg-[#070709] p-3.5 text-center'
                  : 'border border-zinc-800 bg-zinc-900/50 p-3 rounded text-center'
              }
            >
              <div className={isSlate ? 'text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1' : isClay ? 'text-[10px] font-semibold uppercase tracking-wider text-[#647094] mb-1' : isSaas ? 'text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1' : isNordic ? 'text-[10px] font-semibold uppercase tracking-wider text-[#5C6962] mb-1' : isGlass ? 'text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1' : isBrutal ? 'text-xs font-extrabold text-zinc-700 mb-1' : isObsidian ? 'text-[10px] uppercase tracking-[0.16em] text-[#8E877A] mb-1' : 'text-xs text-zinc-500 mb-1'}>
                TOTAL DRILLS
              </div>
              <div className={isSlate ? 'text-2xl font-bold font-mono text-slate-100 tabular-nums' : isClay ? 'text-2xl font-bold font-mono text-[#1E2547] tabular-nums' : isSaas ? 'text-2xl font-bold font-mono text-slate-900 tabular-nums' : isNordic ? 'text-2xl font-bold font-mono text-[#242E28] tabular-nums' : isGlass ? 'text-2xl font-bold font-mono text-white tabular-nums' : isBrutal ? 'text-2xl font-black text-black tabular-nums' : isObsidian ? 'text-2xl font-mono font-semibold text-[#F5F0E6] tabular-nums' : 'text-2xl font-bold text-zinc-100 tabular-nums'}>
                {sessionStats.cardsReviewed}
              </div>
            </div>
            <div
              className={
                isSlate
                  ? 'border border-teal-400/35 bg-teal-950/35 rounded-md p-3.5 text-center'
                  : isClay
                  ? 'border border-white/80 bg-[#E5E9FF] rounded-2xl p-3.5 text-center shadow-sm'
                  : isSaas
                  ? 'border border-indigo-200 bg-indigo-50/75 rounded-lg p-3.5 text-center'
                  : isNordic
                  ? 'border border-[#B8CBBF] bg-[#E7EFEA] rounded-xl p-3.5 text-center'
                  : isGlass
                  ? 'border border-sky-300/40 bg-sky-950/35 rounded-xl p-3.5 text-center'
                  : isBrutal
                  ? 'border-2 border-black bg-[#FFE500] p-3 text-center brutal-shadow-sm'
                  : isObsidian
                  ? 'border border-[#D4AF37]/40 bg-[#14110C] p-3.5 text-center'
                  : 'border border-zinc-800 bg-zinc-900/50 p-3 rounded text-center'
              }
            >
              <div className={isSlate ? 'text-[10px] font-semibold uppercase tracking-wider text-teal-300 mb-1' : isClay ? 'text-[10px] font-semibold uppercase tracking-wider text-indigo-700 mb-1' : isSaas ? 'text-[10px] font-semibold uppercase tracking-wider text-indigo-700 mb-1' : isNordic ? 'text-[10px] font-semibold uppercase tracking-wider text-[#2D4739] mb-1' : isGlass ? 'text-[10px] font-semibold uppercase tracking-wider text-sky-200 mb-1' : isBrutal ? 'text-xs font-extrabold text-black mb-1' : isObsidian ? 'text-[10px] uppercase tracking-[0.16em] text-[#C5A059] mb-1' : 'text-xs text-zinc-500 mb-1'}>
                ADVANCED [BOX+]
              </div>
              <div className={isSlate ? 'text-2xl font-bold font-mono text-teal-300 tabular-nums' : isClay ? 'text-2xl font-bold font-mono text-indigo-600 tabular-nums' : isSaas ? 'text-2xl font-bold font-mono text-indigo-700 tabular-nums' : isNordic ? 'text-2xl font-bold font-mono text-[#3B5948] tabular-nums' : isGlass ? 'text-2xl font-bold font-mono text-sky-300 tabular-nums' : isBrutal ? 'text-2xl font-black text-black tabular-nums' : isObsidian ? 'text-2xl font-mono font-semibold text-[#E5C77B] tabular-nums' : 'text-2xl font-bold text-amber-400 tabular-nums'}>
                {sessionStats.goodCount + sessionStats.easyCount}
              </div>
            </div>
            <div
              className={
                isSlate
                  ? 'border border-rose-500/35 bg-rose-950/35 rounded-md p-3.5 text-center'
                  : isClay
                  ? 'border border-white/80 bg-[#FFE8EC] rounded-2xl p-3.5 text-center shadow-sm'
                  : isSaas
                  ? 'border border-rose-200 bg-rose-50/75 rounded-lg p-3.5 text-center'
                  : isNordic
                  ? 'border border-[#E4C5B9] bg-[#FAF0EC] rounded-xl p-3.5 text-center'
                  : isGlass
                  ? 'glass-well border border-white/15 rounded-xl p-3.5 text-center'
                  : isBrutal
                  ? 'border-2 border-black bg-[#FFE4E6] p-3 text-center brutal-shadow-sm'
                  : isObsidian
                  ? 'border border-[#2A241A] bg-[#070709] p-3.5 text-center'
                  : 'border border-zinc-800 bg-zinc-900/50 p-3 rounded text-center'
              }
            >
              <div className={isSlate ? 'text-[10px] font-semibold uppercase tracking-wider text-rose-300 mb-1' : isClay ? 'text-[10px] font-semibold uppercase tracking-wider text-[#9F1239] mb-1' : isSaas ? 'text-[10px] font-semibold uppercase tracking-wider text-rose-700 mb-1' : isNordic ? 'text-[10px] font-semibold uppercase tracking-wider text-[#964B36] mb-1' : isGlass ? 'text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1' : isBrutal ? 'text-xs font-extrabold text-black mb-1' : isObsidian ? 'text-[10px] uppercase tracking-[0.16em] text-[#8E877A] mb-1' : 'text-xs text-zinc-500 mb-1'}>
                REPEATS [AGAIN]
              </div>
              <div className={isSlate ? 'text-2xl font-bold font-mono text-rose-200 tabular-nums' : isClay ? 'text-2xl font-bold font-mono text-[#9F1239] tabular-nums' : isSaas ? 'text-2xl font-bold font-mono text-rose-700 tabular-nums' : isNordic ? 'text-2xl font-bold font-mono text-[#7D3B29] tabular-nums' : isGlass ? 'text-2xl font-bold font-mono text-rose-200 tabular-nums' : isBrutal ? 'text-2xl font-black text-black tabular-nums' : isObsidian ? 'text-2xl font-mono font-semibold text-[#A39E93] tabular-nums' : 'text-2xl font-bold text-zinc-400 tabular-nums'}>
                {sessionStats.againCount}
              </div>
            </div>
            <div
              className={
                isSlate
                  ? 'slate-well border border-slate-800 rounded-md p-3.5 text-center'
                  : isClay
                  ? 'border border-white/80 bg-[#E3FCEC] rounded-2xl p-3.5 text-center shadow-sm'
                  : isSaas
                  ? 'border border-emerald-200 bg-emerald-50/75 rounded-lg p-3.5 text-center'
                  : isNordic
                  ? 'border border-[#DFD3BE] bg-[#F5EFE4] rounded-xl p-3.5 text-center'
                  : isGlass
                  ? 'glass-well border border-white/15 rounded-xl p-3.5 text-center'
                  : isBrutal
                  ? 'border-2 border-black bg-[#86EFAC] p-3 text-center brutal-shadow-sm'
                  : isObsidian
                  ? 'border border-[#2A241A] bg-[#070709] p-3.5 text-center'
                  : 'border border-zinc-800 bg-zinc-900/50 p-3 rounded text-center'
              }
            >
              <div className={isSlate ? 'text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1' : isClay ? 'text-[10px] font-semibold uppercase tracking-wider text-[#065F46] mb-1' : isSaas ? 'text-[10px] font-semibold uppercase tracking-wider text-emerald-700 mb-1' : isNordic ? 'text-[10px] font-semibold uppercase tracking-wider text-[#614F35] mb-1' : isGlass ? 'text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1' : isBrutal ? 'text-xs font-extrabold text-black mb-1' : isObsidian ? 'text-[10px] uppercase tracking-[0.16em] text-[#8E877A] mb-1' : 'text-xs text-zinc-500 mb-1'}>
                BOX 5 GRADUATES
              </div>
              <div className={isSlate ? 'text-2xl font-bold font-mono text-slate-100 tabular-nums' : isClay ? 'text-2xl font-bold font-mono text-[#065F46] tabular-nums' : isSaas ? 'text-2xl font-bold font-mono text-emerald-700 tabular-nums' : isNordic ? 'text-2xl font-bold font-mono text-[#242E28] tabular-nums' : isGlass ? 'text-2xl font-bold font-mono text-white tabular-nums' : isBrutal ? 'text-2xl font-black text-black tabular-nums' : isObsidian ? 'text-2xl font-mono font-semibold text-[#F5F0E6] tabular-nums' : 'text-2xl font-bold text-zinc-100 tabular-nums'}>
                {sessionStats.promotedToBox5}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className={`flex flex-col sm:flex-row items-center gap-3 pt-4 ${isSlate ? 'border-t border-slate-800' : isClay ? 'border-t border-indigo-900/10' : isSaas ? 'border-t border-slate-200' : isNordic ? 'border-t border-[#E4DFD4]' : isGlass ? 'border-t border-white/15' : isBrutal ? 'border-t-2 border-black' : isObsidian ? 'border-t border-[#2A241A]' : 'border-t border-zinc-800'}`}>
            <button
              onClick={() => {
                soundEffects.playKeyClick();
                setStudyMode('all');
                buildQueue();
              }}
              className={
                isSlate
                  ? 'w-full sm:w-auto px-5 py-2.5 rounded-md bg-teal-400 hover:bg-teal-300 text-slate-950 border border-teal-300 font-semibold text-xs tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs'
                  : isClay
                  ? 'w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white border border-indigo-400/60 font-semibold text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 clay-btn whitespace-nowrap shrink-0'
                  : isSaas
                  ? 'w-full sm:w-auto px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600 font-semibold text-xs tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs'
                  : isNordic
                  ? 'w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#527360] hover:bg-[#425F4E] text-[#FDFBF7] border border-[#425F4E] font-semibold text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm'
                  : isGlass
                  ? 'w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 border border-sky-300 font-semibold text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20'
                  : isBrutal
                  ? 'w-full sm:w-auto px-5 py-2.5 bg-[#FFE500] hover:bg-[#FACC15] text-black border-2 border-black font-black text-xs tracking-wide cursor-pointer flex items-center justify-center gap-2 brutal-btn'
                  : isObsidian
                  ? 'w-full sm:w-auto px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C77B] text-[#070709] border border-[#E5C77B] font-semibold text-[11px] uppercase tracking-[0.16em] transition-colors cursor-pointer flex items-center justify-center gap-2'
                  : 'w-full sm:w-auto px-5 py-2.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2'
              }
            >
              <RefreshCcw className={isSlate ? 'w-4 h-4 text-slate-950' : isClay || isSaas ? 'w-4 h-4 text-white' : isNordic ? 'w-4 h-4 text-[#FDFBF7]' : isGlass ? 'w-4 h-4 text-slate-950' : isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#070709]' : 'w-4 h-4 text-amber-600'} />
              <span>DRILL ALL {cards.length}+ REFRAMES</span>
            </button>
            <button
              onClick={() => {
                soundEffects.playKeyClick();
                onOpenVault();
              }}
              className={
                isSlate
                  ? 'w-full sm:w-auto px-5 py-2.5 rounded-md bg-[#0B1220] border border-slate-700 hover:border-teal-400/50 text-slate-200 hover:text-white font-medium text-xs tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-2'
                  : isClay
                  ? 'w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-white border border-white/90 text-[#1E2547] hover:text-indigo-600 font-semibold text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 clay-btn-soft whitespace-nowrap shrink-0'
                  : isSaas
                  ? 'w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-2'
                  : isNordic
                  ? 'w-full sm:w-auto px-5 py-2.5 rounded-xl nordic-well border border-[#DDD7C8] hover:border-[#527360]/50 text-[#242E28] font-medium text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2'
                  : isGlass
                  ? 'w-full sm:w-auto px-5 py-2.5 rounded-xl glass-well border border-white/20 hover:border-white/35 text-white font-medium text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2'
                  : isBrutal
                  ? 'w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-[#F4F1EA] text-black border-2 border-black font-extrabold text-xs tracking-wide cursor-pointer flex items-center justify-center gap-2 brutal-btn'
                  : isObsidian
                  ? 'w-full sm:w-auto px-5 py-2.5 border border-[#2A241A] hover:border-[#D4AF37]/50 bg-[#070709] text-[#F5F0E6] text-[11px] uppercase tracking-[0.16em] transition-colors cursor-pointer flex items-center justify-center gap-2'
                  : 'w-full sm:w-auto px-5 py-2.5 rounded border border-zinc-700 hover:border-zinc-500 bg-zinc-900 text-zinc-200 text-xs tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2'
              }
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
  const activePhraseText = isFlipped ? currentCard.powerPhrase : currentCard.dangerPhrase;

  return (
    <div className={`max-w-4xl mx-auto px-4 py-6 ${isSlate || isBrutal || isObsidian || isGlass || isNordic || isSaas || isClay ? 'font-sans' : 'font-mono'}`}>
      {/* HUD Toolbar */}
      <div
        className={
          isSlate
            ? 'flex flex-wrap items-center justify-between gap-3 mb-5 border border-slate-700/80 slate-card rounded-lg p-3'
            : isClay
            ? 'flex flex-wrap items-center justify-between gap-3 mb-5 border border-white/90 clay-card rounded-3xl p-3.5'
            : isSaas
            ? 'flex flex-wrap items-center justify-between gap-3 mb-5 border border-slate-200 saas-card rounded-xl p-3'
            : isNordic
            ? 'flex flex-wrap items-center justify-between gap-3 mb-5 border border-[#E4DFD4] nordic-card rounded-2xl p-3'
            : isGlass
            ? 'flex flex-wrap items-center justify-between gap-3 mb-5 border border-white/20 glass-panel rounded-2xl p-3'
            : isBrutal
            ? 'flex flex-wrap items-center justify-between gap-3 mb-5 border-2 border-black bg-white p-3 brutal-shadow'
            : isObsidian
            ? 'flex flex-wrap items-center justify-between gap-3 mb-5 border border-[#2A241A] obsidian-surface p-3'
            : 'flex flex-wrap items-center justify-between gap-3 mb-5 border border-zinc-800/90 bg-zinc-950 p-3 rounded'
        }
      >
        {/* Left: Study Mode & Queue Stats */}
        <div className="flex items-center gap-3">
          <div
            className={
              isSlate
                ? 'flex items-center gap-1 slate-well p-0.5 rounded-md border border-slate-800'
                : isClay
                ? 'flex items-center gap-1 clay-well p-1 rounded-2xl border border-white/70'
                : isSaas
                ? 'flex items-center gap-1 saas-well p-0.5 rounded-lg border border-slate-200'
                : isNordic
                ? 'flex items-center gap-1 nordic-well p-0.5 rounded-xl border border-[#DDD7C8]'
                : isGlass
                ? 'flex items-center gap-1 glass-well p-0.5 rounded-xl border border-white/15'
                : isBrutal
                ? 'flex items-center gap-1 bg-[#F4F1EA] p-0.5 border-2 border-black'
                : isObsidian
                ? 'flex items-center gap-1 bg-[#070709] p-0.5 border border-[#2A241A]'
                : 'flex items-center gap-1 bg-zinc-900 p-0.5 rounded border border-zinc-800'
            }
          >
            <button
              onClick={() => {
                soundEffects.playKeyClick();
                setStudyMode('due');
              }}
              className={
                isSlate
                  ? `px-3 py-1 text-xs rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                      studyMode === 'due'
                        ? 'bg-teal-400 text-slate-950 font-semibold'
                        : 'text-slate-300 hover:text-white'
                    }`
                  : isClay
                  ? `px-3 py-1 text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      studyMode === 'due'
                        ? 'bg-indigo-500 text-white font-semibold clay-btn'
                        : 'text-[#4B5478] hover:text-[#1E2547]'
                    }`
                  : isSaas
                  ? `px-3 py-1 text-xs rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      studyMode === 'due'
                        ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`
                  : isNordic
                  ? `px-3 py-1 text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      studyMode === 'due'
                        ? 'bg-[#527360] text-[#FDFBF7] font-semibold shadow-sm'
                        : 'text-[#4E5A53] hover:text-[#242E28]'
                    }`
                  : isGlass
                  ? `px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      studyMode === 'due'
                        ? 'bg-sky-400 text-slate-950 font-semibold shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`
                  : isBrutal
                  ? `px-2.5 py-1 text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                      studyMode === 'due'
                        ? 'bg-[#FFE500] text-black border border-black'
                        : 'text-zinc-700 hover:text-black'
                    }`
                  : isObsidian
                  ? `px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] transition-colors cursor-pointer whitespace-nowrap ${
                      studyMode === 'due'
                        ? 'bg-[#D4AF37] text-[#070709] font-semibold'
                        : 'text-[#A39E93] hover:text-[#F5F0E6]'
                    }`
                  : `px-2.5 py-1 text-xs rounded transition-colors cursor-pointer whitespace-nowrap ${
                      studyMode === 'due'
                        ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`
              }
            >
              DUE CARDS
            </button>
            <button
              onClick={() => {
                soundEffects.playKeyClick();
                setStudyMode('all');
              }}
              className={
                isSlate
                  ? `px-3 py-1 text-xs rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                      studyMode === 'all'
                        ? 'bg-teal-400 text-slate-950 font-semibold'
                        : 'text-slate-300 hover:text-white'
                    }`
                  : isClay
                  ? `px-3 py-1 text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      studyMode === 'all'
                        ? 'bg-indigo-500 text-white font-semibold clay-btn'
                        : 'text-[#4B5478] hover:text-[#1E2547]'
                    }`
                  : isSaas
                  ? `px-3 py-1 text-xs rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      studyMode === 'all'
                        ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`
                  : isNordic
                  ? `px-3 py-1 text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      studyMode === 'all'
                        ? 'bg-[#527360] text-[#FDFBF7] font-semibold shadow-sm'
                        : 'text-[#4E5A53] hover:text-[#242E28]'
                    }`
                  : isGlass
                  ? `px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                      studyMode === 'all'
                        ? 'bg-sky-400 text-slate-950 font-semibold shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`
                  : isBrutal
                  ? `px-2.5 py-1 text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                      studyMode === 'all'
                        ? 'bg-[#FFE500] text-black border border-black'
                        : 'text-zinc-700 hover:text-black'
                    }`
                  : isObsidian
                  ? `px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] transition-colors cursor-pointer whitespace-nowrap ${
                      studyMode === 'all'
                        ? 'bg-[#D4AF37] text-[#070709] font-semibold'
                        : 'text-[#A39E93] hover:text-[#F5F0E6]'
                    }`
                  : `px-2.5 py-1 text-xs rounded transition-colors cursor-pointer whitespace-nowrap ${
                      studyMode === 'all'
                        ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`
              }
            >
              FREE DRILL
            </button>
          </div>

          <div
            className={
              isSlate
                ? 'text-xs text-slate-400 hidden sm:block whitespace-nowrap'
                : isClay
                ? 'text-xs text-[#647094] hidden sm:block whitespace-nowrap'
                : isSaas
                ? 'text-xs text-slate-500 hidden sm:block whitespace-nowrap'
                : isNordic
                ? 'text-xs text-[#5C6962] hidden sm:block whitespace-nowrap'
                : isGlass
                ? 'text-xs text-slate-300 hidden sm:block whitespace-nowrap'
                : isBrutal
                ? 'text-xs text-zinc-700 font-bold hidden sm:block whitespace-nowrap'
                : isObsidian
                ? 'text-[11px] uppercase tracking-[0.16em] text-[#A39E93] hidden sm:block whitespace-nowrap'
                : 'text-xs text-zinc-400 hidden sm:block whitespace-nowrap'
            }
          >
            CARD{' '}
            <span className={isSlate ? 'text-teal-300 font-mono font-semibold tabular-nums' : isClay ? 'text-[#1E2547] font-mono font-semibold tabular-nums' : isSaas ? 'text-slate-900 font-mono font-semibold tabular-nums' : isNordic ? 'text-[#242E28] font-mono font-semibold tabular-nums' : isGlass ? 'text-sky-300 font-mono font-semibold tabular-nums' : isBrutal ? 'text-black font-black tabular-nums' : isObsidian ? 'text-[#E5C77B] font-mono font-semibold tabular-nums' : 'text-zinc-100 font-bold tabular-nums'}>
              {currentIndex + 1}
            </span>{' '}
            / <span className="font-mono tabular-nums">{activeQueue.length}</span>
          </div>
        </div>

        {/* Right: Filter Category, Speak Control & Speech Rate */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Selector */}
          <div className={isSlate ? 'flex items-center gap-1.5 text-xs text-slate-300' : isClay ? 'flex items-center gap-1.5 text-xs text-[#4B5478]' : isSaas ? 'flex items-center gap-1.5 text-xs text-slate-500' : isNordic ? 'flex items-center gap-1.5 text-xs text-[#4E5A53]' : isGlass ? 'flex items-center gap-1.5 text-xs text-slate-300' : isBrutal ? 'flex items-center gap-1.5 text-xs text-black' : isObsidian ? 'flex items-center gap-1.5 text-xs text-[#A39E93]' : 'flex items-center gap-1.5 text-xs text-zinc-400'}>
            <SlidersHorizontal className={isSlate ? 'w-3.5 h-3.5 text-teal-400' : isClay ? 'w-3.5 h-3.5 text-indigo-500' : isSaas ? 'w-3.5 h-3.5 text-indigo-600' : isNordic ? 'w-3.5 h-3.5 text-[#527360]' : isGlass ? 'w-3.5 h-3.5 text-sky-300' : isBrutal ? 'w-3.5 h-3.5 text-black' : isObsidian ? 'w-3.5 h-3.5 text-[#C5A059]' : 'w-3.5 h-3.5 text-zinc-500'} />
            <select
              value={filterCategory}
              onChange={(e) => {
                soundEffects.playKeyClick();
                setFilterCategory(e.target.value);
                e.currentTarget.blur();
              }}
              className={
                isSlate
                  ? 'slate-well border border-slate-700/80 focus:border-teal-400 text-xs font-medium text-slate-100 rounded-md px-2.5 py-1.5 focus:outline-none cursor-pointer'
                  : isClay
                  ? 'clay-well border border-white/70 focus:border-indigo-300 text-xs font-semibold text-[#1E2547] rounded-2xl px-3 py-1.5 focus:outline-none cursor-pointer'
                  : isSaas
                  ? 'saas-well border border-slate-200 focus:border-indigo-500 text-xs font-medium text-slate-900 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer'
                  : isNordic
                  ? 'nordic-well border border-[#DDD7C8] focus:border-[#527360] text-xs font-medium text-[#242E28] rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer'
                  : isGlass
                  ? 'glass-well border border-white/15 focus:border-sky-300/60 text-xs font-medium text-slate-100 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer'
                  : isBrutal
                  ? 'bg-white border-2 border-black text-xs font-bold text-black px-2 py-1 focus:outline-none cursor-pointer'
                  : isObsidian
                  ? 'bg-[#070709] border border-[#2A241A] focus:border-[#D4AF37]/60 text-[11px] uppercase tracking-[0.12em] text-[#F5F0E6] px-2.5 py-1 focus:outline-none cursor-pointer'
                  : 'bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded px-2 py-1 focus:outline-none focus:border-zinc-600 cursor-pointer'
              }
            >
              <option value="all" className={isSlate ? 'bg-[#0B1220] text-slate-100' : isClay ? 'bg-white text-[#1E2547]' : isSaas ? 'bg-white text-slate-900' : isNordic ? 'bg-[#FDFBF7] text-[#242E28]' : isGlass ? 'bg-[#0B192C] text-slate-100' : ''}>ALL CATEGORIES</option>
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id} className={isSlate ? 'bg-[#0B1220] text-slate-100' : isClay ? 'bg-white text-[#1E2547]' : isSaas ? 'bg-white text-slate-900' : isNordic ? 'bg-[#FDFBF7] text-[#242E28]' : isGlass ? 'bg-[#0B192C] text-slate-100' : ''}>{cat.name.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Direct Speak Button in Toolbar */}
          <button
            type="button"
            onClick={() => handleSpeak(activePhraseText)}
            title="Speak active phrase [A]"
            className={
              isSlate
                ? `text-[11px] px-2.5 py-1.5 rounded-md border transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 font-medium ${
                    isSpeaking
                      ? 'bg-teal-400 text-slate-950 border-teal-300 font-semibold'
                      : 'bg-[#0B1220] text-teal-300 border-slate-700 hover:border-teal-400/50 hover:text-teal-200'
                  }`
                : isClay
                ? `text-[11px] px-3 py-1.5 rounded-2xl border transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 font-semibold ${
                    isSpeaking
                      ? 'bg-indigo-500 text-white border-indigo-400/60 clay-btn'
                      : 'bg-[#E5E9FF] text-indigo-700 border-white/80 hover:bg-indigo-100 clay-btn-soft'
                  }`
                : isSaas
                ? `text-[11px] px-3 py-1.5 rounded-lg border transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 font-medium ${
                    isSpeaking
                      ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-2xs'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                  }`
                : isNordic
                ? `text-[11px] px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 font-medium ${
                    isSpeaking
                      ? 'bg-[#527360] text-[#FDFBF7] border-[#425F4E] font-semibold shadow-sm'
                      : 'bg-[#E7EFEA] text-[#2D4739] border-[#B8CBBF] hover:bg-[#DAE7DF]'
                  }`
                : isGlass
                ? `text-[11px] px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 font-medium ${
                    isSpeaking
                      ? 'bg-sky-400 text-slate-950 border-sky-300 font-semibold shadow-sm'
                      : 'bg-white/10 text-sky-200 border-white/20 hover:bg-white/15 hover:border-sky-300/40'
                  }`
                : isBrutal
                ? `text-[11px] px-2.5 py-1 border-2 border-black font-black cursor-pointer whitespace-nowrap flex items-center gap-1.5 brutal-btn ${
                    isSpeaking
                      ? 'bg-[#FFE500] text-black'
                      : 'bg-[#7DD3FC] text-black hover:bg-[#38BDF8]'
                  }`
                : isObsidian
                ? `text-[11px] px-2.5 py-1 border uppercase tracking-[0.14em] transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSpeaking
                      ? 'bg-[#D4AF37] text-[#070709] border-[#E5C77B] font-semibold'
                      : 'bg-[#1A1610] text-[#E5C77B] border-[#D4AF37]/40 hover:border-[#D4AF37]'
                  }`
                : `text-[11px] px-2.5 py-1 rounded border transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isSpeaking
                      ? 'bg-zinc-100 text-zinc-950 border-white font-bold'
                      : 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:text-white hover:border-zinc-500'
                  }`
            }
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className={isSlate || isClay || isSaas ? 'w-3.5 h-3.5 text-current' : isNordic ? 'w-3.5 h-3.5 text-[#3B5948]' : isGlass ? 'w-3.5 h-3.5 text-sky-300' : isBrutal ? 'w-3.5 h-3.5 text-black' : isObsidian ? 'w-3.5 h-3.5 text-[#D4AF37]' : 'w-3.5 h-3.5 text-amber-400'} />}
            <span>{isSpeaking ? 'STOP [A]' : 'SPEAK [A]'}</span>
          </button>

          {/* Voice Speed Toggle */}
          <button
            type="button"
            onClick={() => {
              soundEffects.playKeyClick();
              setSpeechRate(prev => (prev === 0.8 ? 1.0 : prev === 1.0 ? 1.2 : 0.8));
            }}
            title="Adjust Speech Cadence"
            className={
              isSlate
                ? 'text-[11px] px-2.5 py-1.5 rounded-md bg-[#0B1220] border border-slate-700 text-slate-300 hover:text-white hover:border-teal-400/50 transition-colors cursor-pointer whitespace-nowrap'
                : isClay
                ? 'text-[11px] px-3 py-1.5 rounded-2xl bg-white border border-white/90 text-[#4B5478] hover:text-[#1E2547] font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 clay-btn-soft'
                : isSaas
                ? 'text-[11px] px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors cursor-pointer whitespace-nowrap'
                : isNordic
                ? 'text-[11px] px-2.5 py-1.5 rounded-xl nordic-well border border-[#DDD7C8] text-[#4E5A53] hover:text-[#242E28] hover:border-[#B8CBBF] transition-all cursor-pointer whitespace-nowrap'
                : isGlass
                ? 'text-[11px] px-2.5 py-1.5 rounded-xl glass-well border border-white/15 text-slate-200 hover:text-white hover:border-white/30 transition-all cursor-pointer whitespace-nowrap'
                : isBrutal
                ? 'text-[11px] px-2 py-1 border-2 border-black bg-white text-black hover:bg-[#FEF9C3] font-bold cursor-pointer whitespace-nowrap brutal-btn'
                : isObsidian
                ? 'text-[11px] px-2.5 py-1 border border-[#2A241A] bg-[#070709] text-[#A39E93] hover:text-[#F5F0E6] hover:border-[#D4AF37]/40 uppercase tracking-[0.14em] transition-colors cursor-pointer whitespace-nowrap'
                : 'text-[11px] px-2 py-1 rounded border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer whitespace-nowrap'
            }
          >
            VOICE: <span className={isSlate ? 'text-teal-300 font-mono font-semibold' : isClay ? 'text-indigo-600 font-mono font-semibold tabular-nums' : isSaas ? 'text-indigo-600 font-mono font-semibold' : isNordic ? 'text-[#2D4739] font-mono font-semibold' : isGlass ? 'text-sky-300 font-mono font-semibold' : isBrutal ? 'text-black font-black' : isObsidian ? 'text-[#E5C77B] font-mono font-semibold' : 'text-zinc-100 font-bold'}>{speechRate}x</span>
          </button>
        </div>
      </div>

      {/* Speech Error / Status Notice if browser lacks TTS engine */}
      {speechNotice && (
        <div
          className={
            isSlate
              ? 'mb-4 px-3.5 py-2.5 rounded-md border border-amber-400/40 bg-amber-950/35 text-xs text-amber-200 flex items-center justify-between gap-3'
              : isClay
              ? 'mb-4 px-4 py-2.5 rounded-2xl border border-white/80 bg-[#FEF3C7] text-xs text-[#92400E] flex items-center justify-between gap-3 shadow-sm'
              : isSaas
              ? 'mb-4 px-3.5 py-2.5 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-800 flex items-center justify-between gap-3'
              : isNordic
              ? 'mb-4 px-3.5 py-2.5 rounded-xl border border-[#DFD3BE] bg-[#F5EFE4] text-xs text-[#614F35] flex items-center justify-between gap-3'
              : isGlass
              ? 'mb-4 px-3.5 py-2.5 rounded-xl border border-sky-300/40 glass-panel text-xs text-sky-200 flex items-center justify-between gap-3'
              : isBrutal
              ? 'mb-4 px-3 py-2 border-2 border-black bg-[#FFE500] text-xs font-bold text-black flex items-center justify-between gap-3 brutal-shadow-sm'
              : isObsidian
              ? 'mb-4 px-3.5 py-2 border border-[#D4AF37]/50 bg-[#14110C] text-xs text-[#E5C77B] flex items-center justify-between gap-3'
              : 'mb-4 px-3 py-2 rounded border border-amber-500/40 bg-zinc-950 text-xs text-amber-400 flex items-center justify-between gap-3'
          }
        >
          <span>[AUDIO NOTICE] {speechNotice}</span>
          <button
            type="button"
            onClick={() => setSpeechNotice(null)}
            className={isSlate ? 'text-amber-300 hover:text-white font-semibold cursor-pointer shrink-0' : isClay ? 'text-[#78350F] hover:underline font-semibold cursor-pointer shrink-0' : isSaas ? 'text-amber-900 hover:underline font-semibold cursor-pointer shrink-0' : isNordic ? 'text-[#3B5948] hover:text-[#242E28] font-semibold cursor-pointer shrink-0' : isGlass ? 'text-sky-300 hover:text-white font-semibold cursor-pointer shrink-0' : isBrutal ? 'text-black underline font-black cursor-pointer shrink-0' : isObsidian ? 'text-[#A39E93] hover:text-[#F5F0E6] uppercase tracking-[0.12em] cursor-pointer shrink-0' : 'text-zinc-400 hover:text-zinc-200 cursor-pointer shrink-0'}
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Progress Track */}
      <div
        className={
          isSlate
            ? 'w-full slate-well h-1.5 rounded-full overflow-hidden mb-6 border border-slate-800'
            : isClay
            ? 'w-full clay-well h-2 rounded-full overflow-hidden mb-6 border border-white/70'
            : isSaas
            ? 'w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden mb-6'
            : isNordic
            ? 'w-full nordic-well h-1.5 rounded-full overflow-hidden mb-6 border border-[#E2DDD0]'
            : isGlass
            ? 'w-full glass-well h-1.5 rounded-full overflow-hidden mb-6 border border-white/15'
            : isBrutal
            ? 'w-full bg-white h-3 overflow-hidden mb-6 border-2 border-black brutal-shadow-sm'
            : isObsidian
            ? 'w-full bg-[#0B0B0E] h-1 overflow-hidden mb-6 border border-[#2A241A]'
            : 'w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mb-6 border border-zinc-800'
        }
      >
        <div
          className={
            isSlate
              ? 'bg-teal-400 h-full transition-all duration-300'
              : isClay
              ? 'bg-indigo-500 h-full rounded-full transition-all duration-300'
              : isSaas
              ? 'bg-indigo-600 h-full transition-all duration-300'
              : isNordic
              ? 'bg-[#527360] h-full transition-all duration-300'
              : isGlass
              ? 'bg-sky-400 h-full transition-all duration-300'
              : isBrutal
              ? 'bg-[#FFE500] h-full border-r-2 border-black transition-all duration-300'
              : isObsidian
              ? 'bg-[#D4AF37] h-full transition-all duration-300'
              : 'bg-zinc-300 h-full transition-all duration-300'
          }
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3D Spaced Repetition Flashcard */}
      <div className="perspective-1000 mb-6">
        <div 
          onClick={handleFlip}
          className={`grid w-full min-h-[420px] transition-transform duration-500 transform-style-3d cursor-pointer relative select-none ${
            isSlate ? 'rounded-lg' : isClay ? 'rounded-3xl' : isSaas ? 'rounded-xl' : isGlass || isNordic ? 'rounded-2xl' : isBrutal || isObsidian ? '' : 'rounded-lg'
          } ${isFlipped ? 'rotate-y-180' : ''}`}
        >
          {/* ================= CARD FRONT (Danger Phrase & Scenario Context) ================= */}
          <div
            className={
              isSlate
                ? `[grid-area:1/1] w-full min-h-[420px] rounded-lg border border-slate-700/80 hover:border-teal-400/50 slate-card p-6 sm:p-9 flex flex-col justify-between backface-hidden transition-all ${
                    isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
                  }`
                : isClay
                ? `[grid-area:1/1] w-full min-h-[420px] rounded-3xl border border-white/90 hover:border-indigo-200 clay-card p-6 sm:p-9 flex flex-col justify-between backface-hidden transition-all ${
                    isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
                  }`
                : isSaas
                ? `[grid-area:1/1] w-full min-h-[420px] rounded-xl border border-slate-200 hover:border-indigo-300 saas-card p-6 sm:p-9 flex flex-col justify-between backface-hidden transition-all ${
                    isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
                  }`
                : isNordic
                ? `[grid-area:1/1] w-full min-h-[420px] rounded-2xl border border-[#DDD7C8] hover:border-[#B8CBBF] nordic-card p-6 sm:p-9 flex flex-col justify-between backface-hidden transition-all ${
                    isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
                  }`
                : isGlass
                ? `[grid-area:1/1] w-full min-h-[420px] rounded-2xl border border-white/25 hover:border-sky-300/45 glass-panel p-6 sm:p-9 flex flex-col justify-between backface-hidden transition-all ${
                    isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
                  }`
                : isBrutal
                ? `[grid-area:1/1] w-full min-h-[420px] border-2 border-black bg-white p-6 sm:p-8 flex flex-col justify-between backface-hidden brutal-shadow-lg transition-all ${
                    isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
                  }`
                : isObsidian
                ? `[grid-area:1/1] w-full min-h-[420px] border border-[#D4AF37]/25 hover:border-[#D4AF37]/50 obsidian-surface p-6 sm:p-9 flex flex-col justify-between backface-hidden transition-all ${
                    isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
                  }`
                : `[grid-area:1/1] w-full min-h-[420px] rounded-lg border border-zinc-800 hover:border-zinc-600 bg-zinc-950 p-6 sm:p-8 flex flex-col justify-between backface-hidden shadow-2xl transition-all ${
                    isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
                  }`
            }
          >
            
            {/* Top metadata strip */}
            <div
              className={
                isSlate
                  ? 'flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3.5'
                  : isClay
                  ? 'flex items-center justify-between text-[11px] uppercase tracking-wider text-[#647094] border-b border-indigo-900/10 pb-3.5'
                  : isSaas
                  ? 'flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-3.5'
                  : isNordic
                  ? 'flex items-center justify-between text-[11px] uppercase tracking-wider text-[#5C6962] border-b border-[#E4DFD4] pb-3.5'
                  : isGlass
                  ? 'flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-300 border-b border-white/15 pb-3.5'
                  : isBrutal
                  ? 'flex items-center justify-between text-xs text-zinc-700 font-bold border-b-2 border-black pb-3'
                  : isObsidian
                  ? 'flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-[#A39E93] border-b border-[#2A241A] pb-3.5'
                  : 'flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-3'
              }
            >
              <div className="flex items-center gap-2 font-mono tabular-nums">
                <span className={isSlate ? 'text-teal-300 font-semibold' : isClay ? 'text-indigo-600 font-semibold' : isSaas ? 'text-indigo-600 font-semibold' : isNordic ? 'text-[#3B5948] font-semibold' : isGlass ? 'text-sky-300 font-semibold' : isBrutal ? 'bg-[#FFE500] text-black border border-black px-1.5 py-0.5 font-black' : isObsidian ? 'text-[#D4AF37] font-semibold' : 'text-zinc-100 font-bold'}>
                  [BOX {currentCard.box}]
                </span>
                <span>·</span>
                <span className={isSlate ? 'text-slate-200 font-sans font-semibold' : isClay ? 'text-[#1E2547] font-sans font-semibold' : isSaas ? 'text-slate-900 font-sans font-medium' : isNordic ? 'text-[#242E28] font-sans font-medium' : isGlass ? 'text-slate-100 font-sans font-medium' : isBrutal ? 'text-black font-extrabold' : isObsidian ? 'text-[#DDD6C8]' : ''}>
                  {currentCard.categoryLabel.toUpperCase()}
                </span>
                <span>·</span>
                <span className="hidden sm:inline">STREAK: {currentCard.streak}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak(currentCard.dangerPhrase);
                }}
                className={
                  isSlate
                    ? `flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer border whitespace-nowrap shrink-0 ${
                        isSpeaking && !isFlipped
                          ? 'bg-teal-400 text-slate-950 border-teal-300 font-semibold'
                          : 'bg-[#0B1220] text-teal-300 border-slate-700 hover:border-teal-400/50'
                      }`
                    : isClay
                    ? `flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[11px] font-semibold transition-all cursor-pointer border whitespace-nowrap shrink-0 ${
                        isSpeaking && !isFlipped
                          ? 'bg-indigo-500 text-white border-indigo-400/60 clay-btn'
                          : 'bg-white text-[#1E2547] border-white/90 hover:text-indigo-600 clay-btn-soft'
                      }`
                    : isSaas
                    ? `flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border whitespace-nowrap shrink-0 ${
                        isSpeaking && !isFlipped
                          ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200'
                      }`
                    : isNordic
                    ? `flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer border ${
                        isSpeaking && !isFlipped
                          ? 'bg-[#527360] text-[#FDFBF7] border-[#425F4E] font-semibold'
                          : 'bg-[#E7EFEA] text-[#2D4739] border-[#B8CBBF] hover:bg-[#DAE7DF]'
                      }`
                    : isGlass
                    ? `flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer border ${
                        isSpeaking && !isFlipped
                          ? 'bg-sky-400 text-slate-950 border-sky-300 font-semibold'
                          : 'bg-white/10 text-sky-200 border-white/20 hover:bg-white/15 hover:border-sky-300/40'
                      }`
                    : isBrutal
                    ? `flex items-center gap-1.5 px-2.5 py-1 text-xs font-black transition-colors cursor-pointer border-2 border-black brutal-btn ${
                        isSpeaking && !isFlipped
                          ? 'bg-[#FFE500] text-black'
                          : 'bg-[#F4F1EA] text-black hover:bg-[#FFE500]'
                      }`
                    : isObsidian
                    ? `flex items-center gap-1.5 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] transition-colors cursor-pointer border ${
                        isSpeaking && !isFlipped
                          ? 'bg-[#D4AF37] text-[#070709] border-[#E5C77B] font-semibold'
                          : 'bg-[#121216] text-[#E5C77B] border-[#D4AF37]/35 hover:border-[#D4AF37]'
                      }`
                    : `flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer border ${
                        isSpeaking && !isFlipped
                          ? 'bg-zinc-100 text-zinc-950 border-white font-bold'
                          : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:text-white'
                      }`
                }
                title="Listen to trigger phrase [A]"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isSpeaking && !isFlipped ? 'SPEAKING...' : 'SPEAK [A]'}</span>
              </button>
            </div>

            {/* Middle: Scenario & Danger Phrase */}
            <div className="py-5 my-auto">
              <div
                className={
                  isSlate
                    ? 'text-[11px] uppercase tracking-[0.14em] text-slate-400 font-semibold mb-3'
                    : isClay
                    ? 'text-[11px] uppercase tracking-[0.14em] text-[#647094] font-semibold mb-3'
                    : isSaas
                    ? 'text-[11px] uppercase tracking-[0.14em] text-slate-500 font-semibold mb-3'
                    : isNordic
                    ? 'text-[11px] uppercase tracking-[0.14em] text-[#5C6962] font-semibold mb-3'
                    : isGlass
                    ? 'text-[11px] uppercase tracking-[0.14em] text-slate-400 font-semibold mb-3'
                    : isBrutal
                    ? 'text-xs uppercase tracking-wider text-zinc-700 font-extrabold mb-3'
                    : isObsidian
                    ? 'text-[11px] uppercase tracking-[0.18em] text-[#8E877A] mb-3'
                    : 'text-xs uppercase tracking-wider text-zinc-500 mb-3'
                }
              >
                SITUATION / CONVERSATIONAL TRIGGER:
              </div>
              <div
                className={
                  isSlate
                    ? 'text-sm sm:text-base text-slate-300 mb-6 leading-relaxed italic slate-well border border-slate-800 rounded-md p-4'
                    : isClay
                    ? 'text-sm sm:text-base text-[#4B5478] mb-6 leading-relaxed italic clay-well border border-white/70 rounded-2xl p-4'
                    : isSaas
                    ? 'text-sm sm:text-base text-slate-600 mb-6 leading-relaxed italic saas-well border border-slate-200 rounded-lg p-4'
                    : isNordic
                    ? 'text-sm sm:text-base text-[#4E5A53] mb-6 leading-relaxed italic nordic-well border border-[#E2DDD0] rounded-xl p-4'
                    : isGlass
                    ? 'text-sm sm:text-base text-slate-200 mb-6 leading-relaxed italic glass-well border border-white/12 rounded-xl p-4'
                    : isBrutal
                    ? 'text-sm sm:text-base text-zinc-900 font-semibold mb-6 leading-relaxed bg-[#F4F1EA] border-2 border-black p-3.5'
                    : isObsidian
                    ? 'text-sm sm:text-base text-[#C7C1B5] mb-6 leading-relaxed italic bg-[#070709] border border-[#2A241A] p-4'
                    : 'text-sm sm:text-base text-zinc-300 mb-6 leading-relaxed italic border-l-2 border-zinc-700 pl-3'
                }
              >
                "{currentCard.context}"
              </div>

              <div
                className={
                  isSlate
                    ? 'text-[11px] uppercase tracking-[0.14em] text-rose-300 mb-2 font-semibold'
                    : isClay
                    ? 'text-[11px] uppercase tracking-[0.14em] text-[#9F1239] mb-2 font-semibold'
                    : isSaas
                    ? 'text-[11px] uppercase tracking-[0.14em] text-rose-700 mb-2 font-semibold'
                    : isNordic
                    ? 'text-[11px] uppercase tracking-[0.14em] text-[#964B36] mb-2 font-semibold'
                    : isGlass
                    ? 'text-[11px] uppercase tracking-[0.14em] text-rose-200 mb-2 font-semibold'
                    : isBrutal
                    ? 'inline-block bg-[#FDA4AF] border-2 border-black px-2 py-0.5 text-xs uppercase tracking-wider text-black mb-2 font-black'
                    : isObsidian
                    ? 'text-[11px] uppercase tracking-[0.18em] text-[#E8A5A5] mb-2 font-semibold'
                    : 'text-xs uppercase tracking-wider text-zinc-400 mb-2 font-bold'
                }
              >
                DON'T SAY (DANGER PHRASE):
              </div>
              <div
                className={
                  isSlate
                    ? 'text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight leading-snug'
                    : isClay
                    ? 'text-2xl sm:text-3xl font-bold text-[#1E2547] tracking-tight leading-snug'
                    : isSaas
                    ? 'text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug'
                    : isNordic
                    ? 'text-2xl sm:text-3xl font-bold text-[#242E28] tracking-tight leading-snug'
                    : isGlass
                    ? 'text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug'
                    : isBrutal
                    ? 'text-2xl sm:text-3xl font-black text-black tracking-tight leading-snug'
                    : isObsidian
                    ? 'font-luxury text-3xl sm:text-4xl font-semibold text-[#F5F0E6] leading-snug'
                    : 'text-2xl sm:text-3xl font-bold text-zinc-100 tracking-wide font-mono leading-snug'
                }
              >
                "{currentCard.dangerPhrase}"
              </div>
            </div>

            {/* Bottom prompt to flip */}
            <div
              className={
                isSlate
                  ? 'pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400'
                  : isClay
                  ? 'pt-4 border-t border-indigo-900/10 flex items-center justify-between text-[11px] uppercase tracking-wider text-[#647094]'
                  : isSaas
                  ? 'pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-500'
                  : isNordic
                  ? 'pt-4 border-t border-[#E4DFD4] flex items-center justify-between text-[11px] uppercase tracking-wider text-[#5C6962]'
                  : isGlass
                  ? 'pt-4 border-t border-white/15 flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-300'
                  : isBrutal
                  ? 'pt-4 border-t-2 border-black flex items-center justify-between text-xs font-bold text-zinc-800'
                  : isObsidian
                  ? 'pt-4 border-t border-[#2A241A] flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-[#8E877A]'
                  : 'pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500'
              }
            >
              <div className="flex items-center gap-2">
                <span
                  className={
                    isSlate
                      ? 'px-2 py-0.5 rounded bg-[#0B1220] text-teal-300 border border-slate-700 font-mono text-[10px] font-semibold'
                      : isClay
                      ? 'px-2.5 py-0.5 rounded-xl bg-[#E5E9FF] text-indigo-700 border border-white/80 font-mono text-[10px] font-semibold'
                      : isSaas
                      ? 'px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[10px] font-semibold'
                      : isNordic
                      ? 'px-2 py-0.5 rounded-md bg-[#E7EFEA] text-[#2D4739] border border-[#B8CBBF] font-mono text-[10px] font-semibold'
                      : isGlass
                      ? 'px-2 py-0.5 rounded-md bg-white/10 text-sky-200 border border-white/25 font-mono text-[10px]'
                      : isBrutal
                      ? 'px-2 py-0.5 bg-[#FFE500] text-black border-2 border-black font-black text-[10px] font-mono'
                      : isObsidian
                      ? 'px-2 py-0.5 bg-[#121216] text-[#E5C77B] border border-[#D4AF37]/35 font-mono text-[10px]'
                      : 'px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-700 text-[10px]'
                  }
                >
                  SPACE
                </span>
                <span>PRESS SPACEBAR OR CLICK TO REVEAL REFRAME</span>
              </div>
              <div className={isSlate ? 'flex items-center gap-1.5 text-teal-300 font-semibold whitespace-nowrap shrink-0' : isClay ? 'flex items-center gap-1.5 text-indigo-600 font-semibold whitespace-nowrap shrink-0' : isSaas ? 'flex items-center gap-1.5 text-indigo-600 font-semibold whitespace-nowrap shrink-0' : isNordic ? 'flex items-center gap-1.5 text-[#3B5948] font-semibold' : isGlass ? 'flex items-center gap-1.5 text-sky-300 font-semibold' : isBrutal ? 'flex items-center gap-1 text-black font-black' : isObsidian ? 'flex items-center gap-1.5 text-[#E5C77B] font-semibold' : 'flex items-center gap-1 text-zinc-300 hover:text-white'}>
                <span>REVEAL</span>
                <RotateCw className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>

          {/* ================= CARD BACK (Power Reframe, Psychology, Delivery) ================= */}
          <div
            className={
              isSlate
                ? `[grid-area:1/1] w-full min-h-[420px] rounded-lg border border-teal-400/40 slate-card-elevated p-6 sm:p-9 flex flex-col justify-between backface-hidden rotate-y-180 transition-all ${
                    isFlipped ? 'pointer-events-auto' : 'pointer-events-none'
                  }`
                : isClay
                ? `[grid-area:1/1] w-full min-h-[420px] rounded-3xl border border-white/95 clay-card-elevated p-6 sm:p-9 flex flex-col justify-between backface-hidden rotate-y-180 transition-all ${
                    isFlipped ? 'pointer-events-auto' : 'pointer-events-none'
                  }`
                : isSaas
                ? `[grid-area:1/1] w-full min-h-[420px] rounded-xl border border-indigo-200 saas-card-elevated p-6 sm:p-9 flex flex-col justify-between backface-hidden rotate-y-180 transition-all ${
                    isFlipped ? 'pointer-events-auto' : 'pointer-events-none'
                  }`
                : isNordic
                ? `[grid-area:1/1] w-full min-h-[420px] rounded-2xl border border-[#B8CBBF] nordic-card-elevated p-6 sm:p-9 flex flex-col justify-between backface-hidden rotate-y-180 transition-all ${
                    isFlipped ? 'pointer-events-auto' : 'pointer-events-none'
                  }`
                : isGlass
                ? `[grid-area:1/1] w-full min-h-[420px] rounded-2xl border border-sky-300/40 glass-panel-elevated p-6 sm:p-9 flex flex-col justify-between backface-hidden rotate-y-180 transition-all ${
                    isFlipped ? 'pointer-events-auto' : 'pointer-events-none'
                  }`
                : isBrutal
                ? `[grid-area:1/1] w-full min-h-[420px] border-2 border-black bg-[#FEF9C3] p-6 sm:p-8 flex flex-col justify-between backface-hidden rotate-y-180 brutal-shadow-lg transition-all ${
                    isFlipped ? 'pointer-events-auto' : 'pointer-events-none'
                  }`
                : isObsidian
                ? `[grid-area:1/1] w-full min-h-[420px] border border-[#D4AF37]/50 bg-gradient-to-b from-[#13110C] to-[#09090B] brass-hairline-glow p-6 sm:p-9 flex flex-col justify-between backface-hidden rotate-y-180 transition-all ${
                    isFlipped ? 'pointer-events-auto' : 'pointer-events-none'
                  }`
                : `[grid-area:1/1] w-full min-h-[420px] rounded-lg border border-zinc-700 bg-zinc-950 p-6 sm:p-8 flex flex-col justify-between backface-hidden rotate-y-180 shadow-2xl transition-all ${
                    isFlipped ? 'pointer-events-auto' : 'pointer-events-none'
                  }`
            }
          >
            
            {/* Top metadata strip */}
            <div
              className={
                isSlate
                  ? 'flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3.5 gap-2'
                  : isClay
                  ? 'flex items-center justify-between text-[11px] uppercase tracking-wider text-[#647094] border-b border-indigo-900/10 pb-3.5 gap-2'
                  : isSaas
                  ? 'flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-3.5 gap-2'
                  : isNordic
                  ? 'flex items-center justify-between text-[11px] uppercase tracking-wider text-[#5C6962] border-b border-[#E4DFD4] pb-3.5 gap-2'
                  : isGlass
                  ? 'flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-300 border-b border-white/15 pb-3.5 gap-2'
                  : isBrutal
                  ? 'flex items-center justify-between text-xs text-black font-bold border-b-2 border-black pb-3 gap-2'
                  : isObsidian
                  ? 'flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-[#A39E93] border-b border-[#2A241A] pb-3.5 gap-2'
                  : 'flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-3 gap-2'
              }
            >
              <div className="flex items-center gap-2 min-w-0 font-mono tabular-nums">
                <span className={isSlate ? 'text-teal-300 font-semibold shrink-0' : isClay ? 'text-indigo-600 font-semibold shrink-0' : isSaas ? 'text-indigo-600 font-semibold shrink-0' : isNordic ? 'text-[#3B5948] font-semibold shrink-0' : isGlass ? 'text-sky-300 font-semibold shrink-0' : isBrutal ? 'bg-white border border-black px-1.5 py-0.5 text-black font-black shrink-0' : isObsidian ? 'text-[#D4AF37] font-semibold shrink-0' : 'text-zinc-100 font-bold shrink-0'}>
                  [BOX {currentCard.box}]
                </span>
                <span className="shrink-0">·</span>
                <span className={isSlate ? 'text-slate-200 truncate font-sans font-semibold' : isClay ? 'text-[#1E2547] truncate font-sans font-semibold' : isSaas ? 'text-slate-900 truncate font-sans font-medium' : isNordic ? 'text-[#242E28] truncate font-sans font-medium' : isGlass ? 'text-slate-100 truncate font-sans font-medium' : isBrutal ? 'text-black font-extrabold truncate' : isObsidian ? 'text-[#DDD6C8] truncate font-sans' : 'text-zinc-300 truncate'}>
                  {currentCard.psychologicalShift.toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(currentCard.powerPhrase);
                  }}
                  className={
                    isSlate
                      ? `flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer border whitespace-nowrap shrink-0 ${
                          isSpeaking && isFlipped
                            ? 'bg-teal-400 text-slate-950 border-teal-300 font-semibold'
                            : 'bg-[#0B1220] text-teal-300 border-slate-700 hover:border-teal-400/50'
                        }`
                      : isClay
                      ? `flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[11px] font-semibold transition-all cursor-pointer border whitespace-nowrap shrink-0 ${
                          isSpeaking && isFlipped
                            ? 'bg-indigo-500 text-white border-indigo-400/60 clay-btn'
                            : 'bg-[#E5E9FF] text-indigo-700 border-white/90 hover:bg-indigo-100 clay-btn-soft'
                        }`
                      : isSaas
                      ? `flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border whitespace-nowrap shrink-0 ${
                          isSpeaking && isFlipped
                            ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                        }`
                      : isNordic
                      ? `flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer border whitespace-nowrap ${
                          isSpeaking && isFlipped
                            ? 'bg-[#527360] text-[#FDFBF7] border-[#425F4E] font-semibold'
                            : 'bg-[#E7EFEA] text-[#2D4739] border-[#B8CBBF] hover:bg-[#DAE7DF]'
                        }`
                      : isGlass
                      ? `flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer border whitespace-nowrap ${
                          isSpeaking && isFlipped
                            ? 'bg-sky-400 text-slate-950 border-sky-300 font-semibold'
                            : 'bg-white/10 text-sky-200 border-white/20 hover:bg-white/15 hover:border-sky-300/40'
                        }`
                      : isBrutal
                      ? `flex items-center gap-1.5 px-2.5 py-1 text-xs font-black transition-colors cursor-pointer border-2 border-black whitespace-nowrap brutal-btn ${
                          isSpeaking && isFlipped
                            ? 'bg-[#FFE500] text-black'
                            : 'bg-white text-black hover:bg-[#7DD3FC]'
                        }`
                      : isObsidian
                      ? `flex items-center gap-1.5 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] transition-colors cursor-pointer border whitespace-nowrap ${
                          isSpeaking && isFlipped
                            ? 'bg-[#D4AF37] text-[#070709] border-[#E5C77B] font-semibold'
                            : 'bg-[#1A1610] text-[#E5C77B] border-[#D4AF37]/40 hover:border-[#D4AF37]'
                        }`
                      : `flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer border whitespace-nowrap ${
                          isSpeaking && isFlipped
                            ? 'bg-zinc-100 text-zinc-950 border-white font-bold'
                            : 'bg-zinc-900 text-zinc-200 border-zinc-700 hover:bg-zinc-800'
                        }`
                  }
                  title="Listen to Strategic Pronunciation [A]"
                >
                  <Volume2 className={isSlate || isClay || isSaas || isNordic || isGlass ? 'w-3.5 h-3.5 text-current' : isBrutal ? 'w-3.5 h-3.5 text-black' : isObsidian ? 'w-3.5 h-3.5 text-[#D4AF37]' : 'w-3.5 h-3.5 text-amber-400'} />
                  <span>{isSpeaking && isFlipped ? 'SPEAKING...' : 'SPEAK [A]'}</span>
                </button>
              </div>
            </div>

            {/* Middle: Power Phrase, Psychological Rationale, Delivery Tip */}
            <div className="py-5 my-auto">
              {/* Say Instead */}
              <div
                className={
                  isSlate
                    ? 'text-[11px] uppercase tracking-[0.16em] text-teal-300 font-semibold mb-2'
                    : isClay
                    ? 'text-[11px] uppercase tracking-[0.16em] text-indigo-600 font-semibold mb-2'
                    : isSaas
                    ? 'text-[11px] uppercase tracking-[0.16em] text-indigo-600 font-semibold mb-2'
                    : isNordic
                    ? 'text-[11px] uppercase tracking-[0.16em] text-[#3B5948] font-semibold mb-2'
                    : isGlass
                    ? 'text-[11px] uppercase tracking-[0.16em] text-sky-300 font-semibold mb-2'
                    : isBrutal
                    ? 'inline-flex items-center gap-1.5 bg-[#86EFAC] border-2 border-black px-2 py-0.5 text-xs uppercase tracking-wider text-black font-black mb-2'
                    : isObsidian
                    ? 'text-[11px] uppercase tracking-[0.2em] text-[#E5C77B] font-semibold mb-2'
                    : 'text-xs uppercase tracking-wider text-amber-400 font-bold mb-1.5 flex items-center gap-1.5'
                }
              >
                {!isSlate && !isObsidian && !isGlass && !isNordic && !isSaas && !isClay && <span className={isBrutal ? 'w-2 h-2 bg-black' : 'w-1.5 h-1.5 rounded-full bg-amber-400'} />}
                <span>SAY INSTEAD (POWER REFRAME):</span>
              </div>
              <div
                className={
                  isSlate
                    ? 'text-2xl sm:text-3xl font-bold text-white tracking-tight mb-5 leading-snug'
                    : isClay
                    ? 'text-2xl sm:text-3xl font-bold text-[#1E2547] tracking-tight mb-5 leading-snug'
                    : isSaas
                    ? 'text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-5 leading-snug'
                    : isNordic
                    ? 'text-2xl sm:text-3xl font-bold text-[#242E28] tracking-tight mb-5 leading-snug'
                    : isGlass
                    ? 'text-2xl sm:text-3xl font-bold text-white tracking-tight mb-5 leading-snug'
                    : isBrutal
                    ? 'text-2xl sm:text-3xl font-black text-black tracking-tight mb-4 leading-snug'
                    : isObsidian
                    ? 'font-luxury text-3xl sm:text-4xl font-semibold text-[#F3E5AB] mb-5 leading-snug'
                    : 'text-2xl sm:text-3xl font-bold text-white tracking-wide font-mono mb-4 leading-snug'
                }
              >
                "{currentCard.powerPhrase}"
              </div>

              {/* Rationale & Psychological Mechanism */}
              <div
                className={
                  isSlate
                    ? 'mb-3 slate-well border border-slate-800 rounded-md p-3.5'
                    : isClay
                    ? 'mb-3 clay-well border border-white/70 rounded-2xl p-3.5'
                    : isSaas
                    ? 'mb-3 saas-well border border-slate-200 rounded-lg p-3.5'
                    : isNordic
                    ? 'mb-3 nordic-well border border-[#E2DDD0] rounded-xl p-3.5'
                    : isGlass
                    ? 'mb-3 glass-well border border-white/12 rounded-xl p-3.5'
                    : isBrutal
                    ? 'mb-3 bg-white border-2 border-black p-3 brutal-shadow-sm'
                    : isObsidian
                    ? 'mb-3 bg-[#070709]/80 border border-[#2A241A] p-3.5'
                    : 'mb-3 bg-zinc-900/60 border border-zinc-800 p-3 rounded'
                }
              >
                <div
                  className={
                    isSlate
                      ? 'text-[11px] uppercase tracking-wider text-teal-300 font-semibold mb-1.5 flex items-center gap-1.5'
                      : isClay
                      ? 'text-[11px] uppercase tracking-wider text-indigo-700 font-semibold mb-1.5 flex items-center gap-1.5'
                      : isSaas
                      ? 'text-[11px] uppercase tracking-wider text-indigo-700 font-semibold mb-1.5 flex items-center gap-1.5'
                      : isNordic
                      ? 'text-[11px] uppercase tracking-wider text-[#3B5948] font-semibold mb-1.5 flex items-center gap-1.5'
                      : isGlass
                      ? 'text-[11px] uppercase tracking-wider text-sky-200 font-semibold mb-1.5 flex items-center gap-1.5'
                      : isBrutal
                      ? 'text-[11px] uppercase tracking-wider text-black font-black mb-1 flex items-center gap-1.5'
                      : isObsidian
                      ? 'text-[11px] uppercase tracking-[0.16em] text-[#E5C77B] font-semibold mb-1.5 flex items-center gap-1.5'
                      : 'text-[11px] uppercase tracking-wider text-zinc-300 font-bold mb-1 flex items-center gap-1.5'
                  }
                >
                  <Sparkles className={isSlate ? 'w-3.5 h-3.5 text-teal-400' : isClay ? 'w-3.5 h-3.5 text-indigo-600' : isSaas ? 'w-3.5 h-3.5 text-indigo-600' : isNordic ? 'w-3.5 h-3.5 text-[#527360]' : isGlass ? 'w-3.5 h-3.5 text-sky-300' : isBrutal ? 'w-3.5 h-3.5 text-black' : isObsidian ? 'w-3.5 h-3.5 text-[#D4AF37]' : 'w-3.5 h-3.5 text-zinc-400'} />
                  <span>THE PSYCHOLOGICAL MECHANISM (THE "WHY"):</span>
                </div>
                <p className={isSlate ? 'text-xs text-slate-300 leading-relaxed' : isClay ? 'text-xs text-[#4B5478] leading-relaxed' : isSaas ? 'text-xs text-slate-600 leading-relaxed' : isNordic ? 'text-xs text-[#4E5A53] leading-relaxed' : isGlass ? 'text-xs text-slate-200 leading-relaxed' : isBrutal ? 'text-xs text-zinc-900 font-medium leading-relaxed' : isObsidian ? 'text-xs text-[#DDD6C8] leading-relaxed' : 'text-xs text-zinc-300 leading-relaxed'}>
                  {currentCard.rationale}
                </p>
              </div>

              {/* Delivery and Cadence Advice */}
              <div
                className={
                  isSlate
                    ? 'bg-teal-950/35 border border-teal-400/35 rounded-md p-3.5'
                    : isClay
                    ? 'bg-[#E3FCEC] border border-white/80 rounded-2xl p-3.5 shadow-xs'
                    : isSaas
                    ? 'bg-emerald-50/70 border border-emerald-200 rounded-lg p-3.5'
                    : isNordic
                    ? 'bg-[#E7EFEA]/65 border border-[#B8CBBF] rounded-xl p-3.5'
                    : isGlass
                    ? 'glass-well border border-white/12 rounded-xl p-3.5'
                    : isBrutal
                    ? 'bg-white border-2 border-black p-3 brutal-shadow-sm'
                    : isObsidian
                    ? 'bg-[#070709]/80 border border-[#2A241A] p-3.5'
                    : 'bg-zinc-900/60 border border-zinc-800 p-3 rounded'
                }
              >
                <div
                  className={
                    isSlate
                      ? 'text-[11px] uppercase tracking-wider text-teal-300 font-semibold mb-1.5 flex items-center gap-1.5'
                      : isClay
                      ? 'text-[11px] uppercase tracking-wider text-[#065F46] font-semibold mb-1.5 flex items-center gap-1.5'
                      : isSaas
                      ? 'text-[11px] uppercase tracking-wider text-emerald-800 font-semibold mb-1.5 flex items-center gap-1.5'
                      : isNordic
                      ? 'text-[11px] uppercase tracking-wider text-[#2D4739] font-semibold mb-1.5 flex items-center gap-1.5'
                      : isGlass
                      ? 'text-[11px] uppercase tracking-wider text-sky-200 font-semibold mb-1.5 flex items-center gap-1.5'
                      : isBrutal
                      ? 'text-[11px] uppercase tracking-wider text-black font-black mb-1 flex items-center gap-1.5'
                      : isObsidian
                      ? 'text-[11px] uppercase tracking-[0.16em] text-[#E5C77B] font-semibold mb-1.5 flex items-center gap-1.5'
                      : 'text-[11px] uppercase tracking-wider text-zinc-300 font-bold mb-1 flex items-center gap-1.5'
                  }
                >
                  <CheckCircle2 className={isSlate ? 'w-3.5 h-3.5 text-teal-400' : isClay ? 'w-3.5 h-3.5 text-[#065F46]' : isSaas ? 'w-3.5 h-3.5 text-emerald-600' : isNordic ? 'w-3.5 h-3.5 text-[#527360]' : isGlass ? 'w-3.5 h-3.5 text-sky-300' : isBrutal ? 'w-3.5 h-3.5 text-black' : isObsidian ? 'w-3.5 h-3.5 text-[#D4AF37]' : 'w-3.5 h-3.5 text-zinc-400'} />
                  <span>DELIVERY & VOCAL CADENCE:</span>
                </div>
                <p className={isSlate ? 'text-xs text-teal-50 leading-relaxed' : isClay ? 'text-xs text-[#1E3B2F] leading-relaxed' : isSaas ? 'text-xs text-slate-700 leading-relaxed' : isNordic ? 'text-xs text-[#242E28] leading-relaxed' : isGlass ? 'text-xs text-slate-200 leading-relaxed' : isBrutal ? 'text-xs text-zinc-900 font-medium leading-relaxed' : isObsidian ? 'text-xs text-[#DDD6C8] leading-relaxed' : 'text-xs text-zinc-300 leading-relaxed'}>
                  {currentCard.deliveryTip}
                </p>
              </div>
            </div>

            {/* Bottom: Instructions */}
            <div
              className={
                isSlate
                  ? 'pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400'
                  : isClay
                  ? 'pt-3 border-t border-indigo-900/10 flex items-center justify-between text-[11px] uppercase tracking-wider text-[#647094]'
                  : isSaas
                  ? 'pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-500'
                  : isNordic
                  ? 'pt-3 border-t border-[#E4DFD4] flex items-center justify-between text-[11px] uppercase tracking-wider text-[#5C6962]'
                  : isGlass
                  ? 'pt-3 border-t border-white/15 flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-300'
                  : isBrutal
                  ? 'pt-2 border-t-2 border-black flex items-center justify-between text-xs font-bold text-zinc-900'
                  : isObsidian
                  ? 'pt-3 border-t border-[#2A241A] flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-[#8E877A]'
                  : 'pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500'
              }
            >
              <span>GRADE YOUR RECALL READINESS BELOW</span>
              <span className={isSlate ? 'text-teal-300 font-mono font-semibold tabular-nums' : isClay ? 'text-indigo-600 font-mono font-semibold tabular-nums' : isSaas ? 'text-indigo-600 font-mono font-semibold tabular-nums' : isNordic ? 'text-[#3B5948] font-mono font-semibold' : isGlass ? 'text-sky-300 font-mono font-semibold' : isBrutal ? 'text-black font-black font-mono' : isObsidian ? 'text-[#E5C77B] font-mono' : 'text-zinc-300 font-mono'}>[HOTKEYS 1–4]</span>
            </div>

          </div>
        </div>
      </div>

      {/* Leitner Rating Decision Console */}
      <div
        className={
          isSlate
            ? 'border border-slate-700/80 slate-card rounded-lg p-4'
            : isClay
            ? 'border border-white/90 clay-card rounded-3xl p-4 sm:p-5'
            : isSaas
            ? 'border border-slate-200 saas-card rounded-xl p-4'
            : isNordic
            ? 'border border-[#DDD7C8] nordic-card rounded-2xl p-4'
            : isGlass
            ? 'border border-white/20 glass-panel rounded-2xl p-4'
            : isBrutal
            ? 'border-2 border-black bg-white p-4 brutal-shadow'
            : isObsidian
            ? 'border border-[#2A241A] obsidian-surface p-4'
            : 'border border-zinc-800 bg-zinc-950 p-4 rounded-lg'
        }
      >
        <div
          className={
            isSlate
              ? 'flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-400 mb-3'
              : isClay
              ? 'flex items-center justify-between text-[11px] uppercase tracking-wider text-[#647094] mb-3'
              : isSaas
              ? 'flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-500 mb-3'
              : isNordic
              ? 'flex items-center justify-between text-[11px] uppercase tracking-wider text-[#5C6962] mb-3'
              : isGlass
              ? 'flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-300 mb-3'
              : isBrutal
              ? 'flex items-center justify-between text-xs text-zinc-700 mb-3'
              : isObsidian
              ? 'flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-[#A39E93] mb-3'
              : 'flex items-center justify-between text-xs text-zinc-400 mb-3'
          }
        >
          <span className={isSlate ? 'font-semibold text-slate-100' : isClay ? 'font-semibold text-[#1E2547]' : isSaas ? 'font-semibold text-slate-900' : isNordic ? 'font-semibold text-[#242E28]' : isGlass ? 'font-semibold text-white' : isBrutal ? 'font-black uppercase tracking-wider text-black' : isObsidian ? 'font-semibold text-[#F5F0E6]' : 'font-bold uppercase tracking-wider text-zinc-200'}>
            LEITNER RETENTION RATING:
          </span>
          <span className={isSlate ? 'text-[11px] text-slate-400' : isClay ? 'text-[11px] text-[#647094]' : isSaas ? 'text-[11px] text-slate-500' : isNordic ? 'text-[11px] text-[#5C6962]' : isGlass ? 'text-[11px] text-slate-400' : isBrutal ? 'text-[11px] font-bold text-zinc-700' : isObsidian ? 'text-[11px] text-[#8E877A]' : 'text-[11px] text-zinc-500'}>
            {isFlipped ? 'CHOOSE RETENTION QUALITY' : 'FLIP CARD [SPACE] BEFORE RATING'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Rating 1: Again */}
          <button
            onClick={() => handleRate('again')}
            className={
              isSlate
                ? 'px-3 py-2.5 rounded-md border border-rose-500/35 bg-rose-950/35 hover:bg-rose-950/55 hover:border-rose-400/60 text-rose-200 text-xs font-medium tracking-wide transition-colors cursor-pointer flex flex-col items-center gap-1 text-center group'
                : isClay
                ? 'px-3 py-2.5 rounded-2xl border border-white/80 bg-[#FFE8EC] hover:bg-[#FFD8DF] text-[#9F1239] text-xs font-semibold tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group clay-btn-soft'
                : isSaas
                ? 'px-3 py-2.5 rounded-lg border border-rose-200 bg-rose-50/75 hover:bg-rose-100/80 hover:border-rose-300 text-rose-700 text-xs font-medium tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group'
                : isNordic
                ? 'px-3 py-2.5 rounded-xl border border-[#E4C5B9] bg-[#FAF0EC] hover:bg-[#F3E1DA] hover:border-[#D4A797] text-[#7D3B29] text-xs font-medium tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group'
                : isGlass
                ? 'px-3 py-2.5 rounded-xl border border-rose-300/25 bg-rose-950/35 hover:bg-rose-950/55 hover:border-rose-300/55 text-rose-100 text-xs font-medium tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group'
                : isBrutal
                ? 'px-3 py-2.5 border-2 border-black bg-[#FDA4AF] hover:bg-[#FB7185] text-black text-xs font-black tracking-wide cursor-pointer flex flex-col items-center gap-1 text-center brutal-btn'
                : isObsidian
                ? 'px-3 py-2.5 border border-[#3D2225] bg-[#140D0E] hover:border-[#E8A5A5]/60 text-[#E8A5A5] text-xs font-medium tracking-[0.12em] transition-all cursor-pointer flex flex-col items-center gap-1 text-center group'
                : 'px-3 py-2.5 rounded border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-600 text-zinc-300 text-xs font-mono font-medium tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group'
            }
          >
            <div className="flex items-center gap-1.5 font-semibold">
              <span className={isSlate ? 'text-[10px] px-1.5 py-0.5 rounded bg-[#0B1220] border border-rose-500/40 text-rose-300 font-mono tabular-nums' : isClay ? 'text-[10px] px-1.5 py-0.5 rounded-lg bg-white/90 border border-white text-[#9F1239] font-mono tabular-nums' : isSaas ? 'text-[10px] px-1.5 py-0.5 rounded bg-white border border-rose-200 text-rose-700 font-mono tabular-nums' : isNordic ? 'text-[10px] px-1.5 py-0.5 rounded-md bg-white border border-[#E4C5B9] text-[#7D3B29] font-mono' : isGlass ? 'text-[10px] px-1.5 py-0.5 rounded-md bg-rose-950/70 border border-rose-300/35 text-rose-200 font-mono' : isBrutal ? 'text-[10px] px-1.5 py-0.5 bg-white border border-black text-black font-mono font-black' : isObsidian ? 'text-[10px] px-1.5 py-0.5 bg-[#070709] border border-[#3D2225] text-[#E8A5A5] font-mono' : 'text-[10px] px-1 py-0.2 rounded bg-zinc-800 border border-zinc-700 text-zinc-200'}>1</span>
              <span>AGAIN</span>
            </div>
            <span className={isSlate ? 'text-[10px] text-rose-300/80 font-normal tabular-nums' : isClay ? 'text-[10px] text-[#9F1239]/80 font-normal tabular-nums' : isSaas ? 'text-[10px] text-rose-600 tabular-nums' : isNordic ? 'text-[10px] text-[#964B36]' : isGlass ? 'text-[10px] text-rose-200/80' : isBrutal ? 'text-[10px] font-bold text-zinc-900' : isObsidian ? 'text-[10px] text-[#A39E93] tracking-normal' : 'text-[10px] text-zinc-500 group-hover:text-zinc-400'}>
              Reset to Box 1 (1d)
            </span>
          </button>

          {/* Rating 2: Hard */}
          <button
            onClick={() => handleRate('hard')}
            className={
              isSlate
                ? 'px-3 py-2.5 rounded-md slate-well border border-slate-700/80 hover:border-slate-500 text-slate-200 text-xs font-medium tracking-wide transition-colors cursor-pointer flex flex-col items-center gap-1 text-center group'
                : isClay
                ? 'px-3 py-2.5 rounded-2xl clay-well border border-white/75 hover:border-indigo-200 text-[#1E2547] text-xs font-semibold tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group clay-btn-soft'
                : isSaas
                ? 'px-3 py-2.5 rounded-lg saas-well border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-800 text-xs font-medium tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group'
                : isNordic
                ? 'px-3 py-2.5 rounded-xl nordic-well border border-[#DDD7C8] hover:bg-[#E7E2D6] hover:border-[#C9C2B0] text-[#242E28] text-xs font-medium tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group'
                : isGlass
                ? 'px-3 py-2.5 rounded-xl glass-well border border-white/15 hover:border-white/35 text-slate-100 text-xs font-medium tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group'
                : isBrutal
                ? 'px-3 py-2.5 border-2 border-black bg-[#FFE500] hover:bg-[#FACC15] text-black text-xs font-black tracking-wide cursor-pointer flex flex-col items-center gap-1 text-center brutal-btn'
                : isObsidian
                ? 'px-3 py-2.5 border border-[#2A241A] bg-[#0B0B0E] hover:border-[#D4AF37]/45 text-[#DDD6C8] text-xs font-medium tracking-[0.12em] transition-all cursor-pointer flex flex-col items-center gap-1 text-center group'
                : 'px-3 py-2.5 rounded border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-600 text-zinc-300 text-xs font-mono font-medium tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group'
            }
          >
            <div className="flex items-center gap-1.5 font-semibold">
              <span className={isSlate ? 'text-[10px] px-1.5 py-0.5 rounded bg-[#1E293B] border border-slate-700 text-slate-300 font-mono tabular-nums' : isClay ? 'text-[10px] px-1.5 py-0.5 rounded-lg bg-white border border-white text-[#4B5478] font-mono tabular-nums' : isSaas ? 'text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-mono tabular-nums' : isNordic ? 'text-[10px] px-1.5 py-0.5 rounded-md bg-white border border-[#DDD7C8] text-[#4E5A53] font-mono' : isGlass ? 'text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 border border-white/25 text-slate-200 font-mono' : isBrutal ? 'text-[10px] px-1.5 py-0.5 bg-white border border-black text-black font-mono font-black' : isObsidian ? 'text-[10px] px-1.5 py-0.5 bg-[#121216] border border-[#2A241A] text-[#C5A059] font-mono' : 'text-[10px] px-1 py-0.2 rounded bg-zinc-800 border border-zinc-700 text-zinc-200'}>2</span>
              <span>HARD</span>
            </div>
            <span className={isSlate ? 'text-[10px] text-slate-400 group-hover:text-slate-300 tabular-nums' : isClay ? 'text-[10px] text-[#647094] group-hover:text-[#1E2547] font-normal tabular-nums' : isSaas ? 'text-[10px] text-slate-500 group-hover:text-slate-700 tabular-nums' : isNordic ? 'text-[10px] text-[#5C6962] group-hover:text-[#242E28]' : isGlass ? 'text-[10px] text-slate-300 group-hover:text-white' : isBrutal ? 'text-[10px] font-bold text-zinc-900' : isObsidian ? 'text-[10px] text-[#8E877A] group-hover:text-[#A39E93] tracking-normal' : 'text-[10px] text-zinc-500 group-hover:text-zinc-400'}>
              Maintain ({currentCard.intervalDays}d)
            </span>
          </button>

          {/* Rating 3: Good */}
          <button
            onClick={() => handleRate('good')}
            className={
              isSlate
                ? 'px-3 py-2.5 rounded-md border border-teal-400/40 bg-teal-950/35 hover:bg-teal-950/55 hover:border-teal-300 text-teal-100 text-xs font-semibold tracking-wide transition-colors cursor-pointer flex flex-col items-center gap-1 text-center group'
                : isClay
                ? 'px-3 py-2.5 rounded-2xl border border-white/80 bg-[#E3FCEC] hover:bg-[#D1F7E3] text-[#065F46] text-xs font-semibold tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group clay-btn-soft'
                : isSaas
                ? 'px-3 py-2.5 rounded-lg border border-emerald-200 bg-emerald-50/75 hover:bg-emerald-100/80 hover:border-emerald-300 text-emerald-800 text-xs font-semibold tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group'
                : isNordic
                ? 'px-3 py-2.5 rounded-xl border border-[#B8CBBF] bg-[#E7EFEA] hover:bg-[#DAE7DF] hover:border-[#8EAE9B] text-[#2D4739] text-xs font-semibold tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group'
                : isGlass
                ? 'px-3 py-2.5 rounded-xl border border-sky-300/40 bg-sky-950/35 hover:bg-sky-950/55 hover:border-sky-300/70 text-sky-100 text-xs font-semibold tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group'
                : isBrutal
                ? 'px-3 py-2.5 border-2 border-black bg-[#86EFAC] hover:bg-[#4ADE80] text-black text-xs font-black tracking-wide cursor-pointer flex flex-col items-center gap-1 text-center brutal-btn'
                : isObsidian
                ? 'px-3 py-2.5 border border-[#D4AF37]/40 bg-[#14110C] hover:border-[#D4AF37] text-[#E5C77B] text-xs font-semibold tracking-[0.12em] transition-all cursor-pointer flex flex-col items-center gap-1 text-center group'
                : 'px-3 py-2.5 rounded border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-500 text-zinc-100 text-xs font-mono font-medium tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group'
            }
          >
            <div className="flex items-center gap-1.5 font-semibold">
              <span className={isSlate ? 'text-[10px] px-1.5 py-0.5 rounded bg-[#0B1220] border border-teal-400/45 text-teal-300 font-mono tabular-nums' : isClay ? 'text-[10px] px-1.5 py-0.5 rounded-lg bg-white/90 border border-white text-[#065F46] font-mono tabular-nums' : isSaas ? 'text-[10px] px-1.5 py-0.5 rounded bg-white border border-emerald-200 text-emerald-700 font-mono tabular-nums' : isNordic ? 'text-[10px] px-1.5 py-0.5 rounded-md bg-white border border-[#B8CBBF] text-[#2D4739] font-mono' : isGlass ? 'text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 border border-sky-300/40 text-sky-200 font-mono' : isBrutal ? 'text-[10px] px-1.5 py-0.5 bg-white border border-black text-black font-mono font-black' : isObsidian ? 'text-[10px] px-1.5 py-0.5 bg-[#070709] border border-[#D4AF37]/45 text-[#E5C77B] font-mono' : 'text-[10px] px-1 py-0.2 rounded bg-zinc-800 border border-zinc-600 text-white'}>3</span>
              <span>GOOD</span>
            </div>
            <span className={isSlate ? 'text-[10px] text-teal-300/85 font-normal tabular-nums' : isClay ? 'text-[10px] text-[#065F46]/80 font-normal tabular-nums' : isSaas ? 'text-[10px] text-emerald-700 font-normal tabular-nums' : isNordic ? 'text-[10px] text-[#3B5948] font-normal' : isGlass ? 'text-[10px] text-sky-200/80 group-hover:text-sky-100 font-normal' : isBrutal ? 'text-[10px] font-bold text-zinc-900' : isObsidian ? 'text-[10px] text-[#A39E93] group-hover:text-[#DDD6C8] tracking-normal font-normal' : 'text-[10px] text-zinc-400 group-hover:text-zinc-300'}>
              Advance +1 ({Math.min(5, currentCard.box + 1) * 2}d)
            </span>
          </button>

          {/* Rating 4: Easy */}
          <button
            onClick={() => handleRate('easy')}
            className={
              isSlate
                ? 'px-3 py-2.5 rounded-md border border-teal-300 bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-semibold tracking-wide transition-colors cursor-pointer flex flex-col items-center gap-1 text-center group shadow-xs'
                : isClay
                ? 'px-3 py-2.5 rounded-2xl border border-indigo-400/60 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group clay-btn'
                : isSaas
                ? 'px-3 py-2.5 rounded-lg border border-indigo-600 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group shadow-sm'
                : isNordic
                ? 'px-3 py-2.5 rounded-xl border border-[#425F4E] bg-[#527360] hover:bg-[#425F4E] text-[#FDFBF7] text-xs font-semibold tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group shadow-sm'
                : isGlass
                ? 'px-3 py-2.5 rounded-xl border border-sky-300/65 bg-sky-400/20 hover:bg-sky-400 hover:text-slate-950 text-sky-100 text-xs font-semibold tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group'
                : isBrutal
                ? 'px-3 py-2.5 border-2 border-black bg-[#7DD3FC] hover:bg-[#38BDF8] text-black text-xs font-black tracking-wide cursor-pointer flex flex-col items-center gap-1 text-center brutal-btn'
                : isObsidian
                ? 'px-3 py-2.5 border border-[#D4AF37]/70 bg-[#1C170F] hover:bg-[#D4AF37] hover:text-[#070709] text-[#F3E5AB] text-xs font-semibold tracking-[0.12em] transition-all cursor-pointer flex flex-col items-center gap-1 text-center group'
                : 'px-3 py-2.5 rounded border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-500 text-zinc-100 text-xs font-mono font-medium tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group'
            }
          >
            <div className="flex items-center gap-1.5 font-semibold">
              <span className={isSlate ? 'text-[10px] px-1.5 py-0.5 rounded bg-slate-950/15 border border-slate-950/25 text-slate-950 font-mono tabular-nums' : isClay ? 'text-[10px] px-1.5 py-0.5 rounded-lg bg-white/20 border border-white/35 text-white font-mono tabular-nums' : isSaas ? 'text-[10px] px-1.5 py-0.5 rounded bg-white/15 border border-white/30 text-white font-mono tabular-nums' : isNordic ? 'text-[10px] px-1.5 py-0.5 rounded-md bg-[#FDFBF7]/15 border border-[#FDFBF7]/35 text-[#FDFBF7] font-mono' : isGlass ? 'text-[10px] px-1.5 py-0.5 rounded-md bg-white/10 border border-sky-300/50 text-sky-100 group-hover:bg-slate-950/20 group-hover:border-slate-950/40 group-hover:text-slate-950 font-mono' : isBrutal ? 'text-[10px] px-1.5 py-0.5 bg-white border border-black text-black font-mono font-black' : isObsidian ? 'text-[10px] px-1.5 py-0.5 bg-[#070709] border border-[#D4AF37]/60 text-[#F3E5AB] group-hover:border-[#070709] font-mono' : 'text-[10px] px-1 py-0.2 rounded bg-zinc-800 border border-zinc-600 text-white'}>4</span>
              <span>EASY</span>
            </div>
            <span className={isSlate ? 'text-[10px] text-slate-900/80 font-normal tabular-nums' : isClay ? 'text-[10px] text-indigo-100 font-normal tabular-nums' : isSaas ? 'text-[10px] text-indigo-100 font-normal tabular-nums' : isNordic ? 'text-[10px] text-[#E7EFEA] font-normal' : isGlass ? 'text-[10px] text-sky-200 group-hover:text-slate-900 font-normal' : isBrutal ? 'text-[10px] font-bold text-zinc-900' : isObsidian ? 'text-[10px] text-[#C5A059] group-hover:text-[#070709] tracking-normal font-normal' : 'text-[10px] text-zinc-400 group-hover:text-zinc-300'}>
              Fast-track +2 Boxes
            </span>
          </button>
        </div>
      </div>

    </div>
  );
};
