import type { Request, RequestHandler } from "express";
import { forbidden, unauthorized } from "../lib/errors.js";
import { hasPermission, type Permission } from "../lib/permissions.js";
import { clearSessionCookie, readSessionToken } from "../lib/session-cookie.js";
import { authenticateSession, type AuthContext } from "../services/auth.service.js";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}


export const requireAuth: RequestHandler = async (req, res, next) => {
  const token = readSessionToken(req);
  if (!token) {
    throw unauthorized();
  }

  const auth = await authenticateSession(token);
  if (!auth) {
    clearSessionCookie(res);
    throw unauthorized("Sessão inválida ou expirada.");
  }

  req.auth = auth;
  next();
};


export function getAuth(req: Request): AuthContext {
  if (!req.auth) {
    throw unauthorized();
  }
  return req.auth;
}


export function requirePermission(
  permission: Permission,
  options: { companyParam?: string } = {},
): RequestHandler {
  return (req, _res, next) => {
    const { user } = getAuth(req);

    let companyId: string | undefined;
    if (options.companyParam) {
      const value: unknown = req.params[options.companyParam];
      if (typeof value !== "string" || value.length === 0) {
        throw forbidden();
      }
      companyId = value;
    }

    if (!hasPermission(user.memberships, permission, companyId)) {
      throw forbidden();
    }

    next();
  };
}
