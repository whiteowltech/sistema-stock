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
  // stockItems: StockItem[] = [
  //   { id: 1, modelo: 'Iphone 11', modulos: [
  //     { id: 1, nombre: 'Pantalla', stock: 4 },
  //     { id: 2, nombre: 'Módulo cámara', stock: 2 },
  //     { id: 3, nombre: 'Batería', stock: 5 },
  //   ]},
  // ];

  // Dame muchos más datos
  movimientos: Movimiento[] = [
    { id: 101, fecha: '2025-08-05', modelo: 'Iphone 11', tipo: 'ingreso', comentario: 'Compra', items: [
      { modulo: 'Pantalla', cantidad: 3 }, { modulo: 'Batería', cantidad: 1 }
    ]},
    { id: 201, fecha: '2025-08-12', modelo: 'Iphone 12', tipo: 'ingreso', comentario: 'Compra', items: [
      { modulo: 'Pantalla', cantidad: 4 }, { modulo: 'Batería', cantidad: 2 }
    ]},
    { id: 202, fecha: '2025-08-14', modelo: 'Iphone 12', tipo: 'egreso', comentario: 'Reparación', items: [
      { modulo: 'Módulo cámara', cantidad: 1 }
    ]},
    { id: 203, fecha: '2025-08-17', modelo: 'Nokia 3310', tipo: 'ingreso', comentario: 'Compra', items: [
      { modulo: 'Pantalla', cantidad: 3 }, { modulo: 'Batería', cantidad: 1 }
    ]},
    { id: 204, fecha: '2025-08-20', modelo: 'Samsung Galaxy S21', tipo: 'ingreso', comentario: 'Compra', items: [
      { modulo: 'Pantalla', cantidad: 5 }, { modulo: 'Batería', cantidad: 3 }
    ]},
    { id: 205, fecha: '2025-08-22', modelo: 'Samsung Galaxy S21', tipo: 'egreso', comentario: 'Reparación', items: [
      { modulo: 'Módulo cámara', cantidad: 2 }
    ]},
    { id: 206, fecha: '2025-08-25', modelo: 'Google Pixel 6', tipo: 'ingreso', comentario: 'Compra', items: [
      { modulo: 'Pantalla', cantidad: 4 }, { modulo: 'Batería', cantidad: 2 }
    ]},
    { id: 207, fecha: '2025-08-27', modelo: 'Google Pixel 6', tipo: 'egreso', comentario: 'Reparación', items: [
      { modulo: 'Módulo cámara', cantidad: 1 }
    ]},
    { id: 208, fecha: '2025-08-30', modelo: 'OnePlus Nord', tipo: 'ingreso', comentario: 'Compra', items: [
      { modulo: 'Pantalla', cantidad: 3 }, { modulo: 'Batería', cantidad: 1 }
    ]},
    { id: 209, fecha: '2025-09-02', modelo: 'OnePlus Nord', tipo: 'egreso', comentario: 'Reparación', items: [
      { modulo: 'Módulo cámara', cantidad: 2 }
    ]},
    { id: 210, fecha: '2025-09-05', modelo: 'Xiaomi Mi 11', tipo: 'ingreso', comentario: 'Compra', items: [
      { modulo: 'Pantalla', cantidad: 6 }, { modulo: 'Batería', cantidad: 4 }
    ]},
  ];

}
