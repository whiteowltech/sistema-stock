import { Component, Input, OnChanges } from '@angular/core';
import { MovimientoView, TipoMovimiento } from '../../../../interfaces/stock';
import { DatePipe, NgClass } from '@angular/common';

type SortKey = 'fecha' | 'modelo' | 'comentario' | 'tipo' | 'cantidad';

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.html',
  styleUrls: ['./stock-list.scss'],
  imports: [ DatePipe, NgClass ],
})
export class StockListComponent implements OnChanges {
  @Input() movimientos: MovimientoView[] = [];
  // ⬇️ Agrego la lista de módulos/stock (opcional)
  @Input() stockItems: Array<{
    modelo?: string; nombre?: string; id?: string;
    stock?: number; cantidad?: number; total?: number;
    minimo?: number; minStock?: number; stock_min?: number;
  }> = [];

  Math = Math;

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
    return m.id ?? `${m.modelo}-${m.fecha}-${m.tipo}-${this.itemsSignature(m)}`;
  }

  private itemsSignature(m: MovimientoView): string {
    return (m.items ?? [])
      .map(i => `${i.modulo}:${i.cantidad}`)
      .join('|');
  }

  trackByItem(_i: number, it: { modulo: string; cantidad: number }) {
    return `${it.modulo}-${it.cantidad}`;
  }

  // ====== EXPORTS ======

  // 1) Helper universal para CSV
  private toCSV(headers: string[], rows: string[][]): string {
    const head = headers.join(',');
    const body = rows.map(r =>
      r.map(v => `"${(v ?? '').toString().replaceAll('"','""')}"`).join(',')
    );
    return [head, ...body].join('\r\n');
  }

  // 2) Descargar archivo
  private downloadCSV(name: string, csv: string) {
    const blob = new Blob([new Uint8Array([0xEF,0xBB,0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
    a.href = url;
    a.download = `${name}_${stamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // 3) Formateador de fecha (evita depender del DatePipe en export)
  private fmtAR = new Intl.DateTimeFormat('es-AR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });

  // helper: obtenés TODO (sin paginar/filtrar)
  private getAllMovimientos(): MovimientoView[] {
    return this.movimientos ?? [];
  }

  // Export original (sólo movimientos) — lo dejo por si lo seguís usando
  exportCSV() {
    const rows = this.getAllMovimientos();
    if (!rows?.length) return;

    const headers = ['Fecha','Modelo','Tipo','Comentario'];
    const csvRows = rows.map(r => ([
      r.fecha ? this.fmtAR.format(new Date(r.fecha)) : '',
      (r.modelo ?? ''),
      (r.tipo ?? ''),
      (r.comentario ?? '')
    ]));

    const csv = this.toCSV(headers, csvRows);
    this.downloadCSV('movimientos', csv);
  }

  // 🔹 NUEVO: Exportar TODO JUNTO (un único CSV con dos secciones)
  exportTodoEnUnCSV() {
    // --- Sección 1: Movimientos (con detalle de módulos si existe) ---
    const movs = this.getAllMovimientos();
    const movHeaders = ['Fecha','Modelo','Tipo','Comentario','Detalle'];
    const toDetalle = (m: any) => {
      const arr = m?.items ?? m?.modulos ?? m?.detalle ?? m?.itemsDetalle ?? [];
      if (!Array.isArray(arr) || !arr.length) return '';
      return arr.map((d: any) => {
        const nombre = d?.modulo ?? d?.modelo ?? d?.nombre ?? '';
        const cant = d?.cantidad ?? d?.qty ?? d?.cantidad_total ?? '';
        return `${nombre}:${cant}`;
      }).join('; ');
    };
    const movRows = movs.map(m => ([
      m.fecha ? this.fmtAR.format(new Date(m.fecha)) : '',
      m.modelo ?? '',
      m.tipo ?? '',
      m.comentario ?? '',
      toDetalle(m)
    ]));
    const movCSV = this.toCSV(movHeaders, movRows);

    this.downloadCSV('export_todo', movCSV);
  }
}
