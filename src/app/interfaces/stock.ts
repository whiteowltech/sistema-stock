// Tipos de módulo soportados
export type TipoModulo =
  | 'pantalla'          // Pantallas / display
  | 'pegamento'
  | 'plaqueta_carga'
  | 'alcohol_isopropilico'
  | 'tapa_trasera';

// Presentación para alcohol (en mililitros)
export type PresentacionMl = 250 | 500 | 1000;

export interface Modulo {
  id: number;
  // nombre: string;          // Ej: "Pantalla", "Pegamento", "Alcohol isopropílico"
  tipo: TipoModulo;        // 👈 categoría
  // Para alcohol, si querés manejar stock por presentación:
  presentacionMl?: PresentacionMl; // solo si tipo === 'alcohol_isopropilico'
}

export interface Modelo {
  id: number;
  nombre: string;
  modulos: Modulo[];
  comentario?: string;
}

export type TipoMovimiento = 'ingreso' | 'egreso';  // 👈 NUEVO

export interface Movimiento {
  id: number;
  fecha: string; // ISO
  modeloId: number;
  tipo: TipoMovimiento;            // 👈 usa el alias
  comentario?: string;
  items: {
    moduloId: number;
    cantidad: number;
    presentacionMl?: PresentacionMl;
  }[];
}

export interface MovimientoView {
  id: number;
  fecha: string;
  modelo: string;
  tipo: TipoMovimiento;            // 👈 usa el alias
  comentario?: string;
  items: { modulo: string; cantidad: number; presentacion?: string }[];
}
