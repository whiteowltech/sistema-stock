import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Modelo, Movimiento } from '../../interfaces/stock';
import { environment } from '../../../../environment';
@Injectable({ providedIn: 'root' })
export class StockService {
  // Editar precios de los módulos de un modelo
  patchPreciosModelo(modeloId: string, items: Array<{ categoria: string; precio_costo?: string | number; precio_venta?: string | number }>): Observable<any> {
    return this.http.patch<any>(`${this.API}/modelos/${modeloId}/precios`, { items });
  }
  // Editar un modelo existente
  updateModelo(modelo: Modelo): Observable<Modelo> {
    return this.http.put<Modelo>(`${this.API}/${modelo.id}`, modelo);
  }
  // private readonly API = '
  // Llamar a env prod
  private readonly API = environment.stockApiBase;

  constructor(private http: HttpClient) {}

  // Registrar movimiento para un modelo
  addMovimiento(modeloId: string, movimiento: any): Observable<any> {
    console.log('Payload movimiento:', movimiento);
    return this.http.post<any>(`${this.API}/modelos/${modeloId}/movimiento`, movimiento);
  }
  // Listar todos los modelos
  getModelos(): Observable<Modelo[]> {
    return this.http.get<Modelo[]>(`${this.API}/modelos`);
  }

  // Obtener un modelo por id
  getModelo(id: string): Observable<Modelo> {
    return this.http.get<Modelo>(`${this.API}/modelos/${id}`);
  }

  // Crear un modelo
  addModelo(modelo: Partial<Modelo>): Observable<Modelo> {
    return this.http.post<Modelo>(`${this.API}/modelos`, modelo);
  }

    // Listar todos los movimientos
  getMovimientos(): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(`${this.API}/movimientos`);
  }

  deleteModelo(id: string): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${this.API}/modelos/${id}`);
  }


}


