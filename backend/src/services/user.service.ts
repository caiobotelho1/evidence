import { Prisma } from "../generated/prisma/client.js";
import { conflict, notFound, unauthorized } from "../lib/errors.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { prisma } from "../lib/prisma.js";
import type {CreateUserInput,UpdateUserInput,ChangePasswordInput,} from "../models/user.schema.js";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
};

const profileSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
} as const;

export async function createUser(
  input: CreateUserInput
): Promise<PublicUser> {
  const passwordHash = await hashPassword(input.password);

  try {
    return await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw conflict("E-mail já cadastrado.", {
        email: ["E-mail já cadastrado."],
      });
    }

    throw error;
  }
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: profileSelect,
  });

  if (!user) {
    throw notFound("Usuário não encontrado.");
  }

  return user;
}

export async function updateUserProfile(
  userId: string,
  input: UpdateUserInput
) {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
      },
      select: profileSelect,
    });

    return updatedUser;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        throw conflict("E-mail já cadastrado.", {
          email: ["Este e-mail já está sendo utilizado."],
        });
      }

      if (error.code === "P2025") {
        throw notFound("Usuário não encontrado.");
      }
    }

    throw error;
  }
}

export async function changeUserPassword(
  userId: string,
  input: ChangePasswordInput
) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user) {
    throw notFound("Usuário não encontrado.");
  }

  const validPassword = await verifyPassword(
    user.passwordHash,
    input.currentPassword
  );

  if (!validPassword) {
    throw unauthorized("Senha atual incorreta.");
  }

  const newPasswordHash = await hashPassword(
    input.newPassword
  );

  const result = await prisma.user.updateMany({
    where: {
      id: userId,
      passwordHash: user.passwordHash,
    },
    data: {
      passwordHash: newPasswordHash,
    },
  });

  if (result.count === 0) {
    throw conflict(
      "A senha foi alterada durante esta operação. Tente novamente."
    );
  }

  return {
    message: "Senha alterada com sucesso.",
  };
}
