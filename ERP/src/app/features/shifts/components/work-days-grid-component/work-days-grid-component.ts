import { Component, input, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DayConfig } from '@features/shifts/models/iattendance';

@Component({
  selector: 'app-work-days-grid-component',
  imports: [ReactiveFormsModule],
  templateUrl: './work-days-grid-component.html',
  styleUrl: './work-days-grid-component.css',
})
export class WorkDaysGridComponent implements OnInit{
control = input.required<FormControl>();

gridData = signal<DayConfig[]>([
    { day: 'sun', label: 'الأحد', isWorkDay: false, calculateOnHoliday: false },
    { day: 'mon', label: 'الاثنين', isWorkDay: false, calculateOnHoliday: false },
    { day: 'tue', label: 'الثلاثاء', isWorkDay: false, calculateOnHoliday: false },
    { day: 'wed', label: 'الأربعاء', isWorkDay: false, calculateOnHoliday: false },
    { day: 'thu', label: 'الخميس', isWorkDay: false, calculateOnHoliday: false },
    { day: 'fri', label: 'الجمعة', isWorkDay: false, calculateOnHoliday: false },
    { day: 'sat', label: 'السبت', isWorkDay: false, calculateOnHoliday: false },
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
}
