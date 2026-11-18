import React, { useState } from 'react';
import { Volume2, VolumeX, Keyboard, Terminal, Sparkles } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  currentTab: 'flashcards' | 'quiz' | 'vault' | 'psychology';
  onSelectTab: (tab: 'flashcards' | 'quiz' | 'vault' | 'psychology') => void;
  onOpenShortcuts: () => void;
  dueCount: number;
  totalCards: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenShortcuts,
  dueCount,
  totalCards,
}) => {
  const { isSlate, isClay, isSaas, isNordic, isGlass, isBrutal, isObsidian } = useTheme();
  const [isMuted, setIsMuted] = useState(soundEffects.isMuted());

  const handleToggleMute = () => {
    const next = soundEffects.toggleMute();
    setIsMuted(next);
    if (!next) soundEffects.playKeyClick();
  };

  const cleanEditorialHeader = isSlate || isObsidian || isGlass || isNordic || isSaas || isClay;

  const navItems = [
    { id: 'flashcards', label: cleanEditorialHeader ? '01. Flashcards' : '[01] FLASHCARDS', badge: dueCount > 0 ? `${dueCount} DUE` : null },
    { id: 'quiz', label: cleanEditorialHeader ? '02. Scenario Drill' : '[02] SCENARIO DRILL', badge: null },
    { id: 'vault', label: cleanEditorialHeader ? `03. Leitner Vault (${totalCards})` : `[03] LEITNER VAULT (${totalCards})`, badge: null },
    { id: 'psychology', label: cleanEditorialHeader ? '04. Themes & Psychology' : '[04] THEMES & PSYCHOLOGY', badge: null },
  ] as const;

  return (
    <header
      className={
        isSlate
          ? 'border-b border-slate-800 bg-[#0F172A]/95 sticky top-0 z-40 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.03)]'
          : isClay
          ? 'border-b border-white/80 bg-[#F4F7FF]/90 backdrop-blur-md sticky top-0 z-40 shadow-[0_8px_24px_-12px_rgba(79,92,165,0.2)]'
          : isSaas
          ? 'border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40'
          : isNordic
          ? 'border-b border-[#E4DFD4] bg-[#FDFBF7]/90 backdrop-blur-md sticky top-0 z-40'
          : isBrutal
          ? 'border-b-2 border-black bg-[#FFFDF5] sticky top-0 z-40'
          : isObsidian
          ? 'border-b border-[#2A241A] bg-[#070709]/95 backdrop-blur-md sticky top-0 z-40'
          : isGlass
          ? 'border-b border-white/15 bg-slate-950/45 backdrop-blur-2xl sticky top-0 z-40'
          : 'border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40'
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          {!cleanEditorialHeader && (
            <div
              className={
                isBrutal
                  ? 'w-9 h-9 bg-[#FFE500] border-2 border-black brutal-shadow-sm flex items-center justify-center text-black'
                  : 'w-8 h-8 rounded bg-zinc-900 border border-zinc-700/70 flex items-center justify-center text-zinc-100'
              }
            >
              <Terminal className={isBrutal ? 'w-4 h-4 stroke-[2.5]' : 'w-4 h-4'} />
            </div>
          )}
          <button
            onClick={() => {
              soundEffects.playKeyClick();
              onSelectTab('flashcards');
            }}
            className="text-left group cursor-pointer focus:outline-none"
          >
            {isSlate ? (
              <div className="text-lg font-bold tracking-tight text-slate-50 group-hover:text-teal-300 transition-colors whitespace-nowrap">
                ARTICULATION
              </div>
            ) : isClay ? (
              <div className="text-lg font-extrabold tracking-tight text-[#1E2547] group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                ARTICULATION
              </div>
            ) : isSaas ? (
              <div className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                ARTICULATION
              </div>
            ) : isNordic ? (
              <div className="text-lg font-bold tracking-tight text-[#242E28] group-hover:text-[#527360] transition-colors whitespace-nowrap">
                ARTICULATION
              </div>
            ) : isObsidian ? (
              <div className="font-luxury text-xl font-semibold tracking-[0.22em] text-[#F5F0E6] group-hover:text-[#E5C77B] transition-colors uppercase whitespace-nowrap">
                ARTICULATION
              </div>
            ) : isGlass ? (
              <div className="text-lg font-bold tracking-tight text-white group-hover:text-sky-300 transition-colors whitespace-nowrap">
                ARTICULATION
              </div>
            ) : (
              <>
                <div
                  className={
                    isBrutal
                      ? 'text-sm font-black tracking-tight text-black transition-colors flex items-center gap-1.5 whitespace-nowrap'
                      : 'text-sm font-bold tracking-wider text-zinc-100 group-hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap font-mono'
                  }
                >
                  ARTICULATION_OS
                  <span
                    className={
                      isBrutal
                        ? 'w-2 h-2 bg-black inline-block'
                        : 'w-1.5 h-1.5 rounded-full bg-amber-400'
                    }
                    title="Active Core"
                  />
                </div>
                <div
                  className={
                    isBrutal
                      ? 'text-[11px] text-zinc-700 font-bold tracking-tight whitespace-nowrap'
                      : 'text-[11px] text-zinc-400 font-mono tracking-tight whitespace-nowrap'
                  }
                >
                  STRATEGIC REFRAMING TERMINAL
                </div>
              </>
            )}
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundEffects.playKeyClick();
                  onSelectTab(item.id);
                }}
                className={
                  isSlate
                    ? `px-3 py-1.5 text-xs tracking-wide transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 border-b-2 ${
                        isActive
                          ? 'text-teal-300 border-teal-400 font-semibold'
                          : 'text-slate-400 hover:text-slate-100 border-transparent'
                      }`
                    : isClay
                    ? `px-3.5 py-1.5 text-xs tracking-wide transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 rounded-2xl ${
                        isActive
                          ? 'clay-card text-indigo-600 font-bold border border-white'
                          : 'text-[#4B5478] hover:text-[#1E2547] font-medium'
                      }`
                    : isSaas
                    ? `px-3 py-1.5 text-xs tracking-wide transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 border-b-2 ${
                        isActive
                          ? 'text-indigo-600 border-indigo-600 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 border-transparent'
                      }`
                    : isNordic
                    ? `px-3 py-1.5 text-xs tracking-wide transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 border-b-2 ${
                        isActive
                          ? 'text-[#3B5948] border-[#527360] font-semibold'
                          : 'text-[#5C6962] hover:text-[#242E28] border-transparent'
                      }`
                    : isBrutal
                    ? `px-3 py-1.5 text-xs font-extrabold tracking-tight transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border-2 border-black brutal-btn ${
                        isActive
                          ? 'bg-[#FFE500] text-black'
                          : 'bg-white text-zinc-900 hover:bg-[#FEF9C3]'
                      }`
                    : isObsidian
                    ? `px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 border-b ${
                        isActive
                          ? 'text-[#E5C77B] border-[#D4AF37] font-semibold'
                          : 'text-[#A39E93] hover:text-[#F5F0E6] border-transparent'
                      }`
                    : isGlass
                    ? `px-3 py-1.5 text-xs tracking-wide transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 border-b-2 ${
                        isActive
                          ? 'text-sky-300 border-sky-400 font-semibold'
                          : 'text-slate-300/85 hover:text-white border-transparent'
                      }`
                    : `px-3 py-1.5 text-xs font-mono tracking-wide transition-all rounded cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
                        isActive
                          ? 'bg-zinc-900 text-zinc-100 border-zinc-700 shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border-transparent'
                      }`
                }
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={
                      isSlate
                        ? 'text-[10px] text-teal-400 font-mono font-semibold tabular-nums'
                        : isClay
                        ? 'text-[10px] text-indigo-600 font-mono font-bold tabular-nums'
                        : isSaas
                        ? 'text-[10px] text-indigo-600 font-mono font-semibold tabular-nums'
                        : isNordic
                        ? 'text-[10px] text-[#527360] font-mono font-semibold tabular-nums'
                        : isBrutal
                        ? 'text-[10px] px-1.5 py-0.5 bg-black text-[#FFE500] font-black'
                        : isObsidian
                        ? 'text-[10px] text-[#D4AF37] font-mono tabular-nums'
                        : isGlass
                        ? 'text-[10px] text-sky-300 font-mono tabular-nums'
                        : 'text-[10px] px-1.5 py-0.2 rounded font-mono text-amber-400 bg-amber-950/60 border border-amber-500/30'
                    }
                  >
                    {cleanEditorialHeader ? `· ${item.badge}` : item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Audio Utility HUD */}
        <div className={`flex items-center gap-2 sm:gap-3 shrink-0 ${isSlate || isBrutal || isObsidian || isGlass || isNordic || isSaas || isClay ? 'font-sans' : 'font-mono'}`}>
          {/* Audio Synthesizer Toggle */}
          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            className={
              isSlate
                ? `px-2.5 py-1.5 rounded-lg border text-[11px] uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    isMuted
                      ? 'text-slate-400 border-slate-800 bg-[#0B1220] hover:text-slate-200'
                      : 'text-teal-300 border-slate-700/80 bg-[#1E293B] hover:border-teal-400/50'
                  }`
                : isClay
                ? `px-3 py-1.5 rounded-2xl border border-white/80 text-[11px] uppercase tracking-wider font-semibold cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap clay-btn-soft ${
                    isMuted
                      ? 'text-[#647094] clay-well'
                      : 'text-indigo-700 clay-card'
                  }`
                : isSaas
                ? `px-2.5 py-1.5 rounded-lg border text-[11px] uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    isMuted
                      ? 'text-slate-500 border-slate-200 bg-slate-50 hover:text-slate-900'
                      : 'text-indigo-700 border-indigo-200 bg-indigo-50 hover:border-indigo-300'
                  }`
                : isNordic
                ? `px-2.5 py-1.5 rounded-xl border text-[11px] uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5 ${
                    isMuted
                      ? 'text-[#6D7972] border-[#E4DFD4] bg-[#F6F3EC] hover:text-[#242E28]'
                      : 'text-[#3B5948] border-[#B8CBBF] bg-[#E7EFEA] hover:border-[#527360]'
                  }`
                : isBrutal
                ? `p-2 border-2 border-black text-xs font-extrabold cursor-pointer flex items-center gap-1.5 brutal-btn ${
                    isMuted
                      ? 'bg-[#F4F1EA] text-zinc-600'
                      : 'bg-white text-black hover:bg-[#FEF9C3]'
                  }`
                : isObsidian
                ? `px-2.5 py-1.5 border text-[11px] uppercase tracking-[0.14em] cursor-pointer transition-colors flex items-center gap-1.5 ${
                    isMuted
                      ? 'text-[#736D63] border-[#2A241A] bg-[#0B0B0E] hover:text-[#F5F0E6]'
                      : 'text-[#E5C77B] border-[#D4AF37]/35 bg-[#121216] hover:border-[#D4AF37]'
                  }`
                : isGlass
                ? `px-2.5 py-1.5 rounded-xl border text-[11px] uppercase tracking-wider cursor-pointer transition-colors backdrop-blur-md flex items-center gap-1.5 ${
                    isMuted
                      ? 'text-slate-400 border-white/10 bg-white/[0.04] hover:text-white'
                      : 'text-sky-200 border-white/20 bg-white/[0.08] hover:bg-white/[0.14] hover:border-sky-300/40'
                  }`
                : `p-2 rounded border text-xs cursor-pointer transition-colors flex items-center gap-1.5 ${
                    isMuted
                      ? 'text-zinc-500 border-zinc-800 bg-zinc-900/50 hover:text-zinc-300'
                      : 'text-zinc-200 border-zinc-700 bg-zinc-900 hover:border-zinc-500'
                  }`
            }
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[11px]">
              {isMuted ? 'MUTE' : 'AUDIO'}
            </span>
          </button>

          {/* Keyboard Shortcuts Prompt */}
          <button
            onClick={() => {
              soundEffects.playKeyClick();
              onOpenShortcuts();
            }}
            title="View keyboard commands"
            className={
              isSlate
                ? 'px-2.5 py-1.5 rounded-lg border border-slate-700/80 bg-[#1E293B] text-slate-300 hover:text-white hover:border-slate-600 text-[11px] uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap'
                : isClay
                ? 'px-3 py-1.5 rounded-2xl border border-white/80 clay-card clay-btn-soft text-[#4B5478] hover:text-[#1E2547] text-[11px] uppercase tracking-wider font-semibold cursor-pointer flex items-center gap-1.5 whitespace-nowrap'
                : isSaas
                ? 'px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 text-[11px] uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap'
                : isNordic
                ? 'px-2.5 py-1.5 rounded-xl border border-[#DDD7C8] bg-[#EFECE3] text-[#4E5A53] hover:text-[#242E28] hover:border-[#527360]/50 text-[11px] uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5'
                : isBrutal
                ? 'p-2 border-2 border-black bg-white text-black hover:bg-[#FEF9C3] text-xs font-extrabold cursor-pointer flex items-center gap-1.5 brutal-btn'
                : isObsidian
                ? 'px-2.5 py-1.5 border border-[#2A241A] bg-[#0B0B0E] text-[#A39E93] hover:text-[#F5F0E6] hover:border-[#D4AF37]/40 text-[11px] uppercase tracking-[0.14em] cursor-pointer transition-colors flex items-center gap-1.5'
                : isGlass
                ? 'px-2.5 py-1.5 rounded-xl border border-white/15 bg-white/[0.06] text-slate-200 hover:text-white hover:bg-white/[0.12] hover:border-white/25 text-[11px] uppercase tracking-wider cursor-pointer transition-colors backdrop-blur-md flex items-center gap-1.5'
                : 'p-2 rounded border border-zinc-800 bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 text-xs cursor-pointer transition-colors flex items-center gap-1.5'
            }
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">{cleanEditorialHeader ? 'KEYS' : '[?] KEYS'}</span>
          </button>

          {/* Primary Action CTA */}
          <button
            onClick={() => {
              soundEffects.playKeyClick();
              onSelectTab('flashcards');
            }}
            className={
              isSlate
                ? 'px-4 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider bg-teal-400 hover:bg-teal-300 text-slate-950 border border-teal-300 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0'
                : isClay
                ? 'px-4 py-1.5 rounded-2xl text-[11px] font-bold uppercase tracking-wider bg-indigo-500 hover:bg-indigo-600 text-white border border-indigo-400 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 clay-btn'
                : isSaas
                ? 'px-4 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0'
                : isNordic
                ? 'px-4 py-1.5 rounded-xl text-[11px] font-semibold uppercase tracking-wider bg-[#527360] hover:bg-[#425F4E] text-[#FDFBF7] border border-[#425F4E] transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap'
                : isBrutal
                ? 'px-3.5 py-1.5 text-xs font-black bg-[#86EFAC] hover:bg-[#4ADE80] text-black border-2 border-black flex items-center gap-1.5 cursor-pointer whitespace-nowrap brutal-btn'
                : isObsidian
                ? 'px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] bg-[#D4AF37] hover:bg-[#E5C77B] text-[#070709] border border-[#E5C77B] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap'
                : isGlass
                ? 'px-4 py-1.5 rounded-xl text-[11px] font-semibold uppercase tracking-wider bg-sky-400 hover:bg-sky-300 text-slate-950 border border-sky-300 transition-colors shadow-lg shadow-sky-500/20 flex items-center gap-1.5 cursor-pointer whitespace-nowrap'
                : 'px-3.5 py-1.5 text-xs font-mono font-medium rounded bg-zinc-100 hover:bg-white text-zinc-950 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap group'
            }
          >
            <Sparkles className={isSlate ? 'w-3.5 h-3.5 text-slate-950' : isClay || isSaas ? 'w-3.5 h-3.5 text-white' : isNordic ? 'w-3.5 h-3.5 text-[#FDFBF7]' : isBrutal ? 'w-3.5 h-3.5 text-black' : isObsidian ? 'w-3.5 h-3.5 text-[#070709]' : isGlass ? 'w-3.5 h-3.5 text-slate-950' : 'w-3.5 h-3.5 text-amber-500'} />
            <span className={isBrutal ? 'font-black' : 'font-semibold'}>PRACTICE DECK</span>
          </button>
        </div>

      </div>

      {/* Mobile Nav Sub-row */}
      <div
        className={
          isSlate
            ? 'lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-slate-800 bg-[#0B1220] scrollbar-none'
            : isClay
            ? 'lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-white/70 bg-[#EEF2FA] scrollbar-none'
            : isSaas
            ? 'lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-slate-200 bg-slate-50 scrollbar-none'
            : isNordic
            ? 'lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-[#E4DFD4] bg-[#F6F3EC] scrollbar-none'
            : isBrutal
            ? 'lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t-2 border-black bg-[#FFFDF5] scrollbar-none'
            : isObsidian
            ? 'lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-[#2A241A] bg-[#070709] scrollbar-none'
            : isGlass
            ? 'lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-white/12 bg-slate-950/35 backdrop-blur-xl scrollbar-none'
            : 'lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-zinc-800/80 bg-zinc-950 scrollbar-none'
        }
      >
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                soundEffects.playKeyClick();
                onSelectTab(item.id);
              }}
              className={
                isSlate
                  ? `px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap border transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-teal-400/15 text-teal-300 border-teal-400/50 font-semibold'
                        : 'text-slate-300 border-slate-800 bg-[#1E293B]'
                    }`
                  : isClay
                  ? `px-3 py-1 rounded-xl text-[11px] whitespace-nowrap border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-500 text-white border-indigo-400 font-bold clay-btn'
                        : 'text-[#4B5478] border-white/80 clay-card font-medium'
                    }`
                  : isSaas
                  ? `px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap border transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold'
                        : 'text-slate-600 border-slate-200 bg-white'
                    }`
                  : isNordic
                  ? `px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap border transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#E7EFEA] text-[#2D4739] border-[#527360]/50 font-semibold'
                        : 'text-[#4E5A53] border-[#E4DFD4] bg-[#FDFBF7]'
                    }`
                  : isBrutal
                  ? `px-2.5 py-1 text-[11px] font-extrabold whitespace-nowrap border-2 border-black transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#FFE500] text-black brutal-shadow-sm'
                        : 'bg-white text-zinc-900'
                    }`
                  : isObsidian
                  ? `px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] whitespace-nowrap border transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#1A1610] text-[#E5C77B] border-[#D4AF37]/60'
                        : 'text-[#A39E93] border-[#2A241A] bg-[#0B0B0E]'
                    }`
                  : isGlass
                  ? `px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap border transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-sky-400/20 text-sky-200 border-sky-300/50 font-semibold'
                        : 'text-slate-300 border-white/15 bg-white/[0.05]'
                    }`
                  : `px-2.5 py-1 text-[11px] font-mono whitespace-nowrap rounded border transition-colors ${
                      isActive
                        ? 'bg-zinc-900 text-zinc-100 border-zinc-700'
                        : 'text-zinc-400 border-zinc-800 bg-zinc-950'
                    }`
              }
            >
              {item.label}
              {item.badge && (
                <span className={isSlate ? 'ml-1.5 text-[9px] text-teal-400 font-semibold' : isClay ? 'ml-1.5 text-[9px] font-bold opacity-90' : isSaas ? 'ml-1.5 text-[9px] text-indigo-600 font-semibold' : isNordic ? 'ml-1.5 text-[9px] text-[#527360] font-semibold' : isBrutal ? 'ml-1.5 text-[9px] bg-black text-[#FFE500] px-1' : isObsidian ? 'ml-1.5 text-[9px] text-[#D4AF37]' : isGlass ? 'ml-1.5 text-[9px] text-sky-300' : 'ml-1.5 text-[9px] text-amber-400'}>
                  ({item.badge})
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
