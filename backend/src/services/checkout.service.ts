import { prisma } from "../prisma";
import { Prisma, CopyStatus, PrismaClient } from "@prisma/client";
import { maxLoansForRole, loanDaysForRole } from "./policy.service";
import { auditLogTx } from "./audit.service";

export async function checkoutCopy(params: {
  userId: number;
  copyId: number;
  staffId: number;
}) {
  const { userId, copyId, staffId } = params;

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const copy = await tx.resourceCopy.findUnique({
      where: { id: copyId },
      include: { resource: true },
    });
    if (!copy) throw new Error("Copy not found");
    if (copy.status !== CopyStatus.available) throw new Error("Copy not available");

    const activeLoans = await tx.loan.count({
      where: { userId, returnedAt: null },
    });

    const limit = maxLoansForRole(user.role);
    if (activeLoans >= limit) throw new Error("Loan limit reached");

    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + loanDaysForRole(user.role));

    const loan = await tx.loan.create({
      data: {
        userId,
        copyId,
        dueAt,
      },
    });

    await tx.resourceCopy.update({
      where: { id: copyId },
      data: { status: CopyStatus.checked_out },
    });

    await auditLogTx(tx as unknown as PrismaClient, {
      actorId: staffId,
      action: "CHECKOUT",
      entity: "Loan",
      entityId: loan.id,
    });

    return loan;
  });
}
