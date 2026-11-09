import type { RequestHandler } from "express";
import { clearSessionCookie, readSessionToken, setSessionCookie } from "../lib/session-cookie.js";
import { getAuth } from "../middlewares/authenticate.js";
import { loginSchema } from "../models/auth.schema.js";
import { login, logout } from "../services/auth.service.js";

export const loginController: RequestHandler = async (req, res) => {
  const input = loginSchema.parse(req.body);
  const { token, expiresAt, user } = await login(input, {
    previousToken: readSessionToken(req),
  });

  setSessionCookie(res, token, expiresAt);
  res.status(200).json({ user });
};

export const logoutController: RequestHandler = async (req, res) => {
  const token = readSessionToken(req);
  if (token) {
    await logout(token);
  }

  clearSessionCookie(res);
  res.status(204).send();
};

export const meController: RequestHandler = (req, res) => {
  res.status(200).json({ user: getAuth(req).user });
};
