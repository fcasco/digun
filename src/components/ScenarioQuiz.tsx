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
  const { isSkeuomorphic, isMaterial, isEditorial, isSlate, isClay, isSaas, isGlass, isBrutal, isObsidian, isNordic, isCyberpunk } = useTheme();
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
      <div className={`max-w-3xl mx-auto px-4 py-8 ${isSkeuomorphic ? 'font-skeuo' : isMaterial ? 'font-material' : isEditorial ? 'font-editorial-body' : isSlate || isBrutal || isObsidian || isGlass || isNordic || isSaas || isClay || isCyberpunk ? 'font-sans' : 'font-mono'}`}>
        <div
          className={
            isSkeuomorphic
              ? 'skeuo-paper-elevated border-2 border-[#B8A482] border-t-4 border-t-[#8C6239] rounded-lg p-6 sm:p-8 relative overflow-hidden'
              : isMaterial
              ? 'material-card-elevated border border-slate-200/80 border-t-4 border-t-[#1565C0] rounded-xl p-6 sm:p-8 relative overflow-hidden'
              : isCyberpunk
              ? 'cyber-card-elevated border border-cyan-400/40 border-t-2 border-t-[#00F0FF] rounded-sm p-6 sm:p-8 relative overflow-hidden'
              : isEditorial
              ? 'editorial-card-elevated border-2 border-[#1D1814] rounded-none p-6 sm:p-8 relative overflow-hidden'
              : isSlate
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
          <div className={`flex items-center gap-3 mb-4 ${isSkeuomorphic ? 'pb-3 border-b-2 border-[#C8B896]' : ''}`}>
            <div className={isSkeuomorphic ? 'p-2.5 rounded-md skeuo-brass-btn border border-[#7A5915]' : isMaterial ? 'p-2.5 rounded-lg bg-[#E0F2F1] border border-[#B2DFDB] text-[#00695C]' : isCyberpunk ? 'p-2.5 rounded-sm bg-[#061926] border border-[#00F0FF]/45 text-[#00F0FF]' : isEditorial ? 'p-2 rounded-none bg-[#E6EDE9] border border-[#1E4D40]/45 text-[#1E4D40]' : isSlate ? 'p-2 rounded-md bg-teal-400/15 border border-teal-400/35 text-teal-300' : isClay ? 'p-2.5 rounded-2xl bg-[#E3FCEC] border border-white/80 text-[#065F46] shadow-sm' : isSaas ? 'p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600' : isNordic ? 'p-2 rounded-xl bg-[#E7EFEA] border border-[#B8CBBF] text-[#3B5948]' : isGlass ? 'p-2 rounded-xl bg-sky-400/15 border border-sky-300/35 text-sky-300' : isBrutal ? 'p-2 bg-[#86EFAC] border-2 border-black text-black' : ''}>
              <CheckCircle2 className={isSkeuomorphic ? 'w-5 h-5 text-[#1F1209]' : isMaterial ? 'w-5 h-5 text-[#00695C]' : isCyberpunk ? 'w-5 h-5 text-[#00F0FF]' : isEditorial ? 'w-5 h-5 text-[#1E4D40]' : isSlate ? 'w-5 h-5 text-teal-300' : isClay ? 'w-5 h-5 text-[#065F46]' : isSaas ? 'w-5 h-5 text-indigo-600' : isNordic ? 'w-5 h-5 text-[#3B5948]' : isGlass ? 'w-5 h-5 text-sky-300' : isBrutal ? 'w-5 h-5 text-black' : isObsidian ? 'w-5 h-5 text-[#D4AF37]' : 'w-5 h-5 text-amber-400'} />
            </div>
            <h2
              className={
                isSkeuomorphic
                  ? 'font-editorial-display text-2xl sm:text-3xl font-bold tracking-tight text-[#1F140E]'
                  : isMaterial
                  ? 'text-xl sm:text-2xl font-bold tracking-tight text-[#111827]'
                  : isCyberpunk
                  ? 'font-cyber text-xl sm:text-2xl font-bold uppercase tracking-wider text-[#E6F4FF]'
                  : isEditorial
                  ? 'font-editorial-display text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1814]'
                  : isSlate
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
              SCENARIO DRILL: EVALUATION REPORT
            </h2>
          </div>

          <p className={isSkeuomorphic ? 'text-sm text-[#4A3326] mb-6 leading-relaxed' : isMaterial ? 'text-sm text-[#475569] mb-6 leading-relaxed' : isCyberpunk ? 'text-sm text-[#D6EEFF] mb-6 leading-relaxed' : isEditorial ? 'text-sm text-[#433A31] mb-6 leading-relaxed' : isSlate ? 'text-sm text-slate-300 mb-6 leading-relaxed' : isClay ? 'text-sm text-[#4B5478] mb-6 leading-relaxed' : isSaas ? 'text-sm text-slate-600 mb-6 leading-relaxed' : isNordic ? 'text-sm text-[#4E5A53] mb-6 leading-relaxed' : isGlass ? 'text-sm text-slate-300 mb-6 leading-relaxed' : isBrutal ? 'text-sm text-zinc-700 font-medium mb-6 leading-relaxed' : isObsidian ? 'text-sm text-[#A39E93] mb-6 leading-relaxed' : 'text-sm text-zinc-400 mb-6 leading-relaxed'}>
            Situational simulation complete. You evaluated strategic verbal options across complex interpersonal workplace dynamics.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mb-8">
            <div
              className={
                isSkeuomorphic
                  ? 'skeuo-well border border-[#C8B799] rounded-md p-4 text-center'
                  : isMaterial
                  ? 'material-well border border-slate-200/80 rounded-lg p-4 text-center'
                  : isCyberpunk
                  ? 'cyber-well border border-cyan-400/30 rounded-sm p-4 text-center'
                  : isEditorial
                  ? 'editorial-well border border-[#B8AD96] rounded-none p-4 text-center'
                  : isSlate
                  ? 'slate-well border border-slate-800 rounded-md p-4 text-center'
                  : isClay
                  ? 'clay-well border border-white/70 rounded-2xl p-4 text-center'
                  : isSaas
                  ? 'saas-well border border-slate-200 rounded-lg p-4 text-center'
                  : isNordic
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
              <div className={isSkeuomorphic ? 'text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-[#5C412E] mb-1' : isMaterial ? 'text-[10px] font-bold uppercase tracking-[0.12em] text-[#475569] mb-1' : isCyberpunk ? 'font-cyber text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9BB8D3] mb-1' : isEditorial ? 'font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#574D42] mb-1' : isSlate ? 'text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1' : isClay ? 'text-[10px] font-semibold uppercase tracking-wider text-[#647094] mb-1' : isSaas ? 'text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1' : isNordic ? 'text-[10px] font-semibold uppercase tracking-wider text-[#5C6962] mb-1' : isGlass ? 'text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1' : isBrutal ? 'text-xs font-extrabold text-zinc-700 mb-1' : isObsidian ? 'text-[10px] uppercase tracking-[0.16em] text-[#8E877A] mb-1' : 'text-xs text-zinc-500 mb-1'}>
                SCORE
              </div>
              <div className={isSkeuomorphic ? 'text-3xl font-bold font-mono text-[#1F140E] tabular-nums' : isMaterial ? 'text-3xl font-bold font-mono text-[#111827] tabular-nums' : isCyberpunk ? 'text-3xl font-bold font-mono text-[#E6F4FF] tabular-nums' : isEditorial ? 'text-3xl font-bold font-mono text-[#1D1814] tabular-nums' : isSlate ? 'text-3xl font-bold font-mono text-slate-100 tabular-nums' : isClay ? 'text-3xl font-bold font-mono text-[#1E2547] tabular-nums' : isSaas ? 'text-3xl font-bold font-mono text-slate-900 tabular-nums' : isNordic ? 'text-3xl font-bold font-mono text-[#242E28] tabular-nums' : isGlass ? 'text-3xl font-bold font-mono text-white tabular-nums' : isBrutal ? 'text-3xl font-black text-black tabular-nums' : isObsidian ? 'text-3xl font-mono font-semibold text-[#F5F0E6] tabular-nums' : 'text-3xl font-bold text-zinc-100 tabular-nums'}>
                {score} / {total}
              </div>
            </div>
            <div
              className={
                isSkeuomorphic
                  ? 'border border-[#A88024]/60 bg-[#F7EED6] rounded-md p-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]'
                  : isMaterial
                  ? 'border border-[#BBDEFB] bg-[#E3F2FD] rounded-lg p-4 text-center'
                  : isCyberpunk
                  ? 'border border-[#00F0FF]/45 bg-[#061926] rounded-sm p-4 text-center'
                  : isEditorial
                  ? 'border border-[#9B2226]/40 bg-[#F6E5E2] rounded-none p-4 text-center'
                  : isSlate
                  ? 'border border-teal-400/35 bg-teal-950/35 rounded-md p-4 text-center'
                  : isClay
                  ? 'border border-white/80 bg-[#E5E9FF] rounded-2xl p-4 text-center shadow-sm'
                  : isSaas
                  ? 'border border-indigo-200 bg-indigo-50/75 rounded-lg p-4 text-center'
                  : isNordic
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
              <div className={isSkeuomorphic ? 'text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-[#6E4F12] mb-1' : isMaterial ? 'text-[10px] font-bold uppercase tracking-[0.12em] text-[#1565C0] mb-1' : isCyberpunk ? 'font-cyber text-[10px] font-semibold uppercase tracking-[0.16em] text-[#00F0FF] mb-1' : isEditorial ? 'font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9B2226] mb-1' : isSlate ? 'text-[10px] font-semibold uppercase tracking-wider text-teal-300 mb-1' : isClay ? 'text-[10px] font-semibold uppercase tracking-wider text-indigo-700 mb-1' : isSaas ? 'text-[10px] font-semibold uppercase tracking-wider text-indigo-700 mb-1' : isNordic ? 'text-[10px] font-semibold uppercase tracking-wider text-[#3B5948] mb-1' : isGlass ? 'text-[10px] font-semibold uppercase tracking-wider text-sky-200 mb-1' : isBrutal ? 'text-xs font-extrabold text-black mb-1' : isObsidian ? 'text-[10px] uppercase tracking-[0.16em] text-[#C5A059] mb-1' : 'text-xs text-zinc-500 mb-1'}>
                ACCURACY
              </div>
              <div className={isSkeuomorphic ? 'text-3xl font-bold font-mono text-[#4E3608] tabular-nums' : isMaterial ? 'text-3xl font-bold font-mono text-[#0D47A1] tabular-nums' : isCyberpunk ? 'text-3xl font-bold font-mono text-[#00F0FF] tabular-nums' : isEditorial ? 'text-3xl font-bold font-mono text-[#9B2226] tabular-nums' : isSlate ? 'text-3xl font-bold font-mono text-teal-300 tabular-nums' : isClay ? 'text-3xl font-bold font-mono text-indigo-600 tabular-nums' : isSaas ? 'text-3xl font-bold font-mono text-indigo-700 tabular-nums' : isNordic ? 'text-3xl font-bold font-mono text-[#2D4739] tabular-nums' : isGlass ? 'text-3xl font-bold font-mono text-sky-300 tabular-nums' : isBrutal ? 'text-3xl font-black text-black tabular-nums' : isObsidian ? 'text-3xl font-mono font-semibold text-[#E5C77B] tabular-nums' : 'text-3xl font-bold text-amber-400 tabular-nums'}>
                {percentage}%
              </div>
            </div>
            <div
              className={
                isSkeuomorphic
                  ? 'border-2 border-[#164A37]/50 bg-[#E5EFE9] rounded-md p-4 text-center col-span-2 sm:col-span-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]'
                  : isMaterial
                  ? 'border border-[#B2DFDB] bg-[#E0F2F1] rounded-lg p-4 text-center col-span-2 sm:col-span-1'
                  : isCyberpunk
                  ? 'border border-[#00F5D4]/45 bg-[#051F20] rounded-sm p-4 text-center col-span-2 sm:col-span-1'
                  : isEditorial
                  ? 'border border-[#1E4D40]/40 bg-[#E6EDE9] rounded-none p-4 text-center col-span-2 sm:col-span-1'
                  : isSlate
                  ? 'slate-well border border-slate-800 rounded-md p-4 text-center col-span-2 sm:col-span-1'
                  : isClay
                  ? 'border border-white/80 bg-[#E3FCEC] rounded-2xl p-4 text-center col-span-2 sm:col-span-1 shadow-sm'
                  : isSaas
                  ? 'saas-well border border-slate-200 rounded-lg p-4 text-center col-span-2 sm:col-span-1'
                  : isNordic
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
              <div className={isSkeuomorphic ? 'text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-[#164A37] mb-1' : isMaterial ? 'text-[10px] font-bold uppercase tracking-[0.12em] text-[#00695C] mb-1' : isCyberpunk ? 'font-cyber text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5EEAD4] mb-1' : isEditorial ? 'font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1E4D40] mb-1' : isSlate ? 'text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1' : isClay ? 'text-[10px] font-semibold uppercase tracking-wider text-[#065F46] mb-1' : isSaas ? 'text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1' : isNordic ? 'text-[10px] font-semibold uppercase tracking-wider text-[#5C6962] mb-1' : isGlass ? 'text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1' : isBrutal ? 'text-xs font-extrabold text-black mb-1' : isObsidian ? 'text-[10px] uppercase tracking-[0.16em] text-[#8E877A] mb-1' : 'text-xs text-zinc-500 mb-1'}>
                STRATEGIC RATING
              </div>
              <div className={isSkeuomorphic ? 'font-editorial-display text-xl font-bold tracking-wide text-[#164A37]' : isMaterial ? 'text-lg font-bold tracking-wide text-[#004D40]' : isCyberpunk ? 'font-cyber text-lg font-bold tracking-wider text-[#E6FFFA]' : isEditorial ? 'font-editorial-display text-xl font-bold tracking-wide text-[#1D1814]' : isSlate ? 'text-lg font-bold tracking-wide text-slate-100' : isClay ? 'text-lg font-bold tracking-wide text-[#065F46]' : isSaas ? 'text-lg font-bold tracking-wide text-slate-900' : isNordic ? 'text-lg font-bold tracking-wide text-[#242E28]' : isGlass ? 'text-lg font-bold tracking-wide text-white' : isBrutal ? 'text-lg font-black text-black' : isObsidian ? 'font-luxury text-xl font-semibold tracking-wider text-[#F3E5AB]' : 'text-lg font-bold text-zinc-200'}>
                {percentage >= 80 ? 'EXECUTIVE' : percentage >= 50 ? 'PRACTITIONER' : 'REFINING'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleRestart(false)}
              className={
                isSkeuomorphic
                  ? 'px-5 py-2.5 rounded-md skeuo-brass-btn font-mono font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shrink-0'
                  : isMaterial
                  ? 'px-5 py-2.5 rounded-lg bg-[#1565C0] hover:bg-[#0D47A1] text-white border border-[#0D47A1] font-semibold text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 material-btn whitespace-nowrap shrink-0'
                  : isCyberpunk
                  ? 'px-5 py-2.5 rounded-sm bg-gradient-to-r from-[#00F0FF] to-[#FF2A85] text-[#060714] border border-cyan-200/80 font-cyber font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 cyber-btn whitespace-nowrap shrink-0'
                  : isEditorial
                  ? 'px-5 py-2.5 rounded-none bg-[#9B2226] hover:bg-[#7F1D1D] text-[#FAF5EA] border border-[#1D1814] shadow-[2px_2px_0_#1D1814] font-mono font-semibold text-xs tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2'
                  : isSlate
                  ? 'px-5 py-2.5 rounded-md bg-teal-400 hover:bg-teal-300 text-slate-950 border border-teal-300 font-semibold text-xs tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs'
                  : isClay
                  ? 'px-5 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white border border-indigo-400/60 font-semibold text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 clay-btn whitespace-nowrap shrink-0'
                  : isSaas
                  ? 'px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600 font-semibold text-xs tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs'
                  : isNordic
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
              <RotateCcw className={isSkeuomorphic ? 'w-4 h-4 text-[#1F1209]' : isMaterial ? 'w-4 h-4 text-white' : isCyberpunk ? 'w-4 h-4 text-[#060714]' : isEditorial ? 'w-4 h-4 text-[#FAF5EA]' : isSlate ? 'w-4 h-4 text-slate-950' : isClay || isSaas ? 'w-4 h-4 text-white' : isNordic ? 'w-4 h-4 text-[#FDFBF7]' : isGlass ? 'w-4 h-4 text-slate-950' : isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#070709]' : 'w-4 h-4 text-amber-600'} />
              <span>RESTART DRILL</span>
            </button>
            <button
              onClick={() => handleRestart(true)}
              className={
                isSkeuomorphic
                  ? 'px-5 py-2.5 rounded-md skeuo-leather-btn font-mono font-semibold text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shrink-0'
                  : isMaterial
                  ? 'px-5 py-2.5 rounded-lg bg-white border border-slate-200 hover:border-[#1565C0]/40 hover:bg-slate-50 text-[#111827] font-semibold text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 material-btn whitespace-nowrap shrink-0'
                  : isCyberpunk
                  ? 'px-5 py-2.5 rounded-sm bg-[#061926] border border-[#00F0FF]/45 hover:bg-[#0B2A3E] hover:border-[#00F0FF] text-[#00F0FF] font-cyber font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shrink-0'
                  : isEditorial
                  ? 'px-5 py-2.5 rounded-none bg-[#FFFDF7] border border-[#1D1814]/60 hover:bg-[#EAE1D0] text-[#1D1814] font-mono font-semibold text-xs tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2'
                  : isSlate
                  ? 'px-5 py-2.5 rounded-md bg-[#0B1220] border border-slate-700 hover:border-teal-400/50 text-slate-200 hover:text-white font-medium text-xs tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-2'
                  : isClay
                  ? 'px-5 py-2.5 rounded-2xl bg-white border border-white/90 text-[#1E2547] hover:text-indigo-600 font-semibold text-xs tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 clay-btn-soft whitespace-nowrap shrink-0'
                  : isSaas
                  ? 'px-5 py-2.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-2'
                  : isNordic
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
    <div className={`max-w-3xl mx-auto px-4 py-6 ${isSkeuomorphic ? 'font-skeuo' : isMaterial ? 'font-material' : isEditorial ? 'font-editorial-body' : isSlate || isBrutal || isObsidian || isGlass || isNordic || isSaas || isClay || isCyberpunk ? 'font-sans' : 'font-mono'}`}>
      {/* Toolbar: Category filter, Shuffle & Progress */}
      <div
        className={
          isSkeuomorphic
            ? 'flex flex-wrap items-center justify-between gap-3 mb-4 skeuo-leather rounded-lg p-3'
            : isMaterial
            ? 'flex flex-wrap items-center justify-between gap-3 mb-4 border border-slate-200/80 material-card rounded-xl p-3'
            : isCyberpunk
            ? 'flex flex-wrap items-center justify-between gap-3 mb-4 border border-cyan-400/35 cyber-card rounded-sm p-3'
            : isEditorial
            ? 'flex flex-wrap items-center justify-between gap-3 mb-4 border-2 border-[#1D1814] editorial-card rounded-none p-3'
            : isSlate
            ? 'flex flex-wrap items-center justify-between gap-3 mb-4 border border-slate-700/80 slate-card rounded-lg p-3'
            : isClay
            ? 'flex flex-wrap items-center justify-between gap-3 mb-4 border border-white/90 clay-card rounded-3xl p-3.5'
            : isSaas
            ? 'flex flex-wrap items-center justify-between gap-3 mb-4 border border-slate-200 saas-card rounded-xl p-3'
            : isNordic
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
            isSkeuomorphic
              ? 'flex items-center gap-2 font-mono text-xs text-[#E6D6B8]'
              : isMaterial
              ? 'flex items-center gap-2 text-xs text-[#475569]'
              : isCyberpunk
              ? 'flex items-center gap-2 text-xs text-[#9BB8D3]'
              : isEditorial
              ? 'flex items-center gap-2 font-mono text-xs text-[#574D42]'
              : isSlate
              ? 'flex items-center gap-2 text-xs text-slate-400'
              : isClay
              ? 'flex items-center gap-2 text-xs text-[#647094]'
              : isSaas
              ? 'flex items-center gap-2 text-xs text-slate-500'
              : isNordic
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
          <span className={isSkeuomorphic ? 'text-[#F5ECD8] font-mono font-bold tabular-nums' : isMaterial ? 'text-[#111827] font-mono font-bold tabular-nums' : isCyberpunk ? 'text-[#E6F4FF] font-mono font-bold tabular-nums' : isEditorial ? 'text-[#1D1814] font-mono font-bold tabular-nums' : isSlate ? 'text-slate-100 font-mono font-semibold tabular-nums' : isClay ? 'text-[#1E2547] font-mono font-semibold tabular-nums' : isSaas ? 'text-slate-900 font-mono font-semibold tabular-nums' : isNordic ? 'text-[#242E28] font-mono font-semibold tabular-nums' : isGlass ? 'text-white font-mono font-semibold tabular-nums' : isBrutal ? 'font-black tabular-nums' : isObsidian ? 'text-[#F5F0E6] font-mono tabular-nums' : 'text-zinc-100 font-bold tabular-nums'}>
            SCENARIO {currentQuestionIndex + 1} / {filteredQuestions.length}
          </span>
          <span>·</span>
          <span
            className={
              isSkeuomorphic
                ? 'text-[#E8C978] font-mono font-bold tabular-nums'
                : isMaterial
                ? 'text-[#1565C0] font-mono font-bold tabular-nums'
                : isCyberpunk
                ? 'text-[#00F0FF] font-mono font-bold tabular-nums'
                : isEditorial
                ? 'text-[#9B2226] font-mono font-bold tabular-nums'
                : isSlate
                ? 'text-teal-300 font-mono font-semibold tabular-nums'
                : isClay
                ? 'text-indigo-600 font-mono font-semibold tabular-nums'
                : isSaas
                ? 'text-indigo-600 font-mono font-semibold tabular-nums'
                : isNordic
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
          <div className={isSkeuomorphic ? 'flex items-center gap-1.5 text-xs text-[#E6D6B8]' : isMaterial ? 'flex items-center gap-1.5 text-xs text-[#475569]' : isCyberpunk ? 'flex items-center gap-1.5 text-xs text-[#9BB8D3]' : isEditorial ? 'flex items-center gap-1.5 text-xs text-[#574D42]' : isSlate ? 'flex items-center gap-1.5 text-xs text-slate-300' : isClay ? 'flex items-center gap-1.5 text-xs text-[#4B5478]' : isSaas ? 'flex items-center gap-1.5 text-xs text-slate-500' : isNordic ? 'flex items-center gap-1.5 text-xs text-[#4E5A53]' : isGlass ? 'flex items-center gap-1.5 text-xs text-slate-300' : isBrutal ? 'flex items-center gap-1.5 text-xs text-black' : isObsidian ? 'flex items-center gap-1.5 text-xs text-[#A39E93]' : 'flex items-center gap-1.5 text-xs text-zinc-400'}>
            <SlidersHorizontal className={isSkeuomorphic ? 'w-3.5 h-3.5 text-[#E8C978]' : isMaterial ? 'w-3.5 h-3.5 text-[#1565C0]' : isCyberpunk ? 'w-3.5 h-3.5 text-[#00F0FF]' : isEditorial ? 'w-3.5 h-3.5 text-[#9B2226]' : isSlate ? 'w-3.5 h-3.5 text-teal-400' : isClay ? 'w-3.5 h-3.5 text-indigo-500' : isSaas ? 'w-3.5 h-3.5 text-indigo-600' : isNordic ? 'w-3.5 h-3.5 text-[#527360]' : isGlass ? 'w-3.5 h-3.5 text-sky-300' : isBrutal ? 'w-3.5 h-3.5 text-black' : isObsidian ? 'w-3.5 h-3.5 text-[#C5A059]' : 'w-3.5 h-3.5 text-zinc-500'} />
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
                isSkeuomorphic
                  ? 'skeuo-leather-well rounded-md px-2.5 py-1.5 text-xs font-mono font-medium text-[#F5ECD8] focus:border-[#E8C978] focus:outline-none cursor-pointer'
                  : isMaterial
                  ? 'material-well border border-slate-200/80 focus:border-[#1565C0] text-xs font-semibold text-[#111827] rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer'
                  : isCyberpunk
                  ? 'cyber-well border border-cyan-400/35 focus:border-[#00F0FF] text-xs font-cyber font-semibold text-[#E6F4FF] rounded-sm px-2.5 py-1.5 focus:outline-none cursor-pointer'
                  : isEditorial
                  ? 'editorial-well border border-[#B8AD96] focus:border-[#9B2226] font-mono text-xs font-semibold text-[#1D1814] rounded-none px-2.5 py-1.5 focus:outline-none cursor-pointer'
                  : isSlate
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
              <option value="all" className={isSkeuomorphic ? 'bg-[#2B1910] text-[#F5ECD8]' : isMaterial ? 'bg-white text-[#111827]' : isCyberpunk ? 'bg-[#060714] text-[#E6F4FF]' : isEditorial ? 'bg-[#FAF5EA] text-[#1D1814]' : isSlate ? 'bg-[#0B1220] text-slate-100' : isClay ? 'bg-white text-[#1E2547]' : isSaas ? 'bg-white text-slate-900' : isNordic ? 'bg-[#FDFBF7] text-[#242E28]' : isGlass ? 'bg-[#0B192C] text-slate-100' : ''}>ALL SCENARIOS ({SCENARIO_QUIZZES.length})</option>
              {CATEGORIES.map(cat => {
                const count = SCENARIO_QUIZZES.filter(q => q.category === cat.id).length;
                return (
                  <option key={cat.id} value={cat.id} className={isSkeuomorphic ? 'bg-[#2B1910] text-[#F5ECD8]' : isMaterial ? 'bg-white text-[#111827]' : isCyberpunk ? 'bg-[#060714] text-[#E6F4FF]' : isEditorial ? 'bg-[#FAF5EA] text-[#1D1814]' : isSlate ? 'bg-[#0B1220] text-slate-100' : isClay ? 'bg-white text-[#1E2547]' : isSaas ? 'bg-white text-slate-900' : isNordic ? 'bg-[#FDFBF7] text-[#242E28]' : isGlass ? 'bg-[#0B192C] text-slate-100' : ''}>
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
              isSkeuomorphic
                ? 'skeuo-leather-btn rounded-md px-3 py-1.5 text-[11px] font-mono font-semibold text-[#F5ECD8] cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0'
                : isMaterial
                ? 'text-[11px] px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[#475569] hover:text-[#1565C0] hover:border-[#1565C0]/40 font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap material-btn'
                : isCyberpunk
                ? 'text-[11px] px-3 py-1.5 rounded-sm bg-[#061926] border border-[#00F0FF]/40 text-[#00F0FF] hover:bg-[#0B2A3E] hover:border-[#00F0FF] font-cyber font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0'
                : isEditorial
                ? 'font-mono text-[11px] px-2.5 py-1.5 rounded-none bg-[#FFFDF7] border border-[#1D1814]/60 text-[#1D1814] hover:bg-[#EAE1D0] font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap'
                : isSlate
                ? 'text-[11px] px-2.5 py-1.5 rounded-md bg-[#0B1220] border border-slate-700 text-slate-200 hover:text-white hover:border-teal-400/50 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap'
                : isClay
                ? 'text-[11px] px-3 py-1.5 rounded-2xl bg-white border border-white/90 text-[#4B5478] hover:text-[#1E2547] font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 clay-btn-soft'
                : isSaas
                ? 'text-[11px] px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap'
                : isNordic
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
          isSkeuomorphic
            ? 'w-full skeuo-leather-well h-2 rounded-full overflow-hidden mb-5'
            : isMaterial
            ? 'w-full material-well h-2 rounded-full overflow-hidden mb-5 border border-slate-200/80'
            : isCyberpunk
            ? 'w-full cyber-well h-1.5 rounded-none overflow-hidden mb-5 border border-cyan-400/35'
            : isEditorial
            ? 'w-full editorial-well h-1.5 rounded-none overflow-hidden mb-5 border border-[#1D1814]/45'
            : isSlate
            ? 'w-full slate-well h-1.5 rounded-full overflow-hidden mb-5 border border-slate-800'
            : isClay
            ? 'w-full clay-well h-2 rounded-full overflow-hidden mb-5 border border-white/70'
            : isSaas
            ? 'w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden mb-5'
            : isNordic
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
            isSkeuomorphic
              ? 'bg-gradient-to-r from-[#A88024] via-[#E8C978] to-[#CFA646] h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(232,201,120,0.4)]'
              : isMaterial
              ? 'bg-[#1565C0] h-full rounded-full transition-all duration-300'
              : isCyberpunk
              ? 'bg-gradient-to-r from-[#00F0FF] to-[#FF2A85] h-full transition-all duration-300 shadow-[0_0_10px_rgba(0,240,255,0.65)]'
              : isEditorial
              ? 'bg-[#9B2226] h-full transition-all duration-300'
              : isSlate
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
            isSkeuomorphic
              ? 'mb-4 px-3.5 py-2.5 rounded-md skeuo-stamp bg-[#F9EAE7] text-xs font-mono text-[#8C1D18] flex items-center justify-between gap-3'
              : isMaterial
              ? 'mb-4 px-3.5 py-2.5 rounded-lg border border-[#FFE0B2] bg-[#FFF3E0] text-xs font-medium text-[#BF360C] flex items-center justify-between gap-3'
              : isCyberpunk
              ? 'mb-4 px-3.5 py-2.5 rounded-sm border border-[#FF2A85]/50 bg-[#19091E] text-xs text-[#FFB3D9] flex items-center justify-between gap-3'
              : isEditorial
              ? 'mb-4 px-3.5 py-2.5 rounded-none border border-[#B45309]/45 bg-[#F3E7CE] text-xs font-mono text-[#78350F] flex items-center justify-between gap-3'
              : isSlate
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
            className={isSkeuomorphic ? 'text-[#8C1D18] hover:underline font-mono font-bold cursor-pointer shrink-0' : isMaterial ? 'text-[#E65100] hover:underline font-semibold cursor-pointer shrink-0' : isCyberpunk ? 'text-[#00F0FF] hover:underline font-cyber font-semibold cursor-pointer shrink-0' : isEditorial ? 'text-[#9B2226] hover:underline font-semibold cursor-pointer shrink-0' : isSlate ? 'text-amber-300 hover:text-white font-semibold cursor-pointer shrink-0' : isClay ? 'text-[#78350F] hover:underline font-semibold cursor-pointer shrink-0' : isSaas ? 'text-amber-900 hover:underline font-semibold cursor-pointer shrink-0' : isNordic ? 'text-[#3B5948] hover:text-[#242E28] font-semibold cursor-pointer shrink-0' : isGlass ? 'text-sky-300 hover:text-white font-semibold cursor-pointer shrink-0' : isBrutal ? 'text-black underline font-black cursor-pointer shrink-0' : isObsidian ? 'text-[#A39E93] hover:text-[#F5F0E6] uppercase tracking-[0.12em] cursor-pointer shrink-0' : 'text-zinc-400 hover:text-zinc-200 cursor-pointer shrink-0'}
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Question Card */}
      <div
        className={
          isSkeuomorphic
            ? 'skeuo-paper border-2 border-[#B8A482] border-t-4 border-t-[#8C6239] rounded-lg p-6 sm:p-8 mb-6'
            : isMaterial
            ? 'border border-slate-200/80 border-t-4 border-t-[#1565C0] material-card-elevated rounded-xl p-6 sm:p-8 mb-6'
            : isCyberpunk
            ? 'border border-cyan-400/40 border-t-2 border-t-[#00F0FF] cyber-card-elevated rounded-sm p-6 sm:p-8 mb-6'
            : isEditorial
            ? 'border-2 border-[#1D1814] editorial-card-elevated rounded-none p-6 sm:p-8 mb-6'
            : isSlate
            ? 'border border-slate-700/80 slate-card rounded-lg p-6 sm:p-8 mb-6'
            : isClay
            ? 'border border-white/90 clay-card rounded-3xl p-6 sm:p-8 mb-6'
            : isSaas
            ? 'border border-slate-200 saas-card rounded-xl p-6 sm:p-8 mb-6'
            : isNordic
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
            isSkeuomorphic
              ? 'font-mono text-[11px] uppercase tracking-[0.16em] text-[#8C1D18] mb-2.5 font-bold'
              : isMaterial
              ? 'text-[11px] uppercase tracking-[0.12em] text-[#1565C0] mb-2.5 font-bold'
              : isCyberpunk
              ? 'font-cyber text-[11px] uppercase tracking-[0.16em] text-[#00F0FF] mb-2.5 font-semibold'
              : isEditorial
              ? 'font-mono text-[11px] uppercase tracking-[0.16em] text-[#9B2226] mb-2.5 font-semibold'
              : isSlate
              ? 'text-[11px] uppercase tracking-[0.14em] text-teal-300 mb-2.5 font-semibold'
              : isClay
              ? 'text-[11px] uppercase tracking-[0.14em] text-indigo-600 mb-2.5 font-semibold'
              : isSaas
              ? 'text-[11px] uppercase tracking-[0.12em] text-indigo-600 mb-2.5 font-semibold'
              : isNordic
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
            isSkeuomorphic
              ? 'font-editorial-display text-xl sm:text-2xl font-bold text-[#1F140E] mb-5 leading-snug'
              : isMaterial
              ? 'text-xl sm:text-2xl font-bold text-[#111827] mb-5 leading-snug tracking-tight'
              : isCyberpunk
              ? 'font-cyber text-xl sm:text-2xl font-bold text-[#E6F4FF] mb-5 leading-snug tracking-wide'
              : isEditorial
              ? 'font-editorial-display text-xl sm:text-2xl font-bold text-[#1D1814] mb-5 leading-snug'
              : isSlate
              ? 'text-xl sm:text-2xl font-semibold text-slate-100 mb-5 leading-snug'
              : isClay
              ? 'text-xl sm:text-2xl font-semibold text-[#1E2547] mb-5 leading-snug'
              : isSaas
              ? 'text-xl sm:text-2xl font-semibold text-slate-900 mb-5 leading-snug'
              : isNordic
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
            isSkeuomorphic
              ? 'skeuo-stamp bg-[#F9EAE7] rounded-md p-4 mb-6 flex items-start justify-between gap-3'
              : isMaterial
              ? 'border border-[#FFCDD2] bg-[#FFEBEE] rounded-lg p-4 mb-6 flex items-start justify-between gap-3'
              : isCyberpunk
              ? 'border border-[#FF2A85]/45 bg-[#19091E] rounded-sm p-4 mb-6 flex items-start justify-between gap-3'
              : isEditorial
              ? 'border border-[#9B2226]/35 bg-[#F6E5E2] rounded-none p-4 mb-6 flex items-start justify-between gap-3'
              : isSlate
              ? 'border border-rose-500/35 bg-rose-950/35 rounded-md p-4 mb-6 flex items-start justify-between gap-3'
              : isClay
              ? 'border border-white/80 bg-[#FFE8EC] rounded-2xl p-4 mb-6 flex items-start justify-between gap-3 shadow-sm'
              : isSaas
              ? 'border border-rose-200 bg-rose-50/70 rounded-lg p-4 mb-6 flex items-start justify-between gap-3'
              : isNordic
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
                isSkeuomorphic
                  ? 'font-mono text-[10px] text-[#8C1D18] font-bold uppercase tracking-[0.14em] mb-1.5'
                  : isMaterial
                  ? 'text-[10px] text-[#C62828] font-bold uppercase tracking-[0.14em] mb-1.5'
                  : isCyberpunk
                  ? 'font-cyber text-[10px] text-[#FF66B3] font-semibold uppercase tracking-[0.16em] mb-1.5'
                  : isEditorial
                  ? 'font-mono text-[10px] text-[#9B2226] font-semibold uppercase tracking-[0.16em] mb-1.5'
                  : isSlate
                  ? 'text-[10px] text-rose-300 font-semibold uppercase tracking-[0.14em] mb-1.5'
                  : isClay
                  ? 'text-[10px] text-[#9F1239] font-semibold uppercase tracking-[0.14em] mb-1.5'
                  : isSaas
                  ? 'text-[10px] text-rose-700 font-semibold uppercase tracking-[0.14em] mb-1.5'
                  : isNordic
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
            <div className={isSkeuomorphic ? 'text-sm text-[#5C1410] italic font-medium' : isMaterial ? 'text-sm text-[#7F1D1D] italic font-medium' : isCyberpunk ? 'text-sm text-[#FFB3D9] italic font-medium' : isEditorial ? 'text-sm text-[#7F1D1D] italic font-medium' : isSlate ? 'text-sm text-rose-50 italic' : isClay ? 'text-sm text-[#4B2D38] italic font-medium' : isSaas ? 'text-sm text-slate-800 italic' : isNordic ? 'text-sm text-[#242E28] italic' : isGlass ? 'text-sm text-white italic' : isBrutal ? 'text-sm text-zinc-900 font-semibold italic' : isObsidian ? 'text-sm text-[#F5F0E6] italic' : 'text-sm text-zinc-300 italic font-mono'}>
              "{question.dangerPhrase}"
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSpeak(question.dangerPhrase)}
            className={
              isSkeuomorphic
                ? `p-2 rounded-md transition-all cursor-pointer shrink-0 ${
                    isSpeaking
                      ? 'skeuo-brass-btn'
                      : 'skeuo-leather-btn'
                  }`
                : isMaterial
                ? `p-2 rounded-lg border transition-all cursor-pointer shrink-0 material-btn ${
                    isSpeaking
                      ? 'bg-[#1565C0] text-white border-[#0D47A1]'
                      : 'bg-white text-[#C62828] border-[#FFCDD2] hover:bg-[#FFEBEE]'
                  }`
                : isCyberpunk
                ? `p-2 rounded-sm border transition-all cursor-pointer shrink-0 ${
                    isSpeaking
                      ? 'bg-gradient-to-r from-[#00F0FF] to-[#FF2A85] text-[#060714] border-cyan-200/80'
                      : 'bg-[#060714] text-[#FF66B3] border-[#FF2A85]/45 hover:border-[#00F0FF] hover:text-[#00F0FF]'
                  }`
                : isEditorial
                ? `p-2 rounded-none border transition-colors cursor-pointer shrink-0 ${
                    isSpeaking
                      ? 'bg-[#9B2226] text-[#FAF5EA] border-[#1D1814] shadow-[2px_2px_0_#1D1814]'
                      : 'bg-[#FFFDF7] text-[#9B2226] border-[#9B2226]/45 hover:bg-[#EAE1D0] hover:text-[#1D1814]'
                  }`
                : isSlate
                ? `p-2 rounded-md border transition-colors cursor-pointer shrink-0 ${
                    isSpeaking
                      ? 'bg-teal-400 text-slate-950 border-teal-300'
                      : 'bg-[#0B1220] text-rose-300 border-rose-500/35 hover:border-teal-400/60 hover:text-teal-300'
                  }`
                : isClay
                ? `p-2 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                    isSpeaking
                      ? 'bg-indigo-500 text-white border-indigo-400/60 clay-btn'
                      : 'bg-white text-[#9F1239] border-white/90 hover:bg-rose-50 clay-btn-soft'
                  }`
                : isSaas
                ? `p-2 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                    isSpeaking
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                  }`
                : isNordic
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
              isSkeuomorphic
                ? 'font-mono text-[11px] text-[#5C412E] uppercase tracking-[0.12em] flex items-center justify-between font-bold'
                : isMaterial
                ? 'text-[11px] text-[#475569] uppercase tracking-[0.08em] flex items-center justify-between font-bold'
                : isCyberpunk
                ? 'font-cyber text-[11px] text-[#9BB8D3] uppercase tracking-wider flex items-center justify-between font-semibold'
                : isEditorial
                ? 'font-mono text-[11px] text-[#574D42] uppercase tracking-[0.14em] flex items-center justify-between font-semibold'
                : isSlate
                ? 'text-[11px] text-slate-400 uppercase tracking-wider flex items-center justify-between font-medium'
                : isClay
                ? 'text-[11px] text-[#647094] uppercase tracking-wider flex items-center justify-between font-medium'
                : isSaas
                ? 'text-[11px] text-slate-500 uppercase tracking-wider flex items-center justify-between font-medium'
                : isNordic
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
            <span className={isSkeuomorphic ? 'text-[10px] font-mono text-[#8C1D18] hidden sm:inline' : isMaterial ? 'text-[10px] font-mono text-[#64748B] hidden sm:inline' : isCyberpunk ? 'text-[10px] font-mono text-[#00F0FF] hidden sm:inline' : isEditorial ? 'text-[10px] font-mono text-[#574D42] hidden sm:inline' : isSlate ? 'text-[10px] font-mono text-slate-500 hidden sm:inline' : isClay ? 'text-[10px] font-mono text-[#647094] hidden sm:inline' : isSaas ? 'text-[10px] font-mono text-slate-400 hidden sm:inline' : isNordic ? 'text-[10px] font-mono text-[#5C6962] hidden sm:inline' : isGlass ? 'text-[10px] font-mono text-slate-400 hidden sm:inline' : isBrutal ? 'text-[10px] font-mono text-zinc-700 hidden sm:inline' : isObsidian ? 'text-[10px] font-mono text-[#8E877A] hidden sm:inline' : 'text-[10px] text-zinc-500 hidden sm:inline'}>
              [KEYS 1–3 · ENTER]
            </span>
          </div>

          {question.options.map((option, idx) => {
            const isSelected = selectedOptionIndex === idx;
            let containerStyle = isSkeuomorphic
              ? 'rounded-md skeuo-well border border-[#C8B799] hover:border-[#8C6239] text-[#1F140E]'
              : isMaterial
              ? 'rounded-lg material-well border border-slate-200/80 hover:bg-[#DAE2EE] hover:border-[#1565C0]/40 text-[#111827]'
              : isCyberpunk
              ? 'rounded-sm cyber-well border border-cyan-400/25 hover:border-[#00F0FF]/65 text-[#E6F4FF]'
              : isEditorial
              ? 'rounded-none editorial-well border border-[#B8AD96] hover:border-[#1D1814] text-[#1D1814]'
              : isSlate
              ? 'rounded-md slate-well border border-slate-800 hover:border-teal-400/50 text-slate-200'
              : isClay
              ? 'rounded-2xl clay-well border border-white/75 hover:border-indigo-300 text-[#1E2547]'
              : isSaas
              ? 'rounded-lg bg-slate-50/70 border border-slate-200 hover:border-indigo-300 hover:bg-white text-slate-800'
              : isNordic
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
                containerStyle = isSkeuomorphic
                  ? 'rounded-md border-2 border-[#164A37] bg-[#E5EFE9] text-[#133829] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]'
                  : isMaterial
                  ? 'rounded-lg border-2 border-[#00897B] bg-[#E0F2F1] text-[#004D40]'
                  : isCyberpunk
                  ? 'rounded-sm border border-[#00F5D4] bg-[#051F20] text-[#E6FFFA]'
                  : isEditorial
                  ? 'rounded-none border-2 border-[#1E4D40] bg-[#E6EDE9] text-[#18382F]'
                  : isSlate
                  ? 'rounded-md border border-teal-400/70 bg-teal-950/35 text-teal-50'
                  : isClay
                  ? 'rounded-2xl border border-white/90 bg-[#E3FCEC] text-[#065F46] shadow-sm'
                  : isSaas
                  ? 'rounded-lg border border-emerald-500 bg-emerald-50/80 text-emerald-950'
                  : isNordic
                  ? 'rounded-xl border border-[#527360] bg-[#E7EFEA] text-[#2D4739]'
                  : isGlass
                  ? 'rounded-xl border border-emerald-300/60 bg-emerald-950/35 text-emerald-100'
                  : isBrutal
                  ? 'border-2 border-black bg-[#86EFAC] text-black brutal-shadow-sm'
                  : isObsidian
                  ? 'border border-[#D4AF37]/80 bg-[#14110C] text-[#F3E5AB] brass-hairline-glow'
                  : 'border border-amber-400/80 bg-zinc-900 text-white shadow-sm rounded';
              } else if (isSelected && !option.isOptimal) {
                containerStyle = isSkeuomorphic
                  ? 'rounded-md skeuo-stamp bg-[#F9EAE7] text-[#8C1D18] line-through'
                  : isMaterial
                  ? 'rounded-lg border-2 border-[#D32F2F] bg-[#FFEBEE] text-[#7F1D1D] line-through'
                  : isCyberpunk
                  ? 'rounded-sm border border-[#FF2A85]/60 bg-[#19091E] text-[#FF85C0] line-through'
                  : isEditorial
                  ? 'rounded-none border-2 border-[#9B2226] bg-[#F6E5E2] text-[#7F1D1D] line-through'
                  : isSlate
                  ? 'rounded-md border border-rose-500/45 bg-rose-950/35 text-rose-200 line-through'
                  : isClay
                  ? 'rounded-2xl border border-white/80 bg-[#FFE8EC] text-[#9F1239] line-through'
                  : isSaas
                  ? 'rounded-lg border border-rose-200 bg-rose-50/80 text-rose-700 line-through'
                  : isNordic
                  ? 'rounded-xl border border-[#E4C5B9] bg-[#FAF0EC] text-[#8F4A37] line-through'
                  : isGlass
                  ? 'rounded-xl border border-rose-300/35 bg-rose-950/30 text-rose-200 line-through'
                  : isBrutal
                  ? 'border-2 border-black bg-[#FDA4AF] text-black line-through'
                  : isObsidian
                  ? 'border border-[#3D2225] bg-[#140D0E] text-[#A39E93] line-through'
                  : 'border border-zinc-700 bg-zinc-900 text-zinc-400 line-through rounded';
              } else {
                containerStyle = isSkeuomorphic
                  ? 'rounded-md skeuo-well border border-[#D4C6AA] text-[#7A624E] opacity-70'
                  : isMaterial
                  ? 'rounded-lg material-well border border-slate-200/80 text-[#64748B] opacity-70'
                  : isCyberpunk
                  ? 'rounded-sm cyber-well border border-cyan-400/15 text-[#7A95B0] opacity-60'
                  : isEditorial
                  ? 'rounded-none editorial-well border border-[#C9BFA9] text-[#6E6356] opacity-65'
                  : isSlate
                  ? 'rounded-md slate-well border border-slate-800/70 text-slate-500 opacity-60'
                  : isClay
                  ? 'rounded-2xl clay-well border border-white/60 text-[#647094] opacity-70'
                  : isSaas
                  ? 'rounded-lg bg-slate-50 border border-slate-200 text-slate-400 opacity-70'
                  : isNordic
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
              containerStyle = isSkeuomorphic
                ? 'rounded-md border-2 border-[#A88024] bg-[#F7EED6] text-[#1F140E] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]'
                : isMaterial
                ? 'rounded-lg border-2 border-[#1565C0] bg-[#E3F2FD] text-[#111827]'
                : isCyberpunk
                ? 'rounded-sm border border-[#00F0FF] bg-[#061926] text-white shadow-[0_0_12px_rgba(0,240,255,0.22)]'
                : isEditorial
                ? 'rounded-none border-2 border-[#9B2226] bg-[#FAF5EA] text-[#1D1814]'
                : isSlate
                ? 'rounded-md border border-teal-400 bg-teal-950/35 text-white'
                : isClay
                ? 'rounded-2xl border border-indigo-300 bg-[#E5E9FF] text-[#1E2547] shadow-sm'
                : isSaas
                ? 'rounded-lg border border-indigo-600 bg-indigo-50/75 text-slate-900'
                : isNordic
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
                      <CheckCircle2 className={isSkeuomorphic ? 'w-4 h-4 text-[#164A37]' : isMaterial ? 'w-4 h-4 text-[#00897B]' : isCyberpunk ? 'w-4 h-4 text-[#00F5D4]' : isEditorial ? 'w-4 h-4 text-[#1E4D40]' : isSlate ? 'w-4 h-4 text-teal-300' : isClay ? 'w-4 h-4 text-[#065F46]' : isSaas ? 'w-4 h-4 text-emerald-600' : isNordic ? 'w-4 h-4 text-[#3B5948]' : isGlass ? 'w-4 h-4 text-emerald-300' : isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#D4AF37]' : 'w-4 h-4 text-amber-400'} />
                    ) : isSelected ? (
                      <XCircle className={isSkeuomorphic ? 'w-4 h-4 text-[#8C1D18]' : isMaterial ? 'w-4 h-4 text-[#C62828]' : isCyberpunk ? 'w-4 h-4 text-[#FF2A85]' : isEditorial ? 'w-4 h-4 text-[#9B2226]' : isSlate ? 'w-4 h-4 text-rose-300' : isClay ? 'w-4 h-4 text-[#9F1239]' : isSaas ? 'w-4 h-4 text-rose-600' : isNordic ? 'w-4 h-4 text-[#964B36]' : isGlass ? 'w-4 h-4 text-rose-300' : isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#E8A5A5]' : 'w-4 h-4 text-zinc-500'} />
                    ) : (
                      <span className={isSkeuomorphic ? 'text-xs font-mono text-[#7A624E]' : isMaterial ? 'text-xs font-mono text-[#64748B]' : isCyberpunk ? 'text-xs font-mono text-[#7A95B0]' : isEditorial ? 'text-xs font-mono text-[#6E6356]' : isSlate ? 'text-xs font-mono text-slate-500' : isClay ? 'text-xs font-mono text-[#647094]' : isSaas ? 'text-xs font-mono text-slate-400' : isNordic ? 'text-xs font-mono text-[#5C6962]' : isGlass ? 'text-xs font-mono text-slate-500' : isBrutal ? 'text-xs font-mono font-bold text-zinc-600' : isObsidian ? 'text-xs font-mono text-[#736D63]' : 'text-xs font-mono text-zinc-600'}>[0{idx + 1}]</span>
                    )
                  ) : (
                    <span
                      className={`text-xs font-mono ${
                        isSelected
                          ? isSkeuomorphic
                            ? 'text-[#8C1D18] font-bold'
                            : isMaterial
                            ? 'text-[#1565C0] font-bold'
                            : isCyberpunk
                            ? 'text-[#00F0FF] font-bold'
                            : isEditorial
                            ? 'text-[#9B2226] font-bold'
                            : isSlate
                            ? 'text-teal-300 font-semibold'
                            : isClay
                            ? 'text-indigo-600 font-semibold'
                            : isSaas
                            ? 'text-indigo-600 font-semibold'
                            : isNordic
                            ? 'text-[#3B5948] font-semibold'
                            : isGlass
                            ? 'text-sky-300 font-semibold'
                            : isBrutal
                            ? 'text-black font-black'
                            : isObsidian
                            ? 'text-[#E5C77B] font-semibold'
                            : 'text-zinc-100 font-bold'
                          : isSkeuomorphic
                          ? 'text-[#5C412E]'
                          : isMaterial
                          ? 'text-[#64748B]'
                          : isCyberpunk
                          ? 'text-[#7A95B0]'
                          : isEditorial
                          ? 'text-[#574D42]'
                          : isSlate
                          ? 'text-slate-400'
                          : isClay
                          ? 'text-[#647094]'
                          : isSaas
                          ? 'text-slate-400'
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
                    isSkeuomorphic
                      ? 'p-1.5 rounded-md text-[#5C412E] hover:text-[#1F140E] hover:bg-[#DFD2B8] transition-colors cursor-pointer shrink-0'
                      : isMaterial
                      ? 'p-1.5 rounded-lg text-[#475569] hover:text-[#1565C0] hover:bg-white transition-colors cursor-pointer shrink-0'
                      : isCyberpunk
                      ? 'p-1.5 rounded-sm text-[#9BB8D3] hover:text-[#00F0FF] hover:bg-[#061926] transition-colors cursor-pointer shrink-0'
                      : isEditorial
                      ? 'p-1 rounded-none text-[#574D42] hover:text-[#9B2226] transition-colors cursor-pointer shrink-0'
                      : isSlate
                      ? 'p-1 rounded-md text-slate-400 hover:text-teal-300 transition-colors cursor-pointer shrink-0'
                      : isClay
                      ? 'p-1.5 rounded-xl bg-white/80 text-[#647094] hover:text-indigo-600 transition-colors cursor-pointer shrink-0 shadow-xs'
                      : isSaas
                      ? 'p-1 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer shrink-0'
                      : isNordic
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
              isSkeuomorphic
                ? 'p-4 rounded-md skeuo-well border border-[#C8B799] mb-6'
                : isMaterial
                ? 'p-4 rounded-lg bg-[#E3F2FD] border border-[#BBDEFB] mb-6'
                : isCyberpunk
                ? 'p-4 rounded-sm cyber-well border border-cyan-400/35 mb-6'
                : isEditorial
                ? 'p-4 rounded-none editorial-well border border-[#1D1814]/40 mb-6'
                : isSlate
                ? 'p-4 rounded-md slate-well border border-teal-400/35 mb-6'
                : isClay
                ? 'p-4 rounded-2xl bg-[#E5E9FF]/80 border border-white/80 mb-6 shadow-sm'
                : isSaas
                ? 'p-4 rounded-lg bg-indigo-50/55 border border-indigo-200 mb-6'
                : isNordic
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
                isSkeuomorphic
                  ? 'font-mono text-[11px] text-[#5C412E] font-bold uppercase tracking-[0.12em] mb-1.5 flex items-center gap-1.5'
                  : isMaterial
                  ? 'text-[11px] text-[#0D47A1] font-bold uppercase tracking-[0.08em] mb-1.5 flex items-center gap-1.5'
                  : isCyberpunk
                  ? 'font-cyber text-[11px] text-[#00F0FF] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5'
                  : isEditorial
                  ? 'font-mono text-[11px] text-[#9B2226] font-semibold uppercase tracking-[0.14em] mb-1.5 flex items-center gap-1.5'
                  : isSlate
                  ? 'text-[11px] text-teal-300 font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5'
                  : isClay
                  ? 'text-[11px] text-indigo-700 font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5'
                  : isSaas
                  ? 'text-[11px] text-indigo-700 font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5'
                  : isNordic
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
              <HelpCircle className={isSkeuomorphic ? 'w-4 h-4 text-[#8C6239]' : isMaterial ? 'w-4 h-4 text-[#1565C0]' : isCyberpunk ? 'w-4 h-4 text-[#00F0FF]' : isEditorial ? 'w-4 h-4 text-[#9B2226]' : isSlate ? 'w-4 h-4 text-teal-400' : isClay ? 'w-4 h-4 text-indigo-600' : isSaas ? 'w-4 h-4 text-indigo-600' : isNordic ? 'w-4 h-4 text-[#527360]' : isGlass ? 'w-4 h-4 text-sky-300' : isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#D4AF37]' : 'w-4 h-4 text-amber-400'} />
              <span>COMMUNICATION PSYCHOLOGY DEBRIEF:</span>
            </div>
            <p className={isSkeuomorphic ? 'text-xs text-[#1F140E] leading-relaxed mb-3' : isMaterial ? 'text-xs text-[#111827] leading-relaxed mb-3' : isCyberpunk ? 'text-xs text-[#E6F4FF] leading-relaxed mb-3' : isEditorial ? 'text-xs text-[#1D1814] leading-relaxed mb-3' : isSlate ? 'text-xs text-slate-200 leading-relaxed mb-3' : isClay ? 'text-xs text-[#1E2547] leading-relaxed mb-3' : isSaas ? 'text-xs text-slate-700 leading-relaxed mb-3' : isNordic ? 'text-xs text-[#242E28] leading-relaxed mb-3' : isGlass ? 'text-xs text-slate-200 leading-relaxed mb-3' : isBrutal ? 'text-xs text-zinc-900 font-medium leading-relaxed mb-3' : isObsidian ? 'text-xs text-[#DDD6C8] leading-relaxed mb-3' : 'text-xs text-zinc-300 leading-relaxed mb-3'}>
              {question.psychologicalPrinciple}
            </p>
            {selectedOptionIndex !== null && (
              <div className={isSkeuomorphic ? 'text-xs text-[#4A3326] border-t border-[#C8B799] pt-2.5 italic' : isMaterial ? 'text-xs text-[#334155] border-t border-[#BBDEFB] pt-2.5 italic' : isCyberpunk ? 'text-xs text-[#9BB8D3] border-t border-cyan-400/25 pt-2.5 italic' : isEditorial ? 'text-xs text-[#433A31] border-t border-[#C9BFA9] pt-2.5 italic' : isSlate ? 'text-xs text-slate-400 border-t border-slate-800 pt-2.5 italic' : isClay ? 'text-xs text-[#4B5478] border-t border-indigo-900/10 pt-2.5 italic' : isSaas ? 'text-xs text-slate-600 border-t border-indigo-200/80 pt-2.5 italic' : isNordic ? 'text-xs text-[#4E5A53] border-t border-[#B8CBBF] pt-2.5 italic' : isGlass ? 'text-xs text-slate-300 border-t border-white/15 pt-2.5 italic' : isBrutal ? 'text-xs text-black font-bold border-t-2 border-black pt-2 italic' : isObsidian ? 'text-xs text-[#A39E93] border-t border-[#2A241A] pt-2.5 italic' : 'text-xs text-zinc-400 border-t border-zinc-800 pt-2 italic'}>
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
                isSkeuomorphic
                  ? `px-5 py-2.5 rounded-md font-mono text-xs font-bold uppercase tracking-wider border transition-all whitespace-nowrap shrink-0 ${
                      selectedOptionIndex !== null
                        ? 'skeuo-brass-btn border-[#7A5915] cursor-pointer'
                        : 'skeuo-well text-[#8A735C] border-[#C8B799] cursor-not-allowed'
                    }`
                  : isMaterial
                  ? `px-5 py-2.5 rounded-lg text-xs font-semibold tracking-wide border transition-all whitespace-nowrap shrink-0 ${
                      selectedOptionIndex !== null
                        ? 'bg-[#1565C0] hover:bg-[#0D47A1] text-white border-[#0D47A1] cursor-pointer material-btn'
                        : 'material-well text-[#64748B] border-slate-200/80 cursor-not-allowed'
                    }`
                  : isCyberpunk
                  ? `px-5 py-2.5 rounded-sm font-cyber text-xs font-bold uppercase tracking-wider border transition-all whitespace-nowrap shrink-0 ${
                      selectedOptionIndex !== null
                        ? 'bg-gradient-to-r from-[#00F0FF] to-[#FF2A85] text-[#060714] border-cyan-200/80 cursor-pointer cyber-btn'
                        : 'cyber-well text-[#627D99] border-cyan-400/20 cursor-not-allowed'
                    }`
                  : isEditorial
                  ? `px-5 py-2.5 rounded-none font-mono text-xs font-semibold tracking-wider border transition-colors ${
                      selectedOptionIndex !== null
                        ? 'bg-[#9B2226] hover:bg-[#7F1D1D] text-[#FAF5EA] border-[#1D1814] shadow-[2px_2px_0_#1D1814] cursor-pointer'
                        : 'editorial-well text-[#6E6356] border-[#C9BFA9] cursor-not-allowed'
                    }`
                  : isSlate
                  ? `px-5 py-2.5 rounded-md text-xs font-semibold tracking-wide border transition-colors ${
                      selectedOptionIndex !== null
                        ? 'bg-teal-400 hover:bg-teal-300 text-slate-950 border-teal-300 cursor-pointer shadow-xs'
                        : 'bg-[#0B1220] text-slate-500 border-slate-800 cursor-not-allowed'
                    }`
                  : isClay
                  ? `px-5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide border transition-all whitespace-nowrap shrink-0 ${
                      selectedOptionIndex !== null
                        ? 'bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-400/60 cursor-pointer clay-btn'
                        : 'clay-well text-[#647094] border-white/70 cursor-not-allowed'
                    }`
                  : isSaas
                  ? `px-5 py-2.5 rounded-lg text-xs font-semibold tracking-wide border transition-colors ${
                      selectedOptionIndex !== null
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 cursor-pointer shadow-xs'
                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    }`
                  : isNordic
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
                isSkeuomorphic
                  ? 'px-5 py-2.5 rounded-md skeuo-brass-btn font-mono font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0'
                  : isMaterial
                  ? 'px-5 py-2.5 rounded-lg bg-[#1565C0] hover:bg-[#0D47A1] text-white border border-[#0D47A1] text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-2 material-btn whitespace-nowrap shrink-0'
                  : isCyberpunk
                  ? 'px-5 py-2.5 rounded-sm bg-gradient-to-r from-[#00F0FF] to-[#FF2A85] text-[#060714] border border-cyan-200/80 font-cyber text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 cyber-btn whitespace-nowrap shrink-0'
                  : isEditorial
                  ? 'px-5 py-2.5 rounded-none bg-[#9B2226] hover:bg-[#7F1D1D] text-[#FAF5EA] border border-[#1D1814] shadow-[2px_2px_0_#1D1814] font-mono text-xs font-semibold tracking-wider transition-colors cursor-pointer flex items-center gap-2'
                  : isSlate
                  ? 'px-5 py-2.5 rounded-md bg-teal-400 hover:bg-teal-300 text-slate-950 border border-teal-300 text-xs font-semibold tracking-wide transition-colors cursor-pointer flex items-center gap-2 shadow-xs'
                  : isClay
                  ? 'px-5 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white border border-indigo-400/60 text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-2 clay-btn whitespace-nowrap shrink-0'
                  : isSaas
                  ? 'px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600 text-xs font-semibold tracking-wide transition-colors cursor-pointer flex items-center gap-2 shadow-xs'
                  : isNordic
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
              <ArrowRight className={isSkeuomorphic ? 'w-4 h-4 text-[#1F1209]' : isMaterial ? 'w-4 h-4 text-white' : isCyberpunk ? 'w-4 h-4 text-[#060714]' : isEditorial ? 'w-4 h-4 text-[#FAF5EA]' : isSlate ? 'w-4 h-4 text-slate-950' : isClay || isSaas ? 'w-4 h-4 text-white' : isNordic ? 'w-4 h-4 text-[#FDFBF7]' : isGlass ? 'w-4 h-4 text-slate-950' : isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#070709]' : 'w-4 h-4 text-amber-600'} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
