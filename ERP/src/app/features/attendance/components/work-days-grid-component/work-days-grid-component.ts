import { ChangeDetectionStrategy, Component, input, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DayConfig, IShiftDay } from '@features/attendance/models/iattendance';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideOctagonX } from '@ng-icons/lucide';

@Component({
  selector: 'app-work-days-grid-component',
  imports: [ReactiveFormsModule, TranslocoModule, NgIcon],
  templateUrl: './work-days-grid-component.html',
  styleUrl: './work-days-grid-component.css',
  providers: [provideIcons({ lucideOctagonX })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkDaysGridComponent implements OnInit, OnChanges{
control = input.required<FormControl>();
allowLateToleranceOverrides = input(false);
initialDays = input<IShiftDay[] | null>(null);
disabled = input(false);
showErrors = input(false);
requiredErrorKey = input<string>('AUTH.REQUIRED_FIELD');
timeRangeErrorKey = input<string>('ERRORS.INVALID_TIME_RANGE');

gridData = signal<DayConfig[]>([
    this.createDay('sun', 'الأحد'),
    this.createDay('mon', 'الاثنين'),
    this.createDay('tue', 'الثلاثاء'),
    this.createDay('wed', 'الأربعاء'),
    this.createDay('thu', 'الخميس'),
    this.createDay('fri', 'الجمعة'),
    this.createDay('sat', 'السبت'),
  ]);

  ngOnInit() {
    this.applyInitialDays();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialDays'] && !changes['initialDays'].firstChange) {
      this.applyInitialDays();
    }
  }

  toggle(index: number, field: keyof Pick<DayConfig, 'isWorkDay' | 'calculateOnHoliday'>) {
    if (this.disabled()) {
      return;
    }

    this.gridData.update(data => {
      const newData = [...data];
      const nextValue = !newData[index][field];
      newData[index] = { ...newData[index], [field]: nextValue };

      if (field === 'isWorkDay' && nextValue) {
        newData[index] = {
          ...newData[index],
          calculateOnHoliday: false,
        };
      }

      if (field === 'calculateOnHoliday' && nextValue) {
        newData[index] = {
          ...newData[index],
          isWorkDay: false,
        };
      }

      this.control().setValue(newData);
      return newData;
    });
  }

  updateLateTolerance(index: number, value: string) {
    if (this.disabled() || !this.allowLateToleranceOverrides()) {
      return;
    }

    const numericValue = value === '' ? null : Math.max(0, Number(value));

    this.gridData.update(data => {
      const newData = [...data];
      newData[index] = { ...newData[index], lateToleranceMinutes: Number.isFinite(numericValue) ? numericValue : null };

      this.control().setValue(newData);
      return newData;
    });
  }

  updateTimeOverride(index: number, field: TimeOverrideField, value: string) {
    if (this.disabled() || !this.allowLateToleranceOverrides()) {
      return;
    }

    this.gridData.update(data => {
      const newData = [...data];
      newData[index] = { ...newData[index], [field]: value || null };

      this.control().setValue(newData);
      return newData;
    });
  }

  isMissingRequiredValue(value: string | number | null | undefined) {
    return value === null || value === undefined || value === '';
  }

  isTimeRangeInvalid(
    day: DayConfig,
    startValue: string | null | undefined,
    endValue: string | null | undefined,
  ) {
    if (!this.allowLateToleranceOverrides() || !day.isWorkDay) {
      return false;
    }

    if (this.isMissingRequiredValue(startValue) || this.isMissingRequiredValue(endValue)) {
      return false;
    }

    return String(startValue) >= String(endValue);
  }

  private createDay(day: string, label: string): DayConfig {
    return {
      day,
      label,
      isWorkDay: false,
      calculateOnHoliday: false,
      onDutyTimeOverride: null,
      offDutyTimeOverride: null,
      signInStartTimeOverride: null,
      signInEndTimeOverride: null,
      signOutStartTimeOverride: null,
      signOutEndTimeOverride: null,
      lateToleranceMinutes: null,
    };
  }

  private applyInitialDays() {
    const days = this.initialDays();
    const nextData = this.createDefaultDays();

    if (days?.length) {
      for (const shiftDay of days) {
        const index = shiftDay.dayOfWeek;

        if (index < 0 || index >= nextData.length) {
          continue;
        }

        nextData[index] = {
          ...nextData[index],
          isWorkDay: shiftDay.isWorkDay,
          calculateOnHoliday: Boolean(shiftDay.calculateAttendanceOnOffDay),
          onDutyTimeOverride: this.toTimeInputValue(shiftDay.onDutyTimeOverride),
          offDutyTimeOverride: this.toTimeInputValue(shiftDay.offDutyTimeOverride),
          signInStartTimeOverride: this.toTimeInputValue(shiftDay.signInStartTimeOverride),
          signInEndTimeOverride: this.toTimeInputValue(shiftDay.signInEndTimeOverride),
          signOutStartTimeOverride: this.toTimeInputValue(shiftDay.signOutStartTimeOverride),
          signOutEndTimeOverride: this.toTimeInputValue(shiftDay.signOutEndTimeOverride),
          lateToleranceMinutes: shiftDay.lateToleranceMinutes ?? null,
        };
      }
    }

    this.gridData.set(nextData);
    this.control().setValue(nextData);
  }

  private createDefaultDays() {
    return [
      this.createDay('sun', 'الأحد'),
      this.createDay('mon', 'الاثنين'),
      this.createDay('tue', 'الثلاثاء'),
      this.createDay('wed', 'الأربعاء'),
      this.createDay('thu', 'الخميس'),
      this.createDay('fri', 'الجمعة'),
      this.createDay('sat', 'السبت'),
    ];
  }

  private toTimeInputValue(value?: string | null) {
    return value ? value.slice(0, 5) : null;
  }
}

type TimeOverrideField =
  | 'onDutyTimeOverride'
  | 'offDutyTimeOverride'
  | 'signInStartTimeOverride'
  | 'signInEndTimeOverride'
  | 'signOutStartTimeOverride'
  | 'signOutEndTimeOverride';
