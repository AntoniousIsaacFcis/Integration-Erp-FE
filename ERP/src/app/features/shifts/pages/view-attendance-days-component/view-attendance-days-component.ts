import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AttendanceService } from '@features/shifts/services/attendance-service';
import { TranslocoModule } from '@jsverse/transloco';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheckCircle, lucideCloudUpload, lucideEye, lucidePencil } from '@ng-icons/lucide';
import { ActionBtnComponent } from '@shared/components/molecules/action-btn-component/action-btn-component';
import { DateFilterComponent } from '@shared/components/molecules/date-filter-component/date-filter-component';
import { AppBaseTableComponent } from '@shared/components/organisms/app-base-table-component/app-base-table-component';
import { StatusBadgeComponent } from "@shared/components/molecules/status-badge-component/status-badge-component";

@Component({
  selector: 'app-view-attendance-days-component',
  imports: [TranslocoModule,
    DatePipe,
    AppBaseTableComponent,
    ActionBtnComponent,
    DateFilterComponent,
    NgIcon, StatusBadgeComponent],
  templateUrl: './view-attendance-days-component.html',
  styleUrl: './view-attendance-days-component.css',
  providers: [provideIcons({ lucidePencil, lucideEye, lucideCloudUpload, lucideCheckCircle })],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewAttendanceDaysComponent {
  private attendanceService = inject(AttendanceService);
  private router = inject(Router);

  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');
  fromDate = signal<string>('');
  toDate = signal<string>('');
  statusFilter = signal<'present' | 'absent' | 'late' | ''>('');

  attendanceResource = rxResource({
    params: () => ({
      page: this.currentPage(),
      limit: this.pageSize(),
      search: this.searchTerm() || undefined,
      fromDate: this.fromDate() || undefined,
      toDate: this.toDate() || undefined,
      status: this.statusFilter() || undefined
    }),
    stream: ({ params }) => {
      console.log('📡 [AttendanceResource] Streaming data with:', params);
      return this.attendanceService.getAllAttendance(params);
    }
  });

  attendanceLogs = computed(() => {
    return this.attendanceResource.value()?.data ?? [];
  });

  totalItems = computed(() => this.attendanceResource.value()?.total ?? 0);
  isLoading = computed(() => this.attendanceResource.isLoading());

  getStatusClasses(status: string): string {
    const statusMap: Record<string, string> = {
      'present': 'bg-green-100 text-green-700',
      'late': 'bg-orange-100 text-orange-700',
      'absent': 'bg-red-100 text-red-700',
      'on_leave': 'bg-blue-100 text-blue-700',
      // any specific cases
      'active': 'bg-green-100 text-green-700',
      'expired': 'bg-gray-100 text-gray-700'
    };

    return statusMap[status.toLowerCase()] || 'bg-gray-100 text-gray-700';
  }

  attendanceStatusOptions = [
    { value: '', label: 'FILTERS.ALL' },
    { value: 'present', label: 'ATTENDANCE.STATUS_PRESENT' }, // حضور
    { value: 'absent', label: 'ATTENDANCE.STATUS_ABSENT' },  // غياب
    { value: 'late', label: 'ATTENDANCE.STATUS_LATE' }       // تأخير
  ];
  calculateTotalHours(checkIn?: string, checkOut?: string): string {
    if (!checkIn || !checkOut) return '00:00';

    // if format is "HH:mm" (ex 08:30)
    const [inHours, inMinutes] = checkIn.split(':').map(Number);
    const [outHours, outMinutes] = checkOut.split(':').map(Number);

    const totalInMinutes = inHours * 60 + inMinutes;
    const totalOutMinutes = outHours * 60 + outMinutes;

    let diffInMinutes = totalOutMinutes - totalInMinutes;
    if (diffInMinutes < 0) diffInMinutes += 24 * 60;

    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;

    // return formatted string
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  handleImport() {
    console.log('Importing logic...');
  }

  handleDailyRegistration() {
    this.router.navigate(['/shifts/edit-attendance-day']);
  }

  handleViewDetails(id: string) {
    this.router.navigate(['/shifts/attendance/details', id]);
  }

  handleEdit(id: string) {
    this.router.navigate(['/shifts/attendance/edit', id]);
  }
}
