import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-footer-component',
  imports: [TranslocoModule],
  templateUrl: './footer-component.html',
  styleUrl: './footer-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {

}
