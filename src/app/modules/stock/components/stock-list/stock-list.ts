import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { StockService  } from '../../../../core/services/stock';
import { MovimientoView, TipoMovimiento } from '../../../../interfaces/stock';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.html',
  styleUrls: ['./stock-list.scss'],
  imports: [NgClass],
})
export class StockListComponent implements OnChanges {
  @Input() movimientos: MovimientoView[] = [];

  filtro: 'todos' | TipoMovimiento = 'todos';
  filtered: MovimientoView[] = [];

  ngOnChanges() { this.applyFilter(); }

  setFiltro(f: 'todos' | TipoMovimiento) {
    this.filtro = f;
    this.applyFilter();
  }

  private applyFilter() {
    this.filtered = this.filtro === 'todos'
      ? this.movimientos
      : this.movimientos.filter(m => m.tipo === this.filtro);
  }
}