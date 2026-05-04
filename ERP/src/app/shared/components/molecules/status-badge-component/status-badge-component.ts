import { ChangeDetectionStrategy, Component, computed, input, model, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideChevronDown, lucideSettings2 } from '@ng-icons/lucide';
import { TranslocoDirective } from "@jsverse/transloco";
@Component({
  selector: 'app-status-badge-component',
  imports: [NgIcon, TranslocoDirective],
  templateUrl: './status-badge-component.html',
  styleUrl: './status-badge-component.css',
  providers: [provideIcons({ lucideSettings2, lucideChevronDown, lucideCheck })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBadgeComponent {
  containerClasses = computed(() => {
    return `
     inline-flex items-center gap-2
    w-fit max-w-fit h-[38px] px-2 py-2
    bg-[#BBBBBB33] border border-[#BBBBBB] rounded-md
    hover-lift cursor-pointer transition-all
    whitespace-nowrap
    `;
  });

  label = input.required<string>();

  options = input.required<{value: string, label: string}[]>();
  selectedStatus = model<string>('');

  isDropdownOpen = signal(false);

  currentLabel = computed(() => {
    const status = this.options().find(s => s.value === this.selectedStatus());
    return status ? status.label : this.label();
  });

  toggle() {
    this.isDropdownOpen.update(v => !v);
  }

  selectStatus(value: string) {
    this.selectedStatus.set(value);
    this.isDropdownOpen.set(false); //close the dropdown list when choose
  }

}
