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
    { id: 'psychology', label: '[04] THEMES & PSYCHOLOGY', badge: null },
  ] as const;

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-6">
        
        {/* Zone 1: Terminal Brand Wordmark (Monochrome with subtle amber accent indicator) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-700/70 flex items-center justify-center text-zinc-100">
            <Terminal className="w-4 h-4" />
          </div>
          <button
            onClick={() => {
              soundEffects.playKeyClick();
              onSelectTab('flashcards');
            }}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <div className="text-sm font-bold tracking-wider text-zinc-100 group-hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap font-mono">
              ARTICULATION_OS
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Active Core" />
            </div>
            <div className="text-[11px] text-zinc-400 font-mono tracking-tight whitespace-nowrap">
              STRATEGIC REFRAMING TERMINAL
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Clean monochrome unboxed styling) */}
        <nav className="hidden lg:flex items-center gap-1.5">
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
                    ? 'bg-zinc-900 text-zinc-100 border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border-transparent'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono text-amber-400 bg-amber-950/60 border border-amber-500/30">
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
                ? 'text-zinc-500 border-zinc-800 bg-zinc-900/50 hover:text-zinc-300'
                : 'text-zinc-200 border-zinc-700 bg-zinc-900 hover:border-zinc-500'
            }`}
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
            className="p-2 rounded border border-zinc-800 bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 text-xs cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">[?] KEYS</span>
          </button>

          {/* Primary Action CTA (High contrast monochrome with subtle amber focus) */}
          <button
            onClick={() => {
              soundEffects.playKeyClick();
              onSelectTab('flashcards');
            }}
            className="px-3.5 py-1.5 text-xs font-mono font-medium rounded bg-zinc-100 hover:bg-white text-zinc-950 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm whitespace-nowrap group"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold">PRACTICE DECK</span>
          </button>
        </div>

      </div>

      {/* Mobile Nav Sub-row */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-zinc-800/80 bg-zinc-950 scrollbar-none">
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
                  ? 'bg-zinc-900 text-zinc-100 border-zinc-700'
                  : 'text-zinc-400 border-zinc-800 bg-zinc-950'
              }`}
            >
              {item.label}
              {item.badge && <span className="ml-1.5 text-[9px] text-amber-400">({item.badge})</span>}
            </button>
          );
        })}
      </div>
    </header>
  );
};
