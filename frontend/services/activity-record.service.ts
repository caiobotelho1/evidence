import { apiFetch, describeApiError } from "./api";

export type ActivityRecordStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELED";

export type ActivityRecordAttachment = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
};

export type ActivityRecord = {
  id: string;
  title: string;
  description: string;
  status: ActivityRecordStatus;
  createdAt: string;
  updatedAt: string;
  companyId: string | null;
  author: { id: string; name: string };
  attachments: ActivityRecordAttachment[];
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

export type UpdateActivityRecordPayload = Partial<CreateActivityRecordPayload>;

type ActivityRecordPage = {
  items: ActivityRecord[];
  nextCursor: string | null;
};

export type ActivityRecordListFilters = {
  search: string;
  tagIds: string[];
  statuses: ActivityRecordStatus[];
  dateFrom: string;
  dateTo: string;
  employeeIds: string[];
};

const PAGE_SIZE = 100;
const MAX_PAGES = 20;

async function createRecord(
  path: string,
  payload: CreateActivityRecordPayload,
  files: File[],
): Promise<ActivityRecord> {
  try {
    if (files.length === 0) {
      return await apiFetch<ActivityRecord>(path, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }

    const body = new FormData();
    body.append("payload", JSON.stringify(payload));
    files.forEach((file) => body.append("files", file, file.name));

    return await apiFetch<ActivityRecord>(path, { method: "POST", body });
  } catch (error) {
    throw new Error(describeApiError(error, "Não foi possível criar o registro."));
  }
}

function toLocalDayBoundary(value: string, endOfDay: boolean): string | undefined {
  if (!value) return undefined;

  const [year, month, day] = value.split("-").map(Number);
  const date = endOfDay
    ? new Date(year!, month! - 1, day!, 23, 59, 59, 999)
    : new Date(year!, month! - 1, day!, 0, 0, 0, 0);

  return date.toISOString();
}

async function listAllRecords(
  path: string,
  filters: ActivityRecordListFilters,
): Promise<ActivityRecord[]> {
  const records: ActivityRecord[] = [];
  let cursor: string | null = null;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const query = new URLSearchParams({ limit: String(PAGE_SIZE) });

    if (filters.search.trim()) query.set("search", filters.search.trim());
    filters.tagIds.forEach((tagId) => query.append("tagIds", tagId));
    filters.statuses.forEach((status) => query.append("statuses", status));
    filters.employeeIds.forEach((employeeId) =>
      query.append("employeeIds", employeeId),
    );

    const dateFrom = toLocalDayBoundary(filters.dateFrom, false);
    const dateTo = toLocalDayBoundary(filters.dateTo, true);
    if (dateFrom) query.set("dateFrom", dateFrom);
    if (dateTo) query.set("dateTo", dateTo);

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
  payload: CreateActivityRecordPayload,
  files: File[] = [],
): Promise<ActivityRecord> {
  return createRecord("/api/records", payload, files);
}

export async function createCompanyRecord(
  companyId: string,
  payload: CreateActivityRecordPayload,
  files: File[] = [],
): Promise<ActivityRecord> {
  return createRecord(
    `/api/companies/${encodeURIComponent(companyId)}/records`,
    payload,
    files,
  );
}

export async function getPersonalRecords(
  filters: ActivityRecordListFilters,
): Promise<ActivityRecord[]> {
  return listAllRecords("/api/records", filters);
}

export async function getCompanyRecords(
  companyId: string,
  filters: ActivityRecordListFilters,
): Promise<ActivityRecord[]> {
  return listAllRecords(
    `/api/companies/${encodeURIComponent(companyId)}/records`,
    filters,
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

export async function updatePersonalRecord(
  recordId: string,
  payload: UpdateActivityRecordPayload,
): Promise<ActivityRecord> {
  return apiFetch<ActivityRecord>(`/api/records/${encodeURIComponent(recordId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function updateCompanyRecord(
  companyId: string,
  recordId: string,
  payload: UpdateActivityRecordPayload,
): Promise<ActivityRecord> {
  return apiFetch<ActivityRecord>(
    `/api/companies/${encodeURIComponent(companyId)}/records/${encodeURIComponent(recordId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}
