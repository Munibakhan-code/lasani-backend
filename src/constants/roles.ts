export const ROLES = {
  CLIENT: 'CLIENT',
  MANAGER: 'MANAGER',
  VATOR: 'VATOR',
  ADMIN: 'ADMIN',
} as const;

export type Role = keyof typeof ROLES;
export const ALL_ROLES: Role[] = Object.values(ROLES);
export const STAFF_ROLES: Role[] = [ROLES.MANAGER, ROLES.VATOR];
export const ASSIGNABLE_BY_ADMIN: Role[] = [ROLES.MANAGER, ROLES.VATOR];