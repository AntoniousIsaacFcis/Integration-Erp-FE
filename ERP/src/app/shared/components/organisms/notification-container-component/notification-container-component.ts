import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { INotification } from '@core/models/inotification';
import { NotificationService } from '@core/services/notification-service';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAlertCircle, lucideCheck, lucideInfo, lucideX } from '@ng-icons/lucide';

@Component({ //future features :Sound Effects , Pause on Hover
  selector: 'app-notification-container-component',
  imports: [NgIcon, TranslocoModule],
  templateUrl: './notification-container-component.html',
  styleUrl: './notification-container-component.css',
  providers: [provideIcons({ lucideCheck, lucideX, lucideAlertCircle, lucideInfo })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationContainerComponent {
  protected notificationService = inject(NotificationService);
  private readonly copiedNotificationId = signal<string | null>(null);

  handleAction(notification: INotification) {
    this.notificationService.dismiss(notification.id);
    notification.onAction?.();
  }

  handleCancel(notification: INotification) {
    this.notificationService.dismiss(notification.id);
    notification.onCancel?.();
  }

  iconName(type: string) {
    const icons: Record<string, string> = {
      success: 'lucideCheck',
      error: 'lucideX',
      warning: 'lucideAlertCircle',
      info: 'lucideInfo'
    };
    return icons[type] || 'lucideInfo';
  }

  async copyTemporaryPassword(notification: INotification) {
    const temporaryPassword = notification.temporaryPassword?.trim();
    if (!temporaryPassword) {
      return;
    }

    try {
      await this.copyTextToClipboard(temporaryPassword);
      this.copiedNotificationId.set(notification.id);
      window.setTimeout(() => {
        if (this.copiedNotificationId() === notification.id) {
          this.copiedNotificationId.set(null);
        }
      }, 1500);
    } catch {
      // Silent copy fallback failure keeps the modal usable.
    }
  }

  isCopied(notification: INotification) {
    return this.copiedNotificationId() === notification.id;
  }

  private async copyTextToClipboard(value: string) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}
