import { prisma } from "../prisma";
import { CopyStatus, PrismaClient } from "@prisma/client";
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

    // FIX 1: Allow pickup if Available OR if Held for this user
    const isAvailable = copy.status === CopyStatus.available;
    const isHeldForUser =
      copy.status === CopyStatus.on_hold && copy.holdUserId === userId;

    if (!isAvailable && !isHeldForUser) {
      throw new Error(`Copy is not available (Status: ${copy.status})`);
    }

    const activeLoans = await tx.loan.count({
      where: { userId, returnedAt: null },
    });

    const limit = maxLoansForRole(user.role);
    if (activeLoans >= limit) throw new Error("Loan limit reached");

    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + loanDaysForRole(user.role));

    // FIX 2: Use updateMany for atomic check-and-set to prevent race conditions
    const updateResult = await tx.resourceCopy.updateMany({
      where: {
        id: copyId,
        status: copy.status, // Ensure status hasn't changed since we read it
      },
      data: {
        status: CopyStatus.checked_out,
        holdUserId: null,
        holdUntil: null,
      },
    });

    if (updateResult.count === 0) {
      throw new Error("Checkout failed: Copy status changed unexpectedly.");
    }

    const loan = await tx.loan.create({
      data: {
        userId,
        copyId,
        dueAt,
      },
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