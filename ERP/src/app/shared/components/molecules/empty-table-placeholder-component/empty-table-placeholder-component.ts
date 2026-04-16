import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-empty-table-placeholder-component',
  imports: [TranslocoModule],
  templateUrl: './empty-table-placeholder-component.html',
  styleUrl: './empty-table-placeholder-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyTablePlaceholderComponent {
  titleKey = input('COMMON.EMPTY_TABLE.TITLE');
}
