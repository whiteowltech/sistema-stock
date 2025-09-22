import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LowStockStateService } from '../core/services/low-stock-state.service';
import { LowStockModalComponent } from './low-stock-modal.component';

@Component({
  selector: 'app-low-stock-bell',
  standalone: true,
  imports: [CommonModule, LowStockModalComponent],
  template: `
    <button type="button" (click)="onClick()" style="background:none;border:none;outline:none;cursor:pointer;position:relative;padding:0;">
      <svg width="24" height="24" viewBox="0 0 24 24" [attr.fill]="hasAlerts() ? '#f59e42' : '#bbb'">
        <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6V9a6 6 0 0 0-12 0v7l-2 2v1h16v-1l-2-2z"/>
      </svg>
      <span *ngIf="hasAlerts()" class="badge">{{ count() }}</span>
    </button>
    <app-low-stock-modal *ngIf="modalOpen()"></app-low-stock-modal>
  `,
  styles: [`
    .badge {
      position: absolute;
      top: 0px;
      right: -2px;
      background: #d32f2f;
      color: #fff;
      border-radius: 50%;
      font-size: 0.75em;
      min-width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      box-shadow: 0 1px 4px rgba(0,0,0,0.18);
      z-index: 2;
    }
  `]
})
export class LowStockBellComponent {
  private state = inject(LowStockStateService);
  count = computed(() => this.state.lowStockResources().length);
  hasAlerts = computed(() => this.count() > 0);
  modalOpen = LowStockModalComponent.visible;

  onClick() {
    if (this.hasAlerts()) {
      LowStockModalComponent.visible.set(true);
    }
  }
}
