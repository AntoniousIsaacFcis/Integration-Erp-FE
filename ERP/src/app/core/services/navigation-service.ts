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
      { id: '3-1', label: 'MENU.DEPARTMENTS', path: '/organization/departments', icon: 'lucideFolder' },
      { id: '3-2', label: 'MENU.DESIGNATIONS', path: '/organization/designations', icon: 'lucideBriefcase' },
      { id: '3-3', label: 'MENU.VIEW_LEVELS', path: '/organization/levels/view', icon: 'lucideGraduationCap' },
      { id: '3-4', label: 'MENU.CREATE_LEVEL', path: '/organization/levels/create', icon: 'lucidePlus' },
      { id: '3-5', label: 'MENU.LEVEL_MAPPING', path: '/organization/levels/mapping', icon: 'lucideLink' },
      { id: '3-6', label: 'MENU.VIEW_TYPES', path: '/organization/employment-types/view', icon: 'lucideList' },
      { id: '3-7', label: 'MENU.CREATE_TYPE', path: '/organization/employment-types/create', icon: 'lucidePlus' }
    ]
  },
  {
    id: '6',
    label: 'MENU.SHIFT_MANAGEMENT',
    path: '/shifts',
    icon: 'lucideCalendar',
    children: [
      { id: '6-1', label: 'MENU.VIEW_SHIFTS', path: '/shifts/view', icon: 'lucideCalendarDays' },
      { id: '6-2', label: 'MENU.CREATE_SHIFT', path: '/shifts/create', icon: 'lucidePlus' },
      { id: '6-3', label: 'MENU.VIEW_SPECIAL_SHIFTS', path: '/shifts/special', icon: 'lucideUsers' },
      { id: '6-4', label: 'MENU.CREATE_SPECIAL_SHIFT', path: '/shifts/special-create', icon: 'lucideBarChart3' }, { id: '6-5', label: 'MENU.EDIT_ATTENDANCE_DAY', path: '/shifts/edit-attendance-day', icon: 'lucidePencil' },
      { id: '6-6', label: 'MENU.VIEW_ATTENDANCE_DAYS', path: '/shifts/view-attendance-days', icon: 'lucideCheckCircle' },
      { id: '6-7', label: 'MENU.ADD_ATTENDANCE_PERMISSION', path: '/shifts/add-permission', icon: 'lucideCheckSquare' },
      { id: '6-8', label: 'MENU.VIEW_PERMISSIONS', path: '/shifts/view-permissions', icon: 'lucideShieldCheck' }
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
