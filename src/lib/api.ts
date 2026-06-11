import { supabase } from './supabase';
import {
  Activity,
  EnvironmentInfo,
  FormativeEnvironment,
  InventoryItem,
  Notice,
  Spreadsheet,
  Task,
  EnvironmentEvent,
} from '../types';
import { DEFAULT_ENVIRONMENT_INFO } from '../data';

type EnvironmentRow = {
  id: string;
  name: string;
  description: string;
  type: FormativeEnvironment['type'];
  icon: string;
  color: string;
  parent_id: string | null;
};

type EnvironmentDetailsRow = {
  environment_id: string;
  responsible: string;
  location: string;
  schedule: string;
  status: string;
};

type InventoryRow = {
  id: string;
  environment_id: string;
  name: string;
  quantity: string;
  unit: string;
  notes: string | null;
};

type ActivityRow = {
  id: string;
  environment_id: string;
  title: string;
  content: string;
  author: string;
  image_url: string | null;
  created_at: string;
  completed: boolean;
  completed_by: string | null;
  duration_minutes: number | null;
};

type NoticeRow = {
  id: string;
  title: string;
  content: string;
  environment_id: string | null;
  importance: Notice['importance'];
  completed: boolean;
  completed_by: string | null;
  created_at: string;
};

type EnvironmentEventRow = {
  id: string;
  environment_id: string;
  title: string;
  event_at: string;
  created_at: string;
};

type TaskRow = {
  id: string;
  environment_id: string;
  title: string;
  due_date: string;
  completed: boolean;
  priority: Task['priority'];
  completed_by: string | null;
  duration_minutes: number | null;
};

type SpreadsheetRow = {
  id: string;
  environment_id: string;
  title: string;
  columns: string[];
  rows: Record<string, unknown>[];
  created_at: string;
};

function getClient() {
  if (!supabase) throw new Error('Supabase no está configurado');
  return supabase;
}

function mapEnvironment(row: EnvironmentRow): FormativeEnvironment {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    type: row.type,
    icon: row.icon,
    color: row.color,
    parentId: row.parent_id ?? undefined,
  };
}

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    environmentId: row.environment_id,
    title: row.title,
    dueDate: row.due_date,
    completed: row.completed,
    priority: row.priority,
    completedBy: row.completed_by ?? undefined,
    durationMinutes: row.duration_minutes ?? undefined,
  };
}

function mapActivity(row: ActivityRow, environmentName: string): Activity {
  return {
    id: row.id,
    environmentId: row.environment_id,
    environmentName,
    title: row.title,
    content: row.content,
    author: row.author,
    createdAt: row.created_at,
    imageUrl: row.image_url ?? undefined,
    completed: row.completed ?? false,
    completedBy: row.completed_by ?? undefined,
    durationMinutes: row.duration_minutes ?? undefined,
  };
}

function mapNotice(row: NoticeRow): Notice {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    environmentId: row.environment_id ?? undefined,
    importance: row.importance,
    completed: row.completed,
    completedBy: row.completed_by ?? undefined,
    createdAt: row.created_at,
  };
}

function mapEnvironmentEvent(row: EnvironmentEventRow): EnvironmentEvent {
  return {
    id: row.id,
    environmentId: row.environment_id,
    title: row.title,
    eventAt: row.event_at,
    createdAt: row.created_at,
  };
}

function mapSpreadsheet(row: SpreadsheetRow): Spreadsheet {
  return {
    id: row.id,
    environmentId: row.environment_id,
    title: row.title,
    columns: row.columns,
    rows: row.rows as Record<string, unknown>[],
    createdAt: row.created_at,
  };
}

function buildEnvironmentInfoMap(
  details: EnvironmentDetailsRow[],
  inventory: InventoryRow[]
): Record<string, EnvironmentInfo> {
  const infoMap: Record<string, EnvironmentInfo> = {};

  for (const detail of details) {
    infoMap[detail.environment_id] = {
      responsible: detail.responsible,
      location: detail.location,
      schedule: detail.schedule,
      status: detail.status,
      inventory: [],
    };
  }

  for (const item of inventory) {
    if (!infoMap[item.environment_id]) {
      infoMap[item.environment_id] = { ...DEFAULT_ENVIRONMENT_INFO, inventory: [] };
    }
    infoMap[item.environment_id].inventory.push({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      notes: item.notes ?? undefined,
    });
  }

  return infoMap;
}

export async function loadAppData() {
  const client = getClient();

  const [envRes, detailsRes, inventoryRes, activitiesRes, tasksRes, spreadsheetsRes, noticesRes, eventsRes] =
    await Promise.all([
      client.from('environments').select('*').order('name'),
      client.from('environment_details').select('*'),
      client.from('inventory_items').select('*').order('name'),
      client.from('activities').select('*').order('created_at', { ascending: false }),
      client.from('tasks').select('*').order('due_date'),
      client.from('spreadsheets').select('*').order('created_at', { ascending: false }),
      client.from('notices').select('*').order('created_at', { ascending: false }),
      client.from('environment_events').select('*').order('event_at'),
    ]);

  if (envRes.error) throw envRes.error;
  if (detailsRes.error) throw detailsRes.error;
  if (inventoryRes.error) throw inventoryRes.error;
  if (activitiesRes.error) throw activitiesRes.error;
  if (tasksRes.error) throw tasksRes.error;
  if (spreadsheetsRes.error) throw spreadsheetsRes.error;
  if (noticesRes.error) throw noticesRes.error;
  if (eventsRes.error) throw eventsRes.error;

  const environments = (envRes.data as EnvironmentRow[]).map(mapEnvironment);
  const envNameById = Object.fromEntries(environments.map((e) => [e.id, e.name]));

  return {
    environments,
    environmentInfo: buildEnvironmentInfoMap(
      detailsRes.data as EnvironmentDetailsRow[],
      inventoryRes.data as InventoryRow[]
    ),
    activities: (activitiesRes.data as ActivityRow[]).map((row) =>
      mapActivity(row, envNameById[row.environment_id] ?? 'Entorno')
    ),
    tasks: (tasksRes.data as TaskRow[]).map(mapTask),
    spreadsheets: (spreadsheetsRes.data as SpreadsheetRow[]).map(mapSpreadsheet),
    notices: (noticesRes.data as NoticeRow[]).map(mapNotice),
    events: (eventsRes.data as EnvironmentEventRow[]).map(mapEnvironmentEvent),
  };
}

export async function insertTask(task: Omit<Task, 'id' | 'completed'>) {
  const client = getClient();
  const { data, error } = await client
    .from('tasks')
    .insert({
      environment_id: task.environmentId,
      title: task.title,
      due_date: task.dueDate,
      priority: task.priority,
      completed: false,
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapTask(data as TaskRow);
}

export async function updateTask(
  id: string,
  updates: Partial<Pick<Task, 'completed' | 'completedBy' | 'durationMinutes'>>
) {
  const client = getClient();
  const { data, error } = await client
    .from('tasks')
    .update({
      completed: updates.completed,
      completed_by: updates.completedBy ?? null,
      duration_minutes: updates.durationMinutes ?? null,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return mapTask(data as TaskRow);
}

export async function insertActivity(
  activity: Omit<Activity, 'id' | 'createdAt' | 'completed' | 'completedBy' | 'durationMinutes'>
) {
  const client = getClient();
  const { data, error } = await client
    .from('activities')
    .insert({
      environment_id: activity.environmentId,
      title: activity.title,
      content: activity.content,
      author: activity.author,
      image_url: activity.imageUrl ?? null,
      completed: false,
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapActivity(data as ActivityRow, activity.environmentName);
}

export async function updateActivity(
  id: string,
  updates: Partial<
    Pick<Activity, 'title' | 'content' | 'author' | 'imageUrl' | 'completed' | 'completedBy' | 'durationMinutes'>
  >,
  environmentName: string
) {
  const client = getClient();
  const payload: Record<string, string | number | boolean | null> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.content !== undefined) payload.content = updates.content;
  if (updates.author !== undefined) payload.author = updates.author;
  if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl ?? null;
  if (updates.completed !== undefined) payload.completed = updates.completed;
  if (updates.completedBy !== undefined) payload.completed_by = updates.completedBy ?? null;
  if (updates.durationMinutes !== undefined) payload.duration_minutes = updates.durationMinutes ?? null;

  const { data, error } = await client
    .from('activities')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return mapActivity(data as ActivityRow, environmentName);
}

export async function patchActivity(
  id: string,
  updates: Partial<Pick<Activity, 'title' | 'content' | 'author' | 'imageUrl'>>,
  environmentName: string
) {
  return updateActivity(id, updates, environmentName);
}

export async function deleteActivity(id: string) {
  const client = getClient();
  const { error } = await client.from('activities').delete().eq('id', id);
  if (error) throw error;
}

export async function insertNotice(notice: Omit<Notice, 'id' | 'completed' | 'createdAt'>) {
  const client = getClient();
  const { data, error } = await client
    .from('notices')
    .insert({
      title: notice.title,
      content: notice.content,
      environment_id: notice.environmentId ?? null,
      importance: notice.importance,
      completed: false,
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapNotice(data as NoticeRow);
}

export async function completeNotice(id: string, completedBy?: string) {
  const client = getClient();
  const { data, error } = await client
    .from('notices')
    .update({
      completed: true,
      completed_by: completedBy ?? null,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return mapNotice(data as NoticeRow);
}

export async function insertEnvironmentEvent(
  event: Omit<EnvironmentEvent, 'id' | 'createdAt'>
) {
  const client = getClient();
  const { data, error } = await client
    .from('environment_events')
    .insert({
      environment_id: event.environmentId,
      title: event.title,
      event_at: event.eventAt,
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapEnvironmentEvent(data as EnvironmentEventRow);
}

export async function updateEnvironmentEvent(
  id: string,
  updates: Partial<Pick<EnvironmentEvent, 'title' | 'eventAt'>>
) {
  const client = getClient();
  const payload: Record<string, string> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.eventAt !== undefined) payload.event_at = updates.eventAt;

  const { data, error } = await client
    .from('environment_events')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return mapEnvironmentEvent(data as EnvironmentEventRow);
}

export async function deleteEnvironmentEvent(id: string) {
  const client = getClient();
  const { error } = await client.from('environment_events').delete().eq('id', id);
  if (error) throw error;
}

export async function upsertEnvironmentDetails(
  environmentId: string,
  updates: Partial<Omit<EnvironmentInfo, 'inventory'>>,
  current: EnvironmentInfo = DEFAULT_ENVIRONMENT_INFO
) {
  const client = getClient();
  const { error } = await client.from('environment_details').upsert({
    environment_id: environmentId,
    responsible: updates.responsible ?? current.responsible,
    location: updates.location ?? current.location,
    schedule: updates.schedule ?? current.schedule,
    status: updates.status ?? current.status,
  });
  if (error) throw error;
}

export async function insertInventoryItem(
  environmentId: string,
  item: Omit<InventoryItem, 'id'>
) {
  const client = getClient();
  const { data, error } = await client
    .from('inventory_items')
    .insert({
      environment_id: environmentId,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      notes: item.notes ?? null,
    })
    .select('*')
    .single();

  if (error) throw error;
  const row = data as InventoryRow;
  return {
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    unit: row.unit,
    notes: row.notes ?? undefined,
  } satisfies InventoryItem;
}

export async function patchInventoryItem(itemId: string, updates: Partial<InventoryItem>) {
  const client = getClient();
  const payload: Record<string, string | null> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.quantity !== undefined) payload.quantity = updates.quantity;
  if (updates.unit !== undefined) payload.unit = updates.unit;
  if (updates.notes !== undefined) payload.notes = updates.notes ?? null;

  const { error } = await client.from('inventory_items').update(payload).eq('id', itemId);
  if (error) throw error;
}

export async function deleteInventoryItem(itemId: string) {
  const client = getClient();
  const { error } = await client.from('inventory_items').delete().eq('id', itemId);
  if (error) throw error;
}

export async function insertEnvironment(
  env: Omit<FormativeEnvironment, 'id'>
) {
  const client = getClient();
  const { data, error } = await client
    .from('environments')
    .insert({
      name: env.name,
      description: env.description,
      type: env.type,
      icon: env.icon,
      color: env.color,
      parent_id: env.parentId ?? null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapEnvironment(data as EnvironmentRow);
}

export async function patchEnvironment(
  id: string,
  updates: Partial<Omit<FormativeEnvironment, 'id'>>
) {
  const client = getClient();
  const payload: Record<string, string | null> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.type !== undefined) payload.type = updates.type;
  if (updates.icon !== undefined) payload.icon = updates.icon;
  if (updates.color !== undefined) payload.color = updates.color;
  if (updates.parentId !== undefined) payload.parent_id = updates.parentId ?? null;

  const { data, error } = await client
    .from('environments')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return mapEnvironment(data as EnvironmentRow);
}

export async function deleteEnvironment(id: string) {
  const client = getClient();
  const { error } = await client.from('environments').delete().eq('id', id);
  if (error) throw error;
}

export async function insertSpreadsheet(
  sheet: Omit<Spreadsheet, 'id' | 'createdAt'>
) {
  const client = getClient();
  const { data, error } = await client
    .from('spreadsheets')
    .insert({
      environment_id: sheet.environmentId,
      title: sheet.title,
      columns: sheet.columns,
      rows: sheet.rows,
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapSpreadsheet(data as SpreadsheetRow);
}

export async function patchSpreadsheet(
  id: string,
  updates: Partial<Pick<Spreadsheet, 'title' | 'columns' | 'rows'>>
) {
  const client = getClient();
  const { data, error } = await client
    .from('spreadsheets')
    .update({
      title: updates.title,
      columns: updates.columns,
      rows: updates.rows,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return mapSpreadsheet(data as SpreadsheetRow);
}
