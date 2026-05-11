import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
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
  private readonly translocoService = inject(TranslocoService);

  dayNumber = input.required<number>();
  dayName = input.required<string>();
  isWorkDay = input<boolean>(true);
  checkIn = input<string | null>(null);
  checkOut = input<string | null>(null);
  statusText = input<string>('');
  workedMinutes = input<number | null>(null);
  delayMinutes = input<number | null>(null);
  earlyLeaveMinutes = input<number | null>(null);
  leaveCount = input<number | null>(null);
  shiftId = input<string | null>(null);
  dayOffReason = input<number | null>(null);
  status = input<'present' | 'absent' | 'onLeave' | 'holiday' | 'dayOff' | 'lateArrival' | 'earlyLeave' | 'halfLeave' | 'onPermission' | 'checkInOnly' | 'checkOutOnly' | 'empty' | undefined>('empty');

  protected cardClasses() {
    const state = this.edgeStateKey();
    const status = this.status();
    const hasAttendance = status === 'present'
      || status === 'absent'
      || status === 'lateArrival'
      || status === 'earlyLeave'
      || status === 'checkInOnly'
      || status === 'checkOutOnly';
    const borderColor = state ? 'border-[#EEF2E7]' : (hasAttendance ? 'border-[#8CC63F]' : 'border-[#EEF2E7]');
    const bgColor = status === 'absent' ? 'bg-[#FFF8F8]' : state ? 'bg-[#FBFBFB]' : 'bg-white';

    return `min-h-[86px] py-3 px-3 rounded-lg border ${borderColor} ${bgColor} flex flex-col justify-between transition-all hover:shadow-sm`;
  }

  protected shouldShowStateLabel() {
    return this.edgeStateKey() !== null || this.status() !== 'present';
  }

  protected displayStateLabel() {
    const key = this.edgeStateKey();

    switch (key) {
      case 'no-shift':
        return 'No shift';
      case 'no-logs':
        return 'No logs';
      case 'day-off':
        return 'Day off';
      case 'full-leave':
        return 'Full leave';
      case 'half-leave':
        return 'Half leave';
      default:
        return this.statusText()
          ? this.translocoService.translate(this.statusText())
          : '';
    }
  }

  formatMinutes(totalMinutes?: number | null) {
    if (totalMinutes === null || totalMinutes === undefined) {
      return '--';
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }

  formatLeaveCount(value?: number | null) {
    if (value === null || value === undefined) {
      return '--';
    }

    if (value === 1) {
      return 'Full leave';
    }

    if (value === 0.5) {
      return 'Half leave';
    }

    return `Leave count: ${value}`;
  }

  private edgeStateKey(): 'no-shift' | 'no-logs' | 'day-off' | 'full-leave' | 'half-leave' | null {
    if (this.dayOffReason() !== null && this.dayOffReason() !== undefined) {
      return 'day-off';
    }

    if (this.leaveCount() === 1) {
      return 'full-leave';
    }

    if (this.leaveCount() === 0.5) {
      return 'half-leave';
    }

    if (!this.shiftId() && this.status() !== 'present' && this.status() !== 'onLeave' && this.status() !== 'halfLeave') {
      return 'no-shift';
    }

    if (!this.checkIn() && !this.checkOut() && this.status() === 'absent') {
      return 'no-logs';
    }

    return null;
  }
}
