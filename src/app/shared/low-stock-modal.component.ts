import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LowStockStateService } from '../core/services/low-stock-state.service';

@Component({
  selector: 'app-low-stock-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="close()"></div>
    <div class="modal">
      <h2>Recursos en bajo stock</h2>
      <ul *ngIf="resources().length; else empty">
        <li *ngFor="let r of resources()">
          <span *ngIf="r.modelo">{{ r.modelo }} - </span>{{ r.label }} <span *ngIf="r.tipo">({{ r.tipo }})</span>: <b>{{ r.cantidad }}</b>
        </li>
      </ul>
      <ng-template #empty>
        <div>No hay recursos en bajo stock.</div>
      </ng-template>
      <button class="btn" (click)="close()">Cerrar</button>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed; left: 0; top: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.25); z-index: 1000;
    }
    .modal {
      position: fixed; left: 50%; top: 50%; transform: translate(-50%,-50%);
      background: #fff; border-radius: 10px; box-shadow: 0 4px 24px rgba(0,0,0,0.18);
      padding: 2em 2.5em; z-index: 1001; min-width: 320px;
    }
    h2 { margin-top: 0; }
    ul { margin: 1em 0; padding: 0 0 0 1.2em; }
    .btn { margin-top: 1em; }
  `]
})
export class LowStockModalComponent {
  private state = inject(LowStockStateService);
  resources = this.state.lowStockResources;
  static visible = signal(false);

  close() {
    LowStockModalComponent.visible.set(false);
  }
}
