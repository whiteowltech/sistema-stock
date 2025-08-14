import { Injectable } from '@angular/core';
// import { STOCK_DATA } from '../stock-mock/stock-mock'; // ← si no lo usás, podés borrar esta línea
import { Modelo, Movimiento, MovimientoView } from '../../interfaces/stock';

@Injectable({ providedIn: 'root' })
export class StockService {

  // ====== Datos en memoria (mock) ======
  private modelos: Modelo[] = [
    {
      id: 1,
      nombre: 'Notebook Dell',
      modulos: [
        { id: 11, nombre: 'Pantalla' },
        { id: 12, nombre: 'Batería' },
        { id: 13, nombre: 'Teclado' }
      ]
    },
    {
      id: 2,
      nombre: 'iPhone 13',
      modulos: [
        { id: 21, nombre: 'Pantalla' },
        { id: 22, nombre: 'Módulo cámara' }
      ]
    },
  ];

  private movimientos: Movimiento[] = [
    {
      id: 1,
      fecha: '2025-08-01',
      modeloId: 1,
      items: [{ moduloId: 11, cantidad: 3 }, { moduloId: 12, cantidad: 1 }],
      tipo: 'ingreso',
      comentario: 'Compra a proveedor'
    },
    {
      id: 2,
      fecha: '2025-08-02',
      modeloId: 1,
      items: [{ moduloId: 12, cantidad: 1 }],
      tipo: 'egreso',
      comentario: 'Service'
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
    const id = this.nextModeloId();
    const normalizado: Modelo = {
      id,
      nombre: modelo.nombre,
      // comentario?: si tu interfaz lo contempla, podés extenderla
      modulos: (modelo.modulos ?? []).map(mod => ({
        id: mod.id ?? this.nextModuloId(),
        nombre: mod.nombre
      }))
    };
    this.modelos.push(normalizado);
    return normalizado;
  }

  /**
   * Actualiza un modelo por id.
   * - Reemplaza nombre.
   * - Reemplaza la lista de módulos por la provista (asigna id a los nuevos si falta).
   * Devuelve true si actualizó, false si no encontró el modelo.
   */
  updateModelo(modelo: Modelo): boolean {
    const idx = this.modelos.findIndex(m => m.id === modelo.id);
    if (idx === -1) return false;

    const nuevosModulos = (modelo.modulos ?? []).map(mod => ({
      id: mod.id ?? this.nextModuloId(),
      nombre: mod.nombre
    }));

    this.modelos[idx] = {
      id: modelo.id!,
      nombre: modelo.nombre,
      modulos: nuevosModulos
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
   * Estructura igual a Modelo pero cada módulo trae su stock 'cantidad'.
   */
  getModeloForEdit(id: number): { id: number; nombre: string; modulos: { id: number; nombre: string; cantidad: number }[] } | undefined {
    const modelo = this.getModelo(id);
    if (!modelo) return undefined;
    const stock = this.getStockMap(id);
    return {
      id: modelo.id,
      nombre: modelo.nombre,
      modulos: modelo.modulos.map(mm => ({
        id: mm.id,
        nombre: mm.nombre,
        cantidad: stock[mm.id] ?? 0
      }))
    };
  }

  // ====== Movimientos ======
  /** Tu método original para vista (modelo/modulo por nombre) */
  getMovimientosView(): MovimientoView[] {
    return this.movimientos
      .map(m => {
        const modelo = this.modelos.find(x => x.id === m.modeloId);
        const items = m.items.map(it => {
          const modulo = modelo?.modulos.find(mm => mm.id === it.moduloId);
          return { modulo: modulo?.nombre ?? '(?)', cantidad: it.cantidad };
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
