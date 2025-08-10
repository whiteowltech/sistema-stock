import { Component, Input, OnChanges } from '@angular/core';
import { MovimientoView, TipoMovimiento } from '../../../../interfaces/stock';
import { DatePipe } from '@angular/common';

type SortKey = 'fecha' | 'modelo' | 'comentario' | 'tipo' | 'cantidad';

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.html',
  styleUrls: ['./stock-list.scss'],
  imports: [ DatePipe],
})
export class StockListComponent implements OnChanges {
  @Input() movimientos: MovimientoView[] = [];

  Math = Math; // 👈 lo agregas en la clase StockListComponent


  // Filtros existentes
  filtro: 'todos' | TipoMovimiento = 'todos';

  // Nuevo: búsqueda + orden + paginación
  searchTerm = '';
  sortKey: SortKey = 'fecha';
  sortDir: 'asc' | 'desc' = 'desc';

  page = 1;
  pageSize = 10;
  total = 0;

  // Data derivada
  private working: MovimientoView[] = [];
  visible: MovimientoView[] = [];

  ngOnChanges() { this.rebuild(); }

  setFiltro(f: 'todos' | TipoMovimiento) {
    this.filtro = f;
    this.page = 1;
    this.rebuild();
  }

  onSearch(term: string) {
    this.searchTerm = term.trim().toLowerCase();
    this.page = 1;
    this.rebuild();
  }

  onSort(key: SortKey) {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'asc';
    }
    this.rebuild();
  }

  goTo(page: number) {
    this.page = page;
    this.slicePage();
  }

  private rebuild() {
    // 1) filtrar por tipo
    let data = (this.filtro === 'todos')
      ? [...this.movimientos]
      : this.movimientos.filter(m => m.tipo === this.filtro);

    // 2) búsqueda (modelo, comentario, tipo)
    if (this.searchTerm) {
      data = data.filter(m => {
        const modelo = (m.modelo ?? '').toString().toLowerCase();
        const comentario = (m.comentario ?? '').toString().toLowerCase();
        const tipo = (m.tipo ?? '').toString().toLowerCase();
        return (
          modelo.includes(this.searchTerm) ||
          comentario.includes(this.searchTerm) ||
          tipo.includes(this.searchTerm)
        );
      });
    }

    // 3) ordenar
    data.sort((a, b) => this.compare(a, b, this.sortKey, this.sortDir));

    this.working = data;
    this.total = data.length;
    this.page = Math.max(1, Math.min(this.page, this.maxPage()));
    this.slicePage();
  }

  private slicePage() {
    const start = (this.page - 1) * this.pageSize;
    this.visible = this.working.slice(start, start + this.pageSize);
  }

  private maxPage() {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  private compare(a: any, b: any, key: SortKey, dir: 'asc'|'desc') {
    let va = a[key];
    let vb = b[key];

    // normalizar fechas
    if (key === 'fecha') {
      va = new Date(va).getTime();
      vb = new Date(vb).getTime();
    }

    // normalizar strings
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();

    const res = (va > vb) ? 1 : (va < vb ? -1 : 0);
    return dir === 'asc' ? res : -res;
  }

  // Dentro de tu componente (una sola vez)
  trackByMovimiento(_i: number, m: MovimientoView) {
    // Si hay id, usamos id. Si no, armamos una firma estable con items.
    return m.id ?? `${m.modelo}-${m.fecha}-${m.tipo}-${this.itemsSignature(m)}`;
  }

  // Firma corta basada en items (módulo:cantidad)
  private itemsSignature(m: MovimientoView): string {
    return (m.items ?? [])
      .map(i => `${i.modulo}:${i.cantidad}`)
      .join('|');
  }

  // Si además iterás los items dentro de cada movimiento:
  trackByItem(_i: number, it: { modulo: string; cantidad: number }) {
    return `${it.modulo}-${it.cantidad}`;
}
}
