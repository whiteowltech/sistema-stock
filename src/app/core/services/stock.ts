import { Injectable } from '@angular/core';
import {
  Modelo,
  Movimiento,
  MovimientoView,
  TipoModulo,
  PresentacionMl
} from '../../interfaces/stock';

@Injectable({ providedIn: 'root' })
export class StockService {
  // ====== Texto por tipo ======
  private readonly NOMBRE_MODULO: Record<TipoModulo, string> = {
    pantalla: 'Pantalla / display',
    pegamento: 'Pegamento',
    plaqueta_carga: 'Plaqueta de carga',
    alcohol_isopropilico: 'Alcohol isopropílico',
    tapa_trasera: 'Tapa trasera',
  };

  private nombreModulo(mod?: { tipo: TipoModulo; presentacionMl?: PresentacionMl }): string {
    if (!mod) return '(?)';
    if (mod.tipo === 'alcohol_isopropilico' && mod.presentacionMl) {
      const label = mod.presentacionMl === 1000 ? '1L' : `${mod.presentacionMl}ml`;
      return `${this.NOMBRE_MODULO[mod.tipo]} ${label}`;
    }
    return this.NOMBRE_MODULO[mod.tipo];
  }

  // ====== Datos en memoria (mock) ======
private modelos: Modelo[] = [
  {
    id: 1,
    nombre: 'Notebook Dell',
    modulos: [
      { id: 11, tipo: 'pantalla' },
      { id: 12, tipo: 'pegamento' },
      { id: 13, tipo: 'plaqueta_carga' },
    ]
  },
  {
    id: 2,
    nombre: 'iPhone 13',
    modulos: [
      { id: 21, tipo: 'pantalla' },
      { id: 22, tipo: 'tapa_trasera' },
      { id: 23, tipo: 'alcohol_isopropilico', presentacionMl: 1000 },
      { id: 24, tipo: 'alcohol_isopropilico', presentacionMl: 500 },
      { id: 25, tipo: 'alcohol_isopropilico', presentacionMl: 250 },
    ]
  },
  {
    id: 3,
    nombre: 'Samsung Galaxy S21',
    modulos: [
      { id: 31, tipo: 'pantalla' },
      { id: 32, tipo: 'tapa_trasera' },
      { id: 33, tipo: 'alcohol_isopropilico', presentacionMl: 1000 },
      { id: 34, tipo: 'pegamento' }
    ]
  },
  {
    id: 4,
    nombre: 'Xiaomi Mi 11',
    modulos: [
      { id: 41, tipo: 'pantalla' },
      { id: 42, tipo: 'plaqueta_carga' },
      { id: 43, tipo: 'pegamento' }
    ]
  }
];

private movimientos: Movimiento[] = [
  {
    id: 101,
    fecha: '2025-08-05',
    modeloId: 1, // Notebook Dell
    tipo: 'ingreso',
    comentario: 'Compra',
    items: [
      { moduloId: 11, cantidad: 3 }, // Pantalla
      { moduloId: 12, cantidad: 1 }  // Pegamento
    ]
  },
  {
    id: 201,
    fecha: '2025-08-12',
    modeloId: 2, // iPhone 13
    tipo: 'ingreso',
    comentario: 'Compra',
    items: [
      { moduloId: 21, cantidad: 4 }, // Pantalla
      { moduloId: 22, cantidad: 2 }  // Tapa trasera
    ]
  },
  {
    id: 202,
    fecha: '2025-08-14',
    modeloId: 2, // iPhone 13
    tipo: 'egreso',
    comentario: 'Reparación',
    items: [
      { moduloId: 22, cantidad: 1 }  // Tapa trasera
    ]
  },
  {
    id: 203,
    fecha: '2025-08-20',
    modeloId: 2, // iPhone 13
    tipo: 'ingreso',
    comentario: 'Alcohol 1L',
    items: [
      { moduloId: 23, cantidad: 2, presentacionMl: 1000 } // Alcohol 1L
    ]
  },
  {
    id: 204,
    fecha: '2025-08-22',
    modeloId: 3, // Samsung Galaxy S21
    tipo: 'ingreso',
    comentario: 'Compra',
    items: [
      { moduloId: 31, cantidad: 5 }, // Pantalla
      { moduloId: 32, cantidad: 3 }  // Tapa trasera
    ]
  },
  {
    id: 205,
    fecha: '2025-08-25',
    modeloId: 3, // Samsung Galaxy S21
    tipo: 'egreso',
    comentario: 'Reparación',
    items: [
      { moduloId: 32, cantidad: 1 }  // Tapa trasera
    ]
  },
  {
    id: 206,
    fecha: '2025-08-27',
    modeloId: 4, // Xiaomi Mi 11
    tipo: 'ingreso',
    comentario: 'Compra',
    items: [
      { moduloId: 41, cantidad: 6 }, // Pantalla
      { moduloId: 43, cantidad: 2 }  // Pegamento
    ]
  },
  {
    id: 207,
    fecha: '2025-09-02',
    modeloId: 4, // Xiaomi Mi 11
    tipo: 'egreso',
    comentario: 'Reparación',
    items: [
      { moduloId: 42, cantidad: 1 } // Plaqueta de carga
    ]
  }
];


  // ====== Utilidades internas ======
  private nextModeloId(): number {
    return (this.modelos.length ? Math.max(...this.modelos.map(m => m.id)) : 0) + 1;
  }

  private nextModuloIdSeed = Date.now();
  private nextModuloId(): number {
    return ++this.nextModuloIdSeed;
  }

  private nextMovimientoId(): number {
    return (this.movimientos.length ? Math.max(...this.movimientos.map(m => m.id)) : 0) + 1;
  }

  private signo(tipo: Movimiento['tipo']): number {
    return tipo === 'ingreso' ? +1 : -1;
  }

  // ====== Modelos ======
  getModelos(): Modelo[] {
    return this.modelos;
  }

  getModelo(id: number): Modelo | undefined {
    return this.modelos.find(m => m.id === id);
  }

  /** Crea un nuevo modelo. A los módulos sin id les asigna uno nuevo. */
  createModelo(modelo: Modelo): Modelo {
    const nextId = this.nextModeloId();
    const newModelo: Modelo = {
      id: nextId,
      nombre: modelo.nombre,
      comentario: modelo.comentario,
      modulos: (modelo.modulos ?? []).map((mod, idx) => ({
        id: mod.id ?? (Date.now() + idx),
        tipo: mod.tipo,
        presentacionMl: mod.presentacionMl
      }))
    };
    this.modelos.push(newModelo);
    return newModelo;
  }

  /**
   * Actualiza un modelo por id.
   * - Reemplaza nombre/comentario.
   * - Reemplaza la lista de módulos por la provista (asigna id a los nuevos si falta).
   * Devuelve true si actualizó, false si no encontró el modelo.
   */
  updateModelo(modelo: Modelo): boolean {
    const idx = this.modelos.findIndex(m => m.id === modelo.id);
    if (idx === -1) return false;
    this.modelos[idx] = {
      id: modelo.id!,
      nombre: modelo.nombre,
      comentario: modelo.comentario,
      modulos: (modelo.modulos ?? []).map((mod, idx2) => ({
        id: mod.id ?? (Date.now() + idx2),
        tipo: mod.tipo,
        presentacionMl: mod.presentacionMl
      }))
    };
    return true;
  }

  /**
   * Stock actual por módulo para un modelo (calculado desde movimientos).
   * Retorna: { [moduloId]: cantidad }
   */
  getStockMap(modeloId: number): Record<number, number> {
    const acc: Record<number, number> = {};
    for (const mv of this.movimientos) {
      if (mv.modeloId !== modeloId) continue;
      const s = this.signo(mv.tipo);
      for (const it of mv.items) {
        acc[it.moduloId] = (acc[it.moduloId] ?? 0) + s * it.cantidad;
      }
    }
    return acc;
  }

  /**
   * Devuelve el modelo listo para edición con cantidades actuales por módulo.
   * Estructura: { id, nombre, modulos: [{ id, tipo, presentacionMl?, cantidad }] }
   */
  getModeloForEdit(id: number): {
    id: number;
    nombre: string;
    modulos: { id: number; tipo: TipoModulo; presentacionMl?: PresentacionMl; cantidad: number }[];
  } | undefined {
    const modelo = this.getModelo(id);
    if (!modelo) return undefined;
    const stock = this.getStockMap(id);
    return {
      id: modelo.id,
      nombre: modelo.nombre,
      modulos: modelo.modulos.map(mm => ({
        id: mm.id,
        tipo: mm.tipo,
        presentacionMl: mm.presentacionMl,
        cantidad: stock[mm.id] ?? 0
      }))
    };
  }

  // ====== Movimientos ======
  /** Vista de movimientos con nombre de módulo derivado (tipo/presentación) */
  getMovimientosView(): MovimientoView[] {
    return this.movimientos
      .map(m => {
        const modelo = this.modelos.find(x => x.id === m.modeloId);
        const items = m.items.map(it => {
          const modulo = modelo?.modulos.find(mm => mm.id === it.moduloId);
          const moduloLabel = this.nombreModulo(modulo);
          const presentacion = it.presentacionMl ? `${it.presentacionMl}ml` : undefined; // opcional
          return { modulo: moduloLabel, cantidad: it.cantidad, presentacion };
        });
        return {
          id: m.id,
          fecha: m.fecha,
          modelo: modelo?.nombre ?? '(?)',
          tipo: m.tipo,
          comentario: m.comentario,
          items
        };
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  /** Alta de movimiento (no valida stock; podés sumar validación si es egreso). */
  createMovimiento(mov: Movimiento): Movimiento {
    const nuevo: Movimiento = { ...mov, id: this.nextMovimientoId() };
    this.movimientos.push(nuevo);
    return nuevo;
  }
}
