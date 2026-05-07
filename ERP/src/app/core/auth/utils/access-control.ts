import { AuthService } from '@core/auth/services/auth-service';

export interface AccessRule {
  roles?: string[];
  anyPolicies?: string[];
  allPolicies?: string[];
}

export type AccessRuleInput = string | AccessRule;

export function canAccess(authService: AuthService, rule: AccessRuleInput) {
  const normalizedRule = normalizeRule(rule);

  return hasRequiredRole(authService, normalizedRule.roles) &&
    hasAnyPolicy(authService, normalizedRule.anyPolicies) &&
    hasAllPolicies(authService, normalizedRule.allPolicies);
}

export function canAccessWithAnyRole(authService: AuthService, rule: AccessRuleInput, allowedRoles: string[]) {
  const normalizedRule = normalizeRule(rule);

  return hasRequiredRole(authService, allowedRoles) &&
    hasRequiredRole(authService, normalizedRule.roles) &&
    hasAnyPolicy(authService, normalizedRule.anyPolicies) &&
    hasAllPolicies(authService, normalizedRule.allPolicies);
}

function normalizeRule(rule: AccessRuleInput): AccessRule {
  return typeof rule === 'string'
    ? { allPolicies: [rule] }
    : rule;
}

function hasRequiredRole(authService: AuthService, roles?: string[]) {
  if (!roles?.length) {
    return true;
  }

  const userRoles = authService.currentUser()?.roles ?? [];
  const normalizedUserRoles = userRoles.map((role: string) => role.toLowerCase());

  return roles.some(role => normalizedUserRoles.includes(role.toLowerCase()));
}

function hasAnyPolicy(authService: AuthService, policies?: string[]) {
  if (!policies?.length) {
    return true;
  }

  return policies.some(policy => authService.hasPermission(policy));
}

function hasAllPolicies(authService: AuthService, policies?: string[]) {
  if (!policies?.length) {
    return true;
  }

  return policies.every(policy => authService.hasPermission(policy));
}
