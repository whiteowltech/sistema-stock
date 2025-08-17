// src/app/modules/stock/pages/stock-home/stock-home.component.ts
import { Component, inject } from '@angular/core';
import { StockListComponent } from '../../components/stock-list/stock-list';
import {  MovementList, Movimiento } from '../../components/movement-list/movement-list';
import { StockService } from '../../../../core/services/stock';
import { MovimientoView } from '../../../../interfaces/stock';
// import { StockItem } from '../../../../interfaces/stock';

@Component({
  selector: 'app-stock-home',
    imports: [StockListComponent], // ← 
  templateUrl: './stock-home.html',
})
export class StockHomeComponent {
  private stock = inject(StockService);
  movimientos: MovimientoView[] = this.stock.getMovimientosView(); // 👈 listo para la vista

}
