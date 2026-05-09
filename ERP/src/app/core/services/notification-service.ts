import { computed, Injectable, signal } from '@angular/core';
import { INotification } from '@core/models/inotification';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  notifications = signal<INotification[]>([]);

  hasActiveModal = computed(() => this.notifications().some(n => n.isModal));

  show(notification: Omit<INotification, 'id'>) {
    const signature = this.getSignature(notification);
    const alreadyVisible = this.notifications().some(existing => this.getSignature(existing) === signature);

    if (alreadyVisible) {
      return;
    }

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

  dismissAll() {
    this.notifications.set([]);
  }

  private getSignature(notification: Pick<INotification, 'type' | 'title' | 'message' | 'isModal' | 'actionLabel' | 'cancelLabel' | 'email' | 'temporaryPassword'>) {
    return [
      notification.type,
      notification.title,
      notification.message ?? '',
      notification.isModal ? '1' : '0',
      notification.actionLabel,
      notification.cancelLabel ?? '',
      notification.email ?? '',
      notification.temporaryPassword ?? '',
    ].join('|');
  }
}
