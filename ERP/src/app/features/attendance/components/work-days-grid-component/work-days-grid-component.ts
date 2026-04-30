import { Component, input, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DayConfig, IShiftDay } from '@features/attendance/models/iattendance';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-work-days-grid-component',
  imports: [ReactiveFormsModule,TranslocoModule],
  templateUrl: './work-days-grid-component.html',
  styleUrl: './work-days-grid-component.css',
})
export class WorkDaysGridComponent implements OnInit, OnChanges{
control = input.required<FormControl>();
allowLateToleranceOverrides = input(false);
initialDays = input<IShiftDay[] | null>(null);
disabled = input(false);

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
      newData[index] = { ...newData[index], [field]: !newData[index][field] };

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
