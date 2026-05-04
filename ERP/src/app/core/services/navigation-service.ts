import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, RouterEvent, Router } from '@angular/router';
import { AuthService } from '@core/auth/services/auth-service';
import { INavItem } from '@core/models/inav-item';
import { filter, map } from 'rxjs';

export const MENU_ITEMS: INavItem[] = [
  { id: '1', label: 'MENU.DASHBOARD', path: '/dashboard', icon: 'lucideLayoutDashboard' },
  {
    id: '2',
    label: 'MENU.EMPLOYEES',
    path: '/core-hr/employees',
    icon: 'lucideUsers',
    children: [
      { id: '2-1', label: 'MENU.ALL_EMPLOYEES', path: '/core-hr/employees/view', icon: 'lucideList' },
      { id: '2-2', label: 'MENU.ADD_EMPLOYEE', path: '/core-hr/employees/add', icon: 'lucidePlus' },
      { id: '2-3', label: 'MENU.EMPLOYEE_RECORDS', path: '/core-hr/employees/records', icon: 'lucideFileText' },
      { id: '2-4', label: 'MENU.ATTENDANCE', path: '/core-hr/employees/attendance', icon: 'lucideClipboardList' }
    ]
  },
  {
    id: '3',
    label: 'MENU.ORGANIZATION',
    path: '/organization',
    icon: 'lucideBuilding2',
    children: [
      { id: '3-1', label: 'ORGANIZATION.MANAGE_DESIGNATIONS', path: '/organization/designations', icon: 'lucideBriefcase' },
      { id: '3-2', label: 'ORGANIZATION.MANAGE_DEPARTMENTS', path: '/organization/departments', icon: 'lucideFolder' },
      { id: '3-3', label: 'ORGANIZATION.MANAGE_JOB_LEVELS', path: '/organization/levels', icon: 'lucideGraduationCap' },
      { id: '3-4', label: 'ORGANIZATION.MANAGE_EMPLOYMENT_TYPES', path: '/organization/employment-types', icon: 'lucideList' }
    ]
  },
  {
    id: '6',
    label: 'MENU.SHIFT_MANAGEMENT',
    path: '/attendance',
    icon: 'lucideCalendar',
    children: [
      { id: '6-1', label: 'MENU.VIEW_ATTENDANCE_LOGS', path: '/attendance/view-attendance-log', icon: 'lucideFileText' },
      { id: '6-2', label: 'MENU.VIEW_SHIFTS', path: '/attendance/view', icon: 'lucideCalendarDays' },
      { id: '6-3', label: 'MENU.VIEW_SPECIAL_SHIFTS', path: '/attendance/special', icon: 'lucideUsers' },
      { id: '6-4', label: 'MENU.VIEW_ATTENDANCE_DAYS', path: '/attendance/view-attendance-days', icon: 'lucideCheckCircle' },
      { id: '6-5', label: 'MENU.VIEW_PERMISSIONS', path: '/attendance/view-permissions', icon: 'lucideShieldCheck' }
    ]
  },
  {
    id: '7',
    label: 'MENU.SETTINGS',
    path: '/settings',
    icon: 'lucideSettings',
    children: [
      { id: '7-1', label: 'MENU.GENERAL_SETTINGS', path: '/settings/general', icon: 'lucideGlobe' },
      { id: '7-2', label: 'MENU.USER_MANAGEMENT', path: '/settings/users', icon: 'lucideUsers' },
      { id: '7-3', label: 'MENU.SYSTEM_CONFIGURATION', path: '/settings/config', icon: 'lucideSliders' },
      { id: '7-4', label: 'MENU.AUDIT_LOG', path: '/settings/audit', icon: 'lucideHistory' }
    ]
  }
];

@Injectable({
  providedIn: 'root',
})

export class NavigationService {
  private readonly router = inject(Router);
  private authService = inject(AuthService);

  readonly filteredMenuItems = computed(() => {
    const policies = this.authService.grantedPolicies();
    return this.filterNavItems(MENU_ITEMS, policies);
  });

  private filterNavItems(items: INavItem[], policies: Record<string, boolean>): INavItem[] {
    return items
      .filter(item => !item.requiredPolicy || !!policies[item.requiredPolicy])
      .map(item => {
        if (item.children) {
          return { ...item, children: this.filterNavItems(item.children, policies) };
        }
        return item;
      })
      .filter(item => !item.children || item.children.length > 0 || item.path);
  }

  readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  isActive(path: string): boolean {
    const url = this.currentUrl();
    return url === path || url.startsWith(path + '/');
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
