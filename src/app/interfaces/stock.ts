// interfaces/stock.ts
export interface Modulo {
  id: number;
  nombre: string;
}

export interface Modelo {
  id: number;
  nombre: string;
  modulos: Modulo[];
}

export type TipoMovimiento = 'ingreso' | 'egreso';

export interface MovimientoItem {
  moduloId: number;
  cantidad: number;
}

export interface Movimiento {
  id: number;
  fecha: string;                  // 'YYYY-MM-DD'
  modeloId: number;               // referencia al modelo
  items: MovimientoItem[];        // uno o varios módulos afectados
  tipo: TipoMovimiento;           // ingreso | egreso
  comentario: string;
}

/** Para la vista (resuelve nombres) */
export interface MovimientoView {
  id: number;
  fecha: string;
  modelo: string;
  tipo: TipoMovimiento;
  comentario: string;
  items: { modulo: string; cantidad: number }[];
}
export interface StockModule {
  id: number;
  nombre: string;
  stock: number; // stock actual de ese módulo
}

export interface StockItem {
  id: number;
  modelo: string;
  modulos: StockModule[];
}