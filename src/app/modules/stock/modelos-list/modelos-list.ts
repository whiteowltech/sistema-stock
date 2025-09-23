import { Component, OnInit, computed, inject, signal, effect } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RouterLink } from '@angular/router';
import { StockService } from '../../../core/services/stock';
import { InsumosService } from '../../../core/services/insumos';
import {
  Modelo,
  TipoModulo,            // 'con_borde' | 'sin_borde'
} from '../../../interfaces/stock';
import { CommonModule } from '@angular/common';
import { CategoriaNombrePipe } from '../pipes/categoria-nombre.pipe';
import { LowStockBellComponent } from '../../../shared/low-stock-bell.component';
import { checkLowStock, getLowStockNotificationsEnabled } from '../../../shared/low-stock-check';
import { LowStockStateService } from '../../../core/services/low-stock-state.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ToastNotificationsComponent } from '../../../shared/toast-notifications.component';

@Component({
  selector: 'app-modelos-list',
  standalone: true,
  imports: [RouterLink, CommonModule, CategoriaNombrePipe, ToastNotificationsComponent, LowStockBellComponent],
  templateUrl: './modelos-list.html',
  styleUrls: ['./modelos-list.scss'],
})
export class ModelosList implements OnInit {
  private notification: NotificationService;
  private lowStockState: LowStockStateService;
  private stock: StockService;
  private ins: InsumosService;
  // --- Modal edición precios insumo ---
  constructor() {
  this.notification = inject(NotificationService);
  this.lowStockState = inject(LowStockStateService);
  this.stock = inject(StockService);
  this.ins = inject(InsumosService);
  }
  showInsumoPreciosModal = signal(false);
  insumoEdit = signal<{ id: number; tipoInsumo: string; cantidad: number; precio_costo: number | string; precio_venta: number | string } | null>(null);
  insumoPreciosForm = signal<{ precio_costo: string; precio_venta: string }>({ precio_costo: '', precio_venta: '' });
  insumoPreciosMsg = signal('');

  openInsumoPreciosModal(insumo: { id: number; tipoInsumo: string; cantidad: number; precio_costo: number | string; precio_venta: number | string }) {
    this.insumoEdit.set(insumo);
    this.insumoPreciosForm.set({
      precio_costo: String(insumo.precio_costo ?? ''),
      precio_venta: String(insumo.precio_venta ?? '')
    });
    this.insumoPreciosMsg.set('');
    this.showInsumoPreciosModal.set(true);
  }

  closeInsumoPreciosModal() {
    this.showInsumoPreciosModal.set(false);
    this.insumoEdit.set(null);
    this.insumoPreciosMsg.set('');
  }

  onInsumoPrecioChange(field: 'precio_costo' | 'precio_venta', value: string) {
    const form = { ...this.insumoPreciosForm() };
    form[field] = value;
    this.insumoPreciosForm.set(form);
  }

  async deleteModelo(id: string) {
    // Confirmación visual moderna
    const seguro = window.confirm('¿Seguro que quieres eliminar este modelo?\nEsta acción no se puede deshacer. * Se eliminarán sus movimientos asociados *');
    if (!seguro) return;
    // Opcional: feedback visual (deshabilitar botón, spinner, etc.)
    try {
      await firstValueFrom(this.stock.deleteModelo(id));
      // Recargar modelos
      const modelos = await firstValueFrom(this.stock.getModelos());
      this.modelos.set(modelos);
      // Feedback visual de éxito
      setTimeout(() => {
        alert('Modelo eliminado correctamente');
      }, 100);
    } catch (e: any) {
      alert(e?.error?.error || 'Error al eliminar el modelo');
    }
  }

  async deleteInsumo(id: number) {
    // Confirmación visual moderna
    const seguro = window.confirm('¿Seguro que quieres eliminar este insumo?\nEsta acción no se puede deshacer. * Se eliminarán sus movimientos asociados *');
    if (!seguro) return;
    // Opcional: feedback visual (deshabilitar botón, spinner, etc.)
    try {
      await firstValueFrom(this.ins.deleteInsumo(id));
      // Recargar insumos
      const insumos = await firstValueFrom(this.ins.getInsumos());
      const rows = insumos.map(i => ({
        id: i.id,
        tipoInsumo: i.tipoInsumo,
        cantidad: i.cantidad,
        precio_costo: Number(i.precio_costo),
        precio_venta: Number(i.precio_venta)
      }));
      this.insumos.set(rows);
      // Feedback visual de éxito
      setTimeout(() => {
        alert('Insumo eliminado correctamente');
      }, 100);
    } catch (e: any) {
      alert(e?.error?.error || 'Error al eliminar el insumo');
    }
  }
  async guardarInsumoPrecios() {
    const insumo = this.insumoEdit();
    if (!insumo) return;
    try {
      await firstValueFrom(this.ins.patchPreciosInsumo(insumo.id, this.insumoPreciosForm()));
      this.insumoPreciosMsg.set('Precios actualizados correctamente');
      this.showInsumoPreciosModal.set(false);
      // Recargar insumos
      const catalogo = await firstValueFrom(this.ins.getInsumos());
      const rows = catalogo.map(i => ({
        id: i.id,
        tipoInsumo: i.tipoInsumo,
        cantidad: i.cantidad,
        precio_costo: Number(i.precio_costo),
        precio_venta: Number(i.precio_venta)
      }));
      this.insumos.set(rows);
    } catch (e: any) {
      this.insumoPreciosMsg.set(e?.error?.error || 'Error al actualizar precios');
    }
  }
  // Estado para el modal de edición de precios
  showPreciosModal = signal(false);
  modeloEdit = signal<Modelo | null>(null);
  preciosForm = signal<{ categoria: string; precio_costo: string; precio_venta: string }[]>([]);
  preciosMsg = signal('');

  openPreciosModal(modelo: Modelo) {
    this.modeloEdit.set(modelo);
    this.preciosForm.set(modelo.items.map(it => ({
      categoria: it.tipo,
      precio_costo: String(it.precio_costo ?? ''),
      precio_venta: String(it.precio_venta ?? '')
    })));
    this.preciosMsg.set('');
    this.showPreciosModal.set(true);
  }

  closePreciosModal() {
    this.showPreciosModal.set(false);
    this.modeloEdit.set(null);
    this.preciosMsg.set('');
  }

  onPrecioChange(idx: number, field: 'precio_costo' | 'precio_venta', value: string) {
    const arr = [...this.preciosForm()];
    arr[idx][field] = value;
    this.preciosForm.set(arr);
  }

  async guardarPrecios() {
    const modelo = this.modeloEdit();
    if (!modelo) return;
    try {
      await firstValueFrom(this.stock.patchPreciosModelo(modelo.id, this.preciosForm()));
      this.preciosMsg.set('Precios actualizados correctamente');
      this.showPreciosModal.set(false);
      // Opcional: recargar modelos
      const modelos = await firstValueFrom(this.stock.getModelos());
      this.modelos.set(modelos);
    } catch (e: any) {
      this.preciosMsg.set(e?.error?.error || 'Error al actualizar precios');
    }
  }
  // Devuelve cantidad, precio_costo y precio_venta para un tipo de módulo
  moduloInfo(modelo: Modelo, tipo: TipoModulo): string {
    const item = modelo.items.find(i => i.tipo === tipo);
    if (!item) return '0';
    return `${item.cantidad} / $${item.precio_costo} / $${item.precio_venta}`;
  }

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
    // Chequeo inicial
    // checkLowStock(this.modelos(), this.notification, this.lowStockState, getLowStockNotificationsEnabled());
  }

  // Efecto reactivo para cambios futuros (declarado como propiedad de clase)
  private lowStockEffect = effect(() => {
    checkLowStock(this.modelos(), this.notification, this.lowStockState, getLowStockNotificationsEnabled());
  });


  
}
