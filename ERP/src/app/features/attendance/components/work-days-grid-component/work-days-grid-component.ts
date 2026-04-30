import { Component, input, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DayConfig } from '@features/attendance/models/iattendance';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-work-days-grid-component',
  imports: [ReactiveFormsModule,TranslocoModule],
  templateUrl: './work-days-grid-component.html',
  styleUrl: './work-days-grid-component.css',
})
export class WorkDaysGridComponent implements OnInit{
control = input.required<FormControl>();
allowLateToleranceOverrides = input(false);

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
    // Sync initial state to form for once only
    this.control().setValue(this.gridData());
  }

  toggle(index: number, field: keyof Pick<DayConfig, 'isWorkDay' | 'calculateOnHoliday'>) {
    this.gridData.update(data => {
      const newData = [...data];
      newData[index] = { ...newData[index], [field]: !newData[index][field] };

      this.control().setValue(newData);
      return newData;
    });
  }

  updateLateTolerance(index: number, value: string) {
    if (!this.allowLateToleranceOverrides()) {
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
    if (!this.allowLateToleranceOverrides()) {
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
}

type TimeOverrideField =
  | 'onDutyTimeOverride'
  | 'offDutyTimeOverride'
  | 'signInStartTimeOverride'
  | 'signInEndTimeOverride'
  | 'signOutStartTimeOverride'
  | 'signOutEndTimeOverride';
