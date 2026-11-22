import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppData } from '@/storage/AppDataContext';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { entries, dailyEntry, isLoading, loadError, toggleFavorite } = useAppData();

  const sortedEntries = [...entries].sort((a, b) => {
    if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>MY DAILY REFLECTION</Text>
          <Text style={styles.heading}>Today&apos;s Inspiration</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open manifestations"
          onPress={() => router.push('/manifestations')}
          style={({ pressed }) => [styles.goalButton, pressed && styles.pressed]}>
          <Text style={styles.goalButtonText}>Manifestations</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.emptyCard}>
          <ActivityIndicator color="#667A70" />
        </View>
      ) : dailyEntry ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/journal', params: { id: dailyEntry.id } })}
          style={({ pressed }) => [styles.inspirationCard, pressed && styles.pressed]}>
          <Text style={styles.quoteMark}>“</Text>
          <Text style={styles.inspirationTitle}>{dailyEntry.title}</Text>
          <Text style={styles.readLink}>Read full reflection  →</Text>
        </Pressable>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Welcome to your quiet corner.</Text>
          <Text style={styles.emptyText}>Add your first reflection and it may become tomorrow&apos;s inspiration.</Text>
        </View>
      )}

      {loadError ? <Text style={styles.error}>{loadError}</Text> : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Past Entries</Text>
        <Text style={styles.entryCount}>{entries.length}</Text>
      </View>

      {sortedEntries.length === 0 ? (
        <Pressable
          onPress={() => router.push('/journal')}
          style={({ pressed }) => [styles.firstEntryButton, pressed && styles.pressed]}>
          <Text style={styles.firstEntryButtonText}>+ Add your first reflection</Text>
        </Pressable>
      ) : (
        sortedEntries.map((entry) => (
          <View key={entry.id} style={styles.entryCard}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/journal', params: { id: entry.id } })}
              style={styles.entryMain}>
              <Text numberOfLines={2} style={styles.entryTitle}>{entry.title}</Text>
              <Text numberOfLines={2} style={styles.entryReflection}>{entry.reflection}</Text>
              <Text style={styles.entryDate}>
                {new Date(entry.createdAt).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={entry.isFavorite ? 'Unfavorite entry' : 'Favorite entry'}
              onPress={() => void toggleFavorite(entry.id)}
              hitSlop={10}
              style={styles.starButton}>
              <Text style={[styles.star, entry.isFavorite && styles.starFavorite]}>
                {entry.isFavorite ? '★' : '☆'}
              </Text>
            </Pressable>
          </View>
        ))
      )}

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/journal')}
        style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
        <Text style={styles.addButtonText}>+ New Entry</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F5F0' },
  content: { width: '100%', maxWidth: 800, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  eyebrow: { color: '#8A918C', fontSize: 11, fontWeight: '700', letterSpacing: 1.4, marginBottom: 4 },
  heading: { color: '#2F3834', fontSize: 26, fontWeight: '700' },
  goalButton: { backgroundColor: '#E3EAE5', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 9 },
  goalButtonText: { color: '#53675D', fontWeight: '700', fontSize: 12 },
  inspirationCard: { backgroundColor: '#DCE6DE', borderRadius: 22, paddingHorizontal: 24, paddingVertical: 22, marginBottom: 28 },
  quoteMark: { color: '#91A79A', fontFamily: 'serif', fontSize: 42, lineHeight: 42 },
  inspirationTitle: { color: '#35443C', fontFamily: 'serif', fontSize: 22, lineHeight: 30, marginBottom: 16 },
  readLink: { color: '#667A70', fontSize: 13, fontWeight: '700' },
  emptyCard: { backgroundColor: '#EAE4DA', borderRadius: 22, padding: 24, marginBottom: 28, minHeight: 150, justifyContent: 'center' },
  emptyTitle: { color: '#4A514D', fontFamily: 'serif', fontSize: 20, marginBottom: 8 },
  emptyText: { color: '#777D79', lineHeight: 21 },
  error: { color: '#A44F4F', marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { color: '#2F3834', fontSize: 18, fontWeight: '700' },
  entryCount: { color: '#8A918C', backgroundColor: '#EAE7DF', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 3, overflow: 'hidden' },
  entryCard: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 10, flexDirection: 'row', borderWidth: 1, borderColor: '#ECE8DF' },
  entryMain: { flex: 1, padding: 16 },
  entryTitle: { color: '#343B38', fontSize: 16, fontWeight: '700', marginBottom: 5 },
  entryReflection: { color: '#747A76', lineHeight: 20, marginBottom: 8 },
  entryDate: { color: '#9A9D99', fontSize: 12 },
  starButton: { width: 54, alignItems: 'center', justifyContent: 'center' },
  star: { color: '#A8ADA8', fontSize: 25 },
  starFavorite: { color: '#C69A55' },
  firstEntryButton: { borderWidth: 1, borderColor: '#D9D5CB', borderRadius: 16, alignItems: 'center', padding: 18 },
  firstEntryButtonText: { color: '#667A70', fontWeight: '700' },
  addButton: { backgroundColor: '#667A70', borderRadius: 16, alignItems: 'center', paddingVertical: 16, marginTop: 12 },
  addButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.72 },
});
