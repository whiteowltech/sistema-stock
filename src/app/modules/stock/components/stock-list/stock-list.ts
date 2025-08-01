import { Component, OnInit } from '@angular/core';
import { StockService  } from '../../../../core/services/stock';
import { StockItem } from '../../../../interfaces/stock';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.html',
  styleUrls: ['./stock-list.scss'],
  imports: [NgClass],
})
export class StockListComponent implements OnInit {
  stockItems: StockItem[] = [];
  filteredItems: StockItem[] = [];
  filtro: 'todos' | 'ingreso' | 'egreso' = 'todos';

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
    this.stockItems = this.stockService.getStock();
    this.filtrar();
  }

  filtrar(): void {
    if (this.filtro === 'todos') {
      this.filteredItems = this.stockItems;
    } else {
      this.filteredItems = this.stockItems.filter(item => item.tipo === this.filtro);
    }
  }

  setFiltro(tipo: 'todos' | 'ingreso' | 'egreso'): void {
    this.filtro = tipo;
    this.filtrar();
  }
}
