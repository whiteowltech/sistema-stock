import { Injectable } from '@angular/core';
import {
  Insumo, InsumoMovimiento, InsumoMovimientoView,
  TipoInsumo, TIPO_INSUMO_LABEL
} from '../../interfaces/stock';

@Injectable({ providedIn: 'root' })
export class InsumosService {
  // catálogo fijo de insumos globales
  private insumos: Insumo[] = [
    { id: 1001, tipo: 'pegamento_t7000', unidad: 'unidad' },
    { id: 1002, tipo: 'alcohol_1000ml',  unidad: 'ml' },
    { id: 1003, tipo: 'alcohol_500ml',   unidad: 'ml' },
    { id: 1004, tipo: 'alcohol_250ml',   unidad: 'ml' },
  ];

  private movimientos: InsumoMovimiento[] = [
    // ejemplo
    { id: 1, fecha: '2025-08-10', tipo: 'ingreso', comentario: 'Inicial',
      items: [{ insumoId: 1001, cantidad: 5 }] },
  ];

  // helpers
  getInsumos(): Insumo[] { return this.insumos; }

  private signo(t: InsumoMovimiento['tipo']) { return t === 'ingreso' ? +1 : -1; }

  getStockMap(): Record<number, number> {
    const acc: Record<number, number> = {};
    for (const mv of this.movimientos) {
      const s = this.signo(mv.tipo);
      for (const it of mv.items) {
        acc[it.insumoId] = (acc[it.insumoId] ?? 0) + s * it.cantidad;
      }
    }
    return acc;
  }

  createMovimiento(m: Omit<InsumoMovimiento, 'id'>): InsumoMovimiento {
    const id = (this.movimientos.length ? Math.max(...this.movimientos.map(x => x.id)) : 0) + 1;
    const nuevo: InsumoMovimiento = { ...m, id };
    this.movimientos.push(nuevo);
    return nuevo;
  }

  getMovimientosView(): InsumoMovimientoView[] {
    return this.movimientos.map(mv => {
      return {
        id: mv.id,
        fecha: mv.fecha,
        tipo: mv.tipo,
        comentario: mv.comentario,
        items: mv.items.map(it => {
          const ins = this.insumos.find(x => x.id === it.insumoId);
          const label = ins ? TIPO_INSUMO_LABEL[ins.tipo] : '(?)';
          return { insumo: label, cantidad: it.cantidad };
        })
      };
    }).sort((a,b) => b.fecha.localeCompare(a.fecha));
  }
}