import React from 'react';
import { Keyboard, X } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
      <div className="bg-[#0b1510] border border-emerald-500/50 rounded-lg max-w-md w-full p-6 shadow-2xl glow-box-emerald">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1b2e23]">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-400 tracking-wider">
            <Keyboard className="w-4 h-4" />
            <span>TERMINAL COMMAND SHORTCUTS</span>
          </div>
          <button
            onClick={() => {
              soundEffects.playKeyClick();
              onClose();
            }}
            className="text-[#6d8375] hover:text-emerald-400 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs mb-6">
          <div className="flex items-center justify-between p-2 rounded bg-[#070d0a] border border-[#192a20]">
            <span className="text-[#9cb5a6]">Flip Flashcard (Front / Back)</span>
            <kbd className="px-2 py-0.5 rounded bg-[#13241b] text-emerald-300 border border-emerald-500/40 font-bold">
              SPACE
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-[#070d0a] border border-[#192a20]">
            <span className="text-rose-300">Rate: AGAIN (Reset to Box 1)</span>
            <kbd className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
              1
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-[#070d0a] border border-[#192a20]">
            <span className="text-amber-300">Rate: HARD (Maintain Box)</span>
            <kbd className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
              2
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-[#070d0a] border border-[#192a20]">
            <span className="text-emerald-300">Rate: GOOD (Advance Box +1)</span>
            <kbd className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              3
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-[#070d0a] border border-[#192a20]">
            <span className="text-sky-300">Rate: EASY (Advance Box +2)</span>
            <kbd className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold">
              4
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-[#070d0a] border border-[#192a20]">
            <span className="text-[#9cb5a6]">Speak Power Reframe (Audio TTS)</span>
            <kbd className="px-2 py-0.5 rounded bg-[#13241b] text-emerald-300 border border-emerald-500/40 font-bold">
              A
            </kbd>
          </div>
        </div>

        <button
          onClick={() => {
            soundEffects.playKeyClick();
            onClose();
          }}
          className="w-full py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs glow-box-emerald cursor-pointer"
        >
          CLOSE [ESC]
        </button>
      </div>
    </div>
  );
};
