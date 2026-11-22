import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppData } from '@/storage/AppDataContext';

const PASTEL_MANIFESTATION_BORDERS = ['#CDBBE8', '#F1BED1', '#F3C6A8', '#BFDCCB', '#BAD8EC', '#E7C5D9'];

export default function ManifestationsScreen() {
  const insets = useSafeAreaInsets();
  const { manifestations, addManifestation, updateManifestation, isMutating } = useAppData();
  const [text, setText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const year = new Date().getFullYear();
  const yearGoals = manifestations.filter((item) => item.year === year);

  const save = async () => {
    if (!text.trim()) {
      Alert.alert('Add a goal', 'Your manifestation cannot be blank.');
      return;
    }
    setIsSaving(true);
    try {
      await addManifestation(text);
      setText('');
    } catch {
      Alert.alert('Could not save', 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (goalId: string, goalText: string) => {
    setEditingId(goalId);
    setEditText(goalText);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = async () => {
    if (!editText.trim()) {
      Alert.alert('Add a goal', 'Your manifestation cannot be blank.');
      return;
    }
    if (!editingId) return;

    setIsSaving(true);
    try {
      await updateManifestation(editingId, editText);
      cancelEditing();
    } catch {
      Alert.alert('Could not save', 'Please try again.');
    } finally {
      setIsSaving(false);
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

      <View style={[styles.formCard, { borderColor: '#F1BED1' }]}>
        <Text style={styles.label}>What do you want to bring to life?</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="A goal or manifestation..."
          placeholderTextColor="#A99FB2"
          multiline
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => void save()}
          disabled={isSaving || isMutating}
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
        yearGoals.map((goal, index) => (
          <View
            key={goal.id}
            style={[styles.goalCard, { borderColor: PASTEL_MANIFESTATION_BORDERS[index % PASTEL_MANIFESTATION_BORDERS.length] }]}>
            <Text style={styles.bullet}>•</Text>
            {editingId === goal.id ? (
              <View style={styles.editArea}>
                <TextInput
                  value={editText}
                  onChangeText={setEditText}
                  multiline
                  textAlignVertical="top"
                  accessibilityLabel="Edit manifestation"
                  style={styles.editInput}
                />
                <View style={styles.editActions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Cancel editing manifestation"
                    onPress={cancelEditing}
                    disabled={isSaving}
                    style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Save edited manifestation"
                    onPress={() => void saveEdit()}
                    disabled={isSaving || isMutating}
                    style={({ pressed }) => [styles.editSaveButton, pressed && styles.pressed]}>
                    <Text style={styles.editSaveButtonText}>Save</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.goalContent}>
                <Text style={styles.goalText}>{goal.text}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Edit manifestation: ${goal.text}`}
                  onPress={() => startEditing(goal.id, goal.text)}
                  disabled={isMutating}
                  hitSlop={8}
                  style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}>
                  <Text style={styles.editButtonText}>Edit</Text>
                </Pressable>
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F6FA' },
  content: { width: '100%', maxWidth: 800, alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 40 },
  backButton: { height: 44, justifyContent: 'center', marginBottom: 12, alignSelf: 'flex-start', borderRadius: 10, borderWidth: 1, borderColor: '#8C73B4', paddingHorizontal: 10 },
  backText: { color: '#7456A8', fontSize: 16, fontWeight: '700' },
  eyebrow: { color: '#91879B', fontSize: 11, fontWeight: '700', letterSpacing: 1.4, marginBottom: 5 },
  heading: { color: '#352F3D', fontSize: 27, fontWeight: '700' },
  year: { color: '#A99FB2', fontFamily: 'serif', fontSize: 20, marginTop: 4, marginBottom: 18 },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#E1D7EB', marginBottom: 24 },
  label: { color: '#5F5667', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: '#FAF8FC', borderRadius: 12, borderWidth: 1, borderColor: '#BAD8EC', paddingHorizontal: 14, paddingVertical: 12, minHeight: 110, color: '#403847', fontSize: 16, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#7456A8', borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 12, borderWidth: 2, borderColor: '#7456A8' },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  listHeading: { color: '#352F3D', fontSize: 18, fontWeight: '700', marginBottom: 10 },
  emptyCard: { backgroundColor: '#F1EDF5', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#CDBBE8' },
  emptyText: { color: '#77717F' },
  goalCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 2, borderColor: '#BFDCCB', padding: 16, flexDirection: 'row', marginBottom: 9 },
  bullet: { color: '#B49BCF', fontSize: 20, marginRight: 10, lineHeight: 22 },
  goalContent: { flex: 1, flexDirection: 'row', alignItems: 'flex-start' },
  goalText: { color: '#4A4252', fontSize: 16, lineHeight: 22, flex: 1 },
  editButton: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, marginLeft: 8, backgroundColor: '#EAE4F3', borderWidth: 1, borderColor: '#8C73B4' },
  editButtonText: { color: '#7456A8', fontSize: 13, fontWeight: '700' },
  editArea: { flex: 1 },
  editInput: { backgroundColor: '#FAF8FC', borderRadius: 12, borderWidth: 1, borderColor: '#F1BED1', paddingHorizontal: 12, paddingVertical: 10, minHeight: 84, color: '#403847', fontSize: 16, lineHeight: 22, textAlignVertical: 'top' },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  cancelButton: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 },
  cancelButtonText: { color: '#7456A8', fontSize: 13, fontWeight: '700' },
  editSaveButton: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#7456A8', borderWidth: 1, borderColor: '#4F3A75' },
  editSaveButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  pressed: { opacity: 0.72 },
});
