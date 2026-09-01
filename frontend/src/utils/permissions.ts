import { ROLES, type Role } from './constants'

export const NAV_BY_ROLE: Record<Role, string[]> = {
  [ROLES.ADMIN]: [
    'dashboard',
    'employees',
    'departments',
    'projects',
    'tasks',
    'attendance',
    'leaveApprovals',
    'timesheetApprovals',
    'reports',
    'notifications',
  ],
  [ROLES.MANAGER]: [
    'dashboard',
    'employees',
    'departments',
    'projects',
    'tasks',
    'attendance',
    'leaveApprovals',
    'timesheetApprovals',
    'reports',
    'notifications',
  ],
  [ROLES.EMPLOYEE]: [
    'dashboard',
    'projects',
    'tasks',
    'attendance',
    'leave',
    'timesheets',
    'notifications',
  ],
}

export function canAccess(role: Role, section: string): boolean {
  return NAV_BY_ROLE[role]?.includes(section) ?? false
}
