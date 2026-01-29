import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLogOut } from '@ng-icons/lucide';

@Component({
  selector: 'app-logout-btn-component',
  imports: [NgIcon,TranslocoModule],
  templateUrl: './logout-btn-component.html',
  styleUrl: './logout-btn-component.css',
  providers: [provideIcons({ lucideLogOut })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoutBtnComponent {

}
