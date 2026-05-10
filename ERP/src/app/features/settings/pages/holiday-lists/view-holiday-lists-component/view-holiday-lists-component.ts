import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucidePencil, lucidePlusCircle, lucideTrash2 } from '@ng-icons/lucide';
import { NotificationService } from '@core/services/notification-service';
import { HolidayListsService } from '@features/settings/services/holiday-lists-service';
import { IHolidayList } from '@features/settings/models/iholiday-list';
import { AppBaseTableComponent } from '@shared/components/organisms/app-base-table-component/app-base-table-component';
import { ActionBtnComponent } from '@shared/components/molecules/action-btn-component/action-btn-component';
import { EmptyTablePlaceholderComponent } from '@shared/components/molecules/empty-table-placeholder-component/empty-table-placeholder-component';
import { TableStatusBadgeComponent } from '@shared/components/atoms/table-status-badge-component/table-status-badge-component';
import { CanAccessDirective } from '@shared/directives/can-access-directive';
import { of } from 'rxjs';

@Component({
  selector: 'app-view-holiday-lists-component',
  standalone: true,
  imports: [
    AppBaseTableComponent,
    TranslocoModule,
    ActionBtnComponent,
    EmptyTablePlaceholderComponent,
    NgIcon,
    TableStatusBadgeComponent,
    CanAccessDirective,
  ],
  templateUrl: './view-holiday-lists-component.html',
  styleUrl: './view-holiday-lists-component.css',
  providers: [provideIcons({ lucidePencil, lucideTrash2, lucideEye, lucidePlusCircle })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewHolidayListsComponent {
  private readonly service = inject(HolidayListsService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly platformId = inject(PLATFORM_ID);

  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');

  holidayListsResource = rxResource({
    params: () => ({
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm() || undefined,
    }),
    stream: ({ params }) => {
      if (!isPlatformBrowser(this.platformId)) {
        return of({ data: [], total: 0, page: 1, limit: 10 });
      }

      return this.service.getManagementData(params);
    },
  });

  holidayLists = computed<IHolidayList[]>(() => this.holidayListsResource.value()?.data ?? []);
  totalItems = computed(() => this.holidayListsResource.value()?.total ?? 0);

  private readonly resetPageOnFiltersChange = effect(
    () => {
      this.searchTerm();
      this.currentPage.set(1);
    },
    { allowSignalWrites: true },
  );

  goToCreate() {
    this.router.navigate(['/settings/holiday-lists/create']);
  }

  handleView(id: string) {
    this.router.navigate(['/settings/holiday-lists/preview', id]);
  }

  handleEdit(id: string) {
    this.router.navigate(['/settings/holiday-lists/edit', id]);
  }

  handleDelete(id: string) {
    this.notificationService.show({
      type: 'warning',
      title: 'SETTINGS.DELETE_HOLIDAY_LIST',
      message: 'COMMON.MESSAGES.CONFIRM_DELETE',
      isModal: true,
      actionLabel: 'COMMON.YES',
      cancelLabel: 'COMMON.NO',
      onAction: () => this.deleteHolidayList(id),
    });
  }

  private deleteHolidayList(id: string) {
    this.service.delete(id).subscribe({
      next: () => {
        this.notificationService.show({
          type: 'success',
          title: 'COMMON.MESSAGES.DELETED_SUCCESSFULLY',
          message: 'COMMON.MESSAGES.SUCCESS_MESSAGE',
          isModal: false,
          actionLabel: 'COMMON.CONFIRM',
        });
        this.holidayListsResource.reload();
      },
      error: () => {
        this.notificationService.show({
          type: 'error',
          title: 'COMMON.MESSAGES.OPERATION_FAILED',
          message: 'COMMON.MESSAGES.PLEASE_TRY_AGAIN',
          isModal: false,
          actionLabel: 'COMMON.CONFIRM',
        });
      },
    });
  }
}
