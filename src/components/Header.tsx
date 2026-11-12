import React, { useState } from 'react';
import { Volume2, VolumeX, Keyboard, Terminal, Sparkles } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

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
  const [isMuted, setIsMuted] = useState(soundEffects.isMuted());

  const handleToggleMute = () => {
    const next = soundEffects.toggleMute();
    setIsMuted(next);
    if (!next) soundEffects.playKeyClick();
  };

  const navItems = [
    { id: 'flashcards', label: '[01] FLASHCARDS', badge: dueCount > 0 ? `${dueCount} DUE` : null },
    { id: 'quiz', label: '[02] SCENARIO DRILL', badge: null },
    { id: 'vault', label: `[03] LEITNER VAULT (${totalCards})`, badge: null },
    { id: 'psychology', label: '[04] THEMES & PSYCHOLOGY', badge: 'THEME #12' },
  ] as const;

  return (
    <header className="border-b border-[#1c2c22] bg-[#090f0c]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-6">
        
        {/* Zone 1: Terminal Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded bg-[#102419] border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Terminal className="w-4 h-4" />
          </div>
          <button
            onClick={() => {
              soundEffects.playKeyClick();
              onSelectTab('flashcards');
            }}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <div className="text-sm font-bold tracking-wider text-emerald-400 group-hover:text-emerald-300 transition-colors flex items-center gap-1.5 whitespace-nowrap font-mono glow-emerald">
              ARTICULATION_OS
              <span className="text-xs text-emerald-600/80 font-normal">v1.2</span>
            </div>
            <div className="text-[11px] text-[#71857a] font-mono tracking-tight whitespace-nowrap">
              STRATEGIC REFRAMING TERMINAL
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single-line, unboxed typography) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundEffects.playKeyClick();
                  onSelectTab(item.id);
                }}
                className={`px-3 py-1.5 text-xs font-mono tracking-wide transition-all rounded cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
                  isActive
                    ? 'bg-[#122219] text-emerald-300 border-emerald-500/50 glow-box-emerald shadow-sm'
                    : 'text-[#87998e] hover:text-emerald-400 hover:bg-[#0e1713] border-transparent'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                    isActive ? 'text-emerald-400 bg-emerald-950/70 border border-emerald-500/30' : 'text-[#758a7e] bg-[#121c17]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Audio Utility HUD */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 font-mono">
          {/* Audio Synthesizer Toggle */}
          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            className={`p-2 rounded border text-xs cursor-pointer transition-colors flex items-center gap-1.5 ${
              isMuted
                ? 'text-[#64746b] border-[#1d2922] bg-[#0c120f] hover:text-emerald-400'
                : 'text-emerald-400 border-emerald-500/40 bg-[#102118] hover:border-emerald-400'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[11px]">
              {isMuted ? 'AUDIO: OFF' : 'AUDIO: ON'}
            </span>
          </button>

          {/* Keyboard Shortcuts Prompt */}
          <button
            onClick={() => {
              soundEffects.playKeyClick();
              onOpenShortcuts();
            }}
            title="View keyboard commands"
            className="p-2 rounded border border-[#1e2e25] bg-[#0c1310] text-[#8ea396] hover:text-emerald-300 hover:border-emerald-500/40 text-xs cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">[?] KEYS</span>
          </button>

          {/* Quick Study / Review Due CTA */}
          <button
            onClick={() => {
              soundEffects.playKeyClick();
              onSelectTab('flashcards');
            }}
            className="px-3 py-1.5 text-xs font-mono font-medium rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm glow-box-emerald whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>PRACTICE DECK</span>
          </button>
        </div>

      </div>

      {/* Mobile Nav Sub-row */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-[#15221b] bg-[#080d0a] scrollbar-none">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                soundEffects.playKeyClick();
                onSelectTab(item.id);
              }}
              className={`px-2.5 py-1 text-[11px] font-mono whitespace-nowrap rounded border transition-colors ${
                isActive
                  ? 'bg-[#102219] text-emerald-300 border-emerald-500/40'
                  : 'text-[#7d9185] border-[#18261e] bg-[#0a100d]'
              }`}
            >
              {item.label}
              {item.badge && <span className="ml-1.5 text-[9px] text-emerald-400">({item.badge})</span>}
            </button>
          );
        })}
      </div>
    </header>
  );
};
