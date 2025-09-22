import { Injectable, signal } from '@angular/core';

export type LowStockResource = {
  id: string|number;
  label: string;
  cantidad: number;
  tipo?: string;
  modelo?: string;
};

@Injectable({ providedIn: 'root' })
export class LowStockStateService {
  // Lista reactiva de recursos en bajo stock
  lowStockResources = signal<LowStockResource[]>([]);

  setResources(resources: LowStockResource[]) {
    this.lowStockResources.set(resources);
  }

  clear() {
    this.lowStockResources.set([]);
  }
}
