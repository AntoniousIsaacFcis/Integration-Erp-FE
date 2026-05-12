import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-employee-dashboard-component',
  imports: [TranslocoModule],
  templateUrl: './employee-dashboard-component.html',
  styleUrl: './employee-dashboard-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeDashboardComponent {}
