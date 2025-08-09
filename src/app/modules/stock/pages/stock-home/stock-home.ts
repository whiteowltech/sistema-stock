import { Component, OnInit } from '@angular/core';
import { StockItem } from '../../../../interfaces/stock';
import { StockService } from '../../../../core/services/stock';

@Component({
  selector: 'app-stock-home',
  imports: [],
  templateUrl: './stock-home.html',
  styleUrl: './stock-home.scss'
})
export class StockHome implements OnInit {
  stockItems: StockItem[] = [];

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
    this.stockItems = this.stockService.getStock();
  }

  agregarMovimiento(item: StockItem) {
    this.stockService.agregarMovimiento(item);
    this.stockItems = this.stockService.getStock(); // actualiza la vista
  }
}