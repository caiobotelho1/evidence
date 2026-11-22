import type { ActivityRecordStatus } from "@/services/activity-record.service";

export interface ActivityRecordFilterCriteria {
  tagIds: string[];
  statuses: ActivityRecordStatus[];
  dateFrom: string;
  dateTo: string;
  employeeIds: string[];
}
