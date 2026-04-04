import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-permission-chip-component',
  imports: [TranslocoModule],
  templateUrl: './permission-chip-component.html',
  styleUrl: './permission-chip-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermissionChipComponent {
label = input.required<string>();
  isActive = input<boolean>(false);
  toggle = output<void>();
}
