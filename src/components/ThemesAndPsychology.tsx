import React, { useState } from 'react';
import { 
  Terminal, 
  Brain, 
  Sparkles, 
  HeartHandshake, 
  ShieldCheck, 
  Scale, 
  CheckCircle2
} from 'lucide-react';
import { UI_THEMES_LIST } from '../data/defaultCards';
import { soundEffects } from '../utils/soundEffects';

export const ThemesAndPsychology: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'themes' | 'psychology'>('themes');

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 font-mono">
      {/* Sub-navigation tabs (Monochrome) */}
      <div className="flex items-center gap-2 mb-6 border-b border-zinc-800 pb-3">
        <button
          onClick={() => {
            soundEffects.playKeyClick();
            setActiveSection('themes');
          }}
          className={`px-3.5 py-1.5 rounded text-xs transition-colors cursor-pointer flex items-center gap-2 border ${
            activeSection === 'themes'
              ? 'bg-zinc-900 text-zinc-100 border-zinc-700 shadow-sm'
              : 'text-zinc-400 border-transparent hover:text-zinc-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>[01] THE 12 UI THEMES & SELECTION (#12)</span>
        </button>

        <button
          onClick={() => {
            soundEffects.playKeyClick();
            setActiveSection('psychology');
          }}
          className={`px-3.5 py-1.5 rounded text-xs transition-colors cursor-pointer flex items-center gap-2 border ${
            activeSection === 'psychology'
              ? 'bg-zinc-900 text-zinc-100 border-zinc-700 shadow-sm'
              : 'text-zinc-400 border-transparent hover:text-zinc-200'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>[02] STRATEGIC REFRAMING PSYCHOLOGY</span>
        </button>
      </div>

      {/* ================= SECTION 1: THE 12 MOST USED THEMES ================= */}
      {activeSection === 'themes' && (
        <div className="space-y-6">
          <div className="border border-zinc-800 bg-zinc-950 p-5 sm:p-6 rounded-lg">
            <div className="flex items-center gap-2 text-zinc-100 mb-2">
              <Terminal className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-bold tracking-wider text-zinc-100">
                TAXONOMY: THE 12 MOST PREVALENT UI DESIGN THEMES
              </h2>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              In accordance with the prompt design directive, here is the curated taxonomy of the 12 most used visual themes in web design. Per specification, <strong>Theme #12 (Retro Terminal Console)</strong> was selected, rendered in a restrained monochrome execution with focused accent cues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {UI_THEMES_LIST.map((theme) => {
              return (
                <div
                  key={theme.rank}
                  className={`p-4 rounded-lg border transition-all ${
                    theme.isChosen
                      ? 'border-zinc-500 bg-zinc-900 shadow-md'
                      : 'border-zinc-800/80 bg-zinc-950 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className={`font-bold ${theme.isChosen ? 'text-white' : 'text-zinc-400'}`}>
                      #{String(theme.rank).padStart(2, '0')}. {theme.name.toUpperCase()}
                    </span>
                    {theme.isChosen && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400 text-zinc-950 font-bold tracking-wider">
                        CHOSEN THEME
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-300 mb-3 leading-relaxed">
                    {theme.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {theme.keyCharacteristics.map((char, i) => (
                      <span
                        key={i}
                        className={`text-[10px] px-2 py-0.5 rounded ${
                          theme.isChosen
                            ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                            : 'bg-zinc-900 text-zinc-500 border border-zinc-850'
                        }`}
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Theme #12 Architecture Box */}
          <div className="border border-zinc-800 bg-zinc-950 p-5 sm:p-6 rounded-lg">
            <h3 className="text-sm font-bold text-zinc-200 tracking-wider mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>THEME #12 MONOCHROME SPECIFICATION</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-400 pt-2">
              <div>
                <span className="text-zinc-200 font-bold block mb-1">COLOR ARCHITECTURE</span>
                60% obsidian canvas (#09090b), 30% structural zinc panels (#121215), 10% focused accent highlight.
              </div>
              <div>
                <span className="text-zinc-200 font-bold block mb-1">TYPOGRAPHIC SYSTEM</span>
                Monospace typography (IBM Plex Mono) with strict zero-pill discipline and unboxed dot-separated metadata.
              </div>
              <div>
                <span className="text-zinc-200 font-bold block mb-1">TACTILE ACOUSTICS</span>
                Web Audio procedural synthesis generating mechanical key clacks, relay clicks, and graduation chimes.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 2: STRATEGIC REFRAMING PSYCHOLOGY ================= */}
      {activeSection === 'psychology' && (
        <div className="space-y-6">
          <div className="border border-zinc-800 bg-zinc-950 p-5 sm:p-6 rounded-lg">
            <div className="flex items-center gap-2 text-zinc-100 mb-2">
              <Brain className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-bold tracking-wider text-zinc-100">
                THE PSYCHOLOGY OF STRATEGIC REFRAMING
              </h2>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              The "don't say A, say B" communication style is rooted in behavioral science and cognitive linguistics. The words you choose don't merely convey raw data—they dynamically calibrate how listeners calculate your competence, warmth, and authority, while reinforcing your own internal self-concept.
            </p>
          </div>

          {/* Pillar 1: Responsibility Exchange Theory & Competence-Warmth Trade-off */}
          <div className="border border-zinc-800 bg-zinc-950 p-5 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-zinc-200 text-sm font-bold">
              <Scale className="w-4 h-4 text-zinc-400" />
              <span>THE COMPETENCE-WARMTH TRADE-OFF (RESPONSIBILITY EXCHANGE THEORY)</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Social psychology research shows that interpersonal judgment rests on two primary axes: <strong>Competence</strong> (capability, intelligence, authority) and <strong>Warmth</strong> (friendliness, trustworthiness, empathy). 
            </p>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Over-apologizing (e.g. <em>"Sorry I'm late"</em>, <em>"Sorry for the typo"</em>) trades away competence in an attempt to show warmth. It inadvertently creates a <strong>"debt mindset"</strong>, framing your very presence as an inconvenience. Strategic reframes (e.g. <em>"Thank you for waiting"</em>) break this trade-off by projecting high warmth AND high competence simultaneously.
            </p>
          </div>

          {/* Pillar 2: Apology to Gratitude */}
          <div className="border border-zinc-800 bg-zinc-950 p-5 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-zinc-200 text-sm font-bold">
              <HeartHandshake className="w-4 h-4 text-zinc-400" />
              <span>FROM APOLOGY TO GRATITUDE (VALIDATING THE LISTENER)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="border border-zinc-800 bg-zinc-900/50 p-3 rounded">
                <div className="text-zinc-400 font-bold mb-1">THE "DANGER" APOLOGY PATTERN</div>
                <div className="text-zinc-400 leading-relaxed">
                  Focuses inward on self-guilt, weakness, and embarrassment. Forces the listener into the awkward emotional labor of having to soothe you: <em>"Oh no, it's fine, don't worry about it."</em>
                </div>
              </div>
              <div className="border border-zinc-700 bg-zinc-900 p-3 rounded">
                <div className="text-zinc-100 font-bold mb-1">THE "POWER" GRATITUDE REFRAME</div>
                <div className="text-zinc-300 leading-relaxed">
                  Focuses outward on honoring the listener's patience, generosity, or diligence. Gives them credit and positive reinforcement while preserving your own professional dignity.
                </div>
              </div>
            </div>
          </div>

          {/* Pillar 3: Passive to Assertive */}
          <div className="border border-zinc-800 bg-zinc-950 p-5 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-zinc-200 text-sm font-bold">
              <ShieldCheck className="w-4 h-4 text-zinc-400" />
              <span>FROM PASSIVE PERMISSION-SEEKING TO DECLARATIVE OWNERSHIP</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Hedging phrases like <em>"Can I ask a question?"</em> or <em>"I might be totally wrong, but..."</em> serve as psychological defense mechanisms against critique. However, preemptive self-undermining diminishes audience confidence before you even deliver your point. Replacing them with <em>"I have a question"</em> or <em>"Here is what the data indicates"</em> assumes your legitimate place at the decision table.
            </p>
          </div>

          {/* Pillar 4: Vague to Solution-Oriented */}
          <div className="border border-zinc-800 bg-zinc-950 p-5 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-zinc-200 text-sm font-bold">
              <CheckCircle2 className="w-4 h-4 text-zinc-400" />
              <span>FROM VAGUE COMMITMENT TO DEFINITIVE RELIABILITY</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Replacing <em>"I'll try"</em> with <em>"I will"</em>, or <em>"I don't know"</em> with <em>"I'll find out for you by 3 PM"</em> converts passive uncertainty into proactive stewardship. In organizational psychology, proactive communication is the single highest predictor of perceived executive presence and leadership readiness.
            </p>
          </div>

        </div>
      )}
    </div>
  );
};
