import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../core/services/notification.service';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-toast-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let n of notifications" class="toast" [ngClass]="n.type">
        {{ n.message }}
      </div>
    </div>
  <audio #audio src="notification.mp3"></audio>
  `,
  styleUrls: ['./toast-notifications.component.scss'],
})
export class ToastNotificationsComponent implements OnDestroy {
  notifications: Notification[] = [];
  private sub: Subscription;

  constructor(private notify: NotificationService, private cdr: ChangeDetectorRef) {
    this.sub = this.notify.notifications.subscribe(n => {
      console.log('[Toast] Notificación recibida:', n);
      this.notifications.push(n);
      // Limitar a máximo 5 toasts visibles
      if (this.notifications.length > 5) {
        this.notifications = this.notifications.slice(-5);
      }
      this.cdr.detectChanges();
      if (n.sound) this.playSound();
      timer(4000).subscribe(() => {
        this.notifications.shift();
        this.cdr.detectChanges();
      });
    });
  }

  playSound() {
    const audio = document.querySelector('audio');
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
