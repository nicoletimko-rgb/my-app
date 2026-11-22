import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

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
  isMutating: boolean;
  addEntry: (title: string, reflection: string) => Promise<JournalEntry>;
  toggleFavorite: (id: string) => Promise<void>;
  addManifestation: (text: string) => Promise<void>;
  updateManifestation: (id: string, text: string) => Promise<void>;
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

function isJournalEntry(value: unknown): value is JournalEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === 'string'
    && typeof entry.title === 'string'
    && typeof entry.reflection === 'string'
    && typeof entry.createdAt === 'string'
    && !Number.isNaN(Date.parse(entry.createdAt))
    && typeof entry.isFavorite === 'boolean'
  );
}

function isManifestation(value: unknown): value is Manifestation {
  if (!value || typeof value !== 'object') return false;
  const manifestation = value as Record<string, unknown>;
  return (
    typeof manifestation.id === 'string'
    && typeof manifestation.text === 'string'
    && typeof manifestation.year === 'number'
    && Number.isInteger(manifestation.year)
  );
}

function parseCollection<T>(stored: string | null, validator: (value: unknown) => value is T): T[] {
  if (!stored) return [];
  try {
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(validator) : [];
  } catch {
    return [];
  }
}

function parseDailySelection(stored: string | null): { date: string; id: string } | null {
  if (!stored) return null;
  try {
    const parsed: unknown = JSON.parse(stored);
    if (
      parsed
      && typeof parsed === 'object'
      && typeof (parsed as Record<string, unknown>).date === 'string'
      && typeof (parsed as Record<string, unknown>).id === 'string'
    ) {
      return parsed as { date: string; id: string };
    }
  } catch {
    return null;
  }
  return null;
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [manifestations, setManifestations] = useState<Manifestation[]>([]);
  const [dailyEntry, setDailyEntry] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const entriesRef = useRef<JournalEntry[]>([]);
  const manifestationsRef = useRef<Manifestation[]>([]);
  const mutationQueueRef = useRef<Promise<void>>(Promise.resolve());
  const pendingMutationsRef = useRef(0);

  const runMutation = async <T,>(mutation: () => Promise<T>): Promise<T> => {
    pendingMutationsRef.current += 1;
    setIsMutating(true);

    const task = mutationQueueRef.current
      .catch(() => undefined)
      .then(mutation);
    mutationQueueRef.current = task.then(
      () => undefined,
      () => undefined,
    );

    try {
      return await task;
    } finally {
      pendingMutationsRef.current -= 1;
      if (pendingMutationsRef.current === 0) setIsMutating(false);
    }
  };

  useEffect(() => {
    let active = true;

    const refreshDailySelection = async () => {
      const today = localDateKey();
      const currentEntries = entriesRef.current;

      try {
        const storedDaily = await AsyncStorage.getItem(DAILY_KEY);
        const selection = parseDailySelection(storedDaily);

        if (!active) return;

        if (currentEntries.length === 0) {
          setDailyEntry(null);
          await AsyncStorage.removeItem(DAILY_KEY);
          return;
        }

        if (selection?.date === today) {
          const existing = currentEntries.find((entry) => entry.id === selection?.id);
          if (existing) {
            setDailyEntry(existing);
            return;
          }
        }

        const chosen = chooseDailyEntry(currentEntries, today);
        setDailyEntry(chosen);
        await AsyncStorage.setItem(
          DAILY_KEY,
          JSON.stringify({ date: today, id: chosen?.id }),
        );
      } catch {
        if (active) setLoadError('Could not load your saved reflections.');
      }
    };

    async function load() {
      try {
        const [storedEntries, storedManifestations, storedDaily] = await Promise.all([
          AsyncStorage.getItem(JOURNAL_KEY),
          AsyncStorage.getItem(MANIFESTATIONS_KEY),
          AsyncStorage.getItem(DAILY_KEY),
        ]);

        const nextEntries = parseCollection(storedEntries, isJournalEntry);
        const nextManifestations = parseCollection(storedManifestations, isManifestation);

        if (!active) return;
        entriesRef.current = nextEntries;
        manifestationsRef.current = nextManifestations;
        setEntries(nextEntries);
        setManifestations(nextManifestations);

        const today = localDateKey();
        const selection = parseDailySelection(storedDaily);

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

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') void refreshDailySelection();
    });
    const midnightCheck = setInterval(() => {
      void refreshDailySelection();
    }, 60 * 1000);

    return () => {
      active = false;
      appStateSubscription.remove();
      clearInterval(midnightCheck);
    };
  }, []);

  const persistEntries = async (nextEntries: JournalEntry[]) => {
    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(nextEntries));
  };

  const addEntry = async (title: string, reflection: string) => {
    const trimmedTitle = title.trim();
    const trimmedReflection = reflection.trim();
    if (!trimmedTitle || !trimmedReflection) {
      throw new Error('Both a title and reflection are required');
    }

    const entry: JournalEntry = {
      id: createId('entry'),
      title: trimmedTitle,
      reflection: trimmedReflection,
      createdAt: new Date().toISOString(),
      isFavorite: false,
    };

    return runMutation(async () => {
      const nextEntries = [entry, ...entriesRef.current];
      await persistEntries(nextEntries);
      entriesRef.current = nextEntries;
      setEntries(nextEntries);

      if (!dailyEntry) {
        const today = localDateKey();
        setDailyEntry(entry);
        await AsyncStorage.setItem(DAILY_KEY, JSON.stringify({ date: today, id: entry.id }));
      }
      return entry;
    });
  };

  const toggleFavorite = async (id: string) => {
    await runMutation(async () => {
      const nextEntries = entriesRef.current.map((entry) =>
        entry.id === id ? { ...entry, isFavorite: !entry.isFavorite } : entry,
      );
      await persistEntries(nextEntries);
      entriesRef.current = nextEntries;
      setEntries(nextEntries);
    });
  };

  const addManifestation = async (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) throw new Error('A manifestation is required');

    const manifestation: Manifestation = {
      id: createId('goal'),
      text: trimmedText,
      year: new Date().getFullYear(),
    };

    await runMutation(async () => {
      const nextManifestations = [manifestation, ...manifestationsRef.current];
      await AsyncStorage.setItem(MANIFESTATIONS_KEY, JSON.stringify(nextManifestations));
      manifestationsRef.current = nextManifestations;
      setManifestations(nextManifestations);
    });
  };

  const updateManifestation = async (id: string, text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) throw new Error('A manifestation is required');

    await runMutation(async () => {
      const nextManifestations = manifestationsRef.current.map((manifestation) =>
        manifestation.id === id ? { ...manifestation, text: trimmedText } : manifestation,
      );
      await AsyncStorage.setItem(MANIFESTATIONS_KEY, JSON.stringify(nextManifestations));
      manifestationsRef.current = nextManifestations;
      setManifestations(nextManifestations);
    });
  };

  const value = {
    entries,
    manifestations,
    dailyEntry,
    isLoading,
    loadError,
    isMutating,
    addEntry,
    toggleFavorite,
    addManifestation,
    updateManifestation,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used within AppDataProvider');
  return context;
}
