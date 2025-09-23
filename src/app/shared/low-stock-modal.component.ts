import { Component, inject, signal } from '@angular/core';
import { getLowStockNotificationsEnabled, setLowStockNotificationsEnabled } from './low-stock-check';
import { CommonModule } from '@angular/common';
import { LowStockResource, LowStockStateService } from '../core/services/low-stock-state.service';

@Component({
  selector: 'app-low-stock-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="close()"></div>
    <div class="modal">
      <button class="close-btn" (click)="close()" title="Cerrar">×</button>
      <h2><span class="icon">&#9888;</span> Recursos en bajo stock</h2>
      <ul *ngIf="resources().length; else empty">
        <li *ngFor="let r of resources()">
          <span class="modelo" *ngIf="r.modelo">{{ r.modelo }} <span class="sep">·</span> </span>
          <span class="label">{{ r.label }}</span>
          <!-- <span class="tipo" *ngIf="r.tipo">({{ r.tipo }})</span> -->
          <span class="cantidad"> <b>x{{ r.cantidad }}</b></span>
        </li>
      </ul>
      <ng-template #empty>
        <div class="empty">No hay recursos en bajo stock.</div>
      </ng-template>
      <div class="notif-toggle">
        <label>
          <input type="checkbox" [checked]="notificationsEnabled()" (change)="toggleNotifications($event)" />
          Mostrar notificaciones emergentes
        </label>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed; left: 0; top: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.35); z-index: 1000;
      backdrop-filter: blur(1.5px);
    }
    .modal {
      position: fixed; left: 50%; top: 50%; transform: translate(-50%,-50%);
      background: #fff; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.22);
      padding: 2.2em 2.7em 2em 2.7em; z-index: 1001; min-width: 340px; max-width: 95vw;
      font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
      color: #232323;
      position: fixed;
      animation: modalIn 0.18s cubic-bezier(.4,1.4,.6,1) both;
    }
    @keyframes modalIn {
      from { opacity: 0; transform: translate(-50%,-60%) scale(0.95); }
      to   { opacity: 1; transform: translate(-50%,-50%) scale(1); }
    }
    .close-btn {
      position: absolute; right: 1.1em; top: 1.1em; background: none; border: none;
      font-size: 1.6em; color: #888; cursor: pointer; transition: color 0.15s;
      line-height: 1; padding: 0 0.1em;
    }
    .close-btn:hover { color: #d32f2f; }
    h2 {
      margin-top: 0; margin-bottom: 1.1em; font-size: 1.25em; font-weight: 600;
      display: flex; align-items: center; gap: 0.5em;
    }
    .icon {
      color: #d32f2f; font-size: 1.3em; vertical-align: middle;
    }
    ul {
      margin: 1em 0 0.5em 0; padding: 0; list-style: none;
      max-height: 260px; overflow-y: auto;
    }
    li {
      padding: 0.55em 0.2em; border-bottom: 1px solid #eee; display: flex; align-items: center;
      font-size: 1.07em;
    }
    li:last-child { border-bottom: none; }
    .modelo { color: #1976d2; font-weight: 500; }
    .sep { color: #bbb; margin: 0 0.2em; }
    .label { font-weight: 500; }
    .tipo { color: #888; margin-left: 0.2em; }
    .cantidad { margin-left: auto; font-size: 1.08em; color: #d32f2f; font-weight: 600; }
    .empty {
      color: #888; text-align: center; padding: 1.5em 0 0.5em 0; font-size: 1.08em;
    }
    .notif-toggle {
      margin-top: 1.5em;
      text-align: left;
      font-size: 0.98em;
      color: #444;
      background: #f7f7f7;
      border-radius: 6px;
      padding: 0.7em 1em 0.7em 0.7em;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
    .notif-toggle label {
      cursor: pointer;
      user-select: none;
      display: flex;
      align-items: center;
      gap: 0.5em;
    }
    .notif-toggle input[type="checkbox"] {
      accent-color: #1976d2;
      width: 1.1em; height: 1.1em;
      margin-right: 0.5em;
    }
  `]
})
export class LowStockModalComponent {
  private state: LowStockStateService;
  resources = signal<LowStockResource[]>([]);
  constructor() {
    this.state = inject(LowStockStateService);
    this.resources = this.state.lowStockResources;
  }
  static visible = signal(false);

  notificationsEnabled = signal(getLowStockNotificationsEnabled());

  toggleNotifications(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    setLowStockNotificationsEnabled(checked);
    this.notificationsEnabled.set(checked);
  }

  close() {
    LowStockModalComponent.visible.set(false);
  }
}
