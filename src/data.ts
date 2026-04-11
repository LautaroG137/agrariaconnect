import { FormativeEnvironment, Activity, Spreadsheet, Task } from './types';

export const MOCK_ENVIRONMENTS: FormativeEnvironment[] = [
  {
    id: '1',
    name: 'Avicultura',
    description: 'Producción y manejo de aves de corral.',
    type: 'animal',
    icon: 'Bird',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  {
    id: '1-1',
    parentId: '1',
    name: 'Galpón de Ponedoras',
    description: 'Área dedicada a la producción de huevos.',
    type: 'animal',
    icon: 'Bird',
    color: 'bg-orange-50 text-orange-600 border-orange-100',
  },
  {
    id: '1-2',
    parentId: '1',
    name: 'Recría',
    description: 'Crecimiento de pollitas de reemplazo.',
    type: 'animal',
    icon: 'Bird',
    color: 'bg-orange-50 text-orange-600 border-orange-100',
  },
  {
    id: '2',
    name: 'Huerta Orgánica',
    description: 'Cultivo de hortalizas y verduras sin agroquímicos.',
    type: 'vegetal',
    icon: 'Leaf',
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  {
    id: '2-1',
    parentId: '2',
    name: 'Invernadero 1',
    description: 'Producción bajo cubierta de tomates y pimientos.',
    type: 'vegetal',
    icon: 'Leaf',
    color: 'bg-green-50 text-green-600 border-green-100',
  },
  {
    id: '3',
    name: 'Tambo',
    description: 'Ordeñe y manejo de ganado lechero.',
    type: 'animal',
    icon: 'Milk',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    id: '4',
    name: 'Maquinaria Agrícola',
    description: 'Mantenimiento y uso de tractores e implementos.',
    type: 'maquinaria',
    icon: 'Settings',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
  },
];

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'a1',
    environmentId: '1',
    environmentName: 'Avicultura',
    title: 'Nuevos pollitos BB',
    content: 'Hoy recibimos 200 pollitos BB. Se inició el protocolo de calefacción y alimentación inicial.',
    author: 'Prof. García',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'a2',
    environmentId: '2',
    environmentName: 'Huerta Orgánica',
    title: 'Cosecha de Lechuga',
    content: 'Se cosecharon 50 cajones de lechuga criolla para el comedor escolar.',
    author: 'Alumno Martínez',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export const MOCK_SPREADSHEETS: Spreadsheet[] = [
  {
    id: 's1',
    environmentId: '1',
    title: 'Control de Mortandad',
    columns: ['Fila', 'Fecha', 'Cantidad', 'Causa Probable', 'Observaciones'],
    rows: [
      { Fila: 'Lote A', Fecha: '2024-03-20', Cantidad: 2, 'Causa Probable': 'Frío', Observaciones: 'Se reforzó calefacción' },
      { Fila: 'Lote B', Fecha: '2024-03-21', Cantidad: 1, 'Causa Probable': 'Desconocida', Observaciones: '-' },
    ],
    createdAt: new Date().toISOString(),
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    environmentId: '1',
    title: 'Limpieza de bebederos',
    dueDate: new Date().toISOString(),
    completed: false,
    priority: 'high',
  },
  {
    id: 't2',
    environmentId: '2',
    title: 'Riego por goteo - Sector A',
    dueDate: new Date().toISOString(),
    completed: true,
    priority: 'medium',
  },
];
