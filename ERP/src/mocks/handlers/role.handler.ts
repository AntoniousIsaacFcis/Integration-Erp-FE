// src/mocks/handlers/role.handler.ts
import { http, HttpResponse } from 'msw';
import { environment } from '@env/environment.development';

export const roleHandlers = [
  http.get(`${environment.baseUrl}/api/roles/schema`, () => {
    return HttpResponse.json([
      {
        id: 'administration',
        categoryName: 'الإدارة العامة',
        permissions: [
          { key: 'Pages.Administration.Users', label: 'إدارة المستخدمين', enabled: true },
          { key: 'Pages.Administration.Roles', label: 'إدارة الأدوار', enabled: true }
        ]
      },
      {
        id: 'inventory',
        categoryName: 'المخازن',
        permissions: [
          { key: 'Pages.Inventory.View', label: 'عرض المخزون', enabled: true },
          { key: 'Pages.Inventory.Manage', label: 'تحرير الأصناف', enabled: true }
        ]
      }
    ]);
  })
];
