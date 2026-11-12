
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { conflict, forbidden, notFound } from "../lib/errors.js";

import type {
  CreateTagInput,
  UpdateTagInput,
} from "../models/tag.schema.js";

export type TagContext =
  | {
      type: "personal";
      userId: string;
    }
  | {
      type: "company";
      userId: string;
      companyId: string;
    };

// Verifica as permissões para tags empresariais.
async function validateCompanyAccess(
  companyId: string,
  userId: string,
  requireOwner = false
): Promise<void> {
  const membership = await prisma.companyMembership.findUnique({
    where: {
      userId_companyId: {
        userId,
        companyId,
      },
    },
  });

  if (!membership || membership.status !== "ACTIVE") {
    throw forbidden("Acesso à empresa negado.");
  }

  if (requireOwner && membership.role !== "OWNER") {
    throw forbidden(
      "Somente o proprietário pode gerenciar as tags da empresa."
    );
  }
}

// Tags pessoais pertencem ao usuário autenticado.
// Tags empresariais exigem vínculo ativo com a empresa.
async function validateAccess(
  context: TagContext,
  requireOwner = false
): Promise<void> {
  if (context.type === "company") {
    await validateCompanyAccess(
      context.companyId,
      context.userId,
      requireOwner
    );
  }
}

// Define o contexto da tag.
function tagScope(context: TagContext) {
  if (context.type === "personal") {
    return {
      userId: context.userId,
      companyId: null,
    };
  }

  return {
    userId: null,
    companyId: context.companyId,
  };
}

// Trata nomes duplicados.
function handleTagConflict(error: unknown): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw conflict("Já existe uma tag com esse nome.", {
      name: ["Já existe uma tag com esse nome."],
    });
  }

  throw error;
}

// CREATE - Criar tag
export async function createTag(
  context: TagContext,
  input: CreateTagInput
) {
  await validateAccess(context, true);

  try {
    return await prisma.tag.create({
      data: {
        name: input.name,
        description: input.description,
        color: input.color,
        ...tagScope(context),
      },
    });
  } catch (error) {
    return handleTagConflict(error);
  }
}

// READ - Listar tags ativas
export async function listTags(context: TagContext) {
  await validateAccess(context);

  return prisma.tag.findMany({
    where: {
      ...tagScope(context),
      deletedAt: null,
    },
    orderBy: {
      name: "asc",
    },
  });
}

// UPDATE - Editar tag
export async function updateTag(
  context: TagContext,
  tagId: string,
  input: UpdateTagInput
) {
  await validateAccess(context, true);

  try {
    const result = await prisma.tag.updateMany({
      where: {
        id: tagId,
        ...tagScope(context),
        deletedAt: null,
      },
      data: input,
    });

    if (result.count === 0) {
      throw notFound("Tag não encontrada.");
    }

    return await prisma.tag.findUniqueOrThrow({
      where: { id: tagId },
    });
  } catch (error) {
    return handleTagConflict(error);
  }
}

// DELETE - Exclusão lógica
export async function deleteTag(
  context: TagContext,
  tagId: string
): Promise<void> {
  await validateAccess(context, true);

  const result = await prisma.tag.updateMany({
    where: {
      id: tagId,
      ...tagScope(context),
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  if (result.count === 0) {
    throw notFound("Tag não encontrada.");
  }
}
