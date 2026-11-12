import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Volume2, HelpCircle } from 'lucide-react';
import { SCENARIO_QUIZZES } from '../data/defaultCards';
import { soundEffects } from '../utils/soundEffects';
import { speechEngine } from '../utils/speechSynthesis';

export const ScenarioQuiz: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);

  const question = SCENARIO_QUIZZES[currentQuestionIndex];

  const handleSelectOption = (index: number) => {
    if (hasSubmitted) return;
    soundEffects.playKeyClick();
    setSelectedOptionIndex(index);
  };

  const handleSubmit = () => {
    if (selectedOptionIndex === null || hasSubmitted) return;

    setHasSubmitted(true);
    const chosenOption = question.options[selectedOptionIndex];

    if (chosenOption.isOptimal) {
      soundEffects.playSuccessTone();
      setScore(prev => prev + 1);
    } else {
      soundEffects.playAgainTone();
    }
  };

  const handleNext = () => {
    soundEffects.playKeyClick();
    if (currentQuestionIndex + 1 < SCENARIO_QUIZZES.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionIndex(null);
      setHasSubmitted(false);
    } else {
      setIsQuizCompleted(true);
      soundEffects.playGraduationChime();
    }
  };

  const handleRestart = () => {
    soundEffects.playKeyClick();
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setHasSubmitted(false);
    setScore(0);
    setIsQuizCompleted(false);
  };

  const handleSpeak = (text: string) => {
    soundEffects.playKeyClick();
    speechEngine.speak(text);
  };

  if (isQuizCompleted) {
    const percentage = Math.round((score / SCENARIO_QUIZZES.length) * 100);

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 font-mono">
        <div className="border border-emerald-500/50 bg-[#0b1510] rounded-lg p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 text-emerald-400 mb-4">
            <CheckCircle2 className="w-6 h-6 glow-emerald" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-wider glow-emerald">
              SCENARIO DRILL: EVALUATION REPORT
            </h2>
          </div>

          <p className="text-sm text-[#8fa397] mb-6 leading-relaxed">
            Situational simulation complete. You evaluated strategic verbal options across complex interpersonal workplace dynamics.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            <div className="border border-[#1d3126] bg-[#09100c] p-4 rounded text-center">
              <div className="text-xs text-[#708579] mb-1">SCORE</div>
              <div className="text-3xl font-bold text-emerald-400 tabular-nums">
                {score} / {SCENARIO_QUIZZES.length}
              </div>
            </div>
            <div className="border border-[#1d3126] bg-[#09100c] p-4 rounded text-center">
              <div className="text-xs text-[#708579] mb-1">ACCURACY</div>
              <div className="text-3xl font-bold text-sky-400 tabular-nums">
                {percentage}%
              </div>
            </div>
            <div className="border border-[#1d3126] bg-[#09100c] p-4 rounded text-center col-span-2 sm:col-span-1">
              <div className="text-xs text-[#708579] mb-1">STRATEGIC RATING</div>
              <div className="text-lg font-bold text-amber-400">
                {percentage >= 80 ? 'EXECUTIVE' : percentage >= 50 ? 'PRACTITIONER' : 'REFINING'}
              </div>
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="px-5 py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 glow-box-emerald"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART SCENARIO DRILL</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 font-mono">
      {/* Header bar */}
      <div className="flex items-center justify-between text-xs text-[#718679] border-b border-[#1b2b22] pb-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold">
            SCENARIO {currentQuestionIndex + 1} OF {SCENARIO_QUIZZES.length}
          </span>
          <span>·</span>
          <span>SPOT THE POWER REFRAME</span>
        </div>
        <div className="text-emerald-400 font-bold tabular-nums">
          SCORE: {score}
        </div>
      </div>

      {/* Question Card */}
      <div className="border border-[#1f3427] bg-[#0c1611] rounded-lg p-6 sm:p-7 mb-6 shadow-xl">
        
        {/* Context badge */}
        <div className="text-xs text-sky-400 mb-2 font-bold tracking-wider">
          CONTEXT: {question.speakerContext.toUpperCase()}
        </div>

        {/* Real-world Scenario */}
        <div className="text-base sm:text-lg text-[#d8e8de] font-medium mb-4 leading-relaxed">
          {question.scenario}
        </div>

        {/* The Danger Phrase Trigger */}
        <div className="border border-amber-900/40 bg-[#14100b] p-3 rounded mb-6 flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] text-amber-400 font-bold uppercase tracking-wider mb-1">
              THE INTUITIVE (DANGER) PHRASE TO AVOID:
            </div>
            <div className="text-sm text-amber-300 italic font-mono">
              "{question.dangerPhrase}"
            </div>
          </div>
          <button
            onClick={() => handleSpeak(question.dangerPhrase)}
            className="p-1.5 rounded text-amber-400/80 hover:text-amber-300 hover:bg-amber-950/40 transition-colors"
            title="Listen to trigger phrase"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Options List */}
        <div className="space-y-3 mb-6">
          <div className="text-xs text-[#718679] uppercase tracking-wider">
            SELECT THE OPTIMAL STRATEGIC REFRAME:
          </div>

          {question.options.map((option, idx) => {
            const isSelected = selectedOptionIndex === idx;
            let containerStyle = 'border-[#22392c] bg-[#09110d] hover:border-emerald-500/40 text-[#c7d9ce]';
            
            if (hasSubmitted) {
              if (option.isOptimal) {
                containerStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-200 glow-box-emerald';
              } else if (isSelected && !option.isOptimal) {
                containerStyle = 'border-rose-500 bg-rose-950/40 text-rose-200';
              } else {
                containerStyle = 'border-[#18261e] bg-[#080d0a] text-[#55695e] opacity-60';
              }
            } else if (isSelected) {
              containerStyle = 'border-emerald-400 bg-[#122219] text-emerald-300';
            }

            return (
              <div
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`p-3.5 rounded border transition-all cursor-pointer flex items-start gap-3 select-none ${containerStyle}`}
              >
                <div className="mt-0.5 shrink-0">
                  {hasSubmitted ? (
                    option.isOptimal ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isSelected ? (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    ) : (
                      <span className="text-xs font-mono text-[#55695e]">[0{idx + 1}]</span>
                    )
                  ) : (
                    <span className={`text-xs font-mono ${isSelected ? 'text-emerald-400 font-bold' : 'text-[#6e8577]'}`}>
                      [0{idx + 1}]
                    </span>
                  )}
                </div>

                <div className="flex-1 text-sm leading-relaxed">
                  "{option.text}"
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(option.text);
                  }}
                  className="p-1 rounded text-[#718679] hover:text-emerald-300 transition-colors"
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
          <div className="p-4 rounded border border-emerald-500/30 bg-[#09150f] mb-6 animate-fade-in">
            <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              <span>COMMUNICATION PSYCHOLOGY DEBRIEF:</span>
            </div>
            <p className="text-xs text-[#a4bdad] leading-relaxed mb-3">
              {question.psychologicalPrinciple}
            </p>
            {selectedOptionIndex !== null && (
              <div className="text-xs text-[#8cb098] border-t border-[#1a2f23] pt-2 italic">
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
              className={`px-5 py-2.5 rounded text-xs font-bold tracking-wider transition-all cursor-pointer ${
                selectedOptionIndex !== null
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 glow-box-emerald'
                  : 'bg-[#14221a] text-[#55695e] border border-[#1b2b22] cursor-not-allowed'
              }`}
            >
              SUBMIT ANSWER
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold tracking-wider transition-colors cursor-pointer flex items-center gap-2 glow-box-emerald"
            >
              <span>{currentQuestionIndex + 1 < SCENARIO_QUIZZES.length ? 'NEXT SCENARIO' : 'FINISH DRILL'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
