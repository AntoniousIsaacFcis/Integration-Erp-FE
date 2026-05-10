import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucidePencil, lucidePlusCircle, lucideTrash2 } from '@ng-icons/lucide';
import { NotificationService } from '@core/services/notification-service';
import { AttendanceMachinesService } from '@features/settings/services/attendance-machines-service';
import { IAttendanceMachine } from '@features/settings/models/iattendance-machine';
import { AppBaseTableComponent } from '@shared/components/organisms/app-base-table-component/app-base-table-component';
import { ActionBtnComponent } from '@shared/components/molecules/action-btn-component/action-btn-component';
import { EmptyTablePlaceholderComponent } from '@shared/components/molecules/empty-table-placeholder-component/empty-table-placeholder-component';
import { TableStatusBadgeComponent } from '@shared/components/atoms/table-status-badge-component/table-status-badge-component';
import { CanAccessDirective } from '@shared/directives/can-access-directive';
import { of } from 'rxjs';

@Component({
  selector: 'app-view-attendance-machines-component',
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
  templateUrl: './view-attendance-machines-component.html',
  styleUrl: './view-attendance-machines-component.css',
  providers: [provideIcons({ lucidePencil, lucideTrash2, lucideEye, lucidePlusCircle })],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewAttendanceMachinesComponent {
  private readonly service = inject(AttendanceMachinesService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly platformId = inject(PLATFORM_ID);

  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');

  attendanceMachinesResource = rxResource({
    params: () => ({
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm() || undefined,
      sorting: 'Name asc',
    }),
    stream: ({ params }) => {
      if (!isPlatformBrowser(this.platformId)) {
        return of({ data: [], total: 0, page: 1, limit: 10 });
      }

      return this.service.getManagementData(params);
    },
  });

  attendanceMachines = computed<IAttendanceMachine[]>(() => this.attendanceMachinesResource.value()?.data ?? []);
  totalItems = computed(() => this.attendanceMachinesResource.value()?.total ?? 0);

  private readonly resetPageOnFiltersChange = effect(
    () => {
      this.searchTerm();
      this.currentPage.set(1);
    },
    { allowSignalWrites: true },
  );

  goToCreate() {
    this.router.navigate(['/settings/attendance-machines/create']);
  }

  handleView(id: string) {
    this.router.navigate(['/settings/attendance-machines/preview', id]);
  }

  handleEdit(id: string) {
    this.router.navigate(['/settings/attendance-machines/edit', id]);
  }

  handleDelete(id: string) {
    this.notificationService.show({
      type: 'warning',
      title: 'SETTINGS.DELETE_ATTENDANCE_MACHINE',
      message: 'COMMON.MESSAGES.CONFIRM_DELETE',
      isModal: true,
      actionLabel: 'COMMON.YES',
      cancelLabel: 'COMMON.NO',
      onAction: () => this.deleteAttendanceMachine(id),
    });
  }

  formatConnection(machine: IAttendanceMachine): string {
    const hostName = machine.hostName.trim();
    const port = machine.port;

    if (!hostName && !port) {
      return '';
    }

    if (hostName && port) {
      return `${hostName}:${port}`;
    }

    return hostName || String(port);
  }

  private deleteAttendanceMachine(id: string) {
    this.service.delete(id).subscribe({
      next: () => {
        this.notificationService.show({
          type: 'success',
          title: 'COMMON.MESSAGES.DELETED_SUCCESSFULLY',
          message: 'COMMON.MESSAGES.SUCCESS_MESSAGE',
          isModal: false,
          actionLabel: 'COMMON.CONFIRM',
        });
        this.attendanceMachinesResource.reload();
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
