import { Input } from '@angular/core';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { StockService } from '../../../../core/services/stock';
import { DatePipe } from '@angular/common';
import { Movimiento } from '../../../../interfaces/stock';
import { Modelo } from '../../../../interfaces/stock';
import { TipoModulo } from '../../../../interfaces/stock';
import { CategoriaNombrePipe } from '../../pipes/categoria-nombre.pipe';

// Tipos alineados con tu API
export type TipoMovimiento = 'ingreso' | 'egreso';

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.html',
  styleUrls: ['./stock-list.scss'],
  imports: [DatePipe, CategoriaNombrePipe],
})
export class StockListComponent implements OnInit {
  expanded: Record<string, boolean> = {};
  toggleExpand(id: string) {
    this.expanded[id] = !this.expanded[id];
  }
  // Array de modelos para la tabla
  modelos = signal<Modelo[]>([]);

  // Devuelve cantidad, precio_costo y precio_venta para un tipo de módulo
  moduloInfo(modelo: Modelo, tipo: TipoModulo): string {
    const item = modelo.items.find((i: { tipo: TipoModulo; cantidad: string; precio_costo: string; precio_venta: string }) => i.tipo === tipo);
    if (!item) return '0';
    return `${item.cantidad} / $${item.precio_costo} / $${item.precio_venta}`;
  }
  itemsResumen(items: { categoria: TipoModulo; cantidad: string }[]): string {
    if (!items?.length) return '';
    return items.map(it => `${it.categoria} x${it.cantidad}`).join(', ');
  }
  @Input() movimientos: Movimiento[] = [];

  // ==== inyección de servicio ====
  private stock = inject(StockService);

  // ==== estado ====
  loading = signal<boolean>(false);
  // private allMovimientos = signal<MovimientoView[]>([]);
  private allMovimientos = signal<Movimiento[]>([]);

  // filtros y búsqueda
  private filtro = signal<'todos' | 'ingreso' | 'egreso'>('todos');
  private search = signal<string>('');

  // orden
  sortKey: keyof Movimiento = 'fecha';
  sortDir: 'asc' | 'desc' = 'desc';

  // paginado
  page = 1;
  pageSize = 10;

  // para usar Math en el template (Math.ceil)
  public Math = Math;

  // ==== derivado: filtrado + búsqueda + orden ====
  private filteredSorted = computed<Movimiento[]>(() => {
    const q = this.normalize(this.search());
    const f = this.filtro();

    // 1) filtrar por tipo
    let data = this.allMovimientos().filter(m => f === 'todos' ? true : m.tipo === f);

    // 2) búsqueda (modeloId, comentario, tipo, items.categoria)
    if (q) {
      data = data.filter(m => {
        // Busca en modeloId, comentario, tipo y cada categoria de items
        const campos = [
          m.modeloId,
          m.comentario ?? '',
          m.tipo,
          ...m.items.map(it => it.categoria)
        ];
        return campos.some(txt => this.normalize(String(txt)).includes(q));
      });
    }

    // 3) ordenar por columna
    const dir = this.sortDir === 'asc' ? 1 : -1;
    data = [...data].sort((a, b) => {
      let va: any = (a as any)[this.sortKey];
      let vb: any = (b as any)[this.sortKey];

      if (this.sortKey === 'fecha') {
        // comparar como fecha
        const da = new Date(va).getTime();
        const db = new Date(vb).getTime();
        return (da - db) * dir;
      }

      // string-ish compare
      va = this.normalize(String(va ?? ''));
      vb = this.normalize(String(vb ?? ''));
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });

    return data;
  });

  // ==== getters mapeados al template ====
  get total(): number {
    return this.filteredSorted().length;
  }

  get visible(): Movimiento[] {
  const start = (this.page - 1) * this.pageSize;
  return this.filteredSorted().slice(start, start + this.pageSize);
  }

  // ==== ciclo de vida ====
  async ngOnInit(): Promise<void> {
    // Cargar modelos desde el servicio y guardarlos en la señal
    try {
      const modelos = await firstValueFrom(this.stock.getModelos());
      this.modelos.set(modelos);
    } catch (e) {
      this.modelos.set([]);
    }
    // Si se reciben movimientos por input, usarlos directamente
    if (this.movimientos && this.movimientos.length) {
      this.allMovimientos.set(this.movimientos);
      this.goTo(1);
      return;
    }
    // Si no, cargar desde el servicio
    await this.cargarMovimientos();
  }

  // ==== acciones del template ====
  setFiltro(f: 'todos' | 'ingreso' | 'egreso'): void {
    this.filtro.set(f);
    this.goTo(1);
  }

  onSearch(q: string): void {
    this.search.set(q);
    this.goTo(1);
  }

  onSort(key: 'fecha' | 'modelo' | 'tipo' | 'comentario'): void {
    const realKey = key === 'modelo' ? 'modeloId' : key;
    if (this.sortKey === realKey) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = realKey as keyof Movimiento;
      this.sortDir = 'asc';
    }
    this.goTo(1);
  }

  goTo(p: number): void {
    const totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
    this.page = Math.min(Math.max(1, p), totalPages);
  }

  // trackBy para @for
  trackByMovimiento = (_: number, m: Movimiento) => m.id;
  // Map items to expected shape for trackBy and template
  trackByItem = (_: number, it: { concepto: string; cantidad: number }) => `${it.concepto}:${it.cantidad}`;
  // Helper to map Movimiento.items to { concepto, cantidad }
  mapItem(it: { categoria: TipoModulo; cantidad: string }) {
    return { concepto: it.categoria, cantidad: Number(it.cantidad) };
  }

  // ==== helpers ====
  private normalize(s: string): string {
    return (s ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .trim();
  }

  // ==== carga desde el servicio ====
  private async cargarMovimientos(): Promise<void> {
    this.loading.set(true);
    try {
      // Intentamos varias firmas comunes sin romper tu service:
      // - this.stock.getMovimientos()
      // - this.stock.listMovimientos()
      // - this.stock.listMovements()
      const anyStock = this.stock as any;
      const call =
        anyStock.getMovimientos?.() ??
        anyStock.listMovimientos?.() ??
        anyStock.listMovements?.();

  let data: Movimiento[] = [];

      if (call?.subscribe) {
        // observable
        data = await firstValueFrom(call);
      } else if (typeof call?.then === 'function') {
        // promise
        data = await call;
      } else if (Array.isArray(call)) {
        // arreglo directo
        data = call;
      } else if (anyStock.movimientos$?.subscribe) {
        // observable expuesto como propiedad
        data = await firstValueFrom(anyStock.movimientos$);
      } else if (typeof anyStock.movimientos === 'function') {
        // función sync
        data = anyStock.movimientos();
      }

      this.allMovimientos.set(Array.isArray(data) ? data : []);
      console.log('Movimientos cargados:', data);
      this.goTo(1); // recalcular página por si cambió el total
    } catch (e) {
      console.error('Error cargando movimientos:', e);
      this.allMovimientos.set([]);
    } finally {
      this.loading.set(false);
    }
  }
}
