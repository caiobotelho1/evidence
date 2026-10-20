import type { RequestHandler } from "express";
import { createUserSchema } from "../models/user.schema.js";
import { createUser } from "../services/user.service.js";

export const createUserController: RequestHandler = async (req, res) => {
  const input = createUserSchema.parse(req.body);
  const user = await createUser(input);
  res.status(201).json(user);
};
