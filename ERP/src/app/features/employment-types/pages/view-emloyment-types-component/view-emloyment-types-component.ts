import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { EmploymentTypesService } from '@features/employment-types/services/employment-types-service';
import { TranslocoModule } from '@jsverse/transloco';
import { AppBaseTableComponent } from "@shared/components/organisms/app-base-table-component/app-base-table-component";
import { ActionBtnComponent } from "@shared/components/molecules/action-btn-component/action-btn-component";
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-view-emloyment-types-component',
  imports: [AppBaseTableComponent, TranslocoModule, ActionBtnComponent,NgIcon],
  templateUrl: './view-emloyment-types-component.html',
  styleUrl: './view-emloyment-types-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewEmloymentTypesComponent {
  private service = inject(EmploymentTypesService);
  private router = inject(Router);

  searchTerm = signal('');
  currentPage = signal(1);

  resource = rxResource({
    params: () => ({
      page: this.currentPage(),
      limit: 10,
      search: this.searchTerm()
    }),
    stream: ({ params }) => this.service.getManagementData(params)
  });
  typesList = computed(() => this.resource.value()?.data ?? []);
  totalItems = computed(() => this.resource.value()?.total ?? 0);

  goToCreate() { this.router.navigate(['/employment-types/create']); }
}
