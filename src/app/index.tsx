import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppData } from '@/storage/AppDataContext';

const PASTEL_ENTRY_BORDERS = ['#CDBBE8', '#F1BED1', '#F3C6A8', '#BFDCCB', '#BAD8EC', '#E7C5D9'];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { entries, dailyEntry, isLoading, loadError, isMutating, toggleFavorite } = useAppData();

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
          <ActivityIndicator color="#7456A8" />
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
        sortedEntries.map((entry, index) => (
          <View
            key={entry.id}
            style={[styles.entryCard, { borderColor: PASTEL_ENTRY_BORDERS[index % PASTEL_ENTRY_BORDERS.length], borderWidth: 2 }]}>
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
              disabled={isMutating}
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
  screen: { flex: 1, backgroundColor: '#F8F6FA' },
  content: { width: '100%', maxWidth: 800, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  eyebrow: { color: '#91879B', fontSize: 11, fontWeight: '700', letterSpacing: 1.4, marginBottom: 4 },
  heading: { color: '#352F3D', fontSize: 26, fontWeight: '700' },
  goalButton: { backgroundColor: '#EAE4F3', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: '#CDBBE8' },
  goalButtonText: { color: '#7456A8', fontWeight: '700', fontSize: 12 },
  inspirationCard: { backgroundColor: '#ECE5F6', borderRadius: 22, paddingHorizontal: 24, paddingVertical: 22, marginBottom: 28, borderWidth: 1, borderColor: '#DDD0EC' },
  quoteMark: { color: '#B49BCF', fontFamily: 'serif', fontSize: 42, lineHeight: 42 },
  inspirationTitle: { color: '#4A3D5D', fontFamily: 'serif', fontSize: 22, lineHeight: 30, marginBottom: 16 },
  readLink: { color: '#7456A8', fontSize: 13, fontWeight: '700' },
  emptyCard: { backgroundColor: '#F1EDF5', borderRadius: 22, padding: 24, marginBottom: 28, minHeight: 150, justifyContent: 'center', borderWidth: 1, borderColor: '#E2D9EA' },
  emptyTitle: { color: '#4A4252', fontFamily: 'serif', fontSize: 20, marginBottom: 8 },
  emptyText: { color: '#77717F', lineHeight: 21 },
  error: { color: '#A44F4F', marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { color: '#352F3D', fontSize: 18, fontWeight: '700' },
  entryCount: { color: '#91879B', backgroundColor: '#EAE4F3', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 3, overflow: 'hidden' },
  entryCard: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 10, flexDirection: 'row', borderWidth: 1, borderColor: '#E1D7EB' },
  entryMain: { flex: 1, padding: 16 },
  entryTitle: { color: '#403847', fontSize: 16, fontWeight: '700', marginBottom: 5 },
  entryReflection: { color: '#77717F', lineHeight: 20, marginBottom: 8 },
  entryDate: { color: '#958D9C', fontSize: 12 },
  starButton: { width: 54, alignItems: 'center', justifyContent: 'center' },
  star: { color: '#A99DB2', fontSize: 25 },
  starFavorite: { color: '#7456A8' },
  firstEntryButton: { borderWidth: 2, borderColor: '#F1BED1', borderRadius: 16, alignItems: 'center', padding: 18 },
  firstEntryButtonText: { color: '#7456A8', fontWeight: '700' },
  addButton: { backgroundColor: '#7456A8', borderRadius: 16, alignItems: 'center', paddingVertical: 16, marginTop: 12, borderWidth: 2, borderColor: '#7456A8' },
  addButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.72 },
});
