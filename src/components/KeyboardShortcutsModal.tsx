import React from 'react';
import { Keyboard, X } from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';
import { useTheme } from '../context/ThemeContext';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  const { isBrutal, isObsidian } = useTheme();
  if (!isOpen) return null;

  const shortcuts = [
    { label: 'Flip Flashcard (Front / Back)', key: 'SPACE' },
    { label: 'Rate: AGAIN (Reset to Box 1)', key: '1' },
    { label: 'Rate: HARD (Maintain Box)', key: '2' },
    { label: 'Rate: GOOD (Advance Box +1)', key: '3' },
    { label: 'Rate: EASY (Advance Box +2)', key: '4' },
    { label: 'Speak Active Phrase (Audio TTS)', key: 'A' },
  ];

  return (
    <div className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 ${isBrutal || isObsidian ? 'font-sans' : 'font-mono'}`}>
      <div
        className={
          isBrutal
            ? 'bg-[#FFFDF5] border-2 border-black max-w-md w-full p-6 brutal-shadow-lg'
            : isObsidian
            ? 'obsidian-surface border border-[#D4AF37]/30 max-w-md w-full p-6'
            : 'bg-zinc-950 border border-zinc-750 rounded-lg max-w-md w-full p-6 shadow-2xl'
        }
      >
        <div
          className={`flex items-center justify-between mb-4 pb-3 ${
            isBrutal ? 'border-b-2 border-black' : isObsidian ? 'border-b border-[#2A241A]' : 'border-b border-zinc-800'
          }`}
        >
          <div
            className={
              isBrutal
                ? 'flex items-center gap-2 text-sm font-black text-black tracking-tight'
                : isObsidian
                ? 'flex items-center gap-2 font-luxury text-lg font-semibold tracking-[0.14em] uppercase text-[#F5F0E6]'
                : 'flex items-center gap-2 text-sm font-bold text-zinc-100 tracking-wider'
            }
          >
            <Keyboard className={isBrutal ? 'w-4 h-4 text-black' : isObsidian ? 'w-4 h-4 text-[#D4AF37]' : 'w-4 h-4 text-amber-400'} />
            <span>COMMAND SHORTCUTS</span>
          </div>
          <button
            onClick={() => {
              soundEffects.playKeyClick();
              onClose();
            }}
            className={
              isBrutal
                ? 'text-black bg-[#FFE500] border-2 border-black p-1 cursor-pointer'
                : isObsidian
                ? 'text-[#A39E93] hover:text-[#E5C77B] cursor-pointer transition-colors'
                : 'text-zinc-500 hover:text-zinc-200 cursor-pointer'
            }
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5 text-xs mb-6">
          {shortcuts.map((item) => (
            <div
              key={item.key}
              className={
                isBrutal
                  ? 'flex items-center justify-between p-2.5 bg-white border-2 border-black'
                  : isObsidian
                  ? 'flex items-center justify-between p-2.5 bg-[#070709] border border-[#2A241A]'
                  : 'flex items-center justify-between p-2 rounded bg-zinc-900 border border-zinc-800'
              }
            >
              <span className={isBrutal ? 'text-black font-bold' : isObsidian ? 'text-[#F5F0E6]' : 'text-zinc-300'}>{item.label}</span>
              <kbd
                className={
                  isBrutal
                    ? 'px-2 py-0.5 bg-[#FFE500] text-black border-2 border-black font-black font-mono'
                    : isObsidian
                    ? 'px-2 py-0.5 bg-[#1A1610] text-[#E5C77B] border border-[#D4AF37]/40 font-mono font-semibold'
                    : 'px-2 py-0.5 rounded bg-zinc-800 text-zinc-100 border border-zinc-700 font-bold'
                }
              >
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            soundEffects.playKeyClick();
            onClose();
          }}
          className={
            isBrutal
              ? 'w-full py-2.5 bg-[#86EFAC] hover:bg-[#4ADE80] text-black border-2 border-black font-black text-xs cursor-pointer brutal-btn'
              : isObsidian
              ? 'w-full py-2.5 bg-[#D4AF37] hover:bg-[#E5C77B] text-[#070709] font-semibold uppercase tracking-[0.18em] text-xs cursor-pointer transition-colors'
              : 'w-full py-2 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs cursor-pointer shadow-sm'
          }
        >
          CLOSE [ESC]
        </button>
      </div>
    </div>
  );
};
