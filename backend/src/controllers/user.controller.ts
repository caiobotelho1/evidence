import type { RequestHandler } from "express";
import {createUserSchema,updateUserSchema,changePasswordSchema} from "../models/user.schema.js";
import {createUser,getUserProfile,updateUserProfile,changeUserPassword,} from "../services/user.service.js";
import { getAuth } from "../middlewares/authenticate.js";

// Cadastro de usuário
export const createUserController: RequestHandler = async (req,res) => {
  const input = createUserSchema.parse(req.body);
  const user = await createUser(input);

  res.status(201).json(user);
};

// Consultar dados pessoais
export const getUserProfileController: RequestHandler = async (req,res) => {
  const { user } = getAuth(req);
  const profile = await getUserProfile(user.id);

  res.status(200).json(profile);
};

// Atualizar dados pessoais
export const updateUserProfileController: RequestHandler = async (req,res) => {
  const { user } = getAuth(req);
  const input = updateUserSchema.parse(req.body);
  const profile = await updateUserProfile(
    user.id,
    input
  );
  res.status(200).json(profile);
};

export const changePasswordController: RequestHandler = async (req,res) => {
  const { user } = getAuth(req);
  const input = changePasswordSchema.parse(req.body);
  const result = await changeUserPassword(
    user.id,
    input
  );
  res.status(200).json(result);
};
