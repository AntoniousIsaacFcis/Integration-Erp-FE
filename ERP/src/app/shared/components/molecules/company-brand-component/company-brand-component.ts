import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {  lucideUsers } from '@ng-icons/lucide';

@Component({
  selector: 'app-company-brand-component',
  imports: [NgIcon,TranslocoDirective],
  templateUrl: './company-brand-component.html',
  styleUrl: './company-brand-component.css',
  providers:[provideIcons({ lucideUsers })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyBrandComponent {

}
