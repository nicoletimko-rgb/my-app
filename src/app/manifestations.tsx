import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppData } from '@/storage/AppDataContext';

export default function ManifestationsScreen() {
  const insets = useSafeAreaInsets();
  const { manifestations, addManifestation } = useAppData();
  const [text, setText] = useState('');
  const year = new Date().getFullYear();
  const yearGoals = manifestations.filter((item) => item.year === year);

  const save = async () => {
    if (!text.trim()) {
      Alert.alert('Add a goal', 'Your manifestation cannot be blank.');
      return;
    }
    try {
      await addManifestation(text);
      setText('');
    } catch {
      Alert.alert('Could not save', 'Please try again.');
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}>
      <Pressable onPress={() => router.replace('/')} hitSlop={10} style={styles.backButton}>
        <Text style={styles.backText}>‹  Back</Text>
      </Pressable>
      <Text style={styles.eyebrow}>YEARLY INTENTION</Text>
      <Text style={styles.heading}>My Manifestations</Text>
      <Text style={styles.year}>{year}</Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>What do you want to bring to life?</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="A goal or manifestation..."
          placeholderTextColor="#A3A69F"
          multiline
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => void save()}
          style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}>
          <Text style={styles.saveText}>Save Goal</Text>
        </Pressable>
      </View>

      <Text style={styles.listHeading}>Your {year} Goals</Text>
      {yearGoals.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Your intentions will appear here.</Text>
        </View>
      ) : (
        yearGoals.map((goal) => (
          <View key={goal.id} style={styles.goalCard}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.goalText}>{goal.text}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F5F0' },
  content: { width: '100%', maxWidth: 800, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 40 },
  backButton: { height: 44, justifyContent: 'center', marginBottom: 12 },
  backText: { color: '#667A70', fontSize: 16, fontWeight: '700' },
  eyebrow: { color: '#8A918C', fontSize: 11, fontWeight: '700', letterSpacing: 1.4, marginBottom: 5 },
  heading: { color: '#2F3834', fontSize: 27, fontWeight: '700' },
  year: { color: '#A3A69F', fontFamily: 'serif', fontSize: 20, marginTop: 4, marginBottom: 18 },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#ECE8DF', marginBottom: 24 },
  label: { color: '#59615D', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: '#FAF9F6', borderRadius: 12, borderWidth: 1, borderColor: '#E7E3DA', paddingHorizontal: 14, paddingVertical: 12, minHeight: 110, color: '#303733', fontSize: 16, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#667A70', borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  listHeading: { color: '#2F3834', fontSize: 18, fontWeight: '700', marginBottom: 10 },
  emptyCard: { backgroundColor: '#EAE4DA', borderRadius: 16, padding: 20, alignItems: 'center' },
  emptyText: { color: '#777D79' },
  goalCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#ECE8DF', padding: 16, flexDirection: 'row', marginBottom: 9 },
  bullet: { color: '#9BB0A1', fontSize: 20, marginRight: 10, lineHeight: 22 },
  goalText: { color: '#4A514D', fontSize: 16, lineHeight: 22, flex: 1 },
  pressed: { opacity: 0.72 },
});
