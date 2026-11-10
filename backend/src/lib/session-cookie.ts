import type { CookieOptions, Request, Response } from "express";
import { env } from "../config/env.js";

export const SESSION_COOKIE_NAME = "evidence_session";

const baseOptions: CookieOptions = {
  httpOnly: true, 
  sameSite: "lax", 
  secure: env.NODE_ENV === "production",
  path: "/",
};

export function setSessionCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(SESSION_COOKIE_NAME, token, { ...baseOptions, expires: expiresAt });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, baseOptions);
}

export function readSessionToken(req: Request): string | undefined {
  const value: unknown = req.cookies?.[SESSION_COOKIE_NAME];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
