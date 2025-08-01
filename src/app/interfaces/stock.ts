export interface StockItem {
  id: number;
  nombre: string;
  tipo: 'ingreso' | 'egreso';
  cantidad: number;
  fecha: string;
  comentario: string;
}