export interface IApplicationConfig {
  auth: {
    grantedPolicies: Record<string, boolean>;
  };
  currentUser: {
    isAuthenticated: boolean;
    id: string;
    userName: string;
    email: string;
    roles: string[];
  };
  localization: {
    currentCulture: {
      name: string;
      isRightToLeft: boolean;
    };
  };
}
