import { IApplicationConfig } from '@core/models/iapplication-config';

export const MOCK_AUTH_DATA = {
  // Guest
  guestConfig: (): IApplicationConfig => ({
    localization: {
      currentCulture: { name: 'ar-EG', isRightToLeft: true }
    },
    auth: { grantedPolicies: {} },
    currentUser: { isAuthenticated: false, id: '', userName: '', email: '', roles: [] }
  }),

  // Admin
  adminConfig: (): IApplicationConfig => ({
    localization: {
      currentCulture: { name: 'ar-EG', isRightToLeft: true }
    },
    auth: {
      grantedPolicies: {
        'AbpIdentity.Users': true,
        'Accounting.Reports.View': true,
        'Inventory.Products.Create': true
      }
    },
    currentUser: {
      isAuthenticated: true,
      id: 'admin-001',
      userName: 'admin_erp',
      email: 'admin@company.com',
      roles: ['admin']
    }
  }),

  loginSuccess: {
    result: { result: 1, description: 'Success' }
  }
};
