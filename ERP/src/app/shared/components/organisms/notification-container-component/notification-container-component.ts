import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NotificationService } from '@core/services/notification-service';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAlertCircle, lucideCheck,lucideInfo, lucideX } from '@ng-icons/lucide';

@Component({ //future features :Sound Effects , Pause on Hover
  selector: 'app-notification-container-component',
  imports: [NgIcon,TranslocoModule],
  templateUrl: './notification-container-component.html',
  styleUrl: './notification-container-component.css',
  providers:[provideIcons({ lucideCheck, lucideX, lucideAlertCircle, lucideInfo })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationContainerComponent {
protected notificationService = inject(NotificationService);

iconName(type: string) {
    const icons: Record<string, string> = {
      success: 'lucideCheck',
      error: 'lucideX',
      warning: 'lucideAlertCircle',
      info: 'lucideInfo'
    };
    return icons[type] || 'lucideInfo';
  }

  }
