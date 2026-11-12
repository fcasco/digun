import React, { useState } from 'react';
import { 
  BookOpen, 
  Terminal, 
  Brain, 
  Sparkles, 
  HeartHandshake, 
  ShieldCheck, 
  Scale, 
  CheckCircle2, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { UI_THEMES_LIST } from '../data/defaultCards';
import { soundEffects } from '../utils/soundEffects';

export const ThemesAndPsychology: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'themes' | 'psychology'>('themes');

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 font-mono">
      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-[#1a2d23] pb-3">
        <button
          onClick={() => {
            soundEffects.playKeyClick();
            setActiveSection('themes');
          }}
          className={`px-3.5 py-1.5 rounded text-xs transition-colors cursor-pointer flex items-center gap-2 border ${
            activeSection === 'themes'
              ? 'bg-[#122319] text-emerald-300 border-emerald-500/50 glow-box-emerald'
              : 'text-[#758c7f] border-transparent hover:text-emerald-400'
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
              ? 'bg-[#122319] text-emerald-300 border-emerald-500/50 glow-box-emerald'
              : 'text-[#758c7f] border-transparent hover:text-emerald-400'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>[02] STRATEGIC REFRAMING PSYCHOLOGY</span>
        </button>
      </div>

      {/* ================= SECTION 1: THE 12 MOST USED THEMES ================= */}
      {activeSection === 'themes' && (
        <div className="space-y-6">
          <div className="border border-[#1f3428] bg-[#0c1611] p-5 sm:p-6 rounded-lg">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Terminal className="w-5 h-5 glow-emerald" />
              <h2 className="text-base sm:text-lg font-bold tracking-wider glow-emerald">
                TAXONOMY: THE 12 MOST PREVALENT UI DESIGN THEMES
              </h2>
            </div>
            <p className="text-xs text-[#89a193] leading-relaxed">
              In accordance with the prompt design directive, here is the curated taxonomy of the 12 most used visual themes in web design and gaming. Per specification, <strong>Theme #12 (Retro Terminal Console)</strong> was selected and implemented across this application.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {UI_THEMES_LIST.map((theme) => {
              return (
                <div
                  key={theme.rank}
                  className={`p-4 rounded-lg border transition-all ${
                    theme.isChosen
                      ? 'border-emerald-400 bg-gradient-to-b from-[#102419] to-[#0a150f] glow-box-emerald shadow-lg'
                      : 'border-[#1b2b22] bg-[#09110d] hover:border-[#273d31]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className={`font-bold ${theme.isChosen ? 'text-emerald-300' : 'text-[#6c8275]'}`}>
                      #{String(theme.rank).padStart(2, '0')}. {theme.name.toUpperCase()}
                    </span>
                    {theme.isChosen && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold tracking-wider">
                        CHOSEN THEME
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#9eb6a8] mb-3 leading-relaxed">
                    {theme.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {theme.keyCharacteristics.map((char, i) => (
                      <span
                        key={i}
                        className={`text-[10px] px-2 py-0.5 rounded ${
                          theme.isChosen
                            ? 'bg-[#152e20] text-emerald-300 border border-emerald-500/30'
                            : 'bg-[#0f1814] text-[#6d8476] border border-[#1a2720]'
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

          {/* Theme #12 Design Architecture Box */}
          <div className="border border-emerald-500/40 bg-[#0c1611] p-5 sm:p-6 rounded-lg">
            <h3 className="text-sm font-bold text-emerald-300 tracking-wider mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>THEME #12 IMPLEMENTATION SPECIFICATION</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#8ca496] pt-2">
              <div>
                <span className="text-emerald-400 font-bold block mb-1">COLOR DISTRIBUTION</span>
                60% CRT pitch charcoal (#070b09), 30% structural console panels (#0d1511), 10% phosphor amber & emerald accents.
              </div>
              <div>
                <span className="text-emerald-400 font-bold block mb-1">TYPOGRAPHIC SYSTEM</span>
                Monospace typography (IBM Plex Mono) with strict zero-pill discipline and unboxed dot-separated metadata.
              </div>
              <div>
                <span className="text-emerald-400 font-bold block mb-1">TACTILE ACOUSTICS</span>
                Web Audio procedural synthesis generating mechanical key clacks, relay clicks, and graduation chimes.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 2: STRATEGIC REFRAMING PSYCHOLOGY ================= */}
      {activeSection === 'psychology' && (
        <div className="space-y-6">
          <div className="border border-[#1f3428] bg-[#0c1611] p-5 sm:p-6 rounded-lg">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Brain className="w-5 h-5 glow-emerald" />
              <h2 className="text-base sm:text-lg font-bold tracking-wider glow-emerald">
                THE PSYCHOLOGY OF STRATEGIC REFRAMING
              </h2>
            </div>
            <p className="text-xs text-[#89a193] leading-relaxed">
              The "don't say A, say B" communication style is rooted in behavioral science and cognitive linguistics. The words you choose don't merely convey raw data—they dynamically calibrate how listeners calculate your competence, warmth, and authority, while reinforcing your own internal self-concept.
            </p>
          </div>

          {/* Pillar 1: Responsibility Exchange Theory & Competence-Warmth Trade-off */}
          <div className="border border-[#1b2f23] bg-[#09110d] p-5 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-sky-400 text-sm font-bold">
              <Scale className="w-4 h-4" />
              <span>THE COMPETENCE-WARMTH TRADE-OFF (RESPONSIBILITY EXCHANGE THEORY)</span>
            </div>
            <p className="text-xs text-[#9eb6a8] leading-relaxed">
              Social psychology research shows that interpersonal judgment rests on two primary axes: <strong>Competence</strong> (capability, intelligence, authority) and <strong>Warmth</strong> (friendliness, trustworthiness, empathy). 
            </p>
            <p className="text-xs text-[#9eb6a8] leading-relaxed">
              Over-apologizing (e.g. <em>"Sorry I'm late"</em>, <em>"Sorry for the typo"</em>) trades away competence in an attempt to show warmth. It inadvertently creates a <strong>"debt mindset"</strong>, framing your very presence as an inconvenience. Strategic reframes (e.g. <em>"Thank you for waiting"</em>) break this trade-off by projecting high warmth AND high competence simultaneously.
            </p>
          </div>

          {/* Pillar 2: Apology to Gratitude */}
          <div className="border border-[#1b2f23] bg-[#09110d] p-5 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
              <HeartHandshake className="w-4 h-4" />
              <span>FROM APOLOGY TO GRATITUDE (VALIDATING THE LISTENER)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="border border-amber-900/40 bg-[#120d09] p-3 rounded">
                <div className="text-amber-400 font-bold mb-1">THE "DANGER" APOLOGY PATTERN</div>
                <div className="text-[#cbb898] leading-relaxed">
                  Focuses inward on self-guilt, weakness, and embarrassment. Forces the listener into the awkward emotional labor of having to soothe you: <em>"Oh no, it's fine, don't worry about it."</em>
                </div>
              </div>
              <div className="border border-emerald-900/40 bg-[#0a1610] p-3 rounded">
                <div className="text-emerald-400 font-bold mb-1">THE "POWER" GRATITUDE REFRAME</div>
                <div className="text-[#9bc2aa] leading-relaxed">
                  Focuses outward on honoring the listener's patience, generosity, or diligence. Gives them credit and positive reinforcement while preserving your own professional dignity.
                </div>
              </div>
            </div>
          </div>

          {/* Pillar 3: Passive to Assertive */}
          <div className="border border-[#1b2f23] bg-[#09110d] p-5 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>FROM PASSIVE PERMISSION-SEEKING TO DECLARATIVE OWNERSHIP</span>
            </div>
            <p className="text-xs text-[#9eb6a8] leading-relaxed">
              Hedging phrases like <em>"Can I ask a question?"</em> or <em>"I might be totally wrong, but..."</em> serve as psychological defense mechanisms against critique. However, preemptive self-undermining diminishes audience confidence before you even deliver your point. Replacing them with <em>"I have a question"</em> or <em>"Here is what the data indicates"</em> assumes your legitimate place at the decision table.
            </p>
          </div>

          {/* Pillar 4: Vague to Solution-Oriented */}
          <div className="border border-[#1b2f23] bg-[#09110d] p-5 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-fuchsia-400 text-sm font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>FROM VAGUE COMMITMENT TO DEFINITIVE RELIABILITY</span>
            </div>
            <p className="text-xs text-[#9eb6a8] leading-relaxed">
              Replacing <em>"I'll try"</em> with <em>"I will"</em>, or <em>"I don't know"</em> with <em>"I'll find out for you by 3 PM"</em> converts passive uncertainty into proactive stewardship. In organizational psychology, proactive communication is the single highest predictor of perceived executive presence and leadership readiness.
            </p>
          </div>

        </div>
      )}
    </div>
  );
};
