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
enumName = input<string>('');

badgeClasses = computed(() => {
    const key = this.normalizeStatusKey(this.status());

    const colorMap: Record<string, { bg: string, text: string }> = {
      // Active / Inactive
      'active': { bg: 'bg-[#00A3891A]', text: 'text-[#00A389]' },
      'inactive': { bg: 'bg-[#EF44441A]', text: 'text-[#EF4444]' },

      // Attendance
      'present': { bg: 'bg-[#00A3891A]', text: 'text-[#00A389]' },
      'late': { bg: 'bg-orange-100', text: 'text-orange-700' },
      'absent': { bg: 'bg-red-100', text: 'text-red-700' },
      'pending': { bg: 'bg-[#8181811A]', text: 'text-[#818181]' },
      'valid': { bg: 'bg-[#00A3891A]', text: 'text-[#00A389]' },
      'invalid': { bg: 'bg-[#EF44441A]', text: 'text-[#EF4444]' },
      'check-in': { bg: 'bg-[#61BDDC33]', text: 'text-[#0B84B5]' },
      'check-out': { bg: 'bg-[#E0E7FF]', text: 'text-[#4F46E5]' },
      'invalid-outside-period': { bg: 'bg-[#FDE68A]', text: 'text-[#B45309]' },
      'invalid-weekend': { bg: 'bg-[#FECACA]', text: 'text-[#B91C1C]' },
      'invalid-no-open-period': { bg: 'bg-[#E5E7EB]', text: 'text-[#6B7280]' },
      'open': { bg: 'bg-[#61BDDC33]', text: 'text-[#0B84B5]' },
      'closed': { bg: 'bg-[#8181811A]', text: 'text-[#818181]' },

      // Employees
      'probation': { bg: 'bg-[#FFF3E6]', text: 'text-[#FF8400]' },
      'status-probation': { bg: 'bg-[#FFF3E6]', text: 'text-[#FF8400]' },
      'refused': { bg: 'bg-[#FFEDEE]', text: 'text-[#FF4A55]' },
      'rejected': { bg: 'bg-[#FFEDEE]', text: 'text-[#FF4A55]' },
    };

    //default
    return colorMap[key] || { bg: 'bg-[#8181811A]', text: 'text-[#818181]' };
  });

  translationKey = computed(() => {
    if (this.enumName()) {
      return `Enum:${this.enumName()}.${this.toEnumMemberName(this.status())}`;
    }

    const key = this.status().toUpperCase();
    return `${this.translationPrefix()}.${key}`;
  });

  displayText = computed(() => this.label().trim() || this.translationKey());

  private normalizeStatusKey(value: string): string {
    return value
      .trim()
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  private toEnumMemberName(value: string): string {
    return value
      .trim()
      .split(/[\s_-]+/)
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }
}


