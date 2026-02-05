import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch } from '@ng-icons/lucide';

@Component({
  selector: 'app-searchbar-component',
  imports: [TranslocoDirective,NgIcon],
  templateUrl: './searchbar-component.html',
  styleUrl: './searchbar-component.css',
  providers: [provideIcons({ lucideSearch })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchbarComponent {
  //default => the header with transpet background
  variant = input<'default' | 'table'>('default');
  searchQuery = signal<string>('');
}
