import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { EmploymentTypesService } from '@features/employment-types/services/employment-types-service';
import { TranslocoModule } from '@jsverse/transloco';
import { AppBaseTableComponent } from "@shared/components/organisms/app-base-table-component/app-base-table-component";
import { ActionBtnComponent } from "@shared/components/molecules/action-btn-component/action-btn-component";
import { NgIcon, provideIcons } from '@ng-icons/core';
import { StatusBadgeComponent } from "@shared/components/molecules/status-badge-component/status-badge-component";
import { lucidePencil, lucideTrash2 } from '@ng-icons/lucide';

@Component({
  selector: 'app-view-emloyment-types-component',
  imports: [AppBaseTableComponent, TranslocoModule, ActionBtnComponent, NgIcon, StatusBadgeComponent],
  templateUrl: './view-emloyment-types-component.html',
  styleUrl: './view-emloyment-types-component.css',
  providers:[provideIcons({lucidePencil,lucideTrash2})],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewEmloymentTypesComponent {
  private service = inject(EmploymentTypesService);
  private router = inject(Router);

  currentPage = signal(1);
    pageSize = signal(10);

  searchTerm = signal('');
  selectedStatus = signal<'active' | 'inactive' | ''>('');

  empTypesResource = rxResource({
    params: () => ({
      page: this.currentPage(),
      limit: 10,
      search: this.searchTerm(),
      status: this.selectedStatus()
    }),
    stream: ({ params }) => this.service.getManagementData(params)
  });
  typesList = computed(() => this.empTypesResource.value()?.data ?? []);
  totalItems = computed(() => this.empTypesResource.value()?.total ?? 0);

  goToCreate() { this.router.navigate(['/employment-types/create']); }
}
