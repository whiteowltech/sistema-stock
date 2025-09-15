import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Insumo, InsumoMovimiento
} from '../../interfaces/stock';
import { environment } from '../../../../environment';

@Injectable({ providedIn: 'root' })
export class InsumosService {
  // PATCH precios de un insumo
  patchPreciosInsumo(id: string | number, precios: { precio_costo?: string | number; precio_venta?: string | number }) {
    return this.http.patch<{ ok: boolean }>(`${this.API}/${id}/precios`, precios);
  }
  private readonly API = environment.stockApiBase + '/insumos';
  constructor(private http: HttpClient) {}

  // Obtener un solo insumo por id
  getInsumo(id: any) {
    console.log('Fetching insumo with ID:', id);
    return this.http.get<Insumo>(`${this.API}/${id}`);
  }

  // Obtener todos los insumos
  getInsumos() {
    return this.http.get<Insumo[]>(this.API);
  }

  // Crear un nuevo insumo con todos los campos que espera la API
  createInsumo(data: {
    tipoInsumo: string;
    cantidad: number ;
    precio_costo: number | string;
    precio_venta: number | string;
    tipo: 'ingreso' | 'egreso';
    comentario?: string;
  }) {
    console.log('Creating insumo with data:', data);
    return this.http.post<Insumo>(`${this.API}`, data);
  }

  // Registrar movimiento de ingreso/egreso para un insumo
  addMovimientoInsumo(insumoId: number | string, movimiento: { tipo: 'ingreso' | 'egreso'; comentario?: string; cantidad: number; fecha?: string }) {
    return this.http.post<{ ok: boolean; insumo: Insumo }>(`${this.API}/${insumoId}/movimiento`, movimiento);
  }
}