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
  const { isBrutal, isObsidian } = useTheme();
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
          <div className="flex items-center gap-3 mb-4">
            <div className={isBrutal ? 'p-2 bg-[#86EFAC] border-2 border-black text-black' : ''}>
              <CheckCircle2 className={isBrutal ? 'w-5 h-5 text-black' : isObsidian ? 'w-5 h-5 text-[#D4AF37]' : 'w-5 h-5 text-amber-400'} />
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
              SCENARIO DRILL: EVALUATION REPORT
            </h2>
          </div>

          <p className={isBrutal ? 'text-sm text-zinc-700 font-medium mb-6 leading-relaxed' : isObsidian ? 'text-sm text-[#A39E93] mb-6 leading-relaxed' : 'text-sm text-zinc-400 mb-6 leading-relaxed'}>
            Situational simulation complete. You evaluated strategic verbal options across complex interpersonal workplace dynamics.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            <div
              className={
                isBrutal
                  ? 'border-2 border-black bg-[#F4F1EA] p-4 text-center brutal-shadow-sm'
                  : isObsidian
                  ? 'border border-[#2A241A] bg-[#070709] p-4 text-center'
                  : 'border border-zinc-800 bg-zinc-900/50 p-4 rounded text-center'
              }
            >
              <div className={isBrutal ? 'text-xs font-extrabold text-zinc-700 mb-1' : isObsidian ? 'text-[10px] uppercase tracking-[0.16em] text-[#8E877A] mb-1' : 'text-xs text-zinc-500 mb-1'}>
                SCORE
              </div>
              <div className={isBrutal ? 'text-3xl font-black text-black tabular-nums' : isObsidian ? 'text-3xl font-mono font-semibold text-[#F5F0E6] tabular-nums' : 'text-3xl font-bold text-zinc-100 tabular-nums'}>
                {score} / {total}
              </div>
            </div>
            <div
              className={
                isBrutal
                  ? 'border-2 border-black bg-[#FFE500] p-4 text-center brutal-shadow-sm'
                  : isObsidian
                  ? 'border border-[#D4AF37]/40 bg-[#14110C] p-4 text-center'
                  : 'border border-zinc-800 bg-zinc-900/50 p-4 rounded text-center'
              }
            >
              <div className={isBrutal ? 'text-xs font-extrabold text-black mb-1' : isObsidian ? 'text-[10px] uppercase tracking-[0.16em] text-[#C5A059] mb-1' : 'text-xs text-zinc-500 mb-1'}>
                ACCURACY
              </div>
              <div className={isBrutal ? 'text-3xl font-black text-black tabular-nums' : isObsidian ? 'text-3xl font-mono font-semibold text-[#E5C77B] tabular-nums' : 'text-3xl font-bold text-amber-400 tabular-nums'}>
                {percentage}%
              </div>
            </div>
            <div
              className={
                isBrutal
                  ? 'border-2 border-black bg-[#7DD3FC] p-4 text-center col-span-2 sm:col-span-1 brutal-shadow-sm'
                  : isObsidian
                  ? 'border border-[#2A241A] bg-[#070709] p-4 text-center col-span-2 sm:col-span-1'
                  : 'border border-zinc-800 bg-zinc-900/50 p-4 rounded text-center col-span-2 sm:col-span-1'
              }
            >
              <div className={isBrutal ? 'text-xs font-extrabold text-black mb-1' : isObsidian ? 'text-[10px] uppercase tracking-[0.16em] text-[#8E877A] mb-1' : 'text-xs text-zinc-500 mb-1'}>
                STRATEGIC RATING
              </div>
              <div className={isBrutal ? 'text-lg font-black text-black' : isObsidian ? 'font-luxury text-xl font-semibold tracking-wider text-[#F3E5AB]' : 'text-lg font-bold text-zinc-200'}>
                {percentage >= 80 ? 'EXECUTIVE' : percentage >= 50 ? 'PRACTITIONER' : 'REFINING'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleRestart(false)}
              className={
                isBrutal
                  ? 'px-5 py-2.5 bg-[#FFE500] hover:bg-[#FACC15] text-black border-2 border-black font-black text-xs tracking-wide cursor-pointer flex items-center justify-center gap-2 brutal-btn'
                  : isObsidian
                  ? 'px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C77B] text-[#070709] border border-[#E5C77B] font-semibold text-[11px] uppercase tracking-[0.16em] transition-colors cursor-pointer flex items-center justify-center gap-2'
                  : 'px-5 py-2.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2'
              }
            >
              <RotateCcw className={isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#070709]' : 'w-4 h-4 text-amber-600'} />
              <span>RESTART DRILL</span>
            </button>
            <button
              onClick={() => handleRestart(true)}
              className={
                isBrutal
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
    <div className={`max-w-3xl mx-auto px-4 py-6 ${isBrutal || isObsidian ? 'font-sans' : 'font-mono'}`}>
      {/* Toolbar: Category filter, Shuffle & Progress */}
      <div
        className={
          isBrutal
            ? 'flex flex-wrap items-center justify-between gap-3 mb-4 border-2 border-black bg-white p-3 brutal-shadow'
            : isObsidian
            ? 'flex flex-wrap items-center justify-between gap-3 mb-4 border border-[#2A241A] obsidian-surface p-3'
            : 'flex flex-wrap items-center justify-between gap-3 mb-4 border border-zinc-800/90 bg-zinc-950 p-3 rounded'
        }
      >
        <div
          className={
            isBrutal
              ? 'flex items-center gap-2 text-xs font-bold text-black'
              : isObsidian
              ? 'flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#A39E93]'
              : 'flex items-center gap-2 text-xs text-zinc-400'
          }
        >
          <span className={isBrutal ? 'font-black tabular-nums' : isObsidian ? 'text-[#F5F0E6] font-mono tabular-nums' : 'text-zinc-100 font-bold tabular-nums'}>
            SCENARIO {currentQuestionIndex + 1} / {filteredQuestions.length}
          </span>
          <span>·</span>
          <span
            className={
              isBrutal
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
          <div className={isBrutal ? 'flex items-center gap-1.5 text-xs text-black' : isObsidian ? 'flex items-center gap-1.5 text-xs text-[#A39E93]' : 'flex items-center gap-1.5 text-xs text-zinc-400'}>
            <SlidersHorizontal className={isBrutal ? 'w-3.5 h-3.5 text-black' : isObsidian ? 'w-3.5 h-3.5 text-[#C5A059]' : 'w-3.5 h-3.5 text-zinc-500'} />
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
                isBrutal
                  ? 'bg-white border-2 border-black text-xs font-bold text-black px-2 py-1 focus:outline-none cursor-pointer'
                  : isObsidian
                  ? 'bg-[#070709] border border-[#2A241A] focus:border-[#D4AF37]/60 text-[11px] uppercase tracking-[0.12em] text-[#F5F0E6] px-2.5 py-1 focus:outline-none cursor-pointer'
                  : 'bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 rounded px-2 py-1 focus:outline-none focus:border-zinc-600 cursor-pointer'
              }
            >
              <option value="all">ALL SCENARIOS ({SCENARIO_QUIZZES.length})</option>
              {CATEGORIES.map(cat => {
                const count = SCENARIO_QUIZZES.filter(q => q.category === cat.id).length;
                return (
                  <option key={cat.id} value={cat.id}>
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
              isBrutal
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
          isBrutal
            ? 'w-full bg-white h-3 overflow-hidden mb-5 border-2 border-black brutal-shadow-sm'
            : isObsidian
            ? 'w-full bg-[#0B0B0E] h-1 overflow-hidden mb-5 border border-[#2A241A]'
            : 'w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden mb-5 border border-zinc-800'
        }
      >
        <div
          className={
            isBrutal
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

      {/* Question Card */}
      <div
        className={
          isBrutal
            ? 'border-2 border-black bg-white p-6 sm:p-7 mb-6 brutal-shadow-lg'
            : isObsidian
            ? 'border border-[#D4AF37]/25 obsidian-surface p-6 sm:p-8 mb-6'
            : 'border border-zinc-800 bg-zinc-950 rounded-lg p-6 sm:p-7 mb-6 shadow-xl'
        }
      >
        
        {/* Context badge */}
        <div
          className={
            isBrutal
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
            isBrutal
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
            isBrutal
              ? 'border-2 border-black bg-[#FFE4E6] p-3.5 mb-6 flex items-start justify-between gap-3'
              : isObsidian
              ? 'border border-[#3D2225] bg-[#140D0E] p-4 mb-6 flex items-start justify-between gap-3'
              : 'border border-zinc-800 bg-zinc-900/40 p-3 rounded mb-6 flex items-start justify-between gap-3'
          }
        >
          <div>
            <div
              className={
                isBrutal
                  ? 'text-[11px] text-black font-black uppercase tracking-wider mb-1'
                  : isObsidian
                  ? 'text-[10px] text-[#E8A5A5] font-semibold uppercase tracking-[0.18em] mb-1.5'
                  : 'text-[11px] text-zinc-400 font-bold uppercase tracking-wider mb-1'
              }
            >
              THE INTUITIVE (DANGER) PHRASE TO AVOID:
            </div>
            <div className={isBrutal ? 'text-sm text-zinc-900 font-semibold italic' : isObsidian ? 'text-sm text-[#F5F0E6] italic' : 'text-sm text-zinc-300 italic font-mono'}>
              "{question.dangerPhrase}"
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSpeak(question.dangerPhrase)}
            className={
              isBrutal
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
              isBrutal
                ? 'text-xs text-black font-black uppercase tracking-wider flex items-center justify-between'
                : isObsidian
                ? 'text-[11px] text-[#A39E93] uppercase tracking-[0.16em] flex items-center justify-between'
                : 'text-xs text-zinc-400 uppercase tracking-wider flex items-center justify-between'
            }
          >
            <span>SELECT THE OPTIMAL STRATEGIC REFRAME:</span>
            <span className={isBrutal ? 'text-[10px] font-mono text-zinc-700 hidden sm:inline' : isObsidian ? 'text-[10px] font-mono text-[#8E877A] hidden sm:inline' : 'text-[10px] text-zinc-500 hidden sm:inline'}>
              [KEYS 1–3 · ENTER]
            </span>
          </div>

          {question.options.map((option, idx) => {
            const isSelected = selectedOptionIndex === idx;
            let containerStyle = isBrutal
              ? 'border-2 border-black bg-[#FFFDF5] hover:bg-[#FEF9C3] text-black brutal-btn'
              : isObsidian
              ? 'border border-[#2A241A] bg-[#070709] hover:border-[#D4AF37]/45 text-[#DDD6C8]'
              : 'border border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 text-zinc-300 rounded';
            
            if (hasSubmitted) {
              if (option.isOptimal) {
                containerStyle = isBrutal
                  ? 'border-2 border-black bg-[#86EFAC] text-black brutal-shadow-sm'
                  : isObsidian
                  ? 'border border-[#D4AF37]/80 bg-[#14110C] text-[#F3E5AB] brass-hairline-glow'
                  : 'border border-amber-400/80 bg-zinc-900 text-white shadow-sm rounded';
              } else if (isSelected && !option.isOptimal) {
                containerStyle = isBrutal
                  ? 'border-2 border-black bg-[#FDA4AF] text-black line-through'
                  : isObsidian
                  ? 'border border-[#3D2225] bg-[#140D0E] text-[#A39E93] line-through'
                  : 'border border-zinc-700 bg-zinc-900 text-zinc-400 line-through rounded';
              } else {
                containerStyle = isBrutal
                  ? 'border-2 border-black bg-[#F4F1EA] text-zinc-500 opacity-70'
                  : isObsidian
                  ? 'border border-[#2A241A] bg-[#070709] text-[#736D63] opacity-55'
                  : 'border border-zinc-800 bg-zinc-950 text-zinc-600 opacity-60 rounded';
              }
            } else if (isSelected) {
              containerStyle = isBrutal
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
                      <CheckCircle2 className={isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#D4AF37]' : 'w-4 h-4 text-amber-400'} />
                    ) : isSelected ? (
                      <XCircle className={isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#E8A5A5]' : 'w-4 h-4 text-zinc-500'} />
                    ) : (
                      <span className={isBrutal ? 'text-xs font-mono font-bold text-zinc-600' : isObsidian ? 'text-xs font-mono text-[#736D63]' : 'text-xs font-mono text-zinc-600'}>[0{idx + 1}]</span>
                    )
                  ) : (
                    <span
                      className={`text-xs font-mono ${
                        isSelected
                          ? isBrutal
                            ? 'text-black font-black'
                            : isObsidian
                            ? 'text-[#E5C77B] font-semibold'
                            : 'text-zinc-100 font-bold'
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
                    isBrutal
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
              isBrutal
                ? 'p-4 border-2 border-black bg-[#E0F2FE] mb-6 brutal-shadow-sm'
                : isObsidian
                ? 'p-4 border border-[#D4AF37]/30 bg-[#070709] mb-6'
                : 'p-4 rounded border border-zinc-800 bg-zinc-900/60 mb-6'
            }
          >
            <div
              className={
                isBrutal
                  ? 'text-xs text-black font-black uppercase tracking-wider mb-1.5 flex items-center gap-1.5'
                  : isObsidian
                  ? 'text-[11px] text-[#E5C77B] font-semibold uppercase tracking-[0.16em] mb-1.5 flex items-center gap-1.5'
                  : 'text-xs text-zinc-200 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5'
              }
            >
              <HelpCircle className={isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#D4AF37]' : 'w-4 h-4 text-amber-400'} />
              <span>COMMUNICATION PSYCHOLOGY DEBRIEF:</span>
            </div>
            <p className={isBrutal ? 'text-xs text-zinc-900 font-medium leading-relaxed mb-3' : isObsidian ? 'text-xs text-[#DDD6C8] leading-relaxed mb-3' : 'text-xs text-zinc-300 leading-relaxed mb-3'}>
              {question.psychologicalPrinciple}
            </p>
            {selectedOptionIndex !== null && (
              <div className={isBrutal ? 'text-xs text-black font-bold border-t-2 border-black pt-2 italic' : isObsidian ? 'text-xs text-[#A39E93] border-t border-[#2A241A] pt-2.5 italic' : 'text-xs text-zinc-400 border-t border-zinc-800 pt-2 italic'}>
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
                isBrutal
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
                isBrutal
                  ? 'px-5 py-2.5 bg-[#86EFAC] hover:bg-[#4ADE80] text-black border-2 border-black text-xs font-black tracking-wide cursor-pointer flex items-center gap-2 brutal-btn'
                  : isObsidian
                  ? 'px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C77B] text-[#070709] border border-[#E5C77B] text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors cursor-pointer flex items-center gap-2'
                  : 'px-5 py-2.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold tracking-wider transition-colors cursor-pointer flex items-center gap-2 shadow-sm'
              }
            >
              <span>{currentQuestionIndex + 1 < filteredQuestions.length ? 'NEXT SCENARIO' : 'FINISH DRILL'}</span>
              <ArrowRight className={isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#070709]' : 'w-4 h-4 text-amber-600'} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
