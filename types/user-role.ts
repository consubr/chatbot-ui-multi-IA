export enum UserRole {
  FREE = "FREE",
  PAID = "PAID",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
  PLAN1 = "PLAN1",
  PLAN2 = "PLAN2",
  PLAN3 = "PLAN3"
}

export const checkIsAdmin = (role?: string | null): boolean => {
  return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN
}

export const checkIsSuperAdmin = (role?: string | null): boolean => {
  return role === UserRole.SUPER_ADMIN
}
