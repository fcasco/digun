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
        <div className="border border-zinc-800 bg-zinc-950 rounded-lg p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 text-zinc-100 mb-4">
            <CheckCircle2 className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-wider text-zinc-100">
              SCENARIO DRILL: EVALUATION REPORT
            </h2>
          </div>

          <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
            Situational simulation complete. You evaluated strategic verbal options across complex interpersonal workplace dynamics.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            <div className="border border-zinc-800 bg-zinc-900/50 p-4 rounded text-center">
              <div className="text-xs text-zinc-500 mb-1">SCORE</div>
              <div className="text-3xl font-bold text-zinc-100 tabular-nums">
                {score} / {SCENARIO_QUIZZES.length}
              </div>
            </div>
            <div className="border border-zinc-800 bg-zinc-900/50 p-4 rounded text-center">
              <div className="text-xs text-zinc-500 mb-1">ACCURACY</div>
              <div className="text-3xl font-bold text-amber-400 tabular-nums">
                {percentage}%
              </div>
            </div>
            <div className="border border-zinc-800 bg-zinc-900/50 p-4 rounded text-center col-span-2 sm:col-span-1">
              <div className="text-xs text-zinc-500 mb-1">STRATEGIC RATING</div>
              <div className="text-lg font-bold text-zinc-200">
                {percentage >= 80 ? 'EXECUTIVE' : percentage >= 50 ? 'PRACTITIONER' : 'REFINING'}
              </div>
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="px-5 py-2.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <span>RESTART SCENARIO DRILL</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 font-mono">
      {/* Header bar */}
      <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-zinc-100 font-bold">
            SCENARIO {currentQuestionIndex + 1} OF {SCENARIO_QUIZZES.length}
          </span>
          <span>·</span>
          <span>SPOT THE POWER REFRAME</span>
        </div>
        <div className="text-zinc-100 font-bold tabular-nums">
          SCORE: {score}
        </div>
      </div>

      {/* Question Card */}
      <div className="border border-zinc-800 bg-zinc-950 rounded-lg p-6 sm:p-7 mb-6 shadow-xl">
        
        {/* Context badge */}
        <div className="text-xs text-zinc-400 mb-2 font-bold tracking-wider">
          CONTEXT: {question.speakerContext.toUpperCase()}
        </div>

        {/* Real-world Scenario */}
        <div className="text-base sm:text-lg text-zinc-100 font-medium mb-4 leading-relaxed">
          {question.scenario}
        </div>

        {/* The Danger Phrase Trigger */}
        <div className="border border-zinc-800 bg-zinc-900/40 p-3 rounded mb-6 flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider mb-1">
              THE INTUITIVE (DANGER) PHRASE TO AVOID:
            </div>
            <div className="text-sm text-zinc-300 italic font-mono">
              "{question.dangerPhrase}"
            </div>
          </div>
          <button
            onClick={() => handleSpeak(question.dangerPhrase)}
            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Listen to trigger phrase"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Options List */}
        <div className="space-y-3 mb-6">
          <div className="text-xs text-zinc-400 uppercase tracking-wider">
            SELECT THE OPTIMAL STRATEGIC REFRAME:
          </div>

          {question.options.map((option, idx) => {
            const isSelected = selectedOptionIndex === idx;
            let containerStyle = 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-650 text-zinc-300';
            
            if (hasSubmitted) {
              if (option.isOptimal) {
                containerStyle = 'border-amber-400/80 bg-zinc-900 text-white shadow-sm';
              } else if (isSelected && !option.isOptimal) {
                containerStyle = 'border-zinc-700 bg-zinc-900 text-zinc-400 line-through';
              } else {
                containerStyle = 'border-zinc-850 bg-zinc-950 text-zinc-600 opacity-60';
              }
            } else if (isSelected) {
              containerStyle = 'border-zinc-400 bg-zinc-900 text-white';
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
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    ) : isSelected ? (
                      <XCircle className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <span className="text-xs font-mono text-zinc-600">[0{idx + 1}]</span>
                    )
                  ) : (
                    <span className={`text-xs font-mono ${isSelected ? 'text-zinc-100 font-bold' : 'text-zinc-500'}`}>
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
                  className="p-1 rounded text-zinc-500 hover:text-white transition-colors"
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
          <div className="p-4 rounded border border-zinc-800 bg-zinc-900/60 mb-6">
            <div className="text-xs text-zinc-200 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>COMMUNICATION PSYCHOLOGY DEBRIEF:</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed mb-3">
              {question.psychologicalPrinciple}
            </p>
            {selectedOptionIndex !== null && (
              <div className="text-xs text-zinc-400 border-t border-zinc-800 pt-2 italic">
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
                  ? 'bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm'
                  : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
              }`}
            >
              SUBMIT ANSWER
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold tracking-wider transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <span>{currentQuestionIndex + 1 < SCENARIO_QUIZZES.length ? 'NEXT SCENARIO' : 'FINISH DRILL'}</span>
              <ArrowRight className="w-4 h-4 text-amber-600" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
