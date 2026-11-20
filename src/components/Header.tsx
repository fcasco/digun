import React from 'react';
import { Settings, Keyboard, Terminal, Sparkles } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  currentTab: 'flashcards' | 'quiz' | 'vault' | 'psychology';
  onSelectTab: (tab: 'flashcards' | 'quiz' | 'vault' | 'psychology') => void;
  onOpenShortcuts: () => void;
  onOpenSettings: () => void;
  dueCount: number;
  totalCards: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenShortcuts,
  onOpenSettings,
  dueCount,
  totalCards,
}) => {
  const { isSkeuomorphic, isCyberpunk, isMaterial, isEditorial, isSlate, isClay, isSaas, isNordic, isGlass, isBrutal, isObsidian } = useTheme();

  const cleanEditorialHeader = isSkeuomorphic || isCyberpunk || isMaterial || isEditorial || isSlate || isObsidian || isGlass || isNordic || isSaas || isClay;

  const navItems = [
    { id: 'flashcards', label: cleanEditorialHeader ? '01. Flashcards' : '[01] FLASHCARDS', badge: dueCount > 0 ? `${dueCount} DUE` : null },
    { id: 'quiz', label: cleanEditorialHeader ? '02. Scenario Drill' : '[02] SCENARIO DRILL', badge: null },
    { id: 'vault', label: cleanEditorialHeader ? `03. Leitner Vault (${totalCards})` : `[03] LEITNER VAULT (${totalCards})`, badge: null },
    { id: 'psychology', label: cleanEditorialHeader ? '04. Psychology' : '[04] PSYCHOLOGY', badge: null },
  ] as const;

  return (
    <header
      className={
        isSkeuomorphic
          ? 'border-b-2 border-[#160B05] skeuo-leather sticky top-0 z-40'
          : isCyberpunk
          ? 'border-b border-cyan-400/35 bg-[#070A1B]/92 backdrop-blur-md sticky top-0 z-40 shadow-[0_6px_30px_-10px_rgba(0,240,255,0.32)]'
          : isMaterial
          ? 'bg-[#1565C0] text-white sticky top-0 z-40 shadow-[0_3px_8px_rgba(15,23,42,0.22)]'
          : isEditorial
          ? 'border-b-2 border-[#1D1814] bg-[#FAF5EA]/95 backdrop-blur-xs sticky top-0 z-40'
          : isSlate
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
            {isSkeuomorphic ? (
              <div className="font-editorial-display text-xl font-bold tracking-[0.08em] text-[#F5ECD8] drop-shadow-[0_1px_1px_rgba(0,0,0,0.85)] group-hover:text-[#E8C978] transition-colors uppercase whitespace-nowrap">
                ARTICULATION
              </div>
            ) : isCyberpunk ? (
              <div className="font-cyber text-xl font-bold tracking-[0.14em] bg-gradient-to-r from-[#00F0FF] via-[#A5F3FC] to-[#FF2A85] bg-clip-text text-transparent group-hover:brightness-110 transition-all uppercase whitespace-nowrap">
                ARTICULATION
              </div>
            ) : isMaterial ? (
              <div className="font-material text-xl font-bold tracking-tight text-white group-hover:text-[#E3F2FD] transition-colors whitespace-nowrap">
                ARTICULATION
              </div>
            ) : isEditorial ? (
              <div className="font-editorial-display text-2xl font-extrabold tracking-tight text-[#1D1814] group-hover:text-[#9B2226] transition-colors whitespace-nowrap">
                ARTICULATION
              </div>
            ) : isSlate ? (
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
                  isSkeuomorphic
                    ? `px-3 py-1.5 text-xs tracking-wide transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 rounded-md border ${
                        isActive
                          ? 'skeuo-brass-btn border-[#7A5915] font-bold'
                          : 'text-[#E6D6B8] hover:text-[#FFF8EA] border-transparent hover:bg-[#3A2215]/75 font-medium'
                      }`
                    : isCyberpunk
                    ? `px-3 py-1.5 text-xs font-cyber uppercase tracking-[0.08em] transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border-b-2 ${
                        isActive
                          ? 'text-[#00F0FF] border-[#00F0FF] font-bold drop-shadow-[0_0_8px_rgba(0,240,255,0.65)]'
                          : 'text-slate-300 hover:text-[#00F0FF] border-transparent font-medium'
                      }`
                    : isMaterial
                    ? `px-3 py-1.5 text-xs tracking-wide transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 border-b-2 font-material ${
                        isActive
                          ? 'text-white border-white font-bold'
                          : 'text-[#DBEAFE] hover:text-white border-transparent font-medium'
                      }`
                    : isEditorial
                    ? `px-3 py-1.5 text-xs tracking-wide transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 border-b-2 font-editorial-body ${
                        isActive
                          ? 'text-[#9B2226] border-[#9B2226] font-bold'
                          : 'text-[#574D42] hover:text-[#1D1814] border-transparent font-medium'
                      }`
                    : isSlate
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
                      isSkeuomorphic
                        ? `text-[10px] font-mono font-bold tabular-nums ${isActive ? 'text-[#2C180E]' : 'text-[#E8C978]'}`
                        : isCyberpunk
                        ? 'text-[10px] text-[#FF4DA6] font-mono font-bold tabular-nums'
                        : isMaterial
                        ? 'text-[10px] text-[#E0F2FE] font-mono font-semibold tabular-nums'
                        : isEditorial
                        ? 'text-[10px] text-[#9B2226] font-mono font-semibold tabular-nums'
                        : isSlate
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

        {/* Zone 3: Primary Action & Settings Utility */}
        <div className={`flex items-center gap-2 sm:gap-3 shrink-0 ${isMaterial ? 'font-material' : isEditorial ? 'font-editorial-body' : isSkeuomorphic || isCyberpunk || isSlate || isBrutal || isObsidian || isGlass || isNordic || isSaas || isClay ? 'font-sans' : 'font-mono'}`}>
          {/* Settings Menu Trigger (Theme Selection & Audio Options) */}
          <button
            type="button"
            onClick={() => {
              soundEffects.playKeyClick();
              onOpenSettings();
            }}
            title="Open Settings (Themes & Audio)"
            className={
              isSkeuomorphic
                ? 'px-2.5 py-1.5 rounded-md border border-[#6B462B] skeuo-leather-btn text-[#E8C978] hover:text-[#FFE39A] hover:border-[#C89E3A]/60 text-[11px] uppercase tracking-wider font-semibold cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap'
                : isCyberpunk
                ? 'px-2.5 py-1.5 rounded-sm border border-cyan-400/45 bg-[#0C1532] text-[#00F0FF] hover:border-[#00F0FF] shadow-[0_0_14px_-6px_rgba(0,240,255,0.45)] text-[11px] font-cyber uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap'
                : isMaterial
                ? 'px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-semibold uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap'
                : isEditorial
                ? 'px-2.5 py-1.5 rounded-none border border-[#1D1814]/45 bg-[#FFFDF7] text-[#9B2226] hover:text-[#1D1814] hover:border-[#1D1814] text-[11px] uppercase tracking-[0.12em] cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap'
                : isSlate
                ? 'px-2.5 py-1.5 rounded-lg border border-slate-700/80 bg-[#1E293B] text-teal-300 hover:border-teal-400/50 text-[11px] uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap'
                : isClay
                ? 'px-3 py-1.5 rounded-2xl border border-white/80 clay-card clay-btn-soft text-indigo-700 text-[11px] uppercase tracking-wider font-semibold cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap'
                : isSaas
                ? 'px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:border-indigo-300 text-[11px] uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap'
                : isNordic
                ? 'px-2.5 py-1.5 rounded-xl border border-[#B8CBBF] bg-[#E7EFEA] text-[#3B5948] hover:border-[#527360] text-[11px] uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap'
                : isBrutal
                ? 'p-2 border-2 border-black bg-white hover:bg-[#FEF9C3] text-black text-xs font-extrabold cursor-pointer flex items-center gap-1.5 brutal-btn whitespace-nowrap'
                : isObsidian
                ? 'px-2.5 py-1.5 border border-[#D4AF37]/35 bg-[#121216] text-[#E5C77B] hover:border-[#D4AF37] text-[11px] uppercase tracking-[0.14em] cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap'
                : isGlass
                ? 'px-2.5 py-1.5 rounded-xl border border-white/20 bg-white/[0.08] hover:bg-white/[0.14] text-sky-200 hover:border-sky-300/40 text-[11px] uppercase tracking-wider cursor-pointer transition-colors backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap'
                : 'p-2 rounded border border-zinc-700 bg-zinc-900 hover:border-zinc-500 text-zinc-200 text-xs cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap'
            }
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">SETTINGS</span>
          </button>

          {/* Keyboard Shortcuts Prompt */}
          <button
            onClick={() => {
              soundEffects.playKeyClick();
              onOpenShortcuts();
            }}
            title="View keyboard commands"
            className={
              isSkeuomorphic
                ? 'px-2.5 py-1.5 rounded-md border border-[#6B462B] skeuo-leather-btn text-[#E6D6B8] hover:text-[#FFE39A] hover:border-[#C89E3A]/60 text-[11px] uppercase tracking-wider font-semibold cursor-pointer flex items-center gap-1.5 whitespace-nowrap'
                : isCyberpunk
                ? 'px-2.5 py-1.5 rounded-sm border border-cyan-400/35 bg-[#0C1532] text-cyan-200 hover:text-[#00F0FF] hover:border-[#00F0FF] text-[11px] font-cyber uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap'
                : isMaterial
                ? 'px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-semibold uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap'
                : isEditorial
                ? 'px-2.5 py-1.5 rounded-none border border-[#1D1814]/45 bg-[#FFFDF7] text-[#433A31] hover:text-[#1D1814] hover:border-[#1D1814] text-[11px] uppercase tracking-[0.12em] cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap'
                : isSlate
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
              isSkeuomorphic
                ? 'px-4 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider skeuo-brass-btn border border-[#7A5915] flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0'
                : isCyberpunk
                ? 'px-4 py-1.5 rounded-sm text-[11px] font-cyber font-bold uppercase tracking-[0.1em] bg-gradient-to-r from-[#00F0FF] to-[#FF2A85] text-[#060714] border border-cyan-200/80 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 cyber-btn'
                : isMaterial
                ? 'px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-white hover:bg-[#F8FAFC] text-[#1565C0] flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 material-btn'
                : isEditorial
                ? 'px-4 py-1.5 rounded-none text-[11px] font-semibold uppercase tracking-[0.14em] bg-[#9B2226] hover:bg-[#7F1D1D] text-[#FAF5EA] border border-[#1D1814] transition-colors shadow-[2px_2px_0_#1D1814] flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0'
                : isSlate
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
            <Sparkles className={isSkeuomorphic ? 'w-3.5 h-3.5 text-[#1F1209]' : isCyberpunk ? 'w-3.5 h-3.5 text-[#060714]' : isMaterial ? 'w-3.5 h-3.5 text-[#1565C0]' : isEditorial ? 'w-3.5 h-3.5 text-[#FAF5EA]' : isSlate ? 'w-3.5 h-3.5 text-slate-950' : isClay || isSaas ? 'w-3.5 h-3.5 text-white' : isNordic ? 'w-3.5 h-3.5 text-[#FDFBF7]' : isBrutal ? 'w-3.5 h-3.5 text-black' : isObsidian ? 'w-3.5 h-3.5 text-[#070709]' : isGlass ? 'w-3.5 h-3.5 text-slate-950' : 'w-3.5 h-3.5 text-amber-500'} />
            <span className={isBrutal ? 'font-black' : 'font-semibold'}>PRACTICE DECK</span>
          </button>
        </div>

      </div>

      {/* Mobile Nav Sub-row */}
      <div
        className={
          isSkeuomorphic
            ? 'lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-[#4E3020] bg-[#24140C] scrollbar-none'
            : isCyberpunk
            ? 'lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-cyan-400/25 bg-[#070A1B] scrollbar-none'
            : isMaterial
            ? 'lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-white/15 bg-[#1976D2] scrollbar-none'
            : isEditorial
            ? 'lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-[#C9BFA9] bg-[#F3ECE0] scrollbar-none'
            : isSlate
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
                isSkeuomorphic
                  ? `px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap border transition-all cursor-pointer ${
                      isActive
                        ? 'skeuo-brass-btn border-[#7A5915] font-bold'
                        : 'skeuo-leather-btn border-[#5B3926] text-[#E6D6B8] font-medium'
                    }`
                  : isCyberpunk
                  ? `px-2.5 py-1 rounded-sm text-[11px] font-cyber uppercase tracking-wider whitespace-nowrap border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF] font-bold shadow-[0_0_12px_-3px_rgba(0,240,255,0.6)]'
                        : 'text-slate-300 border-cyan-400/25 bg-[#0C122B]'
                    }`
                  : isMaterial
                  ? `px-3 py-1 rounded-md text-[11px] whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-[#1565C0] font-bold shadow-xs'
                        : 'text-[#DBEAFE] bg-white/10 hover:bg-white/20 font-medium'
                    }`
                  : isEditorial
                  ? `px-2.5 py-1 rounded-none text-[11px] whitespace-nowrap border transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#9B2226] text-[#FAF5EA] border-[#1D1814] font-semibold'
                        : 'text-[#433A31] border-[#C9BFA9] bg-[#FAF5EA]'
                    }`
                  : isSlate
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
                <span className={isSkeuomorphic ? `ml-1.5 text-[9px] font-mono font-bold ${isActive ? 'text-[#2C180E]' : 'text-[#E8C978]'}` : isCyberpunk ? 'ml-1.5 text-[9px] text-[#FF4DA6] font-mono font-bold' : isMaterial ? 'ml-1.5 text-[9px] font-mono font-bold' : isEditorial ? 'ml-1.5 text-[9px] font-mono font-semibold' : isSlate ? 'ml-1.5 text-[9px] text-teal-400 font-semibold' : isClay ? 'ml-1.5 text-[9px] font-bold opacity-90' : isSaas ? 'ml-1.5 text-[9px] text-indigo-600 font-semibold' : isNordic ? 'ml-1.5 text-[9px] text-[#527360] font-semibold' : isBrutal ? 'ml-1.5 text-[9px] bg-black text-[#FFE500] px-1' : isObsidian ? 'ml-1.5 text-[9px] text-[#D4AF37]' : isGlass ? 'ml-1.5 text-[9px] text-sky-300' : 'ml-1.5 text-[9px] text-amber-400'}>
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
