"use client";

import { useEffect, useRef, useState } from "react";
import {
  getCompanyRecordById,
  getPersonalRecordById,
  type ActivityRecord,
} from "@/services/activity-record.service";
import styles from "./RecordDetailsBox.module.css";

interface RecordDetailsBoxProps {
  recordId: string;
  isPersonal: boolean;
  companyId?: string;
  onClose: () => void;
}

const STATUS_LABELS: Record<ActivityRecord["status"], string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluído",
  CANCELED: "Cancelado",
};

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function RecordDetailsBox({
  recordId,
  isPersonal,
  companyId,
  onClose,
}: RecordDetailsBoxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [record, setRecord] = useState<ActivityRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    let active = true;

    async function loadRecord() {
      setLoading(true);
      setError("");

      try {
        if (isPersonal) {
          const result = await getPersonalRecordById(recordId);
          if (active) setRecord(result);
          return;
        }

        if (!companyId) {
          throw new Error("Selecione uma empresa para visualizar o registro.");
        }

        const result = await getCompanyRecordById(companyId, recordId);
        if (active) setRecord(result);
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar o registro.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadRecord();

    return () => {
      active = false;
    };
  }, [companyId, isPersonal, recordId]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="record-details-title"
      onClose={onClose}
    >
      <div className={styles.header}>
        <h2 id="record-details-title">Detalhes do registro</h2>
        <button
          type="button"
          className={styles.close}
          onClick={() => dialogRef.current?.close()}
          aria-label="Fechar detalhes"
        >
          ×
        </button>
      </div>

      {loading ? (
        <p role="status" className={styles.statusMessage}>
          Carregando registro…
        </p>
      ) : error ? (
        <p role="alert" className={styles.errorMessage}>
          {error}
        </p>
      ) : record ? (
        <article className={styles.content}>
          <div className={styles.titleRow}>
            <h3>{record.title}</h3>
            <span className={styles.recordStatus}>
              {STATUS_LABELS[record.status]}
            </span>
          </div>

          <p className={styles.metadata}>
            Por {record.author.name} · {formatDateTime(record.createdAt)}
          </p>

          <section className={styles.section} aria-labelledby="record-description">
            <h4 id="record-description">Descrição</h4>
            <p className={styles.description}>{record.description}</p>
          </section>

          <section className={styles.section} aria-labelledby="record-tags">
            <h4 id="record-tags">Tags</h4>
            {record.tags.length ? (
              <ul className={styles.tags}>
                {record.tags.map((tag) => (
                  <li key={tag.id}>
                    <span
                      className={styles.tagColor}
                      style={{ backgroundColor: tag.color }}
                      aria-hidden="true"
                    />
                    {tag.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyTags}>Sem tags associadas.</p>
            )}
          </section>
        </article>
      ) : null}
    </dialog>
  );
}
