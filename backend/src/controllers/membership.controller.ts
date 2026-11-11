import type { RequestHandler } from "express";
import { badRequest } from "../lib/errors.js";
import { getAuth } from "../middlewares/authenticate.js";
import { createMembershipRequestSchema } from "../models/membership.schema.js";
import {
  createMembershipRequest,
  decideMembershipRequest,
  listPendingMembershipRequests,
} from "../services/membership.service.js";

function getRequiredParam(value: unknown, message: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw badRequest(message);
  }

  return value;
}

export const createMembershipRequestController: RequestHandler =
  async (req, res) => {
    const { user } = getAuth(req);

    const companyId = getRequiredParam(
      req.params.companyId,
      "Identificador da empresa inválido."
    );

    const input = createMembershipRequestSchema.parse(req.body);

    const result = await createMembershipRequest(user.id, companyId, input);

    res.status(201).json(result);
  };

export const listPendingMembershipRequestsController: RequestHandler =
  async (req, res) => {
    const companyId = getRequiredParam(
      req.params.companyId,
      "Identificador da empresa inválido."
    );

    const result = await listPendingMembershipRequests(companyId);

    res.status(200).json(result);
  };

function createMembershipDecisionController(
  decision: "ACTIVE" | "REJECTED"
): RequestHandler {
  return async (req, res) => {
    const { user } = getAuth(req);

    const companyId = getRequiredParam(
      req.params.companyId,
      "Identificador da empresa inválido."
    );

    const membershipId = getRequiredParam(
      req.params.membershipId,
      "Identificador da solicitação inválido."
    );

    const result = await decideMembershipRequest(
      companyId,
      membershipId,
      user.id,
      decision
    );

    res.status(200).json(result);
  };
}

export const approveMembershipRequestController =
  createMembershipDecisionController("ACTIVE");

export const rejectMembershipRequestController =
  createMembershipDecisionController("REJECTED");