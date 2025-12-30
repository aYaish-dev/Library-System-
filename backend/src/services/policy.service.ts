import { Role } from "@prisma/client";

export function maxLoansForRole(role: Role): number {
  switch (role) {
    case Role.student:
      return 3;
    case Role.faculty:
      return 10;
    case Role.staff:
      return 9999;
    case Role.admin:
      return 9999;
    default:
      return 3;
  }
}

export function loanDaysForRole(role: Role): number {
  switch (role) {
    case Role.student:
      return 14;
    case Role.faculty:
      return 30;
    case Role.staff:
      return 30;
    case Role.admin:
      return 30;
    default:
      return 14;
  }
}
