import { computed, Injectable, signal } from '@angular/core';
import { INotification } from '@core/models/inotification';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  notifications = signal<INotification[]>([]);

  hasActiveModal = computed(() => this.notifications().some(n => n.isModal));
  
  show(notification: Omit<INotification, 'id'>) {
    const id = crypto.randomUUID();
    const newNotification = { ...notification, id };

    this.notifications.update(prev => [...prev, newNotification]);

    // if toast => dismiss it after 4 seconds
    if (!notification.isModal) {
      setTimeout(() => this.dismiss(id), 4000);
    }
  }

  dismiss(id: string) {
    this.notifications.update(prev => prev.filter(n => n.id !== id));
  }
}
