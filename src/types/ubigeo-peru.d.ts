declare module 'ubigeo-peru' {
  export interface UbigeoItem {
    departamento: string;
    provincia: string;
    distrito: string;
    nombre: string;
  }

  export interface UbigeoPeru {
    reniec: UbigeoItem[];
    inei: UbigeoItem[];
  }

  const ubigeoPeru: UbigeoPeru;
  export default ubigeoPeru;
}

