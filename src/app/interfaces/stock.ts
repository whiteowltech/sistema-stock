// ===============================
// MODELADO PARA MODELOS
// ===============================



// Variantes fijas de PANTALLA por modelo
export type TipoModulo = 'con_borde' | 'sin_borde' | 'plaqueta_carga' | 'tapa_trasera';

// Un módulo (pantalla) definido dentro de un modelo
export interface Modulo {
  id: string;           // único dentro del modelo
  tipo: TipoModulo;     // 'con_borde' | 'sin_borde' | 'plaqueta_carga' | 'tapa_trasera'
  cantidad: string;
  precio_costo: string; // precio de costo
  precio_venta: string;  // precio de venta
}

// Modelo (ej: "iPhone 12")
export interface Modelo {
  id: string;
  nombre: string;
  items: Modulo[];               // con_borde / sin_borde
  comentario?: string;

}
export type TipoMovimiento = 'ingreso' | 'egreso';
// ===============================
// MOVIMIENTOS POR MODELO
// ===============================

export interface Movimiento {
  id: string;
  fecha: string; // ISO
  modeloId: string;
  nombre: string; // nombre del modelo o insumo
  tipo: TipoMovimiento;
  comentario?: string;
  items: {
    categoria: TipoModulo;   // 'modulo' | 'plaqueta_carga' | 'tapa_trasera'
    cantidad: string;
  }[];
}


// ===============================
// INSUMOS (Stock global compartido)
// ===============================

export interface Insumo {
  id: number;
  tipoInsumo: string | any;
  cantidad: number;
  precio_costo: string | any; // precio de costo
  precio_venta: string | any;  // precio de venta
}

export type TipoMovimientoInsumo = 'ingreso' | 'egreso';

export interface InsumoMovimiento {
  id: number;
  fecha: string;                 // ISO
  tipo: TipoMovimientoInsumo;    // ingreso | egreso
  comentario?: string;
  insumo: Insumo;
}



