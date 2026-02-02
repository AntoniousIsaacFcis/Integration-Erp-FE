import { Injectable, signal } from '@angular/core';
import { INavItem } from '@core/models/inav-item';

export const MENU_ITEMS: INavItem[] = [
  { id: '1', label: 'MENU.DASHBOARD', path: '/dashboard', icon: 'lucideLayoutDashboard' },
  {
    id: '2',
    label: 'MENU.EMPLOYEES',
    path: '/employees',
    icon: 'lucideUsers',
    children: [
      { id: '2-1', label: 'MENU.ALL_EMPLOYEES', path: '/employees/list', icon: 'lucideList' },
      { id: '2-2', label: 'MENU.ADD_EMPLOYEE', path: '/employees/add', icon: 'lucidePlus' },
      { id: '2-3', label: 'MENU.EMPLOYEE_RECORDS', path: '/employees/records', icon: 'lucideFileText' },
      { id: '2-4', label: 'MENU.ATTENDANCE', path: '/employees/attendance', icon: 'lucideClipboardList' }
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
      { id: '3-3', label: 'MENU.LEVELS', path: '/organization/levels', icon: 'lucideGraduationCap' }
    ]
  },
  {
    id: '4',
    label: 'MENU.JOB_LEVELS',
    path: '/job-levels',
    icon: 'lucideAlignEndVertical',
    children: [
      { id: '4-1', label: 'MENU.VIEW_LEVELS', path: '/job-levels/view', icon: 'lucideEye' },
      { id: '4-2', label: 'MENU.CREATE_LEVEL', path: '/job-levels/create', icon: 'lucidePlus' },
      { id: '4-3', label: 'MENU.LEVEL_MAPPING', path: '/job-levels/mapping', icon: 'lucideLink' }
    ]
  },
  { id: '5', label: 'MENU.SHIFT_TYPES', path: '/shift-types', icon: 'lucideClock3' },
  {
    id: '6',
    label: 'MENU.SHIFT_MANAGEMENT',
    path: '/shifts',
    icon: 'lucideCalendar',
    children: [
      { id: '6-1', label: 'MENU.SHIFT_SCHEDULE', path: '/shifts/schedule', icon: 'lucideCalendarDays' },
      { id: '6-2', label: 'MENU.SHIFT_ASSIGNMENT', path: '/shifts/assignment', icon: 'lucideUsers' },
      { id: '6-3', label: 'MENU.SHIFT_REPORTS', path: '/shifts/reports', icon: 'lucideBarChart3' }
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
  },
  {
    id: '2',
    label: 'MENU.EMPLOYEES',
    path: '/employees',
    icon: 'lucideUsers',
    children: [
      { id: '2-1', label: 'MENU.ALL_EMPLOYEES', path: '/employees/list', icon: 'lucideList' },
      { id: '2-2', label: 'MENU.ADD_EMPLOYEE', path: '/employees/add', icon: 'lucidePlus' },
      { id: '2-3', label: 'MENU.EMPLOYEE_RECORDS', path: '/employees/records', icon: 'lucideFileText' },
      { id: '2-4', label: 'MENU.ATTENDANCE', path: '/employees/attendance', icon: 'lucideClipboardList' }
    ]
  },
  {
    id: '2',
    label: 'MENU.EMPLOYEES',
    path: '/employees',
    icon: 'lucideUsers',
    children: [
      { id: '2-1', label: 'MENU.ALL_EMPLOYEES', path: '/employees/list', icon: 'lucideList' },
      { id: '2-2', label: 'MENU.ADD_EMPLOYEE', path: '/employees/add', icon: 'lucidePlus' },
      { id: '2-3', label: 'MENU.EMPLOYEE_RECORDS', path: '/employees/records', icon: 'lucideFileText' },
      { id: '2-4', label: 'MENU.ATTENDANCE', path: '/employees/attendance', icon: 'lucideClipboardList' }
    ]
  },
  {
    id: '2',
    label: 'MENU.EMPLOYEES',
    path: '/employees',
    icon: 'lucideUsers',
    children: [
      { id: '2-1', label: 'MENU.ALL_EMPLOYEES', path: '/employees/list', icon: 'lucideList' },
      { id: '2-2', label: 'MENU.ADD_EMPLOYEE', path: '/employees/add', icon: 'lucidePlus' },
      { id: '2-3', label: 'MENU.EMPLOYEE_RECORDS', path: '/employees/records', icon: 'lucideFileText' },
      { id: '2-4', label: 'MENU.ATTENDANCE', path: '/employees/attendance', icon: 'lucideClipboardList' }
    ]
  },
];

@Injectable({
  providedIn: 'root',
})

export class NavigationService {
  readonly menuItems = signal(MENU_ITEMS);
}
