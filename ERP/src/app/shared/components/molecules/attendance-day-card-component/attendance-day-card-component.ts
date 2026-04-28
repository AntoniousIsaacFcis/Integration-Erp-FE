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
  status = input<'present' | 'absent' | 'onLeave' | 'holiday' | 'dayOff' | 'empty' | undefined>('empty');

  protected cardClasses() {
    const status = this.status();
    const hasAttendance = status === 'present' || status === 'absent';
    const borderColor = hasAttendance ? 'border-[#8CC63F]' : 'border-[#EEF2E7]';
    const bgColor = status === 'absent' ? 'bg-[#FFF8F8]' : 'bg-white';

    return `min-h-[86px] py-3 px-3 rounded-lg border ${borderColor} ${bgColor} flex flex-col justify-between transition-all hover:shadow-sm`;
  }
}
