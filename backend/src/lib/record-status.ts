import type { ActivityRecordStatus } from "../generated/prisma/enums.js";

export const ATTACHABLE_STATUSES = ["PENDING", "IN_PROGRESS"] as const satisfies readonly ActivityRecordStatus[];

export function canReceiveAttachments(status: ActivityRecordStatus): boolean {
  return (ATTACHABLE_STATUSES as readonly ActivityRecordStatus[]).includes(status);
}

export type RuleResult<T> = { ok: true; value: T } | { ok: false; message: string };

export function resolveCreateStatus(
  requested: ActivityRecordStatus | undefined,
  hasFiles: boolean,
): RuleResult<ActivityRecordStatus> {
  if (hasFiles) {
    if (requested !== undefined && requested !== "COMPLETED") {
      return {
        ok: false,
        message: "Um registro criado com anexo é concluído; não é possível escolher outro status.",
      };
    }

    return { ok: true, value: "COMPLETED" };
  }

  if (requested === "COMPLETED") {
    return {
      ok: false,
      message: "Um registro só pode ser concluído com um anexo.",
    };
  }

  return { ok: true, value: requested ?? "PENDING" };
}

export function checkStatusChange(
  current: ActivityRecordStatus,
  next: ActivityRecordStatus | undefined,
): RuleResult<null> {
  if (next === undefined || next === current) return { ok: true, value: null };

  if (next === "COMPLETED") {
    return {
      ok: false,
      message: "Um registro só é concluído ao receber um anexo.",
    };
  }

  if (current === "COMPLETED") {
    return {
      ok: false,
      message: "Registros concluídos não podem mudar de status.",
    };
  }

  return { ok: true, value: null };
}

export function attachmentRejectionMessage(status: ActivityRecordStatus): string {
  return status === "CANCELED"
    ? "Registros cancelados não aceitam anexos."
    : "Este registro já está concluído e possui anexo.";
}
