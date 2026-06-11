import { createContext, useContext, useState, ReactNode } from 'react';
import {
  MOCK_ACTIVITIES,
  MOCK_ENVIRONMENT_INFO,
  MOCK_TASKS,
  DEFAULT_ENVIRONMENT_INFO,
  MOCK_ENVIRONMENTS,
} from '../data';
import { Activity, EnvironmentInfo, InventoryItem, Task } from '../types';

interface AppContextValue {
  tasks: Task[];
  activities: Activity[];
  environmentInfo: Record<string, EnvironmentInfo>;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  completeTask: (id: string, completedBy: string, durationMinutes: number) => void;
  uncompleteTask: (id: string) => void;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => void;
  updateEnvironmentInfo: (environmentId: string, updates: Partial<EnvironmentInfo>) => void;
  addInventoryItem: (environmentId: string, item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (environmentId: string, itemId: string, updates: Partial<InventoryItem>) => void;
  removeInventoryItem: (environmentId: string, itemId: string) => void;
  getEnvironmentName: (environmentId: string) => string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [environmentInfo, setEnvironmentInfo] = useState<Record<string, EnvironmentInfo>>(MOCK_ENVIRONMENT_INFO);

  const getEnvironmentName = (environmentId: string) =>
    MOCK_ENVIRONMENTS.find((e) => e.id === environmentId)?.name ?? 'Entorno';

  const addTask = (task: Omit<Task, 'id' | 'completed'>) => {
    setTasks((prev) => [
      ...prev,
      { ...task, id: Math.random().toString(36).slice(2, 11), completed: false },
    ]);
  };

  const completeTask = (id: string, completedBy: string, durationMinutes: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: true, completedBy, durationMinutes } : t
      )
    );
  };

  const uncompleteTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, completed: false, completedBy: undefined, durationMinutes: undefined }
          : t
      )
    );
  };

  const addActivity = (activity: Omit<Activity, 'id' | 'createdAt'>) => {
    setActivities((prev) => [
      {
        ...activity,
        id: Math.random().toString(36).slice(2, 11),
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const getInfo = (environmentId: string): EnvironmentInfo =>
    environmentInfo[environmentId] ?? DEFAULT_ENVIRONMENT_INFO;

  const updateEnvironmentInfo = (environmentId: string, updates: Partial<EnvironmentInfo>) => {
    setEnvironmentInfo((prev) => ({
      ...prev,
      [environmentId]: { ...getInfo(environmentId), ...updates },
    }));
  };

  const addInventoryItem = (environmentId: string, item: Omit<InventoryItem, 'id'>) => {
    const info = getInfo(environmentId);
    updateEnvironmentInfo(environmentId, {
      inventory: [...info.inventory, { ...item, id: Math.random().toString(36).slice(2, 11) }],
    });
  };

  const updateInventoryItem = (
    environmentId: string,
    itemId: string,
    updates: Partial<InventoryItem>
  ) => {
    const info = getInfo(environmentId);
    updateEnvironmentInfo(environmentId, {
      inventory: info.inventory.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    });
  };

  const removeInventoryItem = (environmentId: string, itemId: string) => {
    const info = getInfo(environmentId);
    updateEnvironmentInfo(environmentId, {
      inventory: info.inventory.filter((item) => item.id !== itemId),
    });
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        activities,
        environmentInfo,
        addTask,
        completeTask,
        uncompleteTask,
        addActivity,
        updateEnvironmentInfo,
        addInventoryItem,
        updateInventoryItem,
        removeInventoryItem,
        getEnvironmentName,
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
