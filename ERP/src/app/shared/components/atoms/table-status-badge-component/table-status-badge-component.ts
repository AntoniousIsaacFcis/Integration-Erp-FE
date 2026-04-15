import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-table-status-badge-component',
  imports: [TranslocoModule],
  templateUrl: './table-status-badge-component.html',
  styleUrl: './table-status-badge-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableStatusBadgeComponent {
status = input.required<string>();
label = input<string>('');

translationPrefix = input<string>('COMMON');

badgeClasses = computed(() => {
    const key = this.status().toLowerCase();

    const colorMap: Record<string, { bg: string, text: string }> = {
      // Active / Inactive
      'active': { bg: 'bg-[#00A3891A]', text: 'text-[#00A389]' },
      'inactive': { bg: 'bg-[#EF44441A]', text: 'text-[#EF4444]' },

      // Attendance
      'present': { bg: 'bg-[#00A3891A]', text: 'text-[#00A389]' },
      'late': { bg: 'bg-orange-100', text: 'text-orange-700' },
      'absent': { bg: 'bg-red-100', text: 'text-red-700' },

      //employees
      'status_probation': { bg: 'bg-[#FF4A551A]', text: 'text-[#FF4A55]' }
    };

    //default
    return colorMap[key] || { bg: 'bg-[#8181811A]', text: 'text-[#818181]' };
  });

  translationKey = computed(() => {
    const key = this.status().toUpperCase();
    return `${this.translationPrefix()}.${key}`;
  });

  displayText = computed(() => this.label().trim() || this.translationKey());
}
