import { Injectable } from '@angular/core';
import { MOCK_STOCK_DATA } from '../stock-mock/stock-mock';
import { StockItem } from '../../interfaces/stock';


@Injectable({
  providedIn: 'root'
})
export class StockService  {
   private stock: StockItem[] = MOCK_STOCK_DATA;

  getStock(): StockItem[] {
    return this.stock;
  }

  agregarMovimiento(item: StockItem) {
    this.stock.push({ ...item, id: Date.now() });
  }
}

