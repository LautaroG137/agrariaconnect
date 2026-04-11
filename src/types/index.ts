export type EnvironmentType = 'animal' | 'vegetal' | 'maquinaria' | 'otro';

export interface FormativeEnvironment {
  id: string;
  name: string;
  description: string;
  type: EnvironmentType;
  icon: string;
  color: string;
  parentId?: string;
}

export interface Activity {
  id: string;
  environmentId: string;
  environmentName: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  imageUrl?: string;
}

export interface Spreadsheet {
  id: string;
  environmentId: string;
  title: string;
  columns: string[];
  rows: Record<string, any>[];
  createdAt: string;
}

export interface Task {
  id: string;
  environmentId: string;
  title: string;
  dueDate: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}
