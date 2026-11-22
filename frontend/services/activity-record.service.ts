import { ApiError, apiFetch } from "./api";

export type ActivityRecordStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELED";

export type ActivityRecord = {
  id: string;
  title: string;
  description: string;
  status: ActivityRecordStatus;
  createdAt: string;
  companyId: string | null;
  author: { id: string; name: string };
  tags: {
    id: string;
    name: string;
    description: string | null;
    color: string;
  }[];
};

export type CreateActivityRecordPayload = {
  title: string;
  description: string;
  status: ActivityRecordStatus;
  tagIds: string[];
};

type ActivityRecordPage = {
  items: ActivityRecord[];
  nextCursor: string | null;
};

const PAGE_SIZE = 100;
const MAX_PAGES = 20;

function firstFieldMessage(error: ApiError): string {
  const messages = Object.values(error.fields ?? {}).flat();
  return messages[0] ?? error.message;
}

async function createRecord(
  path: string,
  payload: CreateActivityRecordPayload
): Promise<ActivityRecord> {
  try {
    return await apiFetch<ActivityRecord>(path, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (error instanceof ApiError && error.fields) {
      throw new Error(firstFieldMessage(error));
    }

    throw error;
  }
}

async function listAllRecords(path: string): Promise<ActivityRecord[]> {
  const records: ActivityRecord[] = [];
  let cursor: string | null = null;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const query = new URLSearchParams({ limit: String(PAGE_SIZE) });

    if (cursor) {
      query.set("cursor", cursor);
    }

    const result: ActivityRecordPage = await apiFetch<ActivityRecordPage>(
      `${path}?${query.toString()}`
    );

    records.push(...result.items);

    if (!result.nextCursor) break;

    cursor = result.nextCursor;
  }

  return records;
}

export async function createPersonalRecord(
  payload: CreateActivityRecordPayload
): Promise<ActivityRecord> {
  return createRecord("/api/records", payload);
}

export async function createCompanyRecord(
  companyId: string,
  payload: CreateActivityRecordPayload
): Promise<ActivityRecord> {
  return createRecord(
    `/api/companies/${encodeURIComponent(companyId)}/records`,
    payload
  );
}

export async function getPersonalRecords(): Promise<ActivityRecord[]> {
  return listAllRecords("/api/records");
}

export async function getCompanyRecords(
  companyId: string
): Promise<ActivityRecord[]> {
  return listAllRecords(
    `/api/companies/${encodeURIComponent(companyId)}/records`
  );
}

export async function getPersonalRecordById(
  recordId: string,
): Promise<ActivityRecord> {
  return apiFetch<ActivityRecord>(
    `/api/records/${encodeURIComponent(recordId)}`,
  );
}

export async function getCompanyRecordById(
  companyId: string,
  recordId: string,
): Promise<ActivityRecord> {
  return apiFetch<ActivityRecord>(
    `/api/companies/${encodeURIComponent(companyId)}/records/${encodeURIComponent(recordId)}`,
  );
}
