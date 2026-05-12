import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EmployeeDashboardComponent } from '@features/dashboard/components/employee-dashboard-component/employee-dashboard-component';

@Component({
  selector: 'app-dashboard-page-component',
  imports: [EmployeeDashboardComponent],
  templateUrl: './dashboard-page-component.html',
  styleUrl: './dashboard-page-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {}
