import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type JournalEntry = {
  id: string;
  title: string;
  reflection: string;
  createdAt: string;
  isFavorite: boolean;
};

export type Manifestation = {
  id: string;
  text: string;
  year: number;
};

type AppDataContextValue = {
  entries: JournalEntry[];
  manifestations: Manifestation[];
  dailyEntry: JournalEntry | null;
  isLoading: boolean;
  loadError: string | null;
  addEntry: (title: string, reflection: string) => Promise<JournalEntry>;
  toggleFavorite: (id: string) => Promise<void>;
  addManifestation: (text: string) => Promise<void>;
};

const JOURNAL_KEY = '@daily_journal_entries';
const MANIFESTATIONS_KEY = '@daily_journal_manifestations';
const DAILY_KEY = '@daily_inspiration_selection';

const AppDataContext = createContext<AppDataContextValue | null>(null);

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function hashText(text: string) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function chooseDailyEntry(entries: JournalEntry[], dateKey: string) {
  if (entries.length === 0) return null;
  return entries.reduce((best, entry) => {
    const score = hashText(`${dateKey}:${entry.id}`);
    const bestScore = hashText(`${dateKey}:${best.id}`);
    return score > bestScore ? entry : best;
  });
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [manifestations, setManifestations] = useState<Manifestation[]>([]);
  const [dailyEntry, setDailyEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [storedEntries, storedManifestations, storedDaily] = await Promise.all([
          AsyncStorage.getItem(JOURNAL_KEY),
          AsyncStorage.getItem(MANIFESTATIONS_KEY),
          AsyncStorage.getItem(DAILY_KEY),
        ]);

        const nextEntries: JournalEntry[] = storedEntries ? JSON.parse(storedEntries) : [];
        const nextManifestations: Manifestation[] = storedManifestations
          ? JSON.parse(storedManifestations)
          : [];

        if (!active) return;
        setEntries(nextEntries);
        setManifestations(nextManifestations);

        const today = localDateKey();
        let selection: { date: string; id: string } | null = storedDaily
          ? JSON.parse(storedDaily)
          : null;

        if (selection?.date === today) {
          const existing = nextEntries.find((entry) => entry.id === selection?.id);
          if (existing) {
            setDailyEntry(existing);
          } else {
            const chosen = chooseDailyEntry(nextEntries, today);
            setDailyEntry(chosen);
            if (chosen) {
              await AsyncStorage.setItem(
                DAILY_KEY,
                JSON.stringify({ date: today, id: chosen.id }),
              );
            }
          }
        } else {
          const chosen = chooseDailyEntry(nextEntries, today);
          setDailyEntry(chosen);
          if (chosen) {
            await AsyncStorage.setItem(
              DAILY_KEY,
              JSON.stringify({ date: today, id: chosen.id }),
            );
          } else {
            await AsyncStorage.removeItem(DAILY_KEY);
          }
        }
      } catch {
        if (active) setLoadError('Could not load your saved reflections.');
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  const persistEntries = async (nextEntries: JournalEntry[]) => {
    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(nextEntries));
  };

  const addEntry = async (title: string, reflection: string) => {
    const entry: JournalEntry = {
      id: createId('entry'),
      title: title.trim(),
      reflection: reflection.trim(),
      createdAt: new Date().toISOString(),
      isFavorite: false,
    };
    const nextEntries = [entry, ...entries];
    await persistEntries(nextEntries);
    setEntries(nextEntries);

    if (!dailyEntry) {
      const today = localDateKey();
      setDailyEntry(entry);
      await AsyncStorage.setItem(DAILY_KEY, JSON.stringify({ date: today, id: entry.id }));
    }
    return entry;
  };

  const toggleFavorite = async (id: string) => {
    const nextEntries = entries.map((entry) =>
      entry.id === id ? { ...entry, isFavorite: !entry.isFavorite } : entry,
    );
    await persistEntries(nextEntries);
    setEntries(nextEntries);
  };

  const addManifestation = async (text: string) => {
    const manifestation: Manifestation = {
      id: createId('goal'),
      text: text.trim(),
      year: new Date().getFullYear(),
    };
    const nextManifestations = [manifestation, ...manifestations];
    await AsyncStorage.setItem(MANIFESTATIONS_KEY, JSON.stringify(nextManifestations));
    setManifestations(nextManifestations);
  };

  const value = {
    entries,
    manifestations,
    dailyEntry,
    isLoading,
    loadError,
    addEntry,
    toggleFavorite,
    addManifestation,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used within AppDataProvider');
  return context;
}
