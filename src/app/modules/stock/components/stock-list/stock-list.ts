import { Component, Input, OnChanges } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MovimientoView, TipoMovimiento } from '../../../../interfaces/stock';

type SortKey = 'fecha' | 'modelo' | 'comentario' | 'tipo' | 'cantidad';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  templateUrl: './stock-list.html',
  styleUrls: ['./stock-list.scss'],
  imports: [DatePipe],
})
export class StockListComponent implements OnChanges {
  // 👉 Entradas
  @Input() movimientos: MovimientoView[] = [];

  // 👉 util en template (paginador)
  Math = Math;

  // 👉 filtros / orden / paginación
  filtro: 'todos' | TipoMovimiento = 'todos';
  searchTerm = '';
  sortKey: SortKey = 'fecha';
  sortDir: 'asc' | 'desc' = 'desc';

  page = 1;
  pageSize = 10;
  total = 0;

  // 👉 data derivada
  private working: MovimientoView[] = [];
  visible: MovimientoView[] = [];

  ngOnChanges() {
    this.rebuild();
  }

  // ======== UI handlers ========
  setFiltro(f: 'todos' | TipoMovimiento) {
    this.filtro = f;
    this.page = 1;
    this.rebuild();
  }

  onSearch(term: string) {
    this.searchTerm = (term ?? '').trim().toLowerCase();
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

  // ======== pipeline ========
  private rebuild() {
    // 1) filtro tipo
    let data =
      this.filtro === 'todos'
        ? [...(this.movimientos ?? [])]
        : (this.movimientos ?? []).filter((m) => m.tipo === this.filtro);

    // 2) búsqueda
    if (this.searchTerm) {
      data = data.filter((m) => {
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

    // 4) paginar
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

  private compare(a: any, b: any, key: SortKey, dir: 'asc' | 'desc') {
    let va = a?.[key];
    let vb = b?.[key];

    if (key === 'fecha') {
      va = va ? new Date(va).getTime() : 0;
      vb = vb ? new Date(vb).getTime() : 0;
    }

    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();

    const res = va > vb ? 1 : va < vb ? -1 : 0;
    return dir === 'asc' ? res : -res;
    }

  // ======== trackBy ========
  trackByMovimiento(_i: number, m: MovimientoView) {
    return m.id ?? `${m.modelo}-${m.fecha}-${m.tipo}-${this.itemsSignature(m)}`;
  }

  trackByItem(_i: number, it: { concepto: string; cantidad: number }) {
    return `${it.concepto}-${it.cantidad}`;
  }

  private itemsSignature(m: MovimientoView): string {
    return (m.items ?? [])
      .map((i: any) => `${i.concepto}:${i.cantidad}`)
      .join('|');
  }

  // ======== EXPORTS ========
  // CSV helper
  private toCSV(headers: string[], rows: string[][]): string {
    const head = headers.join(',');
    const body = rows.map((r) =>
      r.map((v) => `"${(v ?? '').toString().replaceAll('"', '""')}"`).join(',')
    );
    return [head, ...body].join('\r\n');
  }

  // descarga
  private downloadCSV(name: string, csv: string) {
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    a.href = url;
    a.download = `${name}_${stamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // formateo fecha rápido (para export)
  private fmtAR = new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  // detalle ítems en una celda
  private detalleLinea(m: MovimientoView): string {
    const arr = m?.items ?? [];
    if (!Array.isArray(arr) || !arr.length) return '';
    return arr.map((d) => `${d.concepto}:${d.cantidad}`).join('; ');
  }

  // Exporta TODO lo filtrado (ignora paginación)
  exportFiltradoCSV() {
    const rows = this.working; // ya filtrado/ordenado
    if (!rows?.length) return;

    const headers = ['Fecha', 'Modelo', 'Tipo', 'Comentario', 'Detalle'];
    const csvRows = rows.map((r) => [
      r.fecha ? this.fmtAR.format(new Date(r.fecha)) : '',
      r.modelo ?? '',
      r.tipo ?? '',
      r.comentario ?? '',
      this.detalleLinea(r),
    ]);

    this.downloadCSV('movimientos_filtrado', this.toCSV(headers, csvRows));
  }

  // Exporta SOLO la página visible
  exportPaginaCSV() {
    const rows = this.visible;
    if (!rows?.length) return;

    const headers = ['Fecha', 'Modelo', 'Tipo', 'Comentario', 'Detalle'];
    const csvRows = rows.map((r) => [
      r.fecha ? this.fmtAR.format(new Date(r.fecha)) : '',
      r.modelo ?? '',
      r.tipo ?? '',
      r.comentario ?? '',
      this.detalleLinea(r),
    ]);

    this.downloadCSV('movimientos_pagina', this.toCSV(headers, csvRows));
  }
}
