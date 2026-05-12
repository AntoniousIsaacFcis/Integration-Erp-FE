import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { AuthService } from '@core/auth/services/auth-service';
import { AdminDashboardComponent } from '@features/dashboard/components/admin-dashboard-component/admin-dashboard-component';
import { EmployeeDashboardComponent } from '@features/dashboard/components/employee-dashboard-component/employee-dashboard-component';
import { isDashboardAdminUser } from '@features/dashboard/utils/dashboard-role';

@Component({
  selector: 'app-dashboard-page-component',
  imports: [TranslocoModule, AdminDashboardComponent, EmployeeDashboardComponent],
  templateUrl: './dashboard-page-component.html',
  styleUrl: './dashboard-page-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  private readonly authService = inject(AuthService);

  readonly isAdminDashboard = computed(() => isDashboardAdminUser(this.authService));
}
