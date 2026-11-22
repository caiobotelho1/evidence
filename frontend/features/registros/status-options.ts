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
