import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLogIn } from '@ng-icons/lucide';

@Component({
  selector: 'app-attendance-day-card-component',
  imports: [TranslocoModule,NgIcon],
  templateUrl: './attendance-day-card-component.html',
  styleUrl: './attendance-day-card-component.css',
  providers: [provideIcons({ lucideLogIn })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendanceDayCardComponent {
dayNumber = input.required<number>();
dayName = input.required<string>();
  isWorkDay = input<boolean>(true);
  checkIn = input<string | null>(null);
  checkOut = input<string | null>(null);
  statusText = input<string>('');
}
