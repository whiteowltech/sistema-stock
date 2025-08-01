// src/app/core/services/stock-mock.ts
import { StockItem } from '../../interfaces/stock';
export const MOCK_STOCK_DATA: StockItem[] = [
  {
    id: 1,
    nombre: 'Pantalla Samsung 24"',
    tipo: 'ingreso',
    cantidad: 5,
    fecha: '2025-07-31',
    comentario: 'Compra a proveedor'
  },
  {
    id: 2,
    nombre: 'Pantalla Samsung 24"',
    tipo: 'egreso',
    cantidad: 2,
    fecha: '2025-08-01',
    comentario: 'Asignado a oficina'
  }
];
