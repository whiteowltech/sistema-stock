import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StockService } from '../../../core/services/stock';
import { InsumosService } from '../../../core/services/insumos';
import {
  Modelo,
  TipoModulo,            // 'con_borde' | 'sin_borde'
  TipoInsumo,
  TIPO_INSUMO_LABEL
} from '../../../interfaces/stock';

@Component({
  selector: 'app-modelos-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './modelos-list.html',
  styleUrls: ['./modelos-list.scss'],
})
export class ModelosList implements OnInit {
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
  // estructura para la tabla de insumos
  insumos = signal<{ tipo: TipoInsumo; etiqueta: string; cantidad: number }[]>([]);

  ngOnInit(): void {
    // Modelos
    this.modelos.set(this.stock.getModelos());
    this.loading.set(false);

    // Insumos
    const catalogo = this.ins.getInsumos();      // [{ id, tipo, ... }]
    const stockMap = this.ins.getStockMap();     // { [insumoId]: cantidad }
    const rows = catalogo.map(i => ({
      tipo: i.tipo,
      etiqueta: TIPO_INSUMO_LABEL[i.tipo],
      cantidad: stockMap[i.id] ?? 0,
    }));
    this.insumos.set(rows);
    this.insLoading.set(false);
  }

  // ---------- Helpers para cantidades por columna ----------

  // Stock de módulos por variante fija
  qtyModulo(m: Modelo, tipo: TipoModulo): number {
    const map = this.stock.getStockMap(m.id); // { [moduloId]: cantidad }
    const mod = (m.modulos || []).find(mm => mm.tipo === tipo);
    return mod ? (map[mod.id] ?? 0) : 0;
  }

  // Stock de Plaquetas por modelo (vía servicio)
  qtyPlaqueta(m: Modelo): number {
    return this.stock.getPlaquetaStock(m.id) ?? 0;
  }

  // Stock de Tapas por modelo (vía servicio)
  qtyTapa(m: Modelo): number {
    return this.stock.getTapaStock(m.id) ?? 0;
  }
}
