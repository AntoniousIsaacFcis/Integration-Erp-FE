import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { PageHeaderComponent } from "../page-header-component/page-header-component";
import { PaginagtionComponent } from "../paginagtion-component/paginagtion-component";

@Component({
  selector: 'app-app-base-table-component',
  imports: [PageHeaderComponent, PaginagtionComponent],
  templateUrl: './app-base-table-component.html',
  styleUrl: './app-base-table-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppBaseTableComponent {
  actionLabel = input.required<string>();
  totalItems = input<number>(0);
  currentPage = model<number>(1); //for twoWayBinding [(currentPage)]
onAdd = output<void>();
}
