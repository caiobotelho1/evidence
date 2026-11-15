import type { RequestHandler } from "express";
import { z } from "zod";

import {
  listCompanyMembers,
  getCompanyMember,
  removeCompanyMember,
} from "../services/company-member.service.js";

const companyParamsSchema = z.object({
  companyId: z.uuid(),
});

const memberParamsSchema = z.object({
  companyId: z.uuid(),
  membershipId: z.uuid(),
});

export const listCompanyMembersController: RequestHandler =
  async (req, res) => {
    const { companyId } = companyParamsSchema.parse(req.params);

    const result = await listCompanyMembers(companyId);

    res.status(200).json(result);
  };

export const getCompanyMemberController: RequestHandler =
  async (req, res) => {
    const { companyId, membershipId } =
      memberParamsSchema.parse(req.params);

    const result = await getCompanyMember(
      companyId,
      membershipId
    );

    res.status(200).json(result);
  };

export const removeCompanyMemberController: RequestHandler =
  async (req, res) => {
    const { companyId, membershipId } =
      memberParamsSchema.parse(req.params);

    const result = await removeCompanyMember(
      companyId,
      membershipId
    );

    res.status(200).json(result);
  };
