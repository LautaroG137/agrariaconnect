import {
  Apple,
  Bird,
  Droplets,
  Egg,
  Fish,
  Flower2,
  Hammer,
  HelpCircle,
  Leaf,
  Milk,
  Rabbit,
  Settings,
  Sprout,
  Tractor,
  TreePine,
  Warehouse,
  Wheat,
  Wrench,
} from 'lucide-react';

export const iconMap = {
  Bird,
  Leaf,
  Milk,
  Settings,
  HelpCircle,
  Sprout,
  Wheat,
  Fish,
  Tractor,
  Flower2,
  Apple,
  Droplets,
  TreePine,
  Rabbit,
  Egg,
  Hammer,
  Wrench,
  Warehouse,
};

export type EnvironmentIconKey = keyof typeof iconMap;

export const ENV_ICON_OPTIONS: { key: EnvironmentIconKey; label: string }[] = [
  { key: 'Bird', label: 'Aves' },
  { key: 'Rabbit', label: 'Conejos' },
  { key: 'Fish', label: 'Pesca' },
  { key: 'Milk', label: 'Tambo' },
  { key: 'Egg', label: 'Huevos' },
  { key: 'Leaf', label: 'Vegetal' },
  { key: 'Sprout', label: 'Cultivo' },
  { key: 'Wheat', label: 'Cereales' },
  { key: 'Flower2', label: 'Flores' },
  { key: 'Apple', label: 'Frutales' },
  { key: 'TreePine', label: 'Forestal' },
  { key: 'Droplets', label: 'Riego' },
  { key: 'Tractor', label: 'Tractor' },
  { key: 'Settings', label: 'Maquinaria' },
  { key: 'Wrench', label: 'Taller' },
  { key: 'Hammer', label: 'Herramientas' },
  { key: 'Warehouse', label: 'Depósito' },
  { key: 'HelpCircle', label: 'Otro' },
];

export const DEFAULT_ENV_ICON: EnvironmentIconKey = 'Sprout';

export function isEnvironmentIconKey(value: string): value is EnvironmentIconKey {
  return value in iconMap;
}
