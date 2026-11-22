import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppDataProvider } from '@/storage/AppDataContext';

export default function TabLayout() {
  const theme = {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, primary: '#7456A8', background: '#F8F6FA', card: '#FFFFFF', text: '#352F3D', border: '#DFD4EB' },
  };

  return (
    <SafeAreaProvider>
      <ThemeProvider value={theme}>
        <AppDataProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }} />
        </AppDataProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
