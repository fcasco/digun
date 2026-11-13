import React, { useState } from 'react';
import { 
  Terminal, 
  Brain, 
  Sparkles, 
  HeartHandshake, 
  ShieldCheck, 
  Scale, 
  CheckCircle2,
  Palette
} from 'lucide-react';
import { UI_THEMES_LIST } from '../data/defaultCards';
import { soundEffects } from '../utils/soundEffects';
import { useTheme, AppTheme } from '../context/ThemeContext';

export const ThemesAndPsychology: React.FC = () => {
  const { theme, setTheme, isBrutal, isObsidian } = useTheme();
  const [activeSection, setActiveSection] = useState<'themes' | 'psychology'>('themes');

  const getInteractiveThemeKey = (rank: number): AppTheme | null => {
    if (rank === 4) return 'neobrutalism';
    if (rank === 10) return 'obsidian';
    if (rank === 12) return 'terminal';
    return null;
  };

  return (
    <div className={`max-w-5xl mx-auto px-4 py-6 ${isBrutal || isObsidian ? 'font-sans' : 'font-mono'}`}>
      {/* Sub-navigation tabs */}
      <div
        className={`flex flex-wrap items-center gap-2 mb-6 pb-3 ${
          isBrutal ? 'border-b-2 border-black' : isObsidian ? 'border-b border-[#2A241A]' : 'border-b border-zinc-800'
        }`}
      >
        <button
          onClick={() => {
            soundEffects.playKeyClick();
            setActiveSection('themes');
          }}
          className={
            isBrutal
              ? `px-3.5 py-1.5 text-xs font-extrabold cursor-pointer flex items-center gap-2 border-2 border-black brutal-btn ${
                  activeSection === 'themes'
                    ? 'bg-[#FFE500] text-black'
                    : 'bg-white text-black hover:bg-[#FEF9C3]'
                }`
              : isObsidian
              ? `px-4 py-2 text-[11px] uppercase tracking-[0.16em] cursor-pointer flex items-center gap-2 border transition-colors ${
                  activeSection === 'themes'
                    ? 'bg-[#D4AF37] text-[#070709] border-[#E5C77B] font-semibold'
                    : 'bg-[#0B0B0E] text-[#A39E93] border-[#2A241A] hover:text-[#F5F0E6]'
                }`
              : `px-3.5 py-1.5 rounded text-xs transition-colors cursor-pointer flex items-center gap-2 border ${
                  activeSection === 'themes'
                    ? 'bg-zinc-900 text-zinc-100 border-zinc-700 shadow-sm'
                    : 'text-zinc-400 border-transparent hover:text-zinc-200'
                }`
          }
        >
          <Palette className="w-3.5 h-3.5" />
          <span>01. THE 12 UI THEMES & LIVE SWITCHER</span>
        </button>

        <button
          onClick={() => {
            soundEffects.playKeyClick();
            setActiveSection('psychology');
          }}
          className={
            isBrutal
              ? `px-3.5 py-1.5 text-xs font-extrabold cursor-pointer flex items-center gap-2 border-2 border-black brutal-btn ${
                  activeSection === 'psychology'
                    ? 'bg-[#FFE500] text-black'
                    : 'bg-white text-black hover:bg-[#FEF9C3]'
                }`
              : isObsidian
              ? `px-4 py-2 text-[11px] uppercase tracking-[0.16em] cursor-pointer flex items-center gap-2 border transition-colors ${
                  activeSection === 'psychology'
                    ? 'bg-[#D4AF37] text-[#070709] border-[#E5C77B] font-semibold'
                    : 'bg-[#0B0B0E] text-[#A39E93] border-[#2A241A] hover:text-[#F5F0E6]'
                }`
              : `px-3.5 py-1.5 rounded text-xs transition-colors cursor-pointer flex items-center gap-2 border ${
                  activeSection === 'psychology'
                    ? 'bg-zinc-900 text-zinc-100 border-zinc-700 shadow-sm'
                    : 'text-zinc-400 border-transparent hover:text-zinc-200'
                }`
          }
        >
          <Brain className="w-3.5 h-3.5" />
          <span>02. STRATEGIC REFRAMING PSYCHOLOGY</span>
        </button>
      </div>

      {/* ================= SECTION 1: THE 12 MOST USED THEMES ================= */}
      {activeSection === 'themes' && (
        <div className="space-y-6">
          <div
            className={
              isBrutal
                ? 'border-2 border-black bg-white p-5 sm:p-6 brutal-shadow'
                : isObsidian
                ? 'border border-[#D4AF37]/25 obsidian-surface p-6 sm:p-7'
                : 'border border-zinc-800 bg-zinc-950 p-5 sm:p-6 rounded-lg'
            }
          >
            <div className="flex items-center gap-2.5 mb-2">
              <Terminal className={isBrutal ? 'w-5 h-5 text-black' : isObsidian ? 'w-5 h-5 text-[#D4AF37]' : 'w-5 h-5 text-amber-400'} />
              <h2
                className={
                  isBrutal
                    ? 'text-base sm:text-lg font-black tracking-tight text-black'
                    : isObsidian
                    ? 'font-luxury text-2xl sm:text-3xl font-semibold tracking-wide text-[#F5F0E6]'
                    : 'text-base sm:text-lg font-bold tracking-wider text-zinc-100'
                }
              >
                Taxonomy: The 12 Most Prevalent UI Design Themes
              </h2>
            </div>
            <p className={isBrutal ? 'text-xs text-zinc-800 font-medium leading-relaxed' : isObsidian ? 'text-sm text-[#A39E93] leading-relaxed' : 'text-xs text-zinc-400 leading-relaxed'}>
              Explore the 12 core visual themes in modern web design. <strong className={isObsidian ? 'text-[#E5C77B]' : ''}>Theme #10 (Luxury Obsidian &amp; Warm Brass)</strong>, <strong className={isObsidian ? 'text-[#E5C77B]' : ''}>Theme #04 (Neo-Brutalism)</strong>, and <strong className={isObsidian ? 'text-[#E5C77B]' : ''}>Theme #12 (Retro Terminal Console)</strong> are all fully interactive — switch live below or from the workspace toolbar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {UI_THEMES_LIST.map((themeItem) => {
              const interactiveKey = getInteractiveThemeKey(themeItem.rank);
              const isActiveTheme = interactiveKey === theme;

              return (
                <div
                  key={themeItem.rank}
                  className={
                    isBrutal
                      ? `p-4 border-2 border-black transition-all ${
                          isActiveTheme
                            ? 'bg-[#FFE500] brutal-shadow'
                            : interactiveKey
                            ? 'bg-[#FFFDF5] brutal-shadow-sm'
                            : 'bg-white'
                        }`
                      : isObsidian
                      ? `p-5 border transition-all ${
                          isActiveTheme
                            ? 'border-[#D4AF37] bg-[#14110C] brass-hairline-glow'
                            : interactiveKey
                            ? 'border-[#D4AF37]/30 obsidian-surface hover:border-[#D4AF37]/60'
                            : 'border-[#221E17] bg-[#0B0B0E]'
                        }`
                      : `p-4 rounded-lg border transition-all ${
                          isActiveTheme
                            ? 'border-amber-400/70 bg-zinc-900 shadow-md'
                            : interactiveKey
                            ? 'border-zinc-600 bg-zinc-900/50 hover:border-zinc-500'
                            : 'border-zinc-800/80 bg-zinc-950 hover:border-zinc-700'
                        }`
                  }
                >
                  <div className="flex items-center justify-between gap-2 text-xs mb-2">
                    <span
                      className={
                        isBrutal
                          ? 'font-black text-black'
                          : isObsidian
                          ? `tracking-[0.14em] uppercase font-semibold ${isActiveTheme ? 'text-[#E5C77B]' : interactiveKey ? 'text-[#F5F0E6]' : 'text-[#A39E93]'}`
                          : `font-bold ${isActiveTheme ? 'text-white' : interactiveKey ? 'text-zinc-200' : 'text-zinc-400'}`
                      }
                    >
                      #{String(themeItem.rank).padStart(2, '0')}. {themeItem.name}
                    </span>

                    {interactiveKey && (
                      <button
                        type="button"
                        onClick={() => {
                          soundEffects.playKeyClick();
                          setTheme(interactiveKey);
                        }}
                        className={
                          isBrutal
                            ? `text-[10px] px-2 py-0.5 border-2 border-black font-black tracking-wider cursor-pointer shrink-0 ${
                                isActiveTheme
                                  ? 'bg-black text-[#FFE500]'
                                  : 'bg-[#86EFAC] hover:bg-[#4ADE80] text-black brutal-btn'
                              }`
                            : isObsidian
                            ? `text-[10px] px-2.5 py-1 uppercase tracking-[0.15em] font-semibold cursor-pointer shrink-0 border transition-colors ${
                                isActiveTheme
                                  ? 'bg-[#D4AF37] text-[#070709] border-[#E5C77B]'
                                  : 'bg-[#1A1610] text-[#E5C77B] border-[#D4AF37]/40 hover:border-[#D4AF37]'
                              }`
                            : `text-[10px] px-2 py-0.5 rounded font-bold tracking-wider cursor-pointer shrink-0 border transition-colors ${
                                isActiveTheme
                                  ? 'bg-amber-400 text-zinc-950 border-amber-400'
                                  : 'bg-zinc-800 text-zinc-100 border-zinc-600 hover:bg-zinc-700'
                              }`
                        }
                      >
                        {isActiveTheme ? 'ACTIVE THEME' : 'ACTIVATE THEME'}
                      </button>
                    )}
                  </div>

                  <p className={isBrutal ? 'text-xs text-zinc-900 font-medium mb-3 leading-relaxed' : isObsidian ? 'text-xs text-[#C7C1B5] mb-3 leading-relaxed' : 'text-xs text-zinc-300 mb-3 leading-relaxed'}>
                    {themeItem.description}
                  </p>

                  <div className={isObsidian ? 'flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#8E877A]' : 'flex flex-wrap gap-1.5'}>
                    {themeItem.keyCharacteristics.map((char, i) =>
                      isObsidian ? (
                        <React.Fragment key={i}>
                          <span className={isActiveTheme ? 'text-[#D4AF37]' : ''}>{char}</span>
                          {i < themeItem.keyCharacteristics.length - 1 && <span aria-hidden="true">·</span>}
                        </React.Fragment>
                      ) : (
                        <span
                          key={i}
                          className={
                            isBrutal
                              ? `text-[10px] px-2 py-0.5 border border-black font-bold ${
                                  isActiveTheme
                                    ? 'bg-white text-black'
                                    : 'bg-[#F4F1EA] text-zinc-900'
                                }`
                              : `text-[10px] px-2 py-0.5 rounded ${
                                  isActiveTheme
                                    ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                                    : 'bg-zinc-900 text-zinc-500 border border-zinc-850'
                                }`
                          }
                        >
                          {char}
                        </span>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Theme Architecture Box */}
          <div
            className={
              isBrutal
                ? 'border-2 border-black bg-[#E0F2FE] p-5 sm:p-6 brutal-shadow'
                : isObsidian
                ? 'border border-[#D4AF37]/30 obsidian-surface p-6'
                : 'border border-zinc-800 bg-zinc-950 p-5 sm:p-6 rounded-lg'
            }
          >
            <h3
              className={
                isBrutal
                  ? 'text-sm font-black text-black tracking-tight mb-2 flex items-center gap-2'
                  : isObsidian
                  ? 'font-luxury text-xl font-semibold text-[#E5C77B] tracking-wide mb-3 flex items-center gap-2'
                  : 'text-sm font-bold text-zinc-200 tracking-wider mb-2 flex items-center gap-2'
              }
            >
              <Sparkles className={isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#D4AF37]' : 'w-4 h-4 text-amber-400'} />
              <span>
                {isBrutal
                  ? 'THEME #04 NEO-BRUTALISM SPECIFICATION'
                  : isObsidian
                  ? 'Theme #10 · Luxury Obsidian & Warm Brass Specification'
                  : 'THEME #12 MONOCHROME SPECIFICATION'}
              </span>
            </h3>
            {isBrutal ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-900 font-medium pt-2">
                <div>
                  <span className="text-black font-black block mb-1">COLOR ARCHITECTURE</span>
                  Warm archival cream canvas (#FFFDF5), pure white surfaces, hard #000 borders, and volt yellow (#FFE500) + mint (#86EFAC) accents.
                </div>
                <div>
                  <span className="text-black font-black block mb-1">TYPOGRAPHIC SYSTEM</span>
                  Bold Plus Jakarta Sans headlines paired with tabular IBM Plex Mono indices and zero-blur 4px offset drop shadows.
                </div>
                <div>
                  <span className="text-black font-black block mb-1">TACTILE INTERACTION</span>
                  Crisp physical press-down states on every button combined with procedural Web Audio clicks and chimes.
                </div>
              </div>
            ) : isObsidian ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs text-[#A39E93] pt-2">
                <div>
                  <span className="text-[#E5C77B] uppercase tracking-[0.16em] font-semibold block mb-1.5">Obsidian &amp; Brass Palette</span>
                  Pitch velvet obsidian canvas (#070709), layered obsidian card elevations (#0B0B0E–#101014), and burnished champagne brass (#D4AF37) accents.
                </div>
                <div>
                  <span className="text-[#E5C77B] uppercase tracking-[0.16em] font-semibold block mb-1.5">Editorial Typography</span>
                  Cormorant Garamond serif authority for strategic phrases paired with wide-tracked Plus Jakarta Sans micro-kickers and hairline dividers.
                </div>
                <div>
                  <span className="text-[#E5C77B] uppercase tracking-[0.16em] font-semibold block mb-1.5">Tactile Restraint</span>
                  Zero-pill metadata discipline, subtle brass hairline highlights, and calibrated Web Audio acoustic feedback.
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      )}

      {/* ================= SECTION 2: STRATEGIC REFRAMING PSYCHOLOGY ================= */}
      {activeSection === 'psychology' && (
        <div className="space-y-6">
          <div
            className={
              isBrutal
                ? 'border-2 border-black bg-[#FFE500] p-5 sm:p-6 brutal-shadow'
                : isObsidian
                ? 'border border-[#D4AF37]/30 obsidian-surface p-6 sm:p-7'
                : 'border border-zinc-800 bg-zinc-950 p-5 sm:p-6 rounded-lg'
            }
          >
            <div className="flex items-center gap-2.5 mb-2">
              <Brain className={isBrutal ? 'w-5 h-5 text-black' : isObsidian ? 'w-5 h-5 text-[#D4AF37]' : 'w-5 h-5 text-amber-400'} />
              <h2
                className={
                  isBrutal
                    ? 'text-base sm:text-lg font-black tracking-tight text-black'
                    : isObsidian
                    ? 'font-luxury text-2xl sm:text-3xl font-semibold text-[#F5F0E6]'
                    : 'text-base sm:text-lg font-bold tracking-wider text-zinc-100'
                }
              >
                The Psychology of Strategic Reframing
              </h2>
            </div>
            <p className={isBrutal ? 'text-xs text-black font-medium leading-relaxed' : isObsidian ? 'text-sm text-[#A39E93] leading-relaxed' : 'text-xs text-zinc-400 leading-relaxed'}>
              The "don't say A, say B" communication style is rooted in behavioral science and cognitive linguistics. The words you choose don't merely convey raw data—they dynamically calibrate how listeners calculate your competence, warmth, and authority, while reinforcing your own internal self-concept.
            </p>
          </div>

          {/* Pillar 1 */}
          <div
            className={
              isBrutal
                ? 'border-2 border-black bg-white p-5 brutal-shadow space-y-3'
                : isObsidian
                ? 'border border-[#2A241A] obsidian-surface p-6 space-y-3'
                : 'border border-zinc-800 bg-zinc-950 p-5 rounded-lg space-y-3'
            }
          >
            <div
              className={
                isBrutal
                  ? 'flex items-center gap-2 text-black text-sm font-black'
                  : isObsidian
                  ? 'flex items-center gap-2 text-[#E5C77B] text-xs uppercase tracking-[0.16em] font-semibold'
                  : 'flex items-center gap-2 text-zinc-200 text-sm font-bold'
              }
            >
              <Scale className={isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#D4AF37]' : 'w-4 h-4 text-zinc-400'} />
              <span>THE COMPETENCE-WARMTH TRADE-OFF (RESPONSIBILITY EXCHANGE THEORY)</span>
            </div>
            <p className={isBrutal ? 'text-xs text-zinc-900 font-medium leading-relaxed' : isObsidian ? 'text-sm text-[#DDD6C8] leading-relaxed' : 'text-xs text-zinc-300 leading-relaxed'}>
              Social psychology research shows that interpersonal judgment rests on two primary axes: <strong>Competence</strong> (capability, intelligence, authority) and <strong>Warmth</strong> (friendliness, trustworthiness, empathy). 
            </p>
            <p className={isBrutal ? 'text-xs text-zinc-900 font-medium leading-relaxed' : isObsidian ? 'text-sm text-[#DDD6C8] leading-relaxed' : 'text-xs text-zinc-300 leading-relaxed'}>
              Over-apologizing (e.g. <em>"Sorry I'm late"</em>, <em>"Sorry for the typo"</em>) trades away competence in an attempt to show warmth. It inadvertently creates a <strong>"debt mindset"</strong>, framing your very presence as an inconvenience. Strategic reframes (e.g. <em>"Thank you for waiting"</em>) break this trade-off by projecting high warmth AND high competence simultaneously.
            </p>
          </div>

          {/* Pillar 2 */}
          <div
            className={
              isBrutal
                ? 'border-2 border-black bg-white p-5 brutal-shadow space-y-3'
                : isObsidian
                ? 'border border-[#2A241A] obsidian-surface p-6 space-y-3'
                : 'border border-zinc-800 bg-zinc-950 p-5 rounded-lg space-y-3'
            }
          >
            <div
              className={
                isBrutal
                  ? 'flex items-center gap-2 text-black text-sm font-black'
                  : isObsidian
                  ? 'flex items-center gap-2 text-[#E5C77B] text-xs uppercase tracking-[0.16em] font-semibold'
                  : 'flex items-center gap-2 text-zinc-200 text-sm font-bold'
              }
            >
              <HeartHandshake className={isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#D4AF37]' : 'w-4 h-4 text-zinc-400'} />
              <span>FROM APOLOGY TO GRATITUDE (VALIDATING THE LISTENER)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className={isBrutal ? 'border-2 border-black bg-[#FFE4E6] p-3' : isObsidian ? 'border border-[#3D2225] bg-[#140D0E] p-4' : 'border border-zinc-800 bg-zinc-900/50 p-3 rounded'}>
                <div className={isBrutal ? 'text-black font-black mb-1' : isObsidian ? 'text-[#E8A5A5] uppercase tracking-[0.14em] font-semibold mb-1.5' : 'text-zinc-400 font-bold mb-1'}>THE "DANGER" APOLOGY PATTERN</div>
                <div className={isBrutal ? 'text-zinc-900 font-medium leading-relaxed' : isObsidian ? 'text-[#C7C1B5] leading-relaxed' : 'text-zinc-400 leading-relaxed'}>
                  Focuses inward on self-guilt, weakness, and embarrassment. Forces the listener into the awkward emotional labor of having to soothe you: <em>"Oh no, it's fine, don't worry about it."</em>
                </div>
              </div>
              <div className={isBrutal ? 'border-2 border-black bg-[#DCFCE7] p-3' : isObsidian ? 'border border-[#D4AF37]/35 bg-[#14110C] p-4' : 'border border-zinc-700 bg-zinc-900 p-3 rounded'}>
                <div className={isBrutal ? 'text-black font-black mb-1' : isObsidian ? 'text-[#E5C77B] uppercase tracking-[0.14em] font-semibold mb-1.5' : 'text-zinc-100 font-bold mb-1'}>THE "POWER" GRATITUDE REFRAME</div>
                <div className={isBrutal ? 'text-zinc-900 font-medium leading-relaxed' : isObsidian ? 'text-[#F5F0E6] leading-relaxed' : 'text-zinc-300 leading-relaxed'}>
                  Focuses outward on honoring the listener's patience, generosity, or diligence. Gives them credit and positive reinforcement while preserving your own professional dignity.
                </div>
              </div>
            </div>
          </div>

          {/* Pillar 3 */}
          <div
            className={
              isBrutal
                ? 'border-2 border-black bg-white p-5 brutal-shadow space-y-3'
                : isObsidian
                ? 'border border-[#2A241A] obsidian-surface p-6 space-y-3'
                : 'border border-zinc-800 bg-zinc-950 p-5 rounded-lg space-y-3'
            }
          >
            <div
              className={
                isBrutal
                  ? 'flex items-center gap-2 text-black text-sm font-black'
                  : isObsidian
                  ? 'flex items-center gap-2 text-[#E5C77B] text-xs uppercase tracking-[0.16em] font-semibold'
                  : 'flex items-center gap-2 text-zinc-200 text-sm font-bold'
              }
            >
              <ShieldCheck className={isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#D4AF37]' : 'w-4 h-4 text-zinc-400'} />
              <span>FROM PASSIVE PERMISSION-SEEKING TO DECLARATIVE OWNERSHIP</span>
            </div>
            <p className={isBrutal ? 'text-xs text-zinc-900 font-medium leading-relaxed' : isObsidian ? 'text-sm text-[#DDD6C8] leading-relaxed' : 'text-xs text-zinc-300 leading-relaxed'}>
              Hedging phrases like <em>"Can I ask a question?"</em> or <em>"I might be totally wrong, but..."</em> serve as psychological defense mechanisms against critique. However, preemptive self-undermining diminishes audience confidence before you even deliver your point. Replacing them with <em>"I have a question"</em> or <em>"Here is what the data indicates"</em> assumes your legitimate place at the decision table.
            </p>
          </div>

          {/* Pillar 4 */}
          <div
            className={
              isBrutal
                ? 'border-2 border-black bg-white p-5 brutal-shadow space-y-3'
                : isObsidian
                ? 'border border-[#2A241A] obsidian-surface p-6 space-y-3'
                : 'border border-zinc-800 bg-zinc-950 p-5 rounded-lg space-y-3'
            }
          >
            <div
              className={
                isBrutal
                  ? 'flex items-center gap-2 text-black text-sm font-black'
                  : isObsidian
                  ? 'flex items-center gap-2 text-[#E5C77B] text-xs uppercase tracking-[0.16em] font-semibold'
                  : 'flex items-center gap-2 text-zinc-200 text-sm font-bold'
              }
            >
              <CheckCircle2 className={isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#D4AF37]' : 'w-4 h-4 text-zinc-400'} />
              <span>FROM VAGUE COMMITMENT TO DEFINITIVE RELIABILITY</span>
            </div>
            <p className={isBrutal ? 'text-xs text-zinc-900 font-medium leading-relaxed' : isObsidian ? 'text-sm text-[#DDD6C8] leading-relaxed' : 'text-xs text-zinc-300 leading-relaxed'}>
              Replacing <em>"I'll try"</em> with <em>"I will"</em>, or <em>"I don't know"</em> with <em>"I'll find out for you by 3 PM"</em> converts passive uncertainty into proactive stewardship. In organizational psychology, proactive communication is the single highest predictor of perceived executive presence and leadership readiness.
            </p>
          </div>

        </div>
      )}
    </div>
  );
};
