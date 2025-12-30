import jwt, { Secret, SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as Secret;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as Secret;

const ACCESS_TTL: StringValue = "15m";
const REFRESH_TTL: StringValue = "7d";

export function signAccessToken(payload: object) {
  const options: SignOptions = { expiresIn: ACCESS_TTL };
  return jwt.sign(payload, ACCESS_SECRET, options);
}

export function signRefreshToken(payload: object) {
  const options: SignOptions = { expiresIn: REFRESH_TTL };
  return jwt.sign(payload, REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET);
}
