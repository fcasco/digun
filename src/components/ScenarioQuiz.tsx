import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Volume2,
  VolumeX,
  HelpCircle,
  Shuffle,
  SlidersHorizontal
} from 'lucide-react';
import { SCENARIO_QUIZZES, CATEGORIES } from '../data/defaultCards';
import { soundEffects } from '../utils/soundEffects';
import { speechEngine } from '../utils/speechSynthesis';
import { useTheme } from '../context/ThemeContext';

export const ScenarioQuiz: React.FC = () => {
  const { isGlass, isBrutal, isObsidian, isNordic } = useTheme();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [shuffleSeed, setShuffleSeed] = useState<number>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);

  const filteredQuestions = useMemo(() => {
    const pool =
      filterCategory === 'all'
        ? [...SCENARIO_QUIZZES]
        : SCENARIO_QUIZZES.filter(q => q.category === filterCategory);

    if (shuffleSeed > 0) {
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
    }
    return pool;
  }, [filterCategory, shuffleSeed]);

  const question = filteredQuestions[currentQuestionIndex];

  useEffect(() => {
    return () => {
      speechEngine.stop();
    };
  }, []);

  const handleSpeak = useCallback((text: string) => {
    if (isSpeaking) {
      speechEngine.stop();
      setIsSpeaking(false);
      return;
    }

    setSpeechNotice(null);
    setIsSpeaking(true);
    speechEngine.speak(text, {
      onStart: () => {
        setIsSpeaking(true);
        setSpeechNotice(null);
      },
      onEnd: () => setIsSpeaking(false),
      onError: (err) => {
        setIsSpeaking(false);
        setSpeechNotice(err.message || 'Browser speech synthesis unavailable.');
      },
    });
  }, [isSpeaking]);

  const handleSelectOption = useCallback((index: number) => {
    if (hasSubmitted) return;
    soundEffects.playKeyClick();
    setSelectedOptionIndex(index);
  }, [hasSubmitted]);

  const handleSubmit = useCallback(() => {
    if (selectedOptionIndex === null || hasSubmitted || !question) return;

    setHasSubmitted(true);
    const chosenOption = question.options[selectedOptionIndex];

    if (chosenOption.isOptimal) {
      soundEffects.playSuccessTone();
      setScore(prev => prev + 1);
    } else {
      soundEffects.playAgainTone();
    }
  }, [selectedOptionIndex, hasSubmitted, question]);

  const handleNext = useCallback(() => {
    speechEngine.stop();
    setIsSpeaking(false);
    setSpeechNotice(null);
    soundEffects.playKeyClick();

    if (currentQuestionIndex + 1 < filteredQuestions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionIndex(null);
      setHasSubmitted(false);
    } else {
      setIsQuizCompleted(true);
      soundEffects.playGraduationChime();
    }
  }, [currentQuestionIndex, filteredQuestions.length]);

  const handleRestart = useCallback((shouldShuffle = false) => {
    speechEngine.stop();
    setIsSpeaking(false);
    setSpeechNotice(null);
    soundEffects.playKeyClick();
    if (shouldShuffle) {
      setShuffleSeed(prev => prev + 1);
    }
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setHasSubmitted(false);
    setScore(0);
    setIsQuizCompleted(false);
  }, []);

  // Keyboard shortcuts for Scenario Drill
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tagName = (e.target as HTMLElement)?.tagName;
      if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') return;
      if (isQuizCompleted || !question) return;

      if (e.key.toLowerCase() === 'a' || e.code === 'KeyA') {
        e.preventDefault();
        const optimal = question.options.find(o => o.isOptimal);
        const textToSpeak = hasSubmitted && optimal ? optimal.text : question.dangerPhrase;
        handleSpeak(textToSpeak);
      } else if (!hasSubmitted && ['1', '2', '3'].includes(e.key)) {
        const idx = Number(e.key) - 1;
        if (idx < question.options.length) {
          e.preventDefault();
          handleSelectOption(idx);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (!hasSubmitted && selectedOptionIndex !== null) {
          handleSubmit();
        } else if (hasSubmitted) {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuizCompleted, question, hasSubmitted, selectedOptionIndex, handleSpeak, handleSelectOption, handleSubmit, handleNext]);

  if (isQuizCompleted || !question) {
    const total = filteredQuestions.length || 1;
    const percentage = Math.round((score / total) * 100);

    return (
      <div className={`max-w-3xl mx-auto px-4 py-8 ${isBrutal || isObsidian || isGlass || isNordic ? 'font-sans' : 'font-mono'}`}>
        <div
          className={
            isNordic
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
          <div className="flex items-center gap-3 mb-4">
            <div className={isNordic ? 'p-2 rounded-xl bg-[#E7EFEA] border border-[#B8CBBF] text-[#3B5948]' : isGlass ? 'p-2 rounded-xl bg-sky-400/15 border border-sky-300/35 text-sky-300' : isBrutal ? 'p-2 bg-[#86EFAC] border-2 border-black text-black' : ''}>
              <CheckCircle2 className={isNordic ? 'w-5 h-5 text-[#3B5948]' : isGlass ? 'w-5 h-5 text-sky-300' : isBrutal ? 'w-5 h-5 text-black' : isObsidian ? 'w-5 h-5 text-[#D4AF37]' : 'w-5 h-5 text-amber-400'} />
            </div>
            <h2
              className={
                isNordic
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
              SCENARIO DRILL: EVALUATION REPORT
            </h2>
          </div>

          <p className={isNordic ? 'text-sm text-[#4E5A53] mb-6 leading-relaxed' : isGlass ? 'text-sm text-slate-300 mb-6 leading-relaxed' : isBrutal ? 'text-sm text-zinc-700 font-medium mb-6 leading-relaxed' : isObsidian ? 'text-sm text-[#A39E93] mb-6 leading-relaxed' : 'text-sm text-zinc-400 mb-6 leading-relaxed'}>
            Situational simulation complete. You evaluated strategic verbal options across complex interpersonal workplace dynamics.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            <div
              className={
                isNordic
                  ? 'nordic-well border border-[#E2DDD0] rounded-xl p-4 text-center'
                  : isGlass
                  ? 'glass-well border border-white/15 rounded-xl p-4 text-center'
                  : isBrutal
                  ? 'border-2 border-black bg-[#F4F1EA] p-4 text-center brutal-shadow-sm'
                  : isObsidian
                  ? 'border border-[#2A241A] bg-[#070709] p-4 text-center'
                  : 'border border-zinc-800 bg-zinc-900/50 p-4 rounded text-center'
              }
            >
              <div className={isNordic ? 'text-[10px] font-semibold uppercase tracking-wider text-[#5C6962] mb-1' : isGlass ? 'text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1' : isBrutal ? 'text-xs font-extrabold text-zinc-700 mb-1' : isObsidian ? 'text-[10px] uppercase tracking-[0.16em] text-[#8E877A] mb-1' : 'text-xs text-zinc-500 mb-1'}>
                SCORE
              </div>
              <div className={isNordic ? 'text-3xl font-bold font-mono text-[#242E28] tabular-nums' : isGlass ? 'text-3xl font-bold font-mono text-white tabular-nums' : isBrutal ? 'text-3xl font-black text-black tabular-nums' : isObsidian ? 'text-3xl font-mono font-semibold text-[#F5F0E6] tabular-nums' : 'text-3xl font-bold text-zinc-100 tabular-nums'}>
                {score} / {total}
              </div>
            </div>
            <div
              className={
                isNordic
                  ? 'border border-[#B8CBBF] bg-[#E7EFEA] rounded-xl p-4 text-center'
                  : isGlass
                  ? 'border border-sky-300/40 bg-sky-950/35 rounded-xl p-4 text-center'
                  : isBrutal
                  ? 'border-2 border-black bg-[#FFE500] p-4 text-center brutal-shadow-sm'
                  : isObsidian
                  ? 'border border-[#D4AF37]/40 bg-[#14110C] p-4 text-center'
                  : 'border border-zinc-800 bg-zinc-900/50 p-4 rounded text-center'
              }
            >
              <div className={isNordic ? 'text-[10px] font-semibold uppercase tracking-wider text-[#3B5948] mb-1' : isGlass ? 'text-[10px] font-semibold uppercase tracking-wider text-sky-200 mb-1' : isBrutal ? 'text-xs font-extrabold text-black mb-1' : isObsidian ? 'text-[10px] uppercase tracking-[0.16em] text-[#C5A059] mb-1' : 'text-xs text-zinc-500 mb-1'}>
                ACCURACY
              </div>
              <div className={isNordic ? 'text-3xl font-bold font-mono text-[#2D4739] tabular-nums' : isGlass ? 'text-3xl font-bold font-mono text-sky-300 tabular-nums' : isBrutal ? 'text-3xl font-black text-black tabular-nums' : isObsidian ? 'text-3xl font-mono font-semibold text-[#E5C77B] tabular-nums' : 'text-3xl font-bold text-amber-400 tabular-nums'}>
                {percentage}%
              </div>
            </div>
            <div
              className={
                isNordic
                  ? 'nordic-well border border-[#E2DDD0] rounded-xl p-4 text-center col-span-2 sm:col-span-1'
                  : isGlass
                  ? 'glass-well border border-white/15 rounded-xl p-4 text-center col-span-2 sm:col-span-1'
                  : isBrutal
                  ? 'border-2 border-black bg-[#7DD3FC] p-4 text-center col-span-2 sm:col-span-1 brutal-shadow-sm'
                  : isObsidian
                  ? 'border border-[#2A241A] bg-[#070709] p-4 text-center col-span-2 sm:col-span-1'
                  : 'border border-zinc-800 bg-zinc-900/50 p-4 rounded text-center col-span-2 sm:col-span-1'
              }
            >
              <div className={isNordic ? 'text-[10px] font-semibold uppercase tracking-wider text-[#5C6962] mb-1' : isGlass ? 'text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1' : isBrutal ? 'text-xs font-extrabold text-black mb-1' : isObsidian ? 'text-[10px] uppercase tracking-[0.16em] text-[#8E877A] mb-1' : 'text-xs text-zinc-500 mb-1'}>
                STRATEGIC RATING
              </div>
              <div className={isNordic ? 'text-lg font-bold tracking-wide text-[#242E28]' : isGlass ? 'text-lg font-bold tracking-wide text-white' : isBrutal ? 'text-lg font-black text-black' : isObsidian ? 'font-luxury text-xl font-semibold tracking-wider text-[#F3E5AB]' : 'text-lg font-bold text-zinc-200'}>
                {percentage >= 80 ? 'EXECUTIVE' : percentage >= 50 ? 'PRACTITIONER' : 'REFINING'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleRestart(false)}
              className={
                isNordic
                  ? 'px-5 py-2.5 rounded-xl bg-[#527360] hover:bg-[#425F4E] text-[#FDFBF7] border border-[#425F4E] font-semibold text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm'
                  : isGlass
                  ? 'px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 border border-sky-300 font-semibold text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20'
                  : isBrutal
                  ? 'px-5 py-2.5 bg-[#FFE500] hover:bg-[#FACC15] text-black border-2 border-black font-black text-xs tracking-wide cursor-pointer flex items-center justify-center gap-2 brutal-btn'
                  : isObsidian
                  ? 'px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C77B] text-[#070709] border border-[#E5C77B] font-semibold text-[11px] uppercase tracking-[0.16em] transition-colors cursor-pointer flex items-center justify-center gap-2'
                  : 'px-5 py-2.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2'
              }
            >
              <RotateCcw className={isNordic ? 'w-4 h-4 text-[#FDFBF7]' : isGlass ? 'w-4 h-4 text-slate-950' : isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#070709]' : 'w-4 h-4 text-amber-600'} />
              <span>RESTART DRILL</span>
            </button>
            <button
              onClick={() => handleRestart(true)}
              className={
                isNordic
                  ? 'px-5 py-2.5 rounded-xl nordic-well border border-[#DDD7C8] hover:border-[#B8CBBF] text-[#242E28] font-medium text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2'
                  : isGlass
                  ? 'px-5 py-2.5 rounded-xl glass-well border border-white/20 hover:border-white/35 text-white font-medium text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2'
                  : isBrutal
                  ? 'px-5 py-2.5 bg-white hover:bg-[#F4F1EA] text-black border-2 border-black font-extrabold text-xs tracking-wide cursor-pointer flex items-center justify-center gap-2 brutal-btn'
                  : isObsidian
                  ? 'px-5 py-2.5 border border-[#2A241A] hover:border-[#D4AF37]/50 bg-[#070709] text-[#F5F0E6] text-[11px] uppercase tracking-[0.16em] transition-colors cursor-pointer flex items-center justify-center gap-2'
                  : 'px-5 py-2.5 rounded border border-zinc-700 hover:border-zinc-500 bg-zinc-900 text-zinc-200 font-bold text-xs tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2'
              }
            >
              <Shuffle className="w-4 h-4" />
              <span>SHUFFLE & REPLAY</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentQuestionIndex + 1) / filteredQuestions.length) * 100);

  return (
    <div className={`max-w-3xl mx-auto px-4 py-6 ${isBrutal || isObsidian || isGlass || isNordic ? 'font-sans' : 'font-mono'}`}>
      {/* Toolbar: Category filter, Shuffle & Progress */}
      <div
        className={
          isNordic
            ? 'flex flex-wrap items-center justify-between gap-3 mb-4 border border-[#DDD7C8] nordic-card rounded-2xl p-3'
            : isGlass
            ? 'flex flex-wrap items-center justify-between gap-3 mb-4 border border-white/20 glass-panel rounded-2xl p-3'
            : isBrutal
            ? 'flex flex-wrap items-center justify-between gap-3 mb-4 border-2 border-black bg-white p-3 brutal-shadow'
            : isObsidian
            ? 'flex flex-wrap items-center justify-between gap-3 mb-4 border border-[#2A241A] obsidian-surface p-3'
            : 'flex flex-wrap items-center justify-between gap-3 mb-4 border border-zinc-800/90 bg-zinc-950 p-3 rounded'
        }
      >
        <div
          className={
            isNordic
              ? 'flex items-center gap-2 text-xs text-[#5C6962]'
              : isGlass
              ? 'flex items-center gap-2 text-xs text-slate-300'
              : isBrutal
              ? 'flex items-center gap-2 text-xs font-bold text-black'
              : isObsidian
              ? 'flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#A39E93]'
              : 'flex items-center gap-2 text-xs text-zinc-400'
          }
        >
          <span className={isNordic ? 'text-[#242E28] font-mono font-semibold tabular-nums' : isGlass ? 'text-white font-mono font-semibold tabular-nums' : isBrutal ? 'font-black tabular-nums' : isObsidian ? 'text-[#F5F0E6] font-mono tabular-nums' : 'text-zinc-100 font-bold tabular-nums'}>
            SCENARIO {currentQuestionIndex + 1} / {filteredQuestions.length}
          </span>
          <span>·</span>
          <span
            className={
              isNordic
                ? 'text-[#3B5948] font-mono font-semibold tabular-nums'
                : isGlass
                ? 'text-sky-300 font-mono font-semibold tabular-nums'
                : isBrutal
                ? 'bg-[#FFE500] border border-black px-1.5 py-0.5 text-black font-black tabular-nums'
                : isObsidian
                ? 'text-[#E5C77B] font-mono font-semibold tabular-nums'
                : 'text-amber-400 font-bold tabular-nums'
            }
          >
            SCORE: {score}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className={isNordic ? 'flex items-center gap-1.5 text-xs text-[#4E5A53]' : isGlass ? 'flex items-center gap-1.5 text-xs text-slate-300' : isBrutal ? 'flex items-center gap-1.5 text-xs text-black' : isObsidian ? 'flex items-center gap-1.5 text-xs text-[#A39E93]' : 'flex items-center gap-1.5 text-xs text-zinc-400'}>
            <SlidersHorizontal className={isNordic ? 'w-3.5 h-3.5 text-[#527360]' : isGlass ? 'w-3.5 h-3.5 text-sky-300' : isBrutal ? 'w-3.5 h-3.5 text-black' : isObsidian ? 'w-3.5 h-3.5 text-[#C5A059]' : 'w-3.5 h-3.5 text-zinc-500'} />
            <select
              value={filterCategory}
              onChange={(e) => {
                soundEffects.playKeyClick();
                setFilterCategory(e.target.value);
                setCurrentQuestionIndex(0);
                setSelectedOptionIndex(null);
                setHasSubmitted(false);
                setScore(0);
                setIsQuizCompleted(false);
                e.currentTarget.blur();
              }}
              className={
                isNordic
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
              <option value="all" className={isNordic ? 'bg-[#FDFBF7] text-[#242E28]' : isGlass ? 'bg-[#0B192C] text-slate-100' : ''}>ALL SCENARIOS ({SCENARIO_QUIZZES.length})</option>
              {CATEGORIES.map(cat => {
                const count = SCENARIO_QUIZZES.filter(q => q.category === cat.id).length;
                return (
                  <option key={cat.id} value={cat.id} className={isNordic ? 'bg-[#FDFBF7] text-[#242E28]' : isGlass ? 'bg-[#0B192C] text-slate-100' : ''}>
                    {cat.name.toUpperCase()} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          <button
            type="button"
            onClick={() => handleRestart(true)}
            title="Shuffle scenarios"
            className={
              isNordic
                ? 'text-[11px] px-2.5 py-1.5 rounded-xl nordic-well border border-[#DDD7C8] text-[#4E5A53] hover:text-[#242E28] hover:border-[#B8CBBF] transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap'
                : isGlass
                ? 'text-[11px] px-2.5 py-1.5 rounded-xl glass-well border border-white/15 text-slate-200 hover:text-white hover:border-sky-300/40 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap'
                : isBrutal
                ? 'text-[11px] px-2.5 py-1 border-2 border-black bg-[#F4F1EA] hover:bg-[#FFE500] text-black font-black cursor-pointer flex items-center gap-1.5 whitespace-nowrap brutal-btn'
                : isObsidian
                ? 'text-[11px] px-2.5 py-1 border border-[#2A241A] bg-[#070709] text-[#A39E93] hover:text-[#E5C77B] hover:border-[#D4AF37]/40 uppercase tracking-[0.14em] transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap'
                : 'text-[11px] px-2.5 py-1 rounded border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap'
            }
          >
            <Shuffle className="w-3 h-3" />
            <span className="hidden sm:inline">SHUFFLE</span>
          </button>
        </div>
      </div>

      {/* Progress Track */}
      <div
        className={
          isNordic
            ? 'w-full nordic-well h-1.5 rounded-full overflow-hidden mb-5 border border-[#E2DDD0]'
            : isGlass
            ? 'w-full glass-well h-1.5 rounded-full overflow-hidden mb-5 border border-white/15'
            : isBrutal
            ? 'w-full bg-white h-3 overflow-hidden mb-5 border-2 border-black brutal-shadow-sm'
            : isObsidian
            ? 'w-full bg-[#0B0B0E] h-1 overflow-hidden mb-5 border border-[#2A241A]'
            : 'w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mb-5 border border-zinc-800'
        }
      >
        <div
          className={
            isNordic
              ? 'bg-[#527360] h-full transition-all duration-300'
              : isGlass
              ? 'bg-sky-400 h-full transition-all duration-300'
              : isBrutal
              ? 'bg-[#86EFAC] h-full border-r-2 border-black transition-all duration-300'
              : isObsidian
              ? 'bg-[#D4AF37] h-full transition-all duration-300'
              : 'bg-zinc-300 h-full transition-all duration-300'
          }
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {speechNotice && (
        <div
          className={
            isNordic
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
            className={isNordic ? 'text-[#3B5948] hover:text-[#242E28] font-semibold cursor-pointer shrink-0' : isGlass ? 'text-sky-300 hover:text-white font-semibold cursor-pointer shrink-0' : isBrutal ? 'text-black underline font-black cursor-pointer shrink-0' : isObsidian ? 'text-[#A39E93] hover:text-[#F5F0E6] uppercase tracking-[0.12em] cursor-pointer shrink-0' : 'text-zinc-400 hover:text-zinc-200 cursor-pointer shrink-0'}
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Question Card */}
      <div
        className={
          isNordic
            ? 'border border-[#DDD7C8] nordic-card rounded-2xl p-6 sm:p-8 mb-6'
            : isGlass
            ? 'border border-white/25 glass-panel rounded-2xl p-6 sm:p-8 mb-6'
            : isBrutal
            ? 'border-2 border-black bg-white p-6 sm:p-7 mb-6 brutal-shadow-lg'
            : isObsidian
            ? 'border border-[#D4AF37]/25 obsidian-surface p-6 sm:p-8 mb-6'
            : 'border border-zinc-800 bg-zinc-950 rounded-lg p-6 sm:p-7 mb-6 shadow-xl'
        }
      >
        
        {/* Context badge */}
        <div
          className={
            isNordic
              ? 'text-[11px] uppercase tracking-[0.16em] text-[#3B5948] mb-2.5 font-semibold'
              : isGlass
              ? 'text-[11px] uppercase tracking-[0.16em] text-sky-300 mb-2.5 font-semibold'
              : isBrutal
              ? 'inline-block bg-[#FFE500] border-2 border-black px-2 py-0.5 text-xs text-black mb-3 font-black tracking-wide'
              : isObsidian
              ? 'text-[11px] uppercase tracking-[0.18em] text-[#D4AF37] mb-2 font-semibold'
              : 'text-xs text-zinc-400 mb-2 font-bold tracking-wider'
          }
        >
          CONTEXT: {question.speakerContext.toUpperCase()}
        </div>

        {/* Real-world Scenario */}
        <div
          className={
            isNordic
              ? 'text-xl sm:text-2xl font-semibold text-[#242E28] mb-5 leading-snug'
              : isGlass
              ? 'text-xl sm:text-2xl font-semibold text-white mb-5 leading-snug'
              : isBrutal
              ? 'text-base sm:text-lg text-black font-bold mb-4 leading-relaxed'
              : isObsidian
              ? 'font-luxury text-xl sm:text-2xl font-semibold text-[#F5F0E6] mb-5 leading-snug'
              : 'text-base sm:text-lg text-zinc-100 font-medium mb-4 leading-relaxed'
          }
        >
          {question.scenario}
        </div>

        {/* The Danger Phrase Trigger */}
        <div
          className={
            isNordic
              ? 'border border-[#E4C5B9] bg-[#FAF0EC] rounded-xl p-4 mb-6 flex items-start justify-between gap-3'
              : isGlass
              ? 'border border-rose-300/25 bg-rose-950/30 rounded-xl p-4 mb-6 flex items-start justify-between gap-3'
              : isBrutal
              ? 'border-2 border-black bg-[#FFE4E6] p-3.5 mb-6 flex items-start justify-between gap-3'
              : isObsidian
              ? 'border border-[#3D2225] bg-[#140D0E] p-4 mb-6 flex items-start justify-between gap-3'
              : 'border border-zinc-800 bg-zinc-900/40 p-3 rounded mb-6 flex items-start justify-between gap-3'
          }
        >
          <div>
            <div
              className={
                isNordic
                  ? 'text-[10px] text-[#964B36] font-semibold uppercase tracking-[0.16em] mb-1.5'
                  : isGlass
                  ? 'text-[10px] text-rose-200 font-semibold uppercase tracking-[0.16em] mb-1.5'
                  : isBrutal
                  ? 'text-[11px] text-black font-black uppercase tracking-wider mb-1'
                  : isObsidian
                  ? 'text-[10px] text-[#E8A5A5] font-semibold uppercase tracking-[0.18em] mb-1.5'
                  : 'text-[11px] text-zinc-400 font-bold uppercase tracking-wider mb-1'
              }
            >
              THE INTUITIVE (DANGER) PHRASE TO AVOID:
            </div>
            <div className={isNordic ? 'text-sm text-[#242E28] italic' : isGlass ? 'text-sm text-white italic' : isBrutal ? 'text-sm text-zinc-900 font-semibold italic' : isObsidian ? 'text-sm text-[#F5F0E6] italic' : 'text-sm text-zinc-300 italic font-mono'}>
              "{question.dangerPhrase}"
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSpeak(question.dangerPhrase)}
            className={
              isNordic
                ? `p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                    isSpeaking
                      ? 'bg-[#527360] text-[#FDFBF7] border-[#425F4E]'
                      : 'bg-white text-[#7D3B29] border-[#E4C5B9] hover:bg-[#F3E1DA]'
                  }`
                : isGlass
                ? `p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                    isSpeaking
                      ? 'bg-sky-400 text-slate-950 border-sky-300'
                      : 'bg-white/10 text-sky-200 border-white/20 hover:bg-white/15 hover:border-sky-300/40'
                  }`
                : isBrutal
                ? `p-2 border-2 border-black cursor-pointer shrink-0 brutal-btn ${
                    isSpeaking
                      ? 'bg-[#FFE500] text-black'
                      : 'bg-white text-black hover:bg-[#FFE500]'
                  }`
                : isObsidian
                ? `p-2 border transition-colors cursor-pointer shrink-0 ${
                    isSpeaking
                      ? 'bg-[#D4AF37] text-[#070709] border-[#E5C77B]'
                      : 'bg-[#070709] text-[#E5C77B] border-[#D4AF37]/35 hover:border-[#D4AF37]'
                  }`
                : `p-1.5 rounded transition-colors cursor-pointer shrink-0 ${
                    isSpeaking
                      ? 'bg-zinc-100 text-zinc-950'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`
            }
            title="Listen to trigger phrase [A]"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Options List */}
        <div className="space-y-3 mb-6">
          <div
            className={
              isNordic
                ? 'text-[11px] text-[#5C6962] uppercase tracking-wider flex items-center justify-between font-medium'
                : isGlass
                ? 'text-[11px] text-slate-300 uppercase tracking-wider flex items-center justify-between font-medium'
                : isBrutal
                ? 'text-xs text-black font-black uppercase tracking-wider flex items-center justify-between'
                : isObsidian
                ? 'text-[11px] text-[#A39E93] uppercase tracking-[0.16em] flex items-center justify-between'
                : 'text-xs text-zinc-400 uppercase tracking-wider flex items-center justify-between'
            }
          >
            <span>SELECT THE OPTIMAL STRATEGIC REFRAME:</span>
            <span className={isNordic ? 'text-[10px] font-mono text-[#5C6962] hidden sm:inline' : isGlass ? 'text-[10px] font-mono text-slate-400 hidden sm:inline' : isBrutal ? 'text-[10px] font-mono text-zinc-700 hidden sm:inline' : isObsidian ? 'text-[10px] font-mono text-[#8E877A] hidden sm:inline' : 'text-[10px] text-zinc-500 hidden sm:inline'}>
              [KEYS 1–3 · ENTER]
            </span>
          </div>

          {question.options.map((option, idx) => {
            const isSelected = selectedOptionIndex === idx;
            let containerStyle = isNordic
              ? 'rounded-xl nordic-well border border-[#E2DDD0] hover:border-[#8EAE9B] text-[#242E28]'
              : isGlass
              ? 'rounded-xl glass-well border border-white/15 hover:border-sky-300/45 text-slate-100'
              : isBrutal
              ? 'border-2 border-black bg-[#FFFDF5] hover:bg-[#FEF9C3] text-black brutal-btn'
              : isObsidian
              ? 'border border-[#2A241A] bg-[#070709] hover:border-[#D4AF37]/45 text-[#DDD6C8]'
              : 'border border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 text-zinc-300 rounded';
            
            if (hasSubmitted) {
              if (option.isOptimal) {
                containerStyle = isNordic
                  ? 'rounded-xl border border-[#527360] bg-[#E7EFEA] text-[#2D4739]'
                  : isGlass
                  ? 'rounded-xl border border-emerald-300/60 bg-emerald-950/35 text-emerald-100'
                  : isBrutal
                  ? 'border-2 border-black bg-[#86EFAC] text-black brutal-shadow-sm'
                  : isObsidian
                  ? 'border border-[#D4AF37]/80 bg-[#14110C] text-[#F3E5AB] brass-hairline-glow'
                  : 'border border-amber-400/80 bg-zinc-900 text-white shadow-sm rounded';
              } else if (isSelected && !option.isOptimal) {
                containerStyle = isNordic
                  ? 'rounded-xl border border-[#E4C5B9] bg-[#FAF0EC] text-[#8F4A37] line-through'
                  : isGlass
                  ? 'rounded-xl border border-rose-300/35 bg-rose-950/30 text-rose-200 line-through'
                  : isBrutal
                  ? 'border-2 border-black bg-[#FDA4AF] text-black line-through'
                  : isObsidian
                  ? 'border border-[#3D2225] bg-[#140D0E] text-[#A39E93] line-through'
                  : 'border border-zinc-700 bg-zinc-900 text-zinc-400 line-through rounded';
              } else {
                containerStyle = isNordic
                  ? 'rounded-xl nordic-well border border-[#E2DDD0] text-[#5C6962] opacity-65'
                  : isGlass
                  ? 'rounded-xl glass-well border border-white/10 text-slate-400 opacity-60'
                  : isBrutal
                  ? 'border-2 border-black bg-[#F4F1EA] text-zinc-500 opacity-70'
                  : isObsidian
                  ? 'border border-[#2A241A] bg-[#070709] text-[#736D63] opacity-55'
                  : 'border border-zinc-800 bg-zinc-950 text-zinc-600 opacity-60 rounded';
              }
            } else if (isSelected) {
              containerStyle = isNordic
                ? 'rounded-xl border border-[#527360] bg-[#E7EFEA] text-[#242E28]'
                : isGlass
                ? 'rounded-xl border border-sky-300 bg-sky-950/40 text-white'
                : isBrutal
                ? 'border-2 border-black bg-[#FFE500] text-black brutal-shadow-sm'
                : isObsidian
                ? 'border border-[#D4AF37] bg-[#14110C] text-[#F5F0E6]'
                : 'border border-zinc-400 bg-zinc-900 text-white rounded';
            }

            return (
              <div
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`p-3.5 transition-all cursor-pointer flex items-start gap-3 select-none ${containerStyle}`}
              >
                <div className="mt-0.5 shrink-0">
                  {hasSubmitted ? (
                    option.isOptimal ? (
                      <CheckCircle2 className={isNordic ? 'w-4 h-4 text-[#3B5948]' : isGlass ? 'w-4 h-4 text-emerald-300' : isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#D4AF37]' : 'w-4 h-4 text-amber-400'} />
                    ) : isSelected ? (
                      <XCircle className={isNordic ? 'w-4 h-4 text-[#964B36]' : isGlass ? 'w-4 h-4 text-rose-300' : isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#E8A5A5]' : 'w-4 h-4 text-zinc-500'} />
                    ) : (
                      <span className={isNordic ? 'text-xs font-mono text-[#5C6962]' : isGlass ? 'text-xs font-mono text-slate-500' : isBrutal ? 'text-xs font-mono font-bold text-zinc-600' : isObsidian ? 'text-xs font-mono text-[#736D63]' : 'text-xs font-mono text-zinc-600'}>[0{idx + 1}]</span>
                    )
                  ) : (
                    <span
                      className={`text-xs font-mono ${
                        isSelected
                          ? isNordic
                            ? 'text-[#3B5948] font-semibold'
                            : isGlass
                            ? 'text-sky-300 font-semibold'
                            : isBrutal
                            ? 'text-black font-black'
                            : isObsidian
                            ? 'text-[#E5C77B] font-semibold'
                            : 'text-zinc-100 font-bold'
                          : isNordic
                          ? 'text-[#5C6962]'
                          : isGlass
                          ? 'text-slate-400'
                          : isBrutal
                          ? 'text-zinc-700 font-bold'
                          : isObsidian
                          ? 'text-[#8E877A]'
                          : 'text-zinc-500'
                      }`}
                    >
                      [0{idx + 1}]
                    </span>
                  )}
                </div>

                <div className={`flex-1 text-sm leading-relaxed ${isBrutal ? 'font-semibold' : ''}`}>
                  "{option.text}"
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(option.text);
                  }}
                  className={
                    isNordic
                      ? 'p-1 rounded-lg text-[#5C6962] hover:text-[#3B5948] transition-colors cursor-pointer shrink-0'
                      : isGlass
                      ? 'p-1 rounded-lg text-slate-400 hover:text-sky-300 transition-colors cursor-pointer shrink-0'
                      : isBrutal
                      ? 'p-1.5 border border-black bg-white text-black hover:bg-[#7DD3FC] transition-colors cursor-pointer shrink-0'
                      : isObsidian
                      ? 'p-1 text-[#8E877A] hover:text-[#E5C77B] transition-colors cursor-pointer shrink-0'
                      : 'p-1 rounded text-zinc-500 hover:text-white transition-colors cursor-pointer shrink-0'
                  }
                  title="Listen to option"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Feedback Section (Shown after submission) */}
        {hasSubmitted && (
          <div
            className={
              isNordic
                ? 'p-4 rounded-xl bg-[#E7EFEA]/65 border border-[#B8CBBF] mb-6'
                : isGlass
                ? 'p-4 rounded-xl glass-well border border-sky-300/30 mb-6'
                : isBrutal
                ? 'p-4 border-2 border-black bg-[#E0F2FE] mb-6 brutal-shadow-sm'
                : isObsidian
                ? 'p-4 border border-[#D4AF37]/30 bg-[#070709] mb-6'
                : 'p-4 rounded border border-zinc-800 bg-zinc-900/60 mb-6'
            }
          >
            <div
              className={
                isNordic
                  ? 'text-[11px] text-[#2D4739] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5'
                  : isGlass
                  ? 'text-[11px] text-sky-300 font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5'
                  : isBrutal
                  ? 'text-xs text-black font-black uppercase tracking-wider mb-1.5 flex items-center gap-1.5'
                  : isObsidian
                  ? 'text-[11px] text-[#E5C77B] font-semibold uppercase tracking-[0.16em] mb-1.5 flex items-center gap-1.5'
                  : 'text-xs text-zinc-200 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5'
              }
            >
              <HelpCircle className={isNordic ? 'w-4 h-4 text-[#527360]' : isGlass ? 'w-4 h-4 text-sky-300' : isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#D4AF37]' : 'w-4 h-4 text-amber-400'} />
              <span>COMMUNICATION PSYCHOLOGY DEBRIEF:</span>
            </div>
            <p className={isNordic ? 'text-xs text-[#242E28] leading-relaxed mb-3' : isGlass ? 'text-xs text-slate-200 leading-relaxed mb-3' : isBrutal ? 'text-xs text-zinc-900 font-medium leading-relaxed mb-3' : isObsidian ? 'text-xs text-[#DDD6C8] leading-relaxed mb-3' : 'text-xs text-zinc-300 leading-relaxed mb-3'}>
              {question.psychologicalPrinciple}
            </p>
            {selectedOptionIndex !== null && (
              <div className={isNordic ? 'text-xs text-[#4E5A53] border-t border-[#B8CBBF] pt-2.5 italic' : isGlass ? 'text-xs text-slate-300 border-t border-white/15 pt-2.5 italic' : isBrutal ? 'text-xs text-black font-bold border-t-2 border-black pt-2 italic' : isObsidian ? 'text-xs text-[#A39E93] border-t border-[#2A241A] pt-2.5 italic' : 'text-xs text-zinc-400 border-t border-zinc-800 pt-2 italic'}>
                Feedback on your choice: {question.options[selectedOptionIndex].feedback}
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-end">
          {!hasSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={selectedOptionIndex === null}
              className={
                isNordic
                  ? `px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide border transition-all ${
                      selectedOptionIndex !== null
                        ? 'bg-[#527360] hover:bg-[#425F4E] text-[#FDFBF7] border-[#425F4E] cursor-pointer shadow-sm'
                        : 'nordic-well text-[#7B867F] border-[#E2DDD0] cursor-not-allowed'
                    }`
                  : isGlass
                  ? `px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide border transition-all ${
                      selectedOptionIndex !== null
                        ? 'bg-sky-400 hover:bg-sky-300 text-slate-950 border-sky-300 cursor-pointer shadow-lg shadow-sky-500/20'
                        : 'glass-well text-slate-500 border-white/15 cursor-not-allowed'
                    }`
                  : isBrutal
                  ? `px-5 py-2.5 text-xs font-black tracking-wide border-2 border-black transition-all ${
                      selectedOptionIndex !== null
                        ? 'bg-[#FFE500] hover:bg-[#FACC15] text-black cursor-pointer brutal-btn'
                        : 'bg-[#F4F1EA] text-zinc-500 cursor-not-allowed'
                    }`
                  : isObsidian
                  ? `px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] border transition-all ${
                      selectedOptionIndex !== null
                        ? 'bg-[#D4AF37] hover:bg-[#E5C77B] text-[#070709] border-[#E5C77B] cursor-pointer'
                        : 'bg-[#070709] text-[#736D63] border-[#2A241A] cursor-not-allowed'
                    }`
                  : `px-5 py-2.5 rounded text-xs font-bold tracking-wider transition-all cursor-pointer ${
                      selectedOptionIndex !== null
                        ? 'bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm'
                        : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                    }`
              }
            >
              SUBMIT ANSWER
            </button>
          ) : (
            <button
              onClick={handleNext}
              className={
                isNordic
                  ? 'px-5 py-2.5 rounded-xl bg-[#527360] hover:bg-[#425F4E] text-[#FDFBF7] border border-[#425F4E] text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-2 shadow-sm'
                  : isGlass
                  ? 'px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 border border-sky-300 text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-2 shadow-lg shadow-sky-500/20'
                  : isBrutal
                  ? 'px-5 py-2.5 bg-[#86EFAC] hover:bg-[#4ADE80] text-black border-2 border-black text-xs font-black tracking-wide cursor-pointer flex items-center gap-2 brutal-btn'
                  : isObsidian
                  ? 'px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C77B] text-[#070709] border border-[#E5C77B] text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors cursor-pointer flex items-center gap-2'
                  : 'px-5 py-2.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold tracking-wider transition-colors cursor-pointer flex items-center gap-2 shadow-sm'
              }
            >
              <span>{currentQuestionIndex + 1 < filteredQuestions.length ? 'NEXT SCENARIO' : 'FINISH DRILL'}</span>
              <ArrowRight className={isNordic ? 'w-4 h-4 text-[#FDFBF7]' : isGlass ? 'w-4 h-4 text-slate-950' : isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#070709]' : 'w-4 h-4 text-amber-600'} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
