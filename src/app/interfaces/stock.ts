// ===============================
// MODELADO PARA MODELOS
// ===============================

export type CategoriaItem = 'modulo' | 'plaqueta_carga' | 'tapa_trasera';

export interface PiezaModelo {
  id: number;
  categoria: 'plaqueta_carga' | 'tapa_trasera';
}
// Variantes fijas de PANTALLA por modelo
export type TipoModulo = 'con_borde' | 'sin_borde';

// Un módulo (pantalla) definido dentro de un modelo
export interface Modulo {
  id: number;           // único dentro del modelo
  tipo: TipoModulo;     // 'con_borde' | 'sin_borde'
}

// Otros componentes (stock por modelo)
export type TipoComponenteModelo = 'plaqueta_carga' | 'tapa_trasera';

// Etiquetas legibles para UI
export const TIPO_MOD_LABEL: Record<TipoModulo, string> = {
  con_borde: 'Módulo con borde',
  sin_borde: 'Módulo sin borde',
};

export const TIPO_COMP_LABEL: Record<TipoComponenteModelo, string> = {
  plaqueta_carga: 'Plaqueta de carga',
  tapa_trasera:   'Tapa trasera',
};

// Modelo (ej: "iPhone 12")
export interface Modelo {
  id: number;
  nombre: string;
  modulos: Modulo[];               // con_borde / sin_borde
  plaquetas?: PiezaModelo[];       // opcional
  tapas?: PiezaModelo[];           // opcional
  comentario?: string;

}

// ===============================
// MOVIMIENTOS POR MODELO
// ===============================

export type TipoMovimiento = 'ingreso' | 'egreso';

// Ítems de movimiento: pueden ser módulos (pantallas) o componentes (plaqueta/tapa)
export type MovimientoItem =
  | {
      clase: 'modulo';
      moduloId: number;     // referencia a Modulo.id del modelo
      cantidad: number;     // cantidad movida
    }
  | {
      clase: 'componente';
      componente: TipoComponenteModelo; // 'plaqueta_carga' | 'tapa_trasera'
      cantidad: number;
    };

export interface Movimiento {
  id: number;
  fecha: string; // ISO
  modeloId: number;
  tipo: 'ingreso' | 'egreso';
  comentario?: string;
  items: {
    categoria: CategoriaItem;   // 'modulo' | 'plaqueta_carga' | 'tapa_trasera'
    refId: number;              // id del Modulo o PiezaModelo según categoría
    cantidad: number;
  }[];
}

// Vista amigable para listados
export interface MovimientoView {
  id: number;
  fecha: string;
  modelo: string;
  tipo: TipoMovimiento;
  comentario?: string;
  items: {
    concepto: string;    // etiqueta legible (p.ej. "Módulo con borde", "Plaqueta de carga")
    cantidad: number;
  }[];
}

// ===============================
// INSUMOS (Stock global compartido)
// ===============================

export type TipoInsumo =
  | 'pegamento_t7000'
  | 'alcohol_1000ml'
  | 'alcohol_500ml'
  | 'alcohol_250ml';

export const TIPO_INSUMO_LABEL: Record<TipoInsumo, string> = {
  pegamento_t7000: 'Pegamento T7000',
  alcohol_1000ml: 'Alcohol isopropílico 1 L',
  alcohol_500ml:  'Alcohol isopropílico 500 ml',
  alcohol_250ml:  'Alcohol isopropílico 250 ml',
};

export interface Insumo {
  id: number;
  tipo: TipoInsumo;
  unidad?: 'unidad' | 'ml';
  nota?: string;
}

export type TipoMovimientoInsumo = 'ingreso' | 'egreso';

export interface InsumoMovimiento {
  id: number;
  fecha: string;                 // ISO
  tipo: TipoMovimientoInsumo;    // ingreso | egreso
  comentario?: string;
  items: {
    insumoId: number;            // referencia a Insumo.id
    cantidad: number;
  }[];
}

export interface InsumoMovimientoView {
  id: number;
  fecha: string;
  tipo: TipoMovimientoInsumo;
  comentario?: string;
  items: {
    insumo: string;              // etiqueta legible
    cantidad: number;
  }[];
}
