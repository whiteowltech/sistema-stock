import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notification {
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  sound?: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notification$ = new Subject<Notification>();

  get notifications() {
    return this.notification$.asObservable();
  }

  notify(notification: Notification) {
    this.notification$.next(notification);
  }
}
