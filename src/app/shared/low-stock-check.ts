// Utilidad para preferencia de notificaciones de stock bajo
export function getLowStockNotificationsEnabled(): boolean {
  const v = localStorage.getItem('lowStockNotifications');
  return v === null ? true : v === '1';
}

export function setLowStockNotificationsEnabled(enabled: boolean) {
  localStorage.setItem('lowStockNotifications', enabled ? '1' : '0');
}


import { NotificationService } from '../core/services/notification.service';
import { Insumo, Modelo } from '../interfaces/stock';
import { LowStockStateService, LowStockResource } from '../core/services/low-stock-state.service';

const MAP: Record<string, string> = {
  con_borde: 'Módulo con marco',
  sin_borde: 'Módulo sin marco',
  plaqueta_carga: 'Plaqueta carga',
  tapa_trasera: 'Tapa trasera',
};
function categoriaNombre(tipo: string | null | undefined): string {
  if (!tipo) return 'Cantidad';
  return MAP[tipo] || tipo.replace(/_/g, ' ');
}


export function checkLowStock(
  data: Insumo[] | Modelo[],
  notification: NotificationService,
  lowStockState: LowStockStateService,
  enabled: boolean = true
) {
  if (!enabled) return;
  const lowStock: LowStockResource[] = [];
  // Si es array de insumos
  if (data.length && 'tipoInsumo' in data[0]) {
    (data as Insumo[]).forEach(i => {
      if (i.cantidad < 5) {
        notification.notify({
          message: `¡Atención! El insumo "${i.tipoInsumo}" está bajo de stock (${i.cantidad})`,
          type: 'warning',
          sound: true
        });
        lowStock.push({ id: i.id, label: i.tipoInsumo, cantidad: i.cantidad, tipo: i.tipoInsumo });
      }
    });
    lowStockState.setResources(lowStock);
    return;
  }
  // Si es array de modelos
  if (data.length && 'items' in data[0]) {
    (data as Modelo[]).forEach(modelo => {
      modelo.items.forEach(i => {
        if (Number(i.cantidad) < 5) {
          notification.notify({
            message: `¡Atención! El recurso "${modelo.nombre}" (${categoriaNombre(i.tipo)}) está bajo de stock (${i.cantidad})`,
            type: 'warning',
            sound: true
          });
          lowStock.push({ id: i.id, label: categoriaNombre(i.tipo), cantidad: Number(i.cantidad), tipo: i.tipo, modelo: modelo.nombre });
        }
      });
    });
    lowStockState.setResources(lowStock);
  }
}
