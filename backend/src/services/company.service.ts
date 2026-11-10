
import { Prisma } from "../generated/prisma/client.js";
import { conflict } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import type { CreateCompanyInput } from "../models/company.schema.js";

export type PublicCompany = {
  id: string;
  legalName: string;
  tradeName: string | null;
  cnpj: string;
  businessEmail: string | null;
  businessPhone: string | null;
};

export async function createCompany(
  input: CreateCompanyInput,
  userId: string
): Promise<PublicCompany> {
  try {
    return await prisma.company.create({
      data: {
        legalName: input.legalName,
        tradeName: input.tradeName,
        cnpj: input.cnpj,
        businessEmail: input.businessEmail,
        businessPhone: input.businessPhone,

        memberships: {
          create: {
            userId,
            role: "OWNER",
            status: "ACTIVE",
          },
        },
      },
      select: {
        id: true,
        legalName: true,
        tradeName: true,
        cnpj: true,
        businessEmail: true,
        businessPhone: true,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw conflict("CNPJ já cadastrado.", {
        cnpj: ["CNPJ já cadastrado."],
      });
    }

    throw error;
  }
}
