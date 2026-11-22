import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppDataProvider } from '@/storage/AppDataContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark'
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, primary: '#D8B4A6', background: '#171A1F', card: '#171A1F', text: '#FFFFFF', border: '#30343B' } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, primary: '#667A70', background: '#F7F5F0', card: '#FFFFFF', text: '#2F3834', border: '#E6E1D8' } };

  return (
    <SafeAreaProvider>
      <ThemeProvider value={theme}>
        <AppDataProvider>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }} />
        </AppDataProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
