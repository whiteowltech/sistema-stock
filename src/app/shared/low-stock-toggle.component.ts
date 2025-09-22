import { Component, signal } from '@angular/core';
import { getLowStockNotificationsEnabled, setLowStockNotificationsEnabled } from './low-stock-check';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-low-stock-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      (click)="toggle()"
      [title]="enabled() ? 'Desactivar notificaciones de stock bajo' : 'Activar notificaciones de stock bajo'"
      style="background:none;border:none;outline:none;cursor:pointer;padding:0; margin-top:5px;display:flex;align-items:center;"
    >
      <ng-container *ngIf="enabled(); else bellOff">
          <!-- Campana normal (Material Icons style) -->
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#f59e42">
            <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6V9a6 6 0 0 0-12 0v7l-2 2v1h16v-1l-2-2zM4 17h16v-1.17l-2-2V9a8 8 0 0 0-16 0v4.83l-2 2V17z"/>
          </svg>
      </ng-container>
      <ng-template #bellOff>
          <!-- Campana tachada (Material Icons style) -->
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#bbb">
            <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6V9a6 6 0 0 0-9.33-4.93l-1.42-1.42A7.97 7.97 0 0 1 20 9v7l2 2v1H6.83l2 2H20v-1l-2-2zM2.1 2.1 0.69 3.51l2.27 2.27A7.97 7.97 0 0 0 4 9v7l-2 2v1h16.17l1.31 1.31 1.41-1.41L2.1 2.1z"/>
            <line x1="4" y1="4" x2="20" y2="20" stroke="#d32f2f" stroke-width="2"/>
          </svg>
      </ng-template>
    </button>
  `
})
export class LowStockToggleComponent {
  enabled = signal(getLowStockNotificationsEnabled());

  toggle() {
    const next = !this.enabled();
    setLowStockNotificationsEnabled(next);
    this.enabled.set(next);
  }
}
