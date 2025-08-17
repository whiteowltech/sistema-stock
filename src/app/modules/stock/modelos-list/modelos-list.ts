import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StockService } from '../../../core/services/stock';
import { Modelo, TipoModulo, PresentacionMl } from '../../../interfaces/stock';

@Component({
  selector: 'app-modelos-list',
  standalone: true,               // 👈 faltaba
  imports: [RouterLink],          // 👈 RouterLink para [routerLink]
  templateUrl: './modelos-list.html',
  styleUrls: ['./modelos-list.scss'] // 👈 plural
})
export class ModelosList implements OnInit {
  private stock = inject(StockService);

  modelos = signal<Modelo[]>([]);
  loading = signal(true);

  // 🔎 búsqueda
  search = signal('');
  onSearch(term: string) { this.search.set(this.norm(term)); }
  private norm(s: string) {
    return (s ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }

  // lista filtrada
  filtered = computed(() => {
    const term = this.search();
    if (!term) return this.modelos();
    return this.modelos().filter(m => this.norm(m.nombre).includes(term));
  });

  ngOnInit() {
    this.modelos.set(this.stock.getModelos());
    this.loading.set(false);
  }

  // Helper para formatear el nombre del módulo (si necesitás modStock)
  private formatModulo(tipo: TipoModulo, presentacionMl?: PresentacionMl): string {
    const base: Record<TipoModulo, string> = {
      pantalla: 'Pantalla / display',
      pegamento: 'Pegamento',
      plaqueta_carga: 'Plaqueta de carga',
      alcohol_isopropilico: 'Alcohol isopropílico',
      tapa_trasera: 'Tapa trasera',
    };
    if (tipo === 'alcohol_isopropilico' && presentacionMl) {
      const label = presentacionMl === 1000 ? '1L' : `${presentacionMl} ml`;
      return `${base[tipo]} ${label}`;
    }
    return base[tipo];
  }

  // Si tu template ya usa columnas fijas + qty(), podés borrar modStock/totalStock
  modStock(m: Modelo) {
    const stockMap = this.stock.getStockMap(m.id);
    return (m.modulos || []).map(mod => ({
      nombre: this.formatModulo(mod.tipo, mod.presentacionMl),
      cantidad: stockMap[mod.id] ?? 0
    }));
  }

  totalStock(modelo: Modelo): number {
    return this.modStock(modelo).reduce((acc, it) => acc + (it.cantidad || 0), 0);
  }

  // Para las celdas por columna
  qty(m: Modelo, tipo: TipoModulo, presentacionMl?: PresentacionMl): number {
    const map = this.stock.getStockMap(m.id); // { [moduloId]: cantidad }
    const mod = (m.modulos || []).find(mm =>
      mm.tipo === tipo && ((mm.presentacionMl ?? 0) === (presentacionMl ?? 0))
    );
    return mod ? (map[mod.id] ?? 0) : 0;
  }
}
