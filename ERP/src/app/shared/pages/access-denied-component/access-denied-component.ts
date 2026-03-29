import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-access-denied-component',
  imports: [TranslocoModule],
  templateUrl: './access-denied-component.html',
  styleUrl: './access-denied-component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,

})
export class AccessDeniedComponent {

}
