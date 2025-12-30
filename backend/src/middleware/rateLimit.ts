import { Request, Response, NextFunction } from "express";
import { redis } from "../redis"; // if you have a redis singleton, otherwise use req.redis

export function loginRateLimit() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || "unknown";
    const key = `rl:login:${ip}`;

    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 10 * 60); // 10 minutes

    if (count > 5) {
      return res.status(429).json({ error: "Too many login attempts. Try later." });
    }

    next();
  };
}
