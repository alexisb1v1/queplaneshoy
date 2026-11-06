/**
 * Utilidades para humanizar y formatear restricciones de edad en eventos
 */

export interface AgeRestrictionBadge {
  label: string;
  badgeText: string;
  icon: string;
  variant: 'green' | 'amber' | 'indigo' | 'slate';
  description: string;
}

export function formatAgeRestriction(raw?: string | null): AgeRestrictionBadge {
  const norm = (raw || '').trim().toUpperCase();

  if (
    norm === 'ALL_AGES' ||
    norm === 'TODO_PUBLICO' ||
    norm === 'TODAS LAS EDADES' ||
    norm === 'APTO PARA TODO PUBLICO' ||
    norm === 'TODOS'
  ) {
    return {
      label: 'Apto para todo público',
      badgeText: 'Todo Público',
      icon: 'family_restroom',
      variant: 'green',
      description: 'Ingreso permitido para personas de todas las edades.',
    };
  }

  if (
    norm === 'PLUS_14' ||
    norm === 'OVER_14' ||
    norm === '+14' ||
    norm === '14+' ||
    norm === 'MAYORES_14'
  ) {
    return {
      label: 'Mayores de 14 años (+14)',
      badgeText: '+14 años',
      icon: 'person',
      variant: 'amber',
      description: 'Exclusivo para personas de 14 años a más (DNI requerido).',
    };
  }

  if (
    norm === 'PLUS_18' ||
    norm === 'OVER_18' ||
    norm === '+18' ||
    norm === '18+' ||
    norm === 'MAYORES_18' ||
    norm === 'ADULTOS'
  ) {
    return {
      label: 'Exclusivo mayores de 18 años (+18)',
      badgeText: '+18 años',
      icon: 'verified_user',
      variant: 'indigo',
      description: 'Exclusivo para personas mayores de edad con DNI o documento oficial vigente.',
    };
  }

  if (
    norm === 'PLUS_21' ||
    norm === 'OVER_21' ||
    norm === '+21' ||
    norm === '21+'
  ) {
    return {
      label: 'Mayores de 21 años (+21)',
      badgeText: '+21 años',
      icon: 'verified_user',
      variant: 'indigo',
      description: 'Exclusivo para personas de 21 años a más con identificación oficial.',
    };
  }

  if (!norm) {
    return {
      label: 'Apto para todo público',
      badgeText: 'Todo Público',
      icon: 'family_restroom',
      variant: 'green',
      description: 'Ingreso permitido para todas las edades.',
    };
  }

  // Fallback con el texto provisto humanizado
  const humanized = raw!.replace(/_/g, ' ');
  return {
    label: humanized,
    badgeText: humanized,
    icon: 'info',
    variant: 'slate',
    description: `Restricción de ingreso: ${humanized}.`,
  };
}

