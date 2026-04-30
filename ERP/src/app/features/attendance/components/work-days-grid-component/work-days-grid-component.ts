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
    { day: 'sun', label: 'الأحد', isWorkDay: false, calculateOnHoliday: false, lateToleranceMinutes: null },
    { day: 'mon', label: 'الاثنين', isWorkDay: false, calculateOnHoliday: false, lateToleranceMinutes: null },
    { day: 'tue', label: 'الثلاثاء', isWorkDay: false, calculateOnHoliday: false, lateToleranceMinutes: null },
    { day: 'wed', label: 'الأربعاء', isWorkDay: false, calculateOnHoliday: false, lateToleranceMinutes: null },
    { day: 'thu', label: 'الخميس', isWorkDay: false, calculateOnHoliday: false, lateToleranceMinutes: null },
    { day: 'fri', label: 'الجمعة', isWorkDay: false, calculateOnHoliday: false, lateToleranceMinutes: null },
    { day: 'sat', label: 'السبت', isWorkDay: false, calculateOnHoliday: false, lateToleranceMinutes: null },
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
}
