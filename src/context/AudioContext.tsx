import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { soundEffects } from '../utils/soundEffects';

export interface AudioSettings {
  soundEffectsEnabled: boolean;
  speechRate: number;
  speechPitch: number;
  voiceURI: string;
  autoSpeakOnFlip: boolean;
}

interface AudioContextValue extends AudioSettings {
  setSoundEffectsEnabled: (enabled: boolean) => void;
  toggleSoundEffects: () => void;
  setSpeechRate: (rate: number) => void;
  setSpeechPitch: (pitch: number) => void;
  setVoiceURI: (voiceURI: string) => void;
  setAutoSpeakOnFlip: (enabled: boolean) => void;
  resetAudioSettings: () => void;
}

const AUDIO_SETTINGS_KEY = 'articulation_audio_settings_v1';

const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  soundEffectsEnabled: true,
  speechRate: 1.0,
  speechPitch: 1.0,
  voiceURI: '',
  autoSpeakOnFlip: false,
};

function loadInitialAudioSettings(): AudioSettings {
  if (typeof window === 'undefined') return DEFAULT_AUDIO_SETTINGS;
  try {
    const raw = localStorage.getItem(AUDIO_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AudioSettings>;
      return {
        soundEffectsEnabled:
          typeof parsed.soundEffectsEnabled === 'boolean'
            ? parsed.soundEffectsEnabled
            : !soundEffects.isMuted(),
        speechRate:
          parsed.speechRate === 0.8 || parsed.speechRate === 1.0 || parsed.speechRate === 1.2
            ? parsed.speechRate
            : 1.0,
        speechPitch:
          parsed.speechPitch === 0.9 || parsed.speechPitch === 1.0 || parsed.speechPitch === 1.1
            ? parsed.speechPitch
            : 1.0,
        voiceURI: typeof parsed.voiceURI === 'string' ? parsed.voiceURI : '',
        autoSpeakOnFlip: Boolean(parsed.autoSpeakOnFlip),
      };
    }
    return {
      ...DEFAULT_AUDIO_SETTINGS,
      soundEffectsEnabled: !soundEffects.isMuted(),
    };
  } catch {
    return DEFAULT_AUDIO_SETTINGS;
  }
}

const AudioContext = createContext<AudioContextValue | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AudioSettings>(loadInitialAudioSettings);

  useEffect(() => {
    soundEffects.setMuted(!settings.soundEffectsEnabled);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
      } catch {
        // Ignored in restricted environments
      }
    }
  }, [settings]);

  const setSoundEffectsEnabled = useCallback((enabled: boolean) => {
    soundEffects.setMuted(!enabled);
    setSettings(prev => ({ ...prev, soundEffectsEnabled: enabled }));
  }, []);

  const toggleSoundEffects = useCallback(() => {
    setSettings(prev => {
      const nextEnabled = !prev.soundEffectsEnabled;
      soundEffects.setMuted(!nextEnabled);
      return { ...prev, soundEffectsEnabled: nextEnabled };
    });
  }, []);

  const setSpeechRate = useCallback((speechRate: number) => {
    setSettings(prev => ({ ...prev, speechRate }));
  }, []);

  const setSpeechPitch = useCallback((speechPitch: number) => {
    setSettings(prev => ({ ...prev, speechPitch }));
  }, []);

  const setVoiceURI = useCallback((voiceURI: string) => {
    setSettings(prev => ({ ...prev, voiceURI }));
  }, []);

  const setAutoSpeakOnFlip = useCallback((autoSpeakOnFlip: boolean) => {
    setSettings(prev => ({ ...prev, autoSpeakOnFlip }));
  }, []);

  const resetAudioSettings = useCallback(() => {
    soundEffects.setMuted(false);
    setSettings(DEFAULT_AUDIO_SETTINGS);
  }, []);

  return (
    <AudioContext.Provider
      value={{
        ...settings,
        setSoundEffectsEnabled,
        toggleSoundEffects,
        setSpeechRate,
        setSpeechPitch,
        setVoiceURI,
        setAutoSpeakOnFlip,
        resetAudioSettings,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return ctx;
}
