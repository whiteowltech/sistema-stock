import { Injectable } from '@angular/core';
import { STOCK_DATA } from '../stock-mock/stock-mock';
import { Modelo, Movimiento, MovimientoView } from '../../interfaces/stock';


@Injectable({
  providedIn: 'root'
})
export class StockService {
   private modelos: Modelo[] = [
    { id: 1, nombre: 'Notebook Dell', modulos: [
      { id: 11, nombre: 'Pantalla' }, { id: 12, nombre: 'Batería' }, { id: 13, nombre: 'Teclado' }
    ]},
    { id: 2, nombre: 'iPhone 13', modulos: [
      { id: 21, nombre: 'Pantalla' }, { id: 22, nombre: 'Módulo cámara' }
    ]},
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

  getMovimientosView(): MovimientoView[] {
    return this.movimientos.map(m => {
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
    }).sort((a,b) => b.fecha.localeCompare(a.fecha)); // más reciente arriba
  }
}