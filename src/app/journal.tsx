import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppData } from '@/storage/AppDataContext';

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const { entries, addEntry, toggleFavorite, isLoading, isMutating } = useAppData();
  const entry = typeof params.id === 'string' ? entries.find((item) => item.id === params.id) : undefined;
  const hasInvalidEntryId = !isLoading && typeof params.id === 'string' && !entry;
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState(entry?.title ?? '');
  const [reflection, setReflection] = useState(entry?.reflection ?? '');

  const goHome = () => router.replace('/');

  const save = async () => {
    if (!title.trim() || !reflection.trim()) {
      Alert.alert('A moment to finish', 'Both a title and your reflection are required.');
      return;
    }
    setIsSaving(true);
    try {
      const saved = await addEntry(title, reflection);
      router.replace({ pathname: '/journal', params: { id: saved.id } });
    } catch {
      Alert.alert('Could not save', 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}>
      <View style={styles.topRow}>
        <Pressable onPress={goHome} hitSlop={10} style={styles.backButton}>
          <Text style={styles.backText}>‹  Back</Text>
        </Pressable>
        {entry && !hasInvalidEntryId ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={entry.isFavorite ? 'Unfavorite entry' : 'Favorite entry'}
            onPress={() => void toggleFavorite(entry.id)}
            disabled={isMutating}
            hitSlop={10}>
            <Text style={[styles.star, entry.isFavorite && styles.starFavorite]}>{entry.isFavorite ? '★' : '☆'}</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.eyebrow}>
        {isLoading ? 'LOADING' : hasInvalidEntryId ? 'REFLECTION' : entry ? 'REFLECTION' : 'NEW REFLECTION'}
      </Text>
      <Text style={styles.heading}>
        {isLoading ? 'Opening Reflection' : hasInvalidEntryId ? 'Reflection Not Found' : entry ? 'Your Reflection' : 'Capture a Moment'}
      </Text>

      {isLoading && typeof params.id === 'string' ? (
        <View style={styles.viewCard}>
          <ActivityIndicator color="#7456A8" />
        </View>
      ) : hasInvalidEntryId ? (
        <View style={styles.viewCard}>
          <Text style={styles.viewTitle}>Reflection not found</Text>
          <Text style={styles.viewReflection}>It may have been removed or the link may be invalid.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={goHome}
            style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}>
            <Text style={styles.saveText}>Return Home</Text>
          </Pressable>
        </View>
      ) : entry ? (
        <View style={styles.viewCard}>
          <Text style={styles.viewTitle}>{entry.title}</Text>
          <Text style={styles.viewReflection}>{entry.reflection}</Text>
          <Text style={styles.date}>
            {new Date(entry.createdAt).toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={styles.label}>Title / Quote</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Give this reflection a title..."
            placeholderTextColor="#A99FB2"
            style={styles.titleInput}
          />
          <Text style={styles.label}>What I Learned</Text>
          <TextInput
            value={reflection}
            onChangeText={setReflection}
            placeholder="Write what you learned, noticed, or want to remember..."
            placeholderTextColor="#A99FB2"
            multiline
            textAlignVertical="top"
            style={styles.reflectionInput}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => void save()}
            disabled={isSaving}
            style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}>
            <Text style={styles.saveText}>Save Reflection</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F6FA' },
  content: { width: '100%', maxWidth: 800, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 40 },
  topRow: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  backButton: { paddingVertical: 8, paddingRight: 12, borderRadius: 10, borderWidth: 1, borderColor: '#BAD8EC' },
  backText: { color: '#7456A8', fontSize: 16, fontWeight: '700' },
  star: { color: '#A99DB2', fontSize: 30 },
  starFavorite: { color: '#7456A8' },
  eyebrow: { color: '#91879B', fontSize: 11, fontWeight: '700', letterSpacing: 1.4, marginBottom: 5 },
  heading: { color: '#352F3D', fontSize: 27, fontWeight: '700', marginBottom: 18 },
  form: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#E1D7EB' },
  label: { color: '#5F5667', fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 8 },
  titleInput: { backgroundColor: '#FAF8FC', borderRadius: 12, borderWidth: 1, borderColor: '#DFD4EB', paddingHorizontal: 14, height: 52, color: '#403847', fontSize: 16 },
  reflectionInput: { backgroundColor: '#FAF8FC', borderRadius: 12, borderWidth: 1, borderColor: '#DFD4EB', paddingHorizontal: 14, paddingVertical: 12, minHeight: 220, color: '#403847', fontSize: 16, lineHeight: 23 },
  saveButton: { backgroundColor: '#7456A8', borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 18, borderWidth: 2, borderColor: '#7456A8' },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  viewCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 22, borderWidth: 2, borderColor: '#CDBBE8' },
  viewTitle: { color: '#403847', fontFamily: 'serif', fontSize: 24, lineHeight: 32, marginBottom: 16 },
  viewReflection: { color: '#696171', fontSize: 17, lineHeight: 27 },
  date: { color: '#958D9C', fontSize: 12, marginTop: 22 },
  pressed: { opacity: 0.72 },
});
