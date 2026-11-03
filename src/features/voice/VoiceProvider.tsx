import { createContext, useContext, useEffect, useLayoutEffect, useState, useSyncExternalStore, type PropsWithChildren } from 'react';
import { AppState, Platform } from 'react-native';
import { usePathname } from 'expo-router';
import { usePreferences } from '../preferences/PreferencesProvider';
import { useHumorPreferences } from '../humor/HumorPreferencesProvider';
import { canRoast } from '../../domain/humor/access';
import { voiceController } from './service';
import type { VoiceState } from '../../domain/voice/playback';

interface VoiceUI { state: VoiceState; coachLocale: string; saving: boolean; preferenceError: string | null; toggleMute: () => Promise<void>; toggleNetwork: () => Promise<void> }
const Context = createContext<VoiceUI | null>(null);
export function VoiceProvider({ children }: PropsWithChildren) {
  const profile = usePreferences();
  const humor = useHumorPreferences();
  const pathname = usePathname();
  const state = useSyncExternalStore(voiceController.subscribe, voiceController.snapshot, voiceController.snapshot);
  const [muteOverride, setMuteOverride] = useState<boolean | null>(null);
  const [networkOverride, setNetworkOverride] = useState<boolean | null>(null);
  const muted = muteOverride ?? profile.preferences?.voiceProvider !== 'system';
  const context = JSON.stringify({
    scope: JSON.stringify([pathname, profile.preferences?.learningLanguage, profile.preferences?.coachLocale, profile.loading, profile.saving, humor.settings, humor.loading, humor.saving]),
    muted: muted || profile.loading,
    adultAllowed: !humor.loading && !humor.saving && canRoast(humor.settings),
    allowNetworkVoices: networkOverride ?? profile.preferences?.allowNetworkVoices === true,
  });
  useLayoutEffect(() => { voiceController.configure(JSON.parse(context)); }, [context]);
  useEffect(() => {
    void voiceController.refresh();
    const subscription = AppState.addEventListener('change', next => { if (next !== 'active') void voiceController.stop(); });
    const stop = () => { void voiceController.stop(); };
    const visibility = () => { if (document.visibilityState !== 'visible') stop(); };
    if (Platform.OS === 'web') {
      window.addEventListener('pagehide', stop);
      document.addEventListener('visibilitychange', visibility);
    }
    return () => {
      subscription.remove(); stop();
      if (Platform.OS === 'web') { window.removeEventListener('pagehide', stop); document.removeEventListener('visibilitychange', visibility); }
    };
  }, []);
  const toggleMute = async () => {
    const next = !state.muted;
    // Muting remains effective for this session even if persistence fails.
    if (next) { voiceController.mute(true); setMuteOverride(true); }
    const saved = await profile.save({ voiceProvider: next ? 'none' : 'system' });
    if (saved) setMuteOverride(next);
  };
  const toggleNetwork = async () => {
    const next = !state.allowNetworkVoices;
    voiceController.restrict();
    if (!next) setNetworkOverride(false);
    if (await profile.save({ allowNetworkVoices: next })) setNetworkOverride(next);
  };
  return <Context.Provider value={{ state, coachLocale: profile.preferences?.coachLocale ?? 'es-SV', saving: profile.saving, preferenceError: profile.error, toggleMute, toggleNetwork }}>{children}</Context.Provider>;
}
export function useVoice() {
  const voice = useContext(Context);
  if (!voice) throw Error('VoiceProvider requerido');
  return voice;
}
