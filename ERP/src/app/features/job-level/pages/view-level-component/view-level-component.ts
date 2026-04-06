import { ChangeDetectionStrategy, Component, computed, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { AppBaseTableComponent } from "@shared/components/organisms/app-base-table-component/app-base-table-component";
import { HttpClient } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import { isPlatformBrowser } from '@angular/common';
import { of } from 'rxjs';
import { JobLevelService } from '@features/job-level/service/job-level-service';
import { Router } from '@angular/router';
import { ActionBtnComponent } from "@shared/components/molecules/action-btn-component/action-btn-component";
import { StatusBadgeComponent } from "@shared/components/molecules/status-badge-component/status-badge-component";
import { HasPermissionDirective } from '@shared/directives/has-permission-directive';
import { TableStatusBadgeComponent } from "@shared/components/atoms/table-status-badge-component/table-status-badge-component";

@Component({
  selector: 'app-view-level-component',
  imports: [TranslocoModule, AppBaseTableComponent, NgIcon, ActionBtnComponent, StatusBadgeComponent, HasPermissionDirective, TableStatusBadgeComponent],
  templateUrl: './view-level-component.html',
  styleUrl: './view-level-component.css',
  providers: [provideIcons({ lucideTrash2, lucidePencil ,lucideEye})],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewLevelComponent {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly jobService = inject(JobLevelService);
  private readonly router = inject(Router);

  statusOptions = [
    { value: '', label: 'FILTERS.ALL' },
    { value: 'active', label: 'COMMON.ACTIVE' },
    { value: 'inactive', label: 'COMMON.INACTIVE' }
  ];

  currentPage = signal(1);
  pageSize = signal(10);

  searchTerm = signal('');
  selectedStatus = signal<'active' | 'inactive' | ''>('');

  levelsResource = rxResource({
    params: () => ({
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm(),
      status: this.selectedStatus()
    }),
    stream: ({ params }) => {
      if (!isPlatformBrowser(this.platformId)) {
        return of({ data: [], total: 0, page: 1, limit: 10 });
      }//SSR will prevent any requests not on browser
      return this.jobService.getLevels(params);
    }
  });

  // Best practice: when filters change, restart from first page.
  private readonly resetPageOnFiltersChange = effect(
    () => {
      this.searchTerm();
      this.selectedStatus();
      this.currentPage.set(1);
    },
    { allowSignalWrites: true },
  );

  handleCreateNavigation() {
    this.router.navigate(['/job-levels/create']);
    console.log('Navigate to Create Level Page');
  }

  handleView(id: string) {
    this.router.navigate(['/attendance/permissions/details', id]);
  }

  totalItems = computed(() => this.levelsResource.value()?.total ?? 0);

  levelsList = computed(() => this.levelsResource.value()?.data ?? []);

}
