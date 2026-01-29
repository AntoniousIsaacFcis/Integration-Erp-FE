import { Injectable, signal } from '@angular/core';
import { INavItem } from '@core/models/inav-item';

export const MENU_ITEMS :INavItem[]= [
{ id: '1', label: 'MENU.DASHBOARD', path: '/dashboard', icon: 'lucideLayoutDashboard' },
  { id: '2', label: 'MENU.EMPLOYEES', path: '/employees', icon: 'lucideUsers' },
  { id: '3', label: 'MENU.DEPARTMENTS', path: '/departments', icon: 'domain' },
  { id: '4', label: 'MENU.JOB_LEVELS', path: '/job-levels', icon: 'assignment_ind' },
  { id: '5', label: 'MENU.SHIFT_TYPES', path: '/shift-types', icon: 'schedule' },
  { id: '6', label: 'MENU.SHIFT_MANAGEMENT', path: '/shifts', icon: 'calendar_month' },
  { id: '7', label: 'MENU.SETTINGS', path: '/settings', icon: 'lucideSettings' }
];

@Injectable({
  providedIn: 'root',
})

export class NavigationService {
readonly menuItems = signal(MENU_ITEMS);
}
