import type { RequestHandler } from "express";
import { getAuth } from "../middlewares/authenticate.js";
import { createMembershipRequestSchema } from "../models/membership.schema.js";
import { createMembershipRequest } from "../services/membership.service.js";
import { badRequest } from "../lib/errors.js";

export const createMembershipRequestController: RequestHandler =
  async (req, res) => {
    const { user } = getAuth(req);

    const companyId = req.params.companyId;

    if (typeof companyId !== "string" || companyId.length === 0) {
      throw badRequest("Identificador da empresa inválido.");
    }

    const input = createMembershipRequestSchema.parse(req.body);

    const result = await createMembershipRequest(
      user.id,
      companyId,
      input
    );

    res.status(201).json(result);
  };
