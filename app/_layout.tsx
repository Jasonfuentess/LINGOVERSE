import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PreferencesProvider } from '../src/features/preferences/PreferencesProvider';
import { MissionProvider } from '../src/features/learning/MissionProvider';
import { HumorPreferencesProvider } from '../src/features/humor/HumorPreferencesProvider';
import { VoiceProvider } from '../src/features/voice/VoiceProvider';
import { LearningSupportProvider } from '../src/features/learning/LearningSupportProvider';
export default function Layout() {
  return <SafeAreaProvider><PreferencesProvider><HumorPreferencesProvider><VoiceProvider><LearningSupportProvider><MissionProvider><MissionProvider language="en"><MissionProvider adventure="rendezvous"><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false }} /></MissionProvider></MissionProvider></MissionProvider></LearningSupportProvider></VoiceProvider></HumorPreferencesProvider></PreferencesProvider></SafeAreaProvider>;
}
