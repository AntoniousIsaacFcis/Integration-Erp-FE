import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBell, lucideCalendarDays } from '@ng-icons/lucide';

@Component({
  selector: 'app-header-notifications-component',
  imports: [NgIcon],
  templateUrl: './header-notifications-component.html',
  styleUrl: './header-notifications-component.css',
  providers:[provideIcons({ lucideBell,lucideCalendarDays  })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderNotificationsComponent {
bellCount = input<number>(1);
calendarCount = input<number>(1);
}
