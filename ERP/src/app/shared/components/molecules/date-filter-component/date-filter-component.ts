import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, ElementRef, model, signal, viewChild } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendar, lucideChevronDown } from '@ng-icons/lucide';

@Component({
  selector: 'app-date-filter-component',
  imports: [NgIcon, TranslocoModule,DatePipe],
  templateUrl: './date-filter-component.html',
  styleUrl: './date-filter-component.css',
  providers: [provideIcons({ lucideCalendar ,lucideChevronDown})],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateFilterComponent {
selectedDate = model<string>('FILTERS.DATE') ;
isExpanded = signal(false);
dateInput = viewChild<ElementRef<HTMLInputElement>>('picker');

containerClasses = computed(() => {
    return `
      flex items-center justify-between
      w-[109.74px] h-[42px] px-3 py-2.5
      bg-[#BBBBBB33] border border-[#BBBBBB] rounded-md
      hover-lift cursor-pointer transition-all relative
    `;
  });

  toggle() {
    this.isExpanded.update(v => !v);

    const input = this.dateInput()?.nativeElement;
    if (input && 'showPicker' in input) {
      input.showPicker();
    }
  }

  onDateChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.selectedDate.set(value);
    this.isExpanded.set(false);
  }
}
