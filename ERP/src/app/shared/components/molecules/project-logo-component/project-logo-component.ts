import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-project-logo-component',
  imports: [TranslocoDirective],
  templateUrl: './project-logo-component.html',
  styleUrl: './project-logo-component.css',
  providers:[],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectLogoComponent {
isCollapsed = input<boolean>(false);
aboveColor = input<string>('#FFFFFF');
textColor = input<string>('#FFFFFF');
outlineColor = input<string>('#000000 ');
}
