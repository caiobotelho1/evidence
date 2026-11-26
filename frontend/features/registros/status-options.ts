import type { ActivityRecordStatus } from "@/services/activity-record.service";

export type RegistroStatus = ActivityRecordStatus;

export const REGISTRO_STATUS_OPTIONS: {
  value: RegistroStatus;
  label: string;
  color: string;
}[] = [
  { value: "PENDING", label: "Pendente", color: "#D9A441" },
  { value: "IN_PROGRESS", label: "Em andamento", color: "#004F93" },
  { value: "COMPLETED", label: "Concluído", color: "#5E944E" },
  { value: "CANCELED", label: "Cancelado", color: "#900B09" },
];

export function canAttachToStatus(status: RegistroStatus): boolean {
  return status === "PENDING" || status === "IN_PROGRESS";
}

export const MANUAL_STATUS_OPTIONS = REGISTRO_STATUS_OPTIONS.filter(
  (option) => option.value !== "COMPLETED",
);

export const COMPLETED_STATUS_OPTION = REGISTRO_STATUS_OPTIONS.find(
  (option) => option.value === "COMPLETED",
)!;
