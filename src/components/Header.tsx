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
  const { isBrutal, isObsidian } = useTheme();
  const [isMuted, setIsMuted] = useState(soundEffects.isMuted());

  const handleToggleMute = () => {
    const next = soundEffects.toggleMute();
    setIsMuted(next);
    if (!next) soundEffects.playKeyClick();
  };

  const navItems = [
    { id: 'flashcards', label: isObsidian ? '01. Flashcards' : '[01] FLASHCARDS', badge: dueCount > 0 ? `${dueCount} DUE` : null },
    { id: 'quiz', label: isObsidian ? '02. Scenario Drill' : '[02] SCENARIO DRILL', badge: null },
    { id: 'vault', label: isObsidian ? `03. Leitner Vault (${totalCards})` : `[03] LEITNER VAULT (${totalCards})`, badge: null },
    { id: 'psychology', label: isObsidian ? '04. Themes & Psychology' : '[04] THEMES & PSYCHOLOGY', badge: null },
  ] as const;

  return (
    <header
      className={
        isBrutal
          ? 'border-b-2 border-black bg-[#FFFDF5] sticky top-0 z-40'
          : isObsidian
          ? 'border-b border-[#2A241A] bg-[#070709]/95 backdrop-blur-md sticky top-0 z-40'
          : 'border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40'
      }
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          {!isObsidian && (
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
            {isObsidian ? (
              <div className="font-luxury text-xl font-semibold tracking-[0.22em] text-[#F5F0E6] group-hover:text-[#E5C77B] transition-colors uppercase whitespace-nowrap">
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
                  isBrutal
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
                      isBrutal
                        ? 'text-[10px] px-1.5 py-0.5 bg-black text-[#FFE500] font-black'
                        : isObsidian
                        ? 'text-[10px] text-[#D4AF37] font-mono tabular-nums'
                        : 'text-[10px] px-1.5 py-0.2 rounded font-mono text-amber-400 bg-amber-950/60 border border-amber-500/30'
                    }
                  >
                    {isObsidian ? `· ${item.badge}` : item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Audio Utility HUD */}
        <div className={`flex items-center gap-2 sm:gap-3 shrink-0 ${isBrutal || isObsidian ? 'font-sans' : 'font-mono'}`}>
          {/* Audio Synthesizer Toggle */}
          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            className={
              isBrutal
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
              isBrutal
                ? 'p-2 border-2 border-black bg-white text-black hover:bg-[#FEF9C3] text-xs font-extrabold cursor-pointer flex items-center gap-1.5 brutal-btn'
                : isObsidian
                ? 'px-2.5 py-1.5 border border-[#2A241A] bg-[#0B0B0E] text-[#A39E93] hover:text-[#F5F0E6] hover:border-[#D4AF37]/40 text-[11px] uppercase tracking-[0.14em] cursor-pointer transition-colors flex items-center gap-1.5'
                : 'p-2 rounded border border-zinc-800 bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 text-xs cursor-pointer transition-colors flex items-center gap-1.5'
            }
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">{isObsidian ? 'KEYS' : '[?] KEYS'}</span>
          </button>

          {/* Primary Action CTA */}
          <button
            onClick={() => {
              soundEffects.playKeyClick();
              onSelectTab('flashcards');
            }}
            className={
              isBrutal
                ? 'px-3.5 py-1.5 text-xs font-black bg-[#86EFAC] hover:bg-[#4ADE80] text-black border-2 border-black flex items-center gap-1.5 cursor-pointer whitespace-nowrap brutal-btn'
                : isObsidian
                ? 'px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] bg-[#D4AF37] hover:bg-[#E5C77B] text-[#070709] border border-[#E5C77B] transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap'
                : 'px-3.5 py-1.5 text-xs font-mono font-medium rounded bg-zinc-100 hover:bg-white text-zinc-950 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap group'
            }
          >
            <Sparkles className={isBrutal ? 'w-3.5 h-3.5 text-black' : isObsidian ? 'w-3.5 h-3.5 text-[#070709]' : 'w-3.5 h-3.5 text-amber-500'} />
            <span className={isBrutal ? 'font-black' : 'font-semibold'}>PRACTICE DECK</span>
          </button>
        </div>

      </div>

      {/* Mobile Nav Sub-row */}
      <div
        className={
          isBrutal
            ? 'lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t-2 border-black bg-[#FFFDF5] scrollbar-none'
            : isObsidian
            ? 'lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-[#2A241A] bg-[#070709] scrollbar-none'
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
                isBrutal
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
                  : `px-2.5 py-1 text-[11px] font-mono whitespace-nowrap rounded border transition-colors ${
                      isActive
                        ? 'bg-zinc-900 text-zinc-100 border-zinc-700'
                        : 'text-zinc-400 border-zinc-800 bg-zinc-950'
                    }`
              }
            >
              {item.label}
              {item.badge && (
                <span className={isBrutal ? 'ml-1.5 text-[9px] bg-black text-[#FFE500] px-1' : isObsidian ? 'ml-1.5 text-[9px] text-[#D4AF37]' : 'ml-1.5 text-[9px] text-amber-400'}>
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
