// src/app/modules/stock/pages/stock-home/stock-home.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { StockListComponent } from '../../components/stock-list/stock-list';
import { StockService } from '../../../../core/services/stock';
import { Movimiento } from '../../../../interfaces/stock';
// import { StockItem } from '../../../../interfaces/stock';

@Component({
  selector: 'app-stock-home',
    imports: [StockListComponent], // ← 
  templateUrl: './stock-home.html',
})
export class StockHomeComponent implements OnInit {
  private stock: StockService;
  constructor() {
    this.stock = inject(StockService);
  }
  movimientos: Movimiento[] = [];

  async ngOnInit(): Promise<void> {
    this.movimientos = await firstValueFrom(this.stock.getMovimientos());
  }
}
