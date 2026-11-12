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
      <div className="bg-zinc-950 border border-zinc-750 rounded-lg max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-100 tracking-wider">
            <Keyboard className="w-4 h-4 text-amber-400" />
            <span>TERMINAL COMMAND SHORTCUTS</span>
          </div>
          <button
            onClick={() => {
              soundEffects.playKeyClick();
              onClose();
            }}
            className="text-zinc-500 hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5 text-xs mb-6">
          <div className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800">
            <span className="text-zinc-300">Flip Flashcard (Front / Back)</span>
            <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-100 border border-zinc-700 font-bold">
              SPACE
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800">
            <span className="text-zinc-300">Rate: AGAIN (Reset to Box 1)</span>
            <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-100 border border-zinc-700 font-bold">
              1
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800">
            <span className="text-zinc-300">Rate: HARD (Maintain Box)</span>
            <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-100 border border-zinc-700 font-bold">
              2
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800">
            <span className="text-zinc-300">Rate: GOOD (Advance Box +1)</span>
            <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-100 border border-zinc-700 font-bold">
              3
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800">
            <span className="text-zinc-300">Rate: EASY (Advance Box +2)</span>
            <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-100 border border-zinc-700 font-bold">
              4
            </kbd>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800">
            <span className="text-zinc-300">Speak Power Reframe (Audio TTS)</span>
            <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-100 border border-zinc-700 font-bold">
              A
            </kbd>
          </div>
        </div>

        <button
          onClick={() => {
            soundEffects.playKeyClick();
            onClose();
          }}
          className="w-full py-2 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs cursor-pointer shadow-sm"
        >
          CLOSE [ESC]
        </button>
      </div>
    </div>
  );
};
