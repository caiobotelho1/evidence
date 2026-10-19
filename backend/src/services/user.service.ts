import { Prisma } from "../generated/prisma/client.js";
import { conflict } from "../lib/errors.js";
import { hashPassword } from "../lib/password.js";
import { prisma } from "../lib/prisma.js";
import type { CreateUserInput } from "../models/user.schema.js";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
};

export async function createUser(input: CreateUserInput): Promise<PublicUser> {
  const passwordHash = await hashPassword(input.password);

  try {
    return await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        passwordHash,
      },
      select: { id: true, name: true, email: true },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw conflict("E-mail já cadastrado.", { email: ["E-mail já cadastrado."] });
    }
    throw error;
  }
}
