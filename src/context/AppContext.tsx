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
  updateActivity: (
    id: string,
    updates: Partial<Pick<Activity, 'title' | 'content' | 'author' | 'imageUrl'>>
  ) => Promise<void>;
  removeActivity: (id: string) => Promise<void>;
  updateEnvironmentInfo: (environmentId: string, updates: Partial<EnvironmentInfo>) => Promise<void>;
  addInventoryItem: (environmentId: string, item: Omit<InventoryItem, 'id'>) => Promise<void>;
  updateInventoryItem: (
    environmentId: string,
    itemId: string,
    updates: Partial<InventoryItem>
  ) => Promise<void>;
  removeInventoryItem: (environmentId: string, itemId: string) => Promise<void>;
  addEnvironment: (env: Omit<FormativeEnvironment, 'id'>) => Promise<void>;
  updateEnvironment: (
    id: string,
    updates: Partial<Omit<FormativeEnvironment, 'id'>>
  ) => Promise<void>;
  removeEnvironment: (id: string) => Promise<void>;
  addSpreadsheet: (sheet: Omit<Spreadsheet, 'id' | 'createdAt'>) => Promise<void>;
  updateSpreadsheet: (
    id: string,
    updates: Partial<Pick<Spreadsheet, 'title' | 'columns' | 'rows'>>
  ) => Promise<void>;
  getEnvironmentName: (environmentId: string) => string;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as { message: unknown }).message);
  }
  return 'Ocurrió un error inesperado';
}

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
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getInfo = (environmentId: string): EnvironmentInfo =>
    environmentInfo[environmentId] ?? DEFAULT_ENVIRONMENT_INFO;

  const runMutation = async <T,>(fn: () => Promise<T>): Promise<T> => {
    try {
      setError(null);
      return await fn();
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    }
  };

  const addTask = async (task: Omit<Task, 'id' | 'completed'>) => {
    const created = await runMutation(() => api.insertTask(task));
    setTasks((prev) => [...prev, created]);
  };

  const completeTask = async (id: string, completedBy: string, durationMinutes: number) => {
    const updated = await runMutation(() =>
      api.updateTask(id, { completed: true, completedBy, durationMinutes })
    );
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const uncompleteTask = async (id: string) => {
    const updated = await runMutation(() =>
      api.updateTask(id, { completed: false, completedBy: undefined, durationMinutes: undefined })
    );
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const addActivity = async (activity: Omit<Activity, 'id' | 'createdAt'>) => {
    const created = await runMutation(() => api.insertActivity(activity));
    setActivities((prev) => [created, ...prev]);
  };

  const updateActivity = async (
    id: string,
    updates: Partial<Pick<Activity, 'title' | 'content' | 'author' | 'imageUrl'>>
  ) => {
    const activity = activities.find((a) => a.id === id);
    const envName = activity?.environmentName ?? getEnvironmentName(activity?.environmentId ?? '');
    const updated = await runMutation(() => api.patchActivity(id, updates, envName));
    setActivities((prev) => prev.map((a) => (a.id === id ? updated : a)));
  };

  const removeActivity = async (id: string) => {
    await runMutation(() => api.deleteActivity(id));
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const updateEnvironmentInfo = async (
    environmentId: string,
    updates: Partial<EnvironmentInfo>
  ) => {
    const current = getInfo(environmentId);
    const { inventory, ...details } = updates;
    if (Object.keys(details).length > 0) {
      await runMutation(() => api.upsertEnvironmentDetails(environmentId, details, current));
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
    const created = await runMutation(() => api.insertInventoryItem(environmentId, item));
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
    await runMutation(() => api.patchInventoryItem(itemId, updates));
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
    await runMutation(() => api.deleteInventoryItem(itemId));
    setEnvironmentInfo((prev) => ({
      ...prev,
      [environmentId]: {
        ...getInfo(environmentId),
        inventory: getInfo(environmentId).inventory.filter((item) => item.id !== itemId),
      },
    }));
  };

  const addEnvironment = async (env: Omit<FormativeEnvironment, 'id'>) => {
    const created = await runMutation(async () => {
      const environment = await api.insertEnvironment(env);
      await api.upsertEnvironmentDetails(
        environment.id,
        { responsible: '', location: '', schedule: '', status: 'Activo' },
        DEFAULT_ENVIRONMENT_INFO
      );
      return environment;
    });
    setEnvironments((prev) => [...prev, created]);
    setEnvironmentInfo((prev) => ({
      ...prev,
      [created.id]: { ...DEFAULT_ENVIRONMENT_INFO },
    }));
  };

  const updateEnvironment = async (
    id: string,
    updates: Partial<Omit<FormativeEnvironment, 'id'>>
  ) => {
    const updated = await runMutation(() => api.patchEnvironment(id, updates));
    setEnvironments((prev) => prev.map((e) => (e.id === id ? updated : e)));
    if (updates.name) {
      setActivities((prev) =>
        prev.map((a) =>
          a.environmentId === id ? { ...a, environmentName: updates.name! } : a
        )
      );
    }
  };

  const removeEnvironment = async (id: string) => {
    const idsToRemove = new Set<string>([id]);
    const queue = [id];
    while (queue.length > 0) {
      const current = queue.pop()!;
      for (const child of environments.filter((e) => e.parentId === current)) {
        if (!idsToRemove.has(child.id)) {
          idsToRemove.add(child.id);
          queue.push(child.id);
        }
      }
    }

    await runMutation(() => api.deleteEnvironment(id));

    setEnvironments((prev) => prev.filter((e) => !idsToRemove.has(e.id)));
    setTasks((prev) => prev.filter((t) => !idsToRemove.has(t.environmentId)));
    setActivities((prev) => prev.filter((a) => !idsToRemove.has(a.environmentId)));
    setSpreadsheets((prev) => prev.filter((s) => !idsToRemove.has(s.environmentId)));
    setEnvironmentInfo((prev) => {
      const next = { ...prev };
      for (const envId of idsToRemove) delete next[envId];
      return next;
    });
  };

  const addSpreadsheet = async (sheet: Omit<Spreadsheet, 'id' | 'createdAt'>) => {
    const created = await runMutation(() => api.insertSpreadsheet(sheet));
    setSpreadsheets((prev) => [created, ...prev]);
  };

  const updateSpreadsheet = async (
    id: string,
    updates: Partial<Pick<Spreadsheet, 'title' | 'columns' | 'rows'>>
  ) => {
    const updated = await runMutation(() => api.patchSpreadsheet(id, updates));
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
        updateActivity,
        removeActivity,
        updateEnvironmentInfo,
        addInventoryItem,
        updateInventoryItem,
        removeInventoryItem,
        addEnvironment,
        updateEnvironment,
        removeEnvironment,
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
