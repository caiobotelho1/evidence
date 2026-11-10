import { randomBytes } from "node:crypto";
import { env } from "../config/env.js";
import type { Prisma } from "../generated/prisma/client.js";
import type { MembershipRole, MembershipStatus } from "../generated/prisma/enums.js";
import { unauthorized } from "../lib/errors.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { PERSONAL_PERMISSIONS, permissionsFor, type Permission } from "../lib/permissions.js";
import { prisma } from "../lib/prisma.js";
import { generateSessionToken, hashSessionToken } from "../lib/session-token.js";
import type { LoginInput } from "../models/auth.schema.js";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export const INVALID_CREDENTIALS_MESSAGE = "E-mail ou senha inválidos.";

export type AuthMembership = {
  id: string;
  role: MembershipRole;
  status: MembershipStatus;
  companyId: string;
  company: { id: string; legalName: string; tradeName: string | null };
  permissions: Permission[];
};

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  personalPermissions: Permission[];
  memberships: AuthMembership[];
};

export type AuthContext = {
  sessionId: string;
  user: AuthenticatedUser;
};

const profileSelect = {
  id: true,
  name: true,
  email: true,
  memberships: {
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      role: true,
      status: true,
      company: { select: { id: true, legalName: true, tradeName: true } },
    },
  },
} satisfies Prisma.UserSelect;

type ProfileRow = Prisma.UserGetPayload<{ select: typeof profileSelect }>;

function toAuthenticatedUser(row: ProfileRow): AuthenticatedUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    personalPermissions: [...PERSONAL_PERMISSIONS],
    memberships: row.memberships.map((membership) => ({
      id: membership.id,
      role: membership.role,
      status: membership.status,
      companyId: membership.company.id,
      company: membership.company,
      permissions: permissionsFor(membership.role, membership.status),
    })),
  };
}


let dummyHash: Promise<string> | undefined;
function getDummyHash(): Promise<string> {
  dummyHash ??= hashPassword(randomBytes(16).toString("hex"));
  return dummyHash;
}

export type LoginResult = {
  token: string;
  expiresAt: Date;
  user: AuthenticatedUser;
};

export async function login(
  input: LoginInput,
  options: { previousToken?: string } = {},
): Promise<LoginResult> {
  const account = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, passwordHash: true },
  });

  const passwordMatches = await verifyPassword(
    account?.passwordHash ?? (await getDummyHash()),
    input.password,
  );

  if (!account || !passwordMatches) {
    throw unauthorized(INVALID_CREDENTIALS_MESSAGE);
  }

  const now = new Date();
  const token = generateSessionToken();
  const expiresAt = new Date(now.getTime() + env.SESSION_TTL_DAYS * DAY_IN_MS);

  const staleSessions: Prisma.SessionWhereInput[] = [
    { userId: account.id, expiresAt: { lt: now } },
  ];
  if (options.previousToken) {
    staleSessions.push({ tokenHash: hashSessionToken(options.previousToken) });
  }

  const [, , user] = await prisma.$transaction([
    prisma.session.deleteMany({ where: { OR: staleSessions } }),
    prisma.session.create({
      data: { userId: account.id, tokenHash: hashSessionToken(token), expiresAt },
      select: { id: true },
    }),
    prisma.user.findUniqueOrThrow({ where: { id: account.id }, select: profileSelect }),
  ]);

  return { token, expiresAt, user: toAuthenticatedUser(user) };
}


export async function authenticateSession(token: string): Promise<AuthContext | null> {
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    select: { id: true, expiresAt: true, user: { select: profileSelect } },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.deleteMany({ where: { id: session.id } });
    return null;
  }

  return { sessionId: session.id, user: toAuthenticatedUser(session.user) };
}


export async function logout(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { tokenHash: hashSessionToken(token) } });
}
