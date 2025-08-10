// src/app/core/services/stock-mock.ts
import { StockItem } from '../../interfaces/stock';
export const STOCK_DATA: StockItem[] = [
  {
    id: 1,
    modelo: 'Notebook Dell',
    modulos: [
      { id: 1, nombre: 'Pantalla', stock: 10 },
      { id: 2, nombre: 'Batería', stock: 5 },
      { id: 3, nombre: 'Teclado', stock: 8 }
    ]
  },
  {
    id: 2,
    modelo: 'iPhone 13',
    modulos: [
      { id: 1, nombre: 'Pantalla', stock: 4 },
      { id: 2, nombre: 'Módulo cámara', stock: 2 }
    ]
  }
];

