import ubigeoPeru, { UbigeoItem } from 'ubigeo-peru';

export interface UbigeoOption {
  code: string;
  name: string;
}

// Sanitización de la lista de INEI para corregir errores tipográficos conocidos de la librería externa ubigeo-peru
const rawList: UbigeoItem[] = (ubigeoPeru.inei || []).map((item) => {
  // En ubigeo-inei.json, la provincia de Bagua (Amazonas) viene erróneamente con provincia: "00" en lugar de "02"
  if (
    item.departamento === '01' &&
    item.nombre === 'Bagua' &&
    item.provincia === '00' &&
    item.distrito === '00'
  ) {
    return { ...item, provincia: '02' };
  }
  return item;
});

/**
 * Obtiene la lista ordenada de departamentos de Perú garantizando unicidad de código
 */
export function getDepartamentos(): UbigeoOption[] {
  const map = new Map<string, UbigeoOption>();
  for (const item of rawList) {
    if (item.provincia === '00' && item.distrito === '00') {
      if (!map.has(item.departamento)) {
        map.set(item.departamento, {
          code: item.departamento,
          name: item.nombre,
        });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Obtiene las provincias correspondientes a un departamento garantizando unicidad
 */
export function getProvincias(departamentoCode: string): UbigeoOption[] {
  if (!departamentoCode) return [];
  const map = new Map<string, UbigeoOption>();
  for (const item of rawList) {
    if (
      item.departamento === departamentoCode &&
      item.provincia !== '00' &&
      item.distrito === '00'
    ) {
      if (!map.has(item.provincia)) {
        map.set(item.provincia, {
          code: item.provincia,
          name: item.nombre,
        });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Obtiene los distritos correspondientes a una provincia garantizando unicidad
 */
export function getDistritos(departamentoCode: string, provinciaCode: string): UbigeoOption[] {
  if (!departamentoCode || !provinciaCode) return [];
  const map = new Map<string, UbigeoOption>();
  for (const item of rawList) {
    if (
      item.departamento === departamentoCode &&
      item.provincia === provinciaCode &&
      item.distrito !== '00'
    ) {
      if (!map.has(item.distrito)) {
        map.set(item.distrito, {
          code: item.distrito,
          name: item.nombre,
        });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Compone el código de ubigeo oficial de 6 dígitos
 */
export function buildUbigeoCode(dep: string, prov: string, dist: string): string {
  if (!dep || !prov || !dist) return '';
  return `${dep.padStart(2, '0')}${prov.padStart(2, '0')}${dist.padStart(2, '0')}`;
}

/**
 * Resuelve las etiquetas legibles dado un código de ubigeo de 6 dígitos
 */
export function parseUbigeoCode(code: string): {
  departamentoName: string;
  provinciaName: string;
  distritoName: string;
  fullLabel: string;
} {
  if (!code || code.length !== 6) {
    return {
      departamentoName: '',
      provinciaName: '',
      distritoName: '',
      fullLabel: '',
    };
  }

  const dep = code.substring(0, 2);
  const prov = code.substring(2, 4);
  const dist = code.substring(4, 6);

  const depItem = rawList.find(
    (i) => i.departamento === dep && i.provincia === '00' && i.distrito === '00'
  );
  const provItem = rawList.find(
    (i) => i.departamento === dep && i.provincia === prov && i.distrito === '00'
  );
  const distItem = rawList.find(
    (i) => i.departamento === dep && i.provincia === prov && i.distrito === dist
  );

  const departamentoName = depItem ? depItem.nombre : '';
  const provinciaName = provItem ? provItem.nombre : '';
  const distritoName = distItem ? distItem.nombre : '';

  const fullLabel = [distritoName, provinciaName, departamentoName]
    .filter(Boolean)
    .join(', ');

  return {
    departamentoName,
    provinciaName,
    distritoName,
    fullLabel,
  };
}

