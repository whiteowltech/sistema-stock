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
  },
  {
    id: 3,
    nombre: 'Teclado Mecánico',
    tipo: 'ingreso',
    cantidad: 10,
    fecha: '2025-08-02',
    comentario: 'Compra a proveedor'
  },
  {
    id: 4,
    nombre: 'Mouse Inalámbrico',
    tipo: 'egreso',
    cantidad: 3,
    fecha: '2025-08-03',
    comentario: 'Asignado a empleado'
  },
  {
    id: 5,
    nombre: 'Laptop Dell XPS 13',
    tipo: 'ingreso',
    cantidad: 2,
    fecha: '2025-08-04',
    comentario: 'Compra a proveedor'
  },
  {
    id: 6,
    nombre: 'Laptop Dell XPS 13',
    tipo: 'egreso',
    cantidad: 1,
    fecha: '2025-08-05',
    comentario: 'Asignado a gerente'
  },
  {
    id: 7,
    nombre: 'Monitor LG UltraWide',
    tipo: 'ingreso',
    cantidad: 3,
    fecha: '2025-08-06',
    comentario: 'Compra a proveedor'
  },
  {
    id: 8,
    nombre: 'Monitor LG UltraWide',
    tipo: 'egreso',
    cantidad: 1,
    fecha: '2025-08-07',
    comentario: 'Asignado a departamento de diseño'
  }
];
