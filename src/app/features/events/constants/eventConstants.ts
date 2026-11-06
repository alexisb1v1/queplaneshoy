export interface EventCategoryItem {
  id: string;
  label: string;
  icon: string;
  badgeStyle: string;
}

export interface AgeRestrictionItem {
  id: string;
  label: string;
  icon: string;
}

export interface EventCityItem {
  id: string;
  name: string;
  departmentCode: string;
}

export const EVENT_CATEGORIES: EventCategoryItem[] = [
  { id: 'CONCERTS', label: 'Conciertos', icon: '🎵', badgeStyle: 'bg-purple-100 text-purple-700' },
  { id: 'THEATER', label: 'Teatro & Musicales', icon: '🎭', badgeStyle: 'bg-orange-100 text-orange-700' },
  { id: 'SPORTS', label: 'Deportes', icon: '⚽', badgeStyle: 'bg-blue-100 text-blue-700' },
  { id: 'FESTIVALS', label: 'Festivales', icon: '🎪', badgeStyle: 'bg-pink-100 text-pink-700' },
  { id: 'COMEDY', label: 'Comedia & Stand Up', icon: '🎤', badgeStyle: 'bg-yellow-100 text-yellow-700' },
  { id: 'GASTRONOMY', label: 'Gastronomía', icon: '🍔', badgeStyle: 'bg-green-100 text-green-700' },
];

export const EVENT_CITIES: EventCityItem[] = [
  { id: 'LIMA', name: 'Lima', departmentCode: '15' },
  { id: 'PUCALLPA', name: 'Pucallpa', departmentCode: '25' },
  { id: 'AREQUIPA', name: 'Arequipa', departmentCode: '04' },
  { id: 'CUSCO', name: 'Cusco', departmentCode: '08' },
  { id: 'TRUJILLO', name: 'Trujillo', departmentCode: '13' },
  { id: 'CHICLAYO', name: 'Chiclayo', departmentCode: '14' },
  { id: 'PIURA', name: 'Piura', departmentCode: '20' },
  { id: 'IQUITOS', name: 'Iquitos', departmentCode: '16' },
  { id: 'HUANCAYO', name: 'Huancayo', departmentCode: '12' },
  { id: 'TARAPOTO', name: 'Tarapoto', departmentCode: '22' },
];

export const AGE_RESTRICTIONS: AgeRestrictionItem[] = [
  { id: 'ALL_AGES', label: 'Para toda la familia', icon: '👨👩👧👦' },
  { id: 'PLUS_14', label: '+14 Años', icon: '⚠️' },
  { id: 'PLUS_18', label: 'Solo Mayores de 18', icon: '🔞' },
];

// Helper rápido para cuando recibas el evento desde la base de datos
export const getCategoryById = (id?: string): EventCategoryItem =>
  EVENT_CATEGORIES.find((category) => category.id === id) || EVENT_CATEGORIES[0];

export const getCityById = (idOrName?: string): EventCityItem =>
  EVENT_CITIES.find(
    (c) =>
      c.id.toLowerCase() === idOrName?.toLowerCase() ||
      c.name.toLowerCase() === idOrName?.toLowerCase(),
  ) || EVENT_CITIES[0];

export const getAgeRestrictionById = (id?: string): AgeRestrictionItem =>
  AGE_RESTRICTIONS.find((item) => item.id === id) || AGE_RESTRICTIONS[0];

/**
 * Convierte un texto a slug apto para URL:
 * - Minúsculas
 * - Sin tildes ni diacríticos (á -> a, ñ -> n)
 * - Caracteres especiales y espacios reemplazados por guiones (-)
 * - Sin guiones duplicados ni guiones en los extremos
 */
export const slugify = (text?: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

