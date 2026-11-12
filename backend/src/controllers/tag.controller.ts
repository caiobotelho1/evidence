
import type { RequestHandler } from "express";
import {
  createTagSchema,
  updateTagSchema,
} from "../models/tag.schema.js";
import {
  createTag,
  listTags,
  updateTag,
  deleteTag,
} from "../services/tag.service.js";
import { getAuth } from "../middlewares/authenticate.js";

function getRequiredParam(value: string | string[] | undefined): string {
  if (typeof value !== "string" || !value) {
    throw new Error("Parâmetro obrigatório não informado.");
  }

  return value;
}

export const createPersonalTagController: RequestHandler = async (req, res) => {
  const { user } = getAuth(req);
  const input = createTagSchema.parse(req.body);

  const tag = await createTag(
    { type: "personal", userId: user.id },
    input
  );

  res.status(201).json(tag);
};

export const createCompanyTagController: RequestHandler = async (req, res) => {
  const { user } = getAuth(req);
  const companyId = getRequiredParam(req.params.companyId);
  const input = createTagSchema.parse(req.body);

  const tag = await createTag(
    { type: "company", companyId, userId: user.id },
    input
  );

  res.status(201).json(tag);
};

export const listPersonalTagsController: RequestHandler = async (req, res) => {
  const { user } = getAuth(req);

  const tags = await listTags({
    type: "personal",
    userId: user.id,
  });

  res.status(200).json(tags);
};

export const listCompanyTagsController: RequestHandler = async (req, res) => {
  const { user } = getAuth(req);
  const companyId = getRequiredParam(req.params.companyId);

  const tags = await listTags({
    type: "company",
    companyId,
    userId: user.id,
  });

  res.status(200).json(tags);
};

export const updatePersonalTagController: RequestHandler = async (req, res) => {
  const { user } = getAuth(req);
  const tagId = getRequiredParam(req.params.tagId);
  const input = updateTagSchema.parse(req.body);

  const tag = await updateTag(
    { type: "personal", userId: user.id },
    tagId,
    input
  );

  res.status(200).json(tag);
};

export const updateCompanyTagController: RequestHandler = async (req, res) => {
  const { user } = getAuth(req);
  const companyId = getRequiredParam(req.params.companyId);
  const tagId = getRequiredParam(req.params.tagId);
  const input = updateTagSchema.parse(req.body);

  const tag = await updateTag(
    { type: "company", companyId, userId: user.id },
    tagId,
    input
  );

  res.status(200).json(tag);
};

export const deletePersonalTagController: RequestHandler = async (req, res) => {
  const { user } = getAuth(req);
  const tagId = getRequiredParam(req.params.tagId);

  await deleteTag(
    { type: "personal", userId: user.id },
    tagId
  );

  res.status(204).send();
};

export const deleteCompanyTagController: RequestHandler = async (req, res) => {
  const { user } = getAuth(req);
  const companyId = getRequiredParam(req.params.companyId);
  const tagId = getRequiredParam(req.params.tagId);

  await deleteTag(
    { type: "company", companyId, userId: user.id },
    tagId
  );

  res.status(204).send();
};
