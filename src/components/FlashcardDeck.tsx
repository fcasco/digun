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
  const { isBrutal, isObsidian } = useTheme();

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
      <div className={`max-w-3xl mx-auto px-4 py-8 ${isBrutal || isObsidian ? 'font-sans' : 'font-mono'}`}>
        <div
          className={
            isBrutal
              ? 'border-2 border-black bg-white p-6 sm:p-8 brutal-shadow-lg relative overflow-hidden'
              : isObsidian
              ? 'border border-[#D4AF37]/30 obsidian-surface p-6 sm:p-8 relative overflow-hidden'
              : 'border border-zinc-800 bg-zinc-950 rounded-lg p-6 sm:p-8 shadow-2xl relative overflow-hidden'
          }
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className={isBrutal ? 'p-2 bg-[#FFE500] border-2 border-black text-black' : ''}>
              <Trophy className={isBrutal ? 'w-5 h-5 text-black' : isObsidian ? 'w-5 h-5 text-[#D4AF37]' : 'w-5 h-5 text-amber-400'} />
            </div>
            <h2
              className={
                isBrutal
                  ? 'text-xl sm:text-2xl font-black tracking-tight text-black'
                  : isObsidian
                  ? 'font-luxury text-2xl sm:text-3xl font-semibold tracking-wide text-[#F5F0E6]'
                  : 'text-xl sm:text-2xl font-bold tracking-wider text-zinc-100'
              }
            >
              SESSION DISPATCH: COMPLETE
            </h2>
          </div>

          <p className={isBrutal ? 'text-sm text-zinc-700 font-medium mb-6 leading-relaxed' : isObsidian ? 'text-sm text-[#A39E93] mb-6 leading-relaxed' : 'text-sm text-zinc-400 mb-6 leading-relaxed'}>
            Spaced repetition cycle executed. Your neuromuscular speech circuits and subconscious communication defaults have been reinforced through deliberate reframing.
          </p>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div
              className={
                isBrutal
                  ? 'border-2 border-black bg-[#F4F1EA] p-3 text-center brutal-shadow-sm'
                  : isObsidian
                  ? 'border border-[#2A241A] bg-[#070709] p-3.5 text-center'
                  : 'border border-zinc-800 bg-zinc-900/50 p-3 rounded text-center'
              }
            >
              <div className={isBrutal ? 'text-xs font-extrabold text-zinc-700 mb-1' : isObsidian ? 'text-[10px] uppercase tracking-[0.16em] text-[#8E877A] mb-1' : 'text-xs text-zinc-500 mb-1'}>
                TOTAL DRILLS
              </div>
              <div className={isBrutal ? 'text-2xl font-black text-black tabular-nums' : isObsidian ? 'text-2xl font-mono font-semibold text-[#F5F0E6] tabular-nums' : 'text-2xl font-bold text-zinc-100 tabular-nums'}>
                {sessionStats.cardsReviewed}
              </div>
            </div>
            <div
              className={
                isBrutal
                  ? 'border-2 border-black bg-[#FFE500] p-3 text-center brutal-shadow-sm'
                  : isObsidian
                  ? 'border border-[#D4AF37]/40 bg-[#14110C] p-3.5 text-center'
                  : 'border border-zinc-800 bg-zinc-900/50 p-3 rounded text-center'
              }
            >
              <div className={isBrutal ? 'text-xs font-extrabold text-black mb-1' : isObsidian ? 'text-[10px] uppercase tracking-[0.16em] text-[#C5A059] mb-1' : 'text-xs text-zinc-500 mb-1'}>
                ADVANCED [BOX+]
              </div>
              <div className={isBrutal ? 'text-2xl font-black text-black tabular-nums' : isObsidian ? 'text-2xl font-mono font-semibold text-[#E5C77B] tabular-nums' : 'text-2xl font-bold text-amber-400 tabular-nums'}>
                {sessionStats.goodCount + sessionStats.easyCount}
              </div>
            </div>
            <div
              className={
                isBrutal
                  ? 'border-2 border-black bg-[#FFE4E6] p-3 text-center brutal-shadow-sm'
                  : isObsidian
                  ? 'border border-[#2A241A] bg-[#070709] p-3.5 text-center'
                  : 'border border-zinc-800 bg-zinc-900/50 p-3 rounded text-center'
              }
            >
              <div className={isBrutal ? 'text-xs font-extrabold text-black mb-1' : isObsidian ? 'text-[10px] uppercase tracking-[0.16em] text-[#8E877A] mb-1' : 'text-xs text-zinc-500 mb-1'}>
                REPEATS [AGAIN]
              </div>
              <div className={isBrutal ? 'text-2xl font-black text-black tabular-nums' : isObsidian ? 'text-2xl font-mono font-semibold text-[#A39E93] tabular-nums' : 'text-2xl font-bold text-zinc-400 tabular-nums'}>
                {sessionStats.againCount}
              </div>
            </div>
            <div
              className={
                isBrutal
                  ? 'border-2 border-black bg-[#86EFAC] p-3 text-center brutal-shadow-sm'
                  : isObsidian
                  ? 'border border-[#2A241A] bg-[#070709] p-3.5 text-center'
                  : 'border border-zinc-800 bg-zinc-900/50 p-3 rounded text-center'
              }
            >
              <div className={isBrutal ? 'text-xs font-extrabold text-black mb-1' : isObsidian ? 'text-[10px] uppercase tracking-[0.16em] text-[#8E877A] mb-1' : 'text-xs text-zinc-500 mb-1'}>
                BOX 5 GRADUATES
              </div>
              <div className={isBrutal ? 'text-2xl font-black text-black tabular-nums' : isObsidian ? 'text-2xl font-mono font-semibold text-[#F5F0E6] tabular-nums' : 'text-2xl font-bold text-zinc-100 tabular-nums'}>
                {sessionStats.promotedToBox5}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className={`flex flex-col sm:flex-row items-center gap-3 pt-4 ${isBrutal ? 'border-t-2 border-black' : isObsidian ? 'border-t border-[#2A241A]' : 'border-t border-zinc-800'}`}>
            <button
              onClick={() => {
                soundEffects.playKeyClick();
                setStudyMode('all');
                buildQueue();
              }}
              className={
                isBrutal
                  ? 'w-full sm:w-auto px-5 py-2.5 bg-[#FFE500] hover:bg-[#FACC15] text-black border-2 border-black font-black text-xs tracking-wide cursor-pointer flex items-center justify-center gap-2 brutal-btn'
                  : isObsidian
                  ? 'w-full sm:w-auto px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C77B] text-[#070709] border border-[#E5C77B] font-semibold text-[11px] uppercase tracking-[0.16em] transition-colors cursor-pointer flex items-center justify-center gap-2'
                  : 'w-full sm:w-auto px-5 py-2.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2'
              }
            >
              <RefreshCcw className={isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#070709]' : 'w-4 h-4 text-amber-600'} />
              <span>DRILL ALL {cards.length}+ REFRAMES</span>
            </button>
            <button
              onClick={() => {
                soundEffects.playKeyClick();
                onOpenVault();
              }}
              className={
                isBrutal
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
    <div className={`max-w-4xl mx-auto px-4 py-6 ${isBrutal || isObsidian ? 'font-sans' : 'font-mono'}`}>
      {/* HUD Toolbar */}
      <div
        className={
          isBrutal
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
              isBrutal
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
                isBrutal
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
                isBrutal
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
              isBrutal
                ? 'text-xs text-zinc-700 font-bold hidden sm:block whitespace-nowrap'
                : isObsidian
                ? 'text-[11px] uppercase tracking-[0.16em] text-[#A39E93] hidden sm:block whitespace-nowrap'
                : 'text-xs text-zinc-400 hidden sm:block whitespace-nowrap'
            }
          >
            CARD{' '}
            <span className={isBrutal ? 'text-black font-black tabular-nums' : isObsidian ? 'text-[#E5C77B] font-mono font-semibold tabular-nums' : 'text-zinc-100 font-bold tabular-nums'}>
              {currentIndex + 1}
            </span>{' '}
            / <span className="font-mono tabular-nums">{activeQueue.length}</span>
          </div>
        </div>

        {/* Right: Filter Category, Speak Control & Speech Rate */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Selector */}
          <div className={isBrutal ? 'flex items-center gap-1.5 text-xs text-black' : isObsidian ? 'flex items-center gap-1.5 text-xs text-[#A39E93]' : 'flex items-center gap-1.5 text-xs text-zinc-400'}>
            <SlidersHorizontal className={isBrutal ? 'w-3.5 h-3.5 text-black' : isObsidian ? 'w-3.5 h-3.5 text-[#C5A059]' : 'w-3.5 h-3.5 text-zinc-500'} />
            <select
              value={filterCategory}
              onChange={(e) => {
                soundEffects.playKeyClick();
                setFilterCategory(e.target.value);
                e.currentTarget.blur();
              }}
              className={
                isBrutal
                  ? 'bg-white border-2 border-black text-xs font-bold text-black px-2 py-1 focus:outline-none cursor-pointer'
                  : isObsidian
                  ? 'bg-[#070709] border border-[#2A241A] focus:border-[#D4AF37]/60 text-[11px] uppercase tracking-[0.12em] text-[#F5F0E6] px-2.5 py-1 focus:outline-none cursor-pointer'
                  : 'bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded px-2 py-1 focus:outline-none focus:border-zinc-600 cursor-pointer'
              }
            >
              <option value="all">ALL CATEGORIES</option>
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Direct Speak Button in Toolbar */}
          <button
            type="button"
            onClick={() => handleSpeak(activePhraseText)}
            title="Speak active phrase [A]"
            className={
              isBrutal
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
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className={isBrutal ? 'w-3.5 h-3.5 text-black' : isObsidian ? 'w-3.5 h-3.5 text-[#D4AF37]' : 'w-3.5 h-3.5 text-amber-400'} />}
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
              isBrutal
                ? 'text-[11px] px-2 py-1 border-2 border-black bg-white text-black hover:bg-[#FEF9C3] font-bold cursor-pointer whitespace-nowrap brutal-btn'
                : isObsidian
                ? 'text-[11px] px-2.5 py-1 border border-[#2A241A] bg-[#070709] text-[#A39E93] hover:text-[#F5F0E6] hover:border-[#D4AF37]/40 uppercase tracking-[0.14em] transition-colors cursor-pointer whitespace-nowrap'
                : 'text-[11px] px-2 py-1 rounded border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer whitespace-nowrap'
            }
          >
            VOICE: <span className={isBrutal ? 'text-black font-black' : isObsidian ? 'text-[#E5C77B] font-mono font-semibold' : 'text-zinc-100 font-bold'}>{speechRate}x</span>
          </button>
        </div>
      </div>

      {/* Speech Error / Status Notice if browser lacks TTS engine */}
      {speechNotice && (
        <div
          className={
            isBrutal
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
            className={isBrutal ? 'text-black underline font-black cursor-pointer shrink-0' : isObsidian ? 'text-[#A39E93] hover:text-[#F5F0E6] uppercase tracking-[0.12em] cursor-pointer shrink-0' : 'text-zinc-400 hover:text-zinc-200 cursor-pointer shrink-0'}
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Progress Track */}
      <div
        className={
          isBrutal
            ? 'w-full bg-white h-3 overflow-hidden mb-6 border-2 border-black brutal-shadow-sm'
            : isObsidian
            ? 'w-full bg-[#0B0B0E] h-1 overflow-hidden mb-6 border border-[#2A241A]'
            : 'w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mb-6 border border-zinc-800'
        }
      >
        <div
          className={
            isBrutal
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
            isBrutal || isObsidian ? '' : 'rounded-lg'
          } ${isFlipped ? 'rotate-y-180' : ''}`}
        >
          {/* ================= CARD FRONT (Danger Phrase & Scenario Context) ================= */}
          <div
            className={
              isBrutal
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
                isBrutal
                  ? 'flex items-center justify-between text-xs text-zinc-700 font-bold border-b-2 border-black pb-3'
                  : isObsidian
                  ? 'flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-[#A39E93] border-b border-[#2A241A] pb-3.5'
                  : 'flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-3'
              }
            >
              <div className="flex items-center gap-2 font-mono">
                <span className={isBrutal ? 'bg-[#FFE500] text-black border border-black px-1.5 py-0.5 font-black' : isObsidian ? 'text-[#D4AF37] font-semibold' : 'text-zinc-100 font-bold'}>
                  [BOX {currentCard.box}]
                </span>
                <span>·</span>
                <span className={isBrutal ? 'text-black font-extrabold' : isObsidian ? 'text-[#DDD6C8]' : ''}>
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
                  isBrutal
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
                  isBrutal
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
                  isBrutal
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
                  isBrutal
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
                  isBrutal
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
                isBrutal
                  ? 'pt-4 border-t-2 border-black flex items-center justify-between text-xs font-bold text-zinc-800'
                  : isObsidian
                  ? 'pt-4 border-t border-[#2A241A] flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-[#8E877A]'
                  : 'pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500'
              }
            >
              <div className="flex items-center gap-2">
                <span
                  className={
                    isBrutal
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
              <div className={isBrutal ? 'flex items-center gap-1 text-black font-black' : isObsidian ? 'flex items-center gap-1.5 text-[#E5C77B] font-semibold' : 'flex items-center gap-1 text-zinc-300 hover:text-white'}>
                <span>REVEAL</span>
                <RotateCw className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>

          {/* ================= CARD BACK (Power Reframe, Psychology, Delivery) ================= */}
          <div
            className={
              isBrutal
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
                isBrutal
                  ? 'flex items-center justify-between text-xs text-black font-bold border-b-2 border-black pb-3 gap-2'
                  : isObsidian
                  ? 'flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-[#A39E93] border-b border-[#2A241A] pb-3.5 gap-2'
                  : 'flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-3 gap-2'
              }
            >
              <div className="flex items-center gap-2 min-w-0 font-mono">
                <span className={isBrutal ? 'bg-white border border-black px-1.5 py-0.5 text-black font-black shrink-0' : isObsidian ? 'text-[#D4AF37] font-semibold shrink-0' : 'text-zinc-100 font-bold shrink-0'}>
                  [BOX {currentCard.box}]
                </span>
                <span className="shrink-0">·</span>
                <span className={isBrutal ? 'text-black font-extrabold truncate' : isObsidian ? 'text-[#DDD6C8] truncate font-sans' : 'text-zinc-300 truncate'}>
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
                    isBrutal
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
                  <Volume2 className={isBrutal ? 'w-3.5 h-3.5 text-black' : isObsidian ? 'w-3.5 h-3.5 text-[#D4AF37]' : 'w-3.5 h-3.5 text-amber-400'} />
                  <span>{isSpeaking && isFlipped ? 'SPEAKING...' : 'SPEAK [A]'}</span>
                </button>
              </div>
            </div>

            {/* Middle: Power Phrase, Psychological Rationale, Delivery Tip */}
            <div className="py-5 my-auto">
              {/* Say Instead */}
              <div
                className={
                  isBrutal
                    ? 'inline-flex items-center gap-1.5 bg-[#86EFAC] border-2 border-black px-2 py-0.5 text-xs uppercase tracking-wider text-black font-black mb-2'
                    : isObsidian
                    ? 'text-[11px] uppercase tracking-[0.2em] text-[#E5C77B] font-semibold mb-2'
                    : 'text-xs uppercase tracking-wider text-amber-400 font-bold mb-1.5 flex items-center gap-1.5'
                }
              >
                {!isObsidian && <span className={isBrutal ? 'w-2 h-2 bg-black' : 'w-1.5 h-1.5 rounded-full bg-amber-400'} />}
                <span>SAY INSTEAD (POWER REFRAME):</span>
              </div>
              <div
                className={
                  isBrutal
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
                  isBrutal
                    ? 'mb-3 bg-white border-2 border-black p-3 brutal-shadow-sm'
                    : isObsidian
                    ? 'mb-3 bg-[#070709]/80 border border-[#2A241A] p-3.5'
                    : 'mb-3 bg-zinc-900/60 border border-zinc-800 p-3 rounded'
                }
              >
                <div
                  className={
                    isBrutal
                      ? 'text-[11px] uppercase tracking-wider text-black font-black mb-1 flex items-center gap-1.5'
                      : isObsidian
                      ? 'text-[11px] uppercase tracking-[0.16em] text-[#E5C77B] font-semibold mb-1.5 flex items-center gap-1.5'
                      : 'text-[11px] uppercase tracking-wider text-zinc-300 font-bold mb-1 flex items-center gap-1.5'
                  }
                >
                  <Sparkles className={isBrutal ? 'w-3.5 h-3.5 text-black' : isObsidian ? 'w-3.5 h-3.5 text-[#D4AF37]' : 'w-3.5 h-3.5 text-zinc-400'} />
                  <span>THE PSYCHOLOGICAL MECHANISM (THE "WHY"):</span>
                </div>
                <p className={isBrutal ? 'text-xs text-zinc-900 font-medium leading-relaxed' : isObsidian ? 'text-xs text-[#DDD6C8] leading-relaxed' : 'text-xs text-zinc-300 leading-relaxed'}>
                  {currentCard.rationale}
                </p>
              </div>

              {/* Delivery and Cadence Advice */}
              <div
                className={
                  isBrutal
                    ? 'bg-white border-2 border-black p-3 brutal-shadow-sm'
                    : isObsidian
                    ? 'bg-[#070709]/80 border border-[#2A241A] p-3.5'
                    : 'bg-zinc-900/60 border border-zinc-800 p-3 rounded'
                }
              >
                <div
                  className={
                    isBrutal
                      ? 'text-[11px] uppercase tracking-wider text-black font-black mb-1 flex items-center gap-1.5'
                      : isObsidian
                      ? 'text-[11px] uppercase tracking-[0.16em] text-[#E5C77B] font-semibold mb-1.5 flex items-center gap-1.5'
                      : 'text-[11px] uppercase tracking-wider text-zinc-300 font-bold mb-1 flex items-center gap-1.5'
                  }
                >
                  <CheckCircle2 className={isBrutal ? 'w-3.5 h-3.5 text-black' : isObsidian ? 'w-3.5 h-3.5 text-[#D4AF37]' : 'w-3.5 h-3.5 text-zinc-400'} />
                  <span>DELIVERY & VOCAL CADENCE:</span>
                </div>
                <p className={isBrutal ? 'text-xs text-zinc-900 font-medium leading-relaxed' : isObsidian ? 'text-xs text-[#DDD6C8] leading-relaxed' : 'text-xs text-zinc-300 leading-relaxed'}>
                  {currentCard.deliveryTip}
                </p>
              </div>
            </div>

            {/* Bottom: Instructions */}
            <div
              className={
                isBrutal
                  ? 'pt-2 border-t-2 border-black flex items-center justify-between text-xs font-bold text-zinc-900'
                  : isObsidian
                  ? 'pt-3 border-t border-[#2A241A] flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-[#8E877A]'
                  : 'pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500'
              }
            >
              <span>GRADE YOUR RECALL READINESS BELOW</span>
              <span className={isBrutal ? 'text-black font-black font-mono' : isObsidian ? 'text-[#E5C77B] font-mono' : 'text-zinc-300 font-mono'}>[HOTKEYS 1–4]</span>
            </div>

          </div>
        </div>
      </div>

      {/* Leitner Rating Decision Console */}
      <div
        className={
          isBrutal
            ? 'border-2 border-black bg-white p-4 brutal-shadow'
            : isObsidian
            ? 'border border-[#2A241A] obsidian-surface p-4'
            : 'border border-zinc-800 bg-zinc-950 p-4 rounded-lg'
        }
      >
        <div
          className={
            isBrutal
              ? 'flex items-center justify-between text-xs text-zinc-700 mb-3'
              : isObsidian
              ? 'flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-[#A39E93] mb-3'
              : 'flex items-center justify-between text-xs text-zinc-400 mb-3'
          }
        >
          <span className={isBrutal ? 'font-black uppercase tracking-wider text-black' : isObsidian ? 'font-semibold text-[#F5F0E6]' : 'font-bold uppercase tracking-wider text-zinc-200'}>
            LEITNER RETENTION RATING:
          </span>
          <span className={isBrutal ? 'text-[11px] font-bold text-zinc-700' : isObsidian ? 'text-[11px] text-[#8E877A]' : 'text-[11px] text-zinc-500'}>
            {isFlipped ? 'CHOOSE RETENTION QUALITY' : 'FLIP CARD [SPACE] BEFORE RATING'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Rating 1: Again */}
          <button
            onClick={() => handleRate('again')}
            className={
              isBrutal
                ? 'px-3 py-2.5 border-2 border-black bg-[#FDA4AF] hover:bg-[#FB7185] text-black text-xs font-black tracking-wide cursor-pointer flex flex-col items-center gap-1 text-center brutal-btn'
                : isObsidian
                ? 'px-3 py-2.5 border border-[#3D2225] bg-[#140D0E] hover:border-[#E8A5A5]/60 text-[#E8A5A5] text-xs font-medium tracking-[0.12em] transition-all cursor-pointer flex flex-col items-center gap-1 text-center group'
                : 'px-3 py-2.5 rounded border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-600 text-zinc-300 text-xs font-mono font-medium tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group'
            }
          >
            <div className="flex items-center gap-1.5 font-semibold">
              <span className={isBrutal ? 'text-[10px] px-1.5 py-0.5 bg-white border border-black text-black font-mono font-black' : isObsidian ? 'text-[10px] px-1.5 py-0.5 bg-[#070709] border border-[#3D2225] text-[#E8A5A5] font-mono' : 'text-[10px] px-1 py-0.2 rounded bg-zinc-800 border border-zinc-700 text-zinc-200'}>1</span>
              <span>AGAIN</span>
            </div>
            <span className={isBrutal ? 'text-[10px] font-bold text-zinc-900' : isObsidian ? 'text-[10px] text-[#A39E93] tracking-normal' : 'text-[10px] text-zinc-500 group-hover:text-zinc-400'}>
              Reset to Box 1 (1d)
            </span>
          </button>

          {/* Rating 2: Hard */}
          <button
            onClick={() => handleRate('hard')}
            className={
              isBrutal
                ? 'px-3 py-2.5 border-2 border-black bg-[#FFE500] hover:bg-[#FACC15] text-black text-xs font-black tracking-wide cursor-pointer flex flex-col items-center gap-1 text-center brutal-btn'
                : isObsidian
                ? 'px-3 py-2.5 border border-[#2A241A] bg-[#0B0B0E] hover:border-[#D4AF37]/45 text-[#DDD6C8] text-xs font-medium tracking-[0.12em] transition-all cursor-pointer flex flex-col items-center gap-1 text-center group'
                : 'px-3 py-2.5 rounded border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-600 text-zinc-300 text-xs font-mono font-medium tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group'
            }
          >
            <div className="flex items-center gap-1.5 font-semibold">
              <span className={isBrutal ? 'text-[10px] px-1.5 py-0.5 bg-white border border-black text-black font-mono font-black' : isObsidian ? 'text-[10px] px-1.5 py-0.5 bg-[#121216] border border-[#2A241A] text-[#C5A059] font-mono' : 'text-[10px] px-1 py-0.2 rounded bg-zinc-800 border border-zinc-700 text-zinc-200'}>2</span>
              <span>HARD</span>
            </div>
            <span className={isBrutal ? 'text-[10px] font-bold text-zinc-900' : isObsidian ? 'text-[10px] text-[#8E877A] group-hover:text-[#A39E93] tracking-normal' : 'text-[10px] text-zinc-500 group-hover:text-zinc-400'}>
              Maintain ({currentCard.intervalDays}d)
            </span>
          </button>

          {/* Rating 3: Good */}
          <button
            onClick={() => handleRate('good')}
            className={
              isBrutal
                ? 'px-3 py-2.5 border-2 border-black bg-[#86EFAC] hover:bg-[#4ADE80] text-black text-xs font-black tracking-wide cursor-pointer flex flex-col items-center gap-1 text-center brutal-btn'
                : isObsidian
                ? 'px-3 py-2.5 border border-[#D4AF37]/40 bg-[#14110C] hover:border-[#D4AF37] text-[#E5C77B] text-xs font-semibold tracking-[0.12em] transition-all cursor-pointer flex flex-col items-center gap-1 text-center group'
                : 'px-3 py-2.5 rounded border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-500 text-zinc-100 text-xs font-mono font-medium tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group'
            }
          >
            <div className="flex items-center gap-1.5 font-semibold">
              <span className={isBrutal ? 'text-[10px] px-1.5 py-0.5 bg-white border border-black text-black font-mono font-black' : isObsidian ? 'text-[10px] px-1.5 py-0.5 bg-[#070709] border border-[#D4AF37]/45 text-[#E5C77B] font-mono' : 'text-[10px] px-1 py-0.2 rounded bg-zinc-800 border border-zinc-600 text-white'}>3</span>
              <span>GOOD</span>
            </div>
            <span className={isBrutal ? 'text-[10px] font-bold text-zinc-900' : isObsidian ? 'text-[10px] text-[#A39E93] group-hover:text-[#DDD6C8] tracking-normal font-normal' : 'text-[10px] text-zinc-400 group-hover:text-zinc-300'}>
              Advance +1 ({Math.min(5, currentCard.box + 1) * 2}d)
            </span>
          </button>

          {/* Rating 4: Easy */}
          <button
            onClick={() => handleRate('easy')}
            className={
              isBrutal
                ? 'px-3 py-2.5 border-2 border-black bg-[#7DD3FC] hover:bg-[#38BDF8] text-black text-xs font-black tracking-wide cursor-pointer flex flex-col items-center gap-1 text-center brutal-btn'
                : isObsidian
                ? 'px-3 py-2.5 border border-[#D4AF37]/70 bg-[#1C170F] hover:bg-[#D4AF37] hover:text-[#070709] text-[#F3E5AB] text-xs font-semibold tracking-[0.12em] transition-all cursor-pointer flex flex-col items-center gap-1 text-center group'
                : 'px-3 py-2.5 rounded border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-500 text-zinc-100 text-xs font-mono font-medium tracking-wide transition-all cursor-pointer flex flex-col items-center gap-1 text-center group'
            }
          >
            <div className="flex items-center gap-1.5 font-semibold">
              <span className={isBrutal ? 'text-[10px] px-1.5 py-0.5 bg-white border border-black text-black font-mono font-black' : isObsidian ? 'text-[10px] px-1.5 py-0.5 bg-[#070709] border border-[#D4AF37]/60 text-[#F3E5AB] group-hover:border-[#070709] font-mono' : 'text-[10px] px-1 py-0.2 rounded bg-zinc-800 border border-zinc-600 text-white'}>4</span>
              <span>EASY</span>
            </div>
            <span className={isBrutal ? 'text-[10px] font-bold text-zinc-900' : isObsidian ? 'text-[10px] text-[#C5A059] group-hover:text-[#070709] tracking-normal font-normal' : 'text-[10px] text-zinc-400 group-hover:text-zinc-300'}>
              Fast-track +2 Boxes
            </span>
          </button>
        </div>
      </div>

    </div>
  );
};
