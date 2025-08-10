import { Component, Input, OnChanges } from '@angular/core';

export type TipoMovimiento = 'ingreso' | 'egreso';

export interface MovimientoItem {
  modulo: string;
  cantidad: number;
}

export interface Movimiento {
  id: number;
  fecha: string;           // YYYY-MM-DD
  modelo: string;          // nombre del modelo
  tipo: TipoMovimiento;    // ingreso | egreso
  comentario: string;
  items: MovimientoItem[]; // módulos afectados
}
@Component({
  selector: 'app-movement-list',
  imports: [],
  templateUrl: './movement-list.html',
  styleUrl: './movement-list.scss'
})
export class MovementList implements OnChanges {
  @Input() movimientos: Movimiento[] = [];
  filtro: 'todos' | TipoMovimiento = 'todos';
  filtered: Movimiento[] = [];

  ngOnChanges() { this.apply(); }

  setFiltro(f: 'todos' | TipoMovimiento) {
    this.filtro = f;
    this.apply();
  }

  private apply() {
    const base = this.filtro === 'todos'
      ? this.movimientos
      : this.movimientos.filter(m => m.tipo === this.filtro);
    this.filtered = [...base].sort((a,b) => b.fecha.localeCompare(a.fecha));
  }
}