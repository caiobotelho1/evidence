import { Prisma } from "../generated/prisma/client.js";
import { conflict, notFound } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import type { CreateMembershipRequestInput } from "../models/membership.schema.js";

const membershipRequestSelect = {
  id: true,
  role: true,
  status: true,
  jobTitle: true,
  message: true,
  createdAt: true,
  company: {
    select: {
      id: true,
      legalName: true,
      tradeName: true,
      cnpj: true,
    },
  },
} satisfies Prisma.CompanyMembershipSelect;

const membershipReviewSelect = {
  id: true,
  role: true,
  status: true,
  jobTitle: true,
  message: true,
  createdAt: true,
  decidedById: true,
  decidedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
  company: {
    select: {
      id: true,
      legalName: true,
      tradeName: true,
    },
  },
} satisfies Prisma.CompanyMembershipSelect;

export async function createMembershipRequest(
  userId: string,
  companyId: string,
  input: CreateMembershipRequestInput
) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true },
  });

  if (!company) {
    throw notFound("Empresa não encontrada.");
  }

  const existingMembership = await prisma.companyMembership.findUnique({
    where: {
      userId_companyId: {
        userId,
        companyId,
      },
    },
    select: {
      id: true,
      role: true,
      status: true,
    },
  });

  if (existingMembership?.role === "OWNER") {
    throw conflict("Você já é proprietário desta empresa.");
  }

  if (existingMembership?.status === "PENDING") {
    throw conflict("Você já possui uma solicitação pendente para esta empresa.");
  }

  if (existingMembership?.status === "ACTIVE") {
    throw conflict("Você já faz parte desta empresa.");
  }

  try {
    let request;

    if (existingMembership) {
      request = await prisma.companyMembership.update({
        where: { id: existingMembership.id },
        data: {
          role: "EMPLOYEE",
          status: "PENDING",
          jobTitle: input.jobTitle,
          message: input.message ?? null,
          decidedById: null,
          decidedAt: null,
          createdAt: new Date(),
        },
        select: membershipRequestSelect,
      });
    } else {
      request = await prisma.companyMembership.create({
        data: {
          userId,
          companyId,
          role: "EMPLOYEE",
          status: "PENDING",
          jobTitle: input.jobTitle,
          message: input.message ?? null,
        },
        select: membershipRequestSelect,
      });
    }

    return { request };

  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw conflict(
        "Você já possui um vínculo ou solicitação para esta empresa."
      );
    }

    throw error;
  }
}

export async function listPendingMembershipRequests(companyId: string) {
  const requests = await prisma.companyMembership.findMany({
    where: {
      companyId,
      role: "EMPLOYEE",
      status: "PENDING",
    },
    orderBy: {
      createdAt: "asc",
    },
    select: membershipReviewSelect,
  });

  return { requests };
}

export async function decideMembershipRequest(
  companyId: string,
  membershipId: string,
  decidedById: string,
  decision: "ACTIVE" | "REJECTED"
) {
  const request = await prisma.companyMembership.findFirst({
    where: {
      id: membershipId,
      companyId,
      role: "EMPLOYEE",
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!request) {
    throw notFound("Solicitação não encontrada.");
  }

  if (request.status !== "PENDING") {
    throw conflict("Esta solicitação já foi decidida.");
  }

  const result = await prisma.companyMembership.updateMany({
    where: {
      id: membershipId,
      companyId,
      role: "EMPLOYEE",
      status: "PENDING",
    },
    data: {
      status: decision,
      decidedById,
      decidedAt: new Date(),
    },
  });

  if (result.count === 0) {
    throw conflict("Esta solicitação já foi decidida.");
  }

  const updatedRequest = await prisma.companyMembership.findUnique({
    where: { id: membershipId },
    select: membershipReviewSelect,
  });

  if (!updatedRequest) {
    throw notFound("Solicitação não encontrada.");
  }

  return { request: updatedRequest };
}