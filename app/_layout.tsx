import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PreferencesProvider } from '../src/features/preferences/PreferencesProvider';
import { MissionProvider } from '../src/features/learning/MissionProvider';
export default function Layout() {
  return <SafeAreaProvider><PreferencesProvider><MissionProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false }} /></MissionProvider></PreferencesProvider></SafeAreaProvider>;
}
