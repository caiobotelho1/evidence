export type TagScope = "personal" | "company";

export type Tag = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  userId: string | null;
  companyId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type CreateTagInput = {
  name: string;
  description?: string;
  color: string;
};

export type UpdateTagInput = Partial<CreateTagInput>;

export type TagCompanyOption = {
  id: string;
  name: string;
};