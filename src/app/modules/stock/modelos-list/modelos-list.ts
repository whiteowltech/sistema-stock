import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RouterLink } from '@angular/router';
import { StockService } from '../../../core/services/stock';
import { InsumosService } from '../../../core/services/insumos';
import {
  Modelo,
  TipoModulo,            // 'con_borde' | 'sin_borde'
} from '../../../interfaces/stock';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modelos-list',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './modelos-list.html',
  styleUrls: ['./modelos-list.scss'],
})
export class ModelosList implements OnInit {
  // Devuelve cantidad, precio_costo y precio_venta para un tipo de módulo
  moduloInfo(modelo: Modelo, tipo: TipoModulo): string {
    const item = modelo.items.find(i => i.tipo === tipo);
    if (!item) return '0';
    return `${item.cantidad} / $${item.precio_costo} / $${item.precio_venta}`;
  }
  private stock = inject(StockService);
  private ins   = inject(InsumosService);

  // ---------- Modelos ----------
  modelos = signal<Modelo[]>([]);
  loading = signal(true);

  // 🔎 búsqueda por nombre de modelo
  search = signal('');
  onSearch(term: string) { this.search.set(this.norm(term)); }
  private norm(s: string) {
    return (s ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  filtered = computed(() => {
    const term = this.search();
    if (!term) return this.modelos();
    return this.modelos().filter(m => this.norm(m.nombre).includes(term));
  });

  // ---------- Insumos (stock global) ----------
  insLoading = signal(true);
  // estructura para la tabla de insumos, ahora incluye precios
  insumos = signal<{ id: number; tipoInsumo: string; cantidad: number; precio_costo: number; precio_venta: number }[]>([]);

  async ngOnInit(): Promise<void> {
    // Modelos
    const modelos = await firstValueFrom(this.stock.getModelos());
    this.modelos.set(modelos);
    this.loading.set(false);


    // Insumos (API)
    try {
      const catalogo = await firstValueFrom(this.ins.getInsumos());
      const rows = catalogo.map(i => ({
        id: i.id,
        tipoInsumo: i.tipoInsumo,
        cantidad: i.cantidad,
        precio_costo: Number(i.precio_costo),
        precio_venta: Number(i.precio_venta)
      }));
      console.log('Insumos cargados:', rows);
      this.insumos.set(rows);
    } catch (e) {
      this.insumos.set([]);
    } finally {
      this.insLoading.set(false);
    }
  }


  
}
