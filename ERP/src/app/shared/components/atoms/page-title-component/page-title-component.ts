import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-title-component',
  imports: [],
  templateUrl: './page-title-component.html',
  styleUrl: './page-title-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageTitleComponent {
  title = input.required<string>();
}
