import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PreferencesProvider } from '../src/features/preferences/PreferencesProvider';
import { MissionProvider } from '../src/features/learning/MissionProvider';
import { HumorPreferencesProvider } from '../src/features/humor/HumorPreferencesProvider';
export default function Layout() {
  return <SafeAreaProvider><PreferencesProvider><HumorPreferencesProvider><MissionProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false }} /></MissionProvider></HumorPreferencesProvider></PreferencesProvider></SafeAreaProvider>;
}
