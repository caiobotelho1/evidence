import { Prisma } from "../generated/prisma/client.js";
import { conflict, notFound } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";

const memberSelect = {
  id: true,
  role: true,
  status: true,
  jobTitle: true,
  createdAt: true,
  decidedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
} satisfies Prisma.CompanyMembershipSelect;

export async function listCompanyMembers(companyId: string) {
  const members = await prisma.companyMembership.findMany({
    where: {
      companyId,
      role: "EMPLOYEE",
      status: "ACTIVE",
    },
    select: memberSelect,
    orderBy: {
      createdAt: "asc",
    },
  });

  return { members };
}

export async function getCompanyMember(
  companyId: string,
  membershipId: string
) {
  const member = await prisma.companyMembership.findFirst({
    where: {
      id: membershipId,
      companyId,
      role: "EMPLOYEE",
      status: "ACTIVE",
    },
    select: memberSelect,
  });

  if (!member) {
    throw notFound("Funcionário não encontrado.");
  }

  return { member };
}

export async function removeCompanyMember(
  companyId: string,
  membershipId: string
) {
  const result = await prisma.companyMembership.updateMany({
    where: {
      id: membershipId,
      companyId,
      role: "EMPLOYEE",
      status: "ACTIVE",
    },
    data: {
      status: "INACTIVE",
    },
  });

  if (result.count === 0) {
    throw conflict("Funcionário não encontrado ou vínculo já inativo.");
  }

  return { message: "Funcionário removido com sucesso." };
}
