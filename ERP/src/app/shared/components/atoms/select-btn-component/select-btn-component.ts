import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown } from '@ng-icons/lucide';

export interface ISelectOption {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-select-btn-component',
  imports: [NgIcon],
  templateUrl: './select-btn-component.html',
  styleUrl: './select-btn-component.css',
  providers: [provideIcons({ lucideChevronDown })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectBtnComponent {
  options = input.required<ISelectOption[]>();
  value = input.required<string | number>();

  borderColor = input<string>('#333333');
  textColor = input<string>('black');
  iconColor = input<string | null>('#333333');

  change = output<string>();
}
