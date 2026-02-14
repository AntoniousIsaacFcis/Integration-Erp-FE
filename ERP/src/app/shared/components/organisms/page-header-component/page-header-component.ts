import { ChangeDetectionStrategy, Component, computed, inject, input, model, output } from '@angular/core';
import { BreadcrumbService } from '@core/services/breadcrumb-service';
import { TranslocoModule } from '@jsverse/transloco';
import { PageTitleComponent } from "@shared/components/atoms/page-title-component/page-title-component";
import { ActionBtnComponent } from "@shared/components/molecules/action-btn-component/action-btn-component";
import { SearchbarComponent } from "@shared/components/molecules/searchbar-component/searchbar-component";
import { StatusBadgeComponent } from "@shared/components/molecules/status-badge-component/status-badge-component";

@Component({
  selector: 'app-page-header-component',
  imports: [PageTitleComponent, TranslocoModule, ActionBtnComponent, SearchbarComponent, StatusBadgeComponent],
  templateUrl: './page-header-component.html',
  styleUrl: './page-header-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageHeaderComponent {
  private readonly breadcrumbService = inject(BreadcrumbService);

  protected readonly autoTitle = computed(() => {
    const items = this.breadcrumbService.items();
    return items.length > 0 ? items[items.length - 1].label : '';
  });

 actionLabel = input.required<string>();
 actionClicked = output<void>();

searchQuery = model<string>('');//modal for twoWay binding

  handleActionClick() {
    this.actionClicked.emit();
  }

  selectedStatus = model<'active' | 'inactive' | ''>('');
}
