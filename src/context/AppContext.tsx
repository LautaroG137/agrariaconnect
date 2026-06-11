import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import * as api from '../lib/api';
import { DEFAULT_ENVIRONMENT_INFO } from '../data';
import {
  Activity,
  EnvironmentInfo,
  FormativeEnvironment,
  InventoryItem,
  Spreadsheet,
  Task,
} from '../types';

interface AppContextValue {
  loading: boolean;
  error: string | null;
  environments: FormativeEnvironment[];
  tasks: Task[];
  activities: Activity[];
  spreadsheets: Spreadsheet[];
  environmentInfo: Record<string, EnvironmentInfo>;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => Promise<void>;
  completeTask: (id: string, completedBy: string, durationMinutes: number) => Promise<void>;
  uncompleteTask: (id: string) => Promise<void>;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => Promise<void>;
  updateEnvironmentInfo: (environmentId: string, updates: Partial<EnvironmentInfo>) => Promise<void>;
  addInventoryItem: (environmentId: string, item: Omit<InventoryItem, 'id'>) => Promise<void>;
  updateInventoryItem: (
    environmentId: string,
    itemId: string,
    updates: Partial<InventoryItem>
  ) => Promise<void>;
  removeInventoryItem: (environmentId: string, itemId: string) => Promise<void>;
  addEnvironment: (env: Omit<FormativeEnvironment, 'id'>) => Promise<void>;
  addSpreadsheet: (sheet: Omit<Spreadsheet, 'id' | 'createdAt'>) => Promise<void>;
  updateSpreadsheet: (
    id: string,
    updates: Partial<Pick<Spreadsheet, 'title' | 'columns' | 'rows'>>
  ) => Promise<void>;
  getEnvironmentName: (environmentId: string) => string;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [environments, setEnvironments] = useState<FormativeEnvironment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);
  const [environmentInfo, setEnvironmentInfo] = useState<Record<string, EnvironmentInfo>>({});

  const getEnvironmentName = useCallback(
    (environmentId: string) =>
      environments.find((e) => e.id === environmentId)?.name ?? 'Entorno',
    [environments]
  );

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError('Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en las variables de entorno.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.loadAppData();
      setEnvironments(data.environments);
      setTasks(data.tasks);
      setActivities(data.activities);
      setSpreadsheets(data.spreadsheets);
      setEnvironmentInfo(data.environmentInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getInfo = (environmentId: string): EnvironmentInfo =>
    environmentInfo[environmentId] ?? DEFAULT_ENVIRONMENT_INFO;

  const addTask = async (task: Omit<Task, 'id' | 'completed'>) => {
    const created = await api.insertTask(task);
    setTasks((prev) => [...prev, created]);
  };

  const completeTask = async (id: string, completedBy: string, durationMinutes: number) => {
    const updated = await api.updateTask(id, {
      completed: true,
      completedBy,
      durationMinutes,
    });
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const uncompleteTask = async (id: string) => {
    const updated = await api.updateTask(id, {
      completed: false,
      completedBy: undefined,
      durationMinutes: undefined,
    });
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const addActivity = async (activity: Omit<Activity, 'id' | 'createdAt'>) => {
    const created = await api.insertActivity(activity);
    setActivities((prev) => [created, ...prev]);
  };

  const updateEnvironmentInfo = async (
    environmentId: string,
    updates: Partial<EnvironmentInfo>
  ) => {
    const current = getInfo(environmentId);
    const { inventory, ...details } = updates;
    if (Object.keys(details).length > 0) {
      await api.upsertEnvironmentDetails(environmentId, details, current);
    }
    setEnvironmentInfo((prev) => ({
      ...prev,
      [environmentId]: {
        ...current,
        ...details,
        inventory: inventory ?? current.inventory,
      },
    }));
  };

  const addInventoryItem = async (environmentId: string, item: Omit<InventoryItem, 'id'>) => {
    const created = await api.insertInventoryItem(environmentId, item);
    setEnvironmentInfo((prev) => ({
      ...prev,
      [environmentId]: {
        ...getInfo(environmentId),
        inventory: [...getInfo(environmentId).inventory, created],
      },
    }));
  };

  const updateInventoryItem = async (
    environmentId: string,
    itemId: string,
    updates: Partial<InventoryItem>
  ) => {
    await api.patchInventoryItem(itemId, updates);
    setEnvironmentInfo((prev) => ({
      ...prev,
      [environmentId]: {
        ...getInfo(environmentId),
        inventory: getInfo(environmentId).inventory.map((item) =>
          item.id === itemId ? { ...item, ...updates } : item
        ),
      },
    }));
  };

  const removeInventoryItem = async (environmentId: string, itemId: string) => {
    await api.deleteInventoryItem(itemId);
    setEnvironmentInfo((prev) => ({
      ...prev,
      [environmentId]: {
        ...getInfo(environmentId),
        inventory: getInfo(environmentId).inventory.filter((item) => item.id !== itemId),
      },
    }));
  };

  const addEnvironment = async (env: Omit<FormativeEnvironment, 'id'>) => {
    const created = await api.insertEnvironment(env);
    setEnvironments((prev) => [...prev, created]);
  };

  const addSpreadsheet = async (sheet: Omit<Spreadsheet, 'id' | 'createdAt'>) => {
    const created = await api.insertSpreadsheet(sheet);
    setSpreadsheets((prev) => [created, ...prev]);
  };

  const updateSpreadsheet = async (
    id: string,
    updates: Partial<Pick<Spreadsheet, 'title' | 'columns' | 'rows'>>
  ) => {
    const updated = await api.patchSpreadsheet(id, updates);
    setSpreadsheets((prev) => prev.map((s) => (s.id === id ? updated : s)));
  };

  return (
    <AppContext.Provider
      value={{
        loading,
        error,
        environments,
        tasks,
        activities,
        spreadsheets,
        environmentInfo,
        addTask,
        completeTask,
        uncompleteTask,
        addActivity,
        updateEnvironmentInfo,
        addInventoryItem,
        updateInventoryItem,
        removeInventoryItem,
        addEnvironment,
        addSpreadsheet,
        updateSpreadsheet,
        getEnvironmentName,
        refresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');
  return ctx;
}
