// src/app/modules/stock/pages/stock-home/stock-home.component.ts
import { Component } from '@angular/core';
import { StockListComponent } from '../../components/stock-list/stock-list';
import {  MovementList, Movimiento } from '../../components/movement-list/movement-list';
import { StockItem } from '../../../../interfaces/stock';

@Component({
  selector: 'app-stock-home',
    imports: [StockListComponent, MovementList], // ← 
  templateUrl: './stock-home.html',
})
export class StockHomeComponent {
  stockItems: StockItem[] = [
    { id: 1, modelo: 'Iphone 11', modulos: [
      { id: 1, nombre: 'Pantalla', stock: 4 },
      { id: 2, nombre: 'Módulo cámara', stock: 2 },
      { id: 3, nombre: 'Batería', stock: 5 },
    ]},
  ];

  movimientos: Movimiento[] = [
    { id: 101, fecha: '2025-08-05', modelo: 'Iphone 11', tipo: 'ingreso', comentario: 'Compra', items: [
      { modulo: 'Pantalla', cantidad: 3 }, { modulo: 'Batería', cantidad: 1 }
    ]},
    { id: 102, fecha: '2025-08-07', modelo: 'Iphone 11', tipo: 'egreso', comentario: 'Reparación', items: [
      { modulo: 'Módulo cámara', cantidad: 1 }
    ]},
  ];
}
