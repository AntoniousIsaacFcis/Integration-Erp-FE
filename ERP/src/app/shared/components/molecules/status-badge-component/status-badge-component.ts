import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {  lucideChevronDown ,lucideSettings2 } from '@ng-icons/lucide';
@Component({
  selector: 'app-status-badge-component',
  imports: [NgIcon],
  templateUrl: './status-badge-component.html',
  styleUrl: './status-badge-component.css',
  providers:[provideIcons({ lucideSettings2, lucideChevronDown })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBadgeComponent {
  label = input.required<string>();

  containerClasses = computed(() => {
    return `
      flex items-center justify-between
      w-[109.74px] h-[42px] px-[12px] py-[10px]
      bg-[#BBBBBB33] border border-[#BBBBBB] rounded-[8px]
      text-black hover-lift cursor-pointer transition-base
    `;
  });
}
