/**
 * Speech Synthesis helper for articulation training.
 * Uses browser Web Speech API with safeguards for Chromium/Safari quirks
 * (async cancel queue race, GC utterance retention, paused queue, and watchdog fallback).
 */

export interface SpeechOptions {
  rate?: number; // 0.8, 1.0, 1.2
  pitch?: number; // 0.95 to 1.05
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: Error) => void;
}

class SpeechArticulationEngine {
  private isSupported: boolean;
  private activeUtterances: SpeechSynthesisUtterance[] = [];
  private preferredVoice: SpeechSynthesisVoice | null = null;
  private pendingSpeakTimer: number | null = null;
  private watchdogTimer: number | null = null;
  private maxDurationTimer: number | null = null;

  constructor() {
    this.isSupported =
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof window.SpeechSynthesisUtterance !== 'undefined';

    if (this.isSupported) {
      this.initVoice();
      if (typeof window.speechSynthesis.addEventListener === 'function') {
        window.speechSynthesis.addEventListener('voiceschanged', () => this.initVoice());
      } else if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoice();
      }
    }
  }

  private initVoice(): SpeechSynthesisVoice | null {
    if (!this.isSupported) return null;
    try {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return null;

      // Prioritize natural English voices
      const englishVoice =
        voices.find(
          v =>
            v.lang.toLowerCase().startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Neural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Daniel') ||
              v.name.includes('Alex') ||
              v.name.includes('Serena'))
        ) ||
        voices.find(v => v.lang.toLowerCase().startsWith('en-us')) ||
        voices.find(v => v.lang.toLowerCase().startsWith('en')) ||
        voices[0];

      this.preferredVoice = englishVoice || null;
      return this.preferredVoice;
    } catch {
      return null;
    }
  }

  private clearTimers() {
    if (this.pendingSpeakTimer !== null) {
      window.clearTimeout(this.pendingSpeakTimer);
      this.pendingSpeakTimer = null;
    }
    if (this.watchdogTimer !== null) {
      window.clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
    if (this.maxDurationTimer !== null) {
      window.clearTimeout(this.maxDurationTimer);
      this.maxDurationTimer = null;
    }
  }

  public getIsSupported(): boolean {
    return this.isSupported;
  }

  public getAvailableVoicesCount(): number {
    if (!this.isSupported) return 0;
    try {
      return window.speechSynthesis.getVoices().length;
    } catch {
      return 0;
    }
  }

  public stop() {
    this.clearTimers();
    if (!this.isSupported) return;
    try {
      this.activeUtterances = [];
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }
    } catch {
      // Ignored
    }
  }

  public speak(text: string, options: SpeechOptions = {}) {
    if (!this.isSupported) {
      options.onError?.(new Error('Speech synthesis is not supported in this browser.'));
      return;
    }

    const trimmed = text.trim();
    if (!trimmed) {
      options.onEnd?.();
      return;
    }

    const wasActive = window.speechSynthesis.speaking || window.speechSynthesis.pending;
    this.clearTimers();

    if (wasActive) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignored
      }
    }

    const startSpeech = () => {
      try {
        // Refresh voice list in case voices loaded asynchronously after constructor
        const voice = this.preferredVoice || this.initVoice();

        const utterance = new SpeechSynthesisUtterance(trimmed);
        utterance.lang = voice?.lang || 'en-US';
        if (voice) {
          utterance.voice = voice;
        }
        utterance.rate = options.rate ?? 1.0;
        utterance.pitch = options.pitch ?? 1.0;
        utterance.volume = 1.0;

        let started = false;
        let settled = false;

        const cleanup = () => {
          this.clearTimers();
          this.activeUtterances = this.activeUtterances.filter(u => u !== utterance);
        };

        utterance.onstart = () => {
          started = true;
          if (this.watchdogTimer !== null) {
            window.clearTimeout(this.watchdogTimer);
            this.watchdogTimer = null;
          }
          options.onStart?.();
        };

        utterance.onend = () => {
          if (settled) return;
          settled = true;
          cleanup();
          options.onEnd?.();
        };

        utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
          if (settled) return;
          settled = true;
          cleanup();
          // 'interrupted' and 'canceled' are normal when stopping/re-triggering
          if (event?.error === 'interrupted' || event?.error === 'canceled') {
            options.onEnd?.();
            return;
          }
          const msg = event?.error
            ? `Speech synthesis error: ${event.error}`
            : 'Browser speech synthesis unavailable.';
          options.onError?.(new Error(msg));
        };

        // Keep reference so Chromium GC cannot collect utterance mid-speech
        this.activeUtterances.push(utterance);

        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        window.speechSynthesis.speak(utterance);

        // Watchdog: if browser neither starts speaking nor errors within 1200ms
        // (common on headless Linux or browsers with no OS TTS voices installed)
        this.watchdogTimer = window.setTimeout(() => {
          if (!started && !settled && !window.speechSynthesis.speaking) {
            settled = true;
            cleanup();
            try {
              window.speechSynthesis.cancel();
            } catch {
              // Ignored
            }
            options.onError?.(
              new Error('No active browser voice output detected. Check system audio or browser TTS voices.')
            );
          }
        }, 1200);

        // Safety cap so UI state can never remain stuck on "SPEAKING..."
        this.maxDurationTimer = window.setTimeout(() => {
          if (!settled) {
            settled = true;
            cleanup();
            options.onEnd?.();
          }
        }, 15000);
      } catch (err) {
        this.clearTimers();
        options.onError?.(err instanceof Error ? err : new Error('Speech synthesis failed.'));
      }
    };

    // Chromium drops utterances queued synchronously on the same tick as cancel().
    // Only delay if cancel() was actually issued; otherwise start synchronously inside user gesture.
    if (wasActive) {
      this.pendingSpeakTimer = window.setTimeout(startSpeech, 70);
    } else {
      startSpeech();
    }
  }

  public isSpeaking(): boolean {
    if (!this.isSupported) return false;
    try {
      return window.speechSynthesis.speaking;
    } catch {
      return false;
    }
  }
}

export const speechEngine = new SpeechArticulationEngine();
