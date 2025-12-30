import { Role } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user: { id: number; role: Role; email?: string; sub?: number | string };
    }
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
