import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { Role } from "@prisma/client";
declare global {
  namespace Express {
    interface Request {
      user: { id: number; role: Role; email?: string; sub?: number | string };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing Bearer token" });
  }

  try {
    const decoded = verifyAccessToken(token) as any;
    req.user = {
      id: Number(decoded.sub),
      role: decoded.role,
      email: decoded.email,
      sub: decoded.sub,
    };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
