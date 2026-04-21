import { ChangeDetectionStrategy, Component, input, model, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoDirective } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch } from '@ng-icons/lucide';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

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
  placeholder = input<string>('HEADER.SEARCH_PLACEHOLDER');

  searchQuery = model<string>('');

private readonly searchUpdater$ = new Subject<string>();

  constructor() {
    this.searchUpdater$.pipe(
      debounceTime(300), //wait after last letter inserted
      distinctUntilChanged(), // not make request until change
      takeUntilDestroyed() // auto clean memory
    ).subscribe(value => {
      this.searchQuery.set(value);
    });
  }

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchUpdater$.next(value);
  }
}
