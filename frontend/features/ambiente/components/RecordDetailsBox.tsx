"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuthUser } from "@/features/auth/components/AuthGate";
import {
  getCompanyRecordById,
  getPersonalRecordById,
  updateCompanyRecord,
  updatePersonalRecord,
  type ActivityRecord,
  type ActivityRecordStatus,
} from "@/services/activity-record.service";
import {
  getCompanyTags,
  getPersonalTags,
  type Tag,
} from "@/services/tag.service";
import { REGISTRO_STATUS_OPTIONS } from "@/features/registros/status-options";
import styles from "./RecordDetailsBox.module.css";

interface RecordDetailsBoxProps {
  recordId: string;
  isPersonal: boolean;
  companyId?: string;
  onClose: () => void;
  onUpdated?: (record: ActivityRecord) => void;
}

type RecordDraft = {
  title: string;
  description: string;
  status: ActivityRecordStatus;
  tagIds: string[];
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
  onUpdated,
}: RecordDetailsBoxProps) {
  const user = useAuthUser();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const statusDropdownRef = useRef<HTMLDetailsElement>(null);
  const [record, setRecord] = useState<ActivityRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<RecordDraft | null>(null);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [tagsError, setTagsError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const membership = user.memberships.find(
    (item) =>
      item.companyId === companyId && item.status === "ACTIVE",
  );
  const canEditRecord = Boolean(
    record &&
      (isPersonal
        ? user.personalPermissions.includes("record:write") &&
          record.author.id === user.id
        : membership?.permissions.includes("record:write") &&
          (membership.role === "OWNER" || record.author.id === user.id)),
  );
  const selectedStatus = REGISTRO_STATUS_OPTIONS.find(
    (option) => option.value === draft?.status,
  ) ?? REGISTRO_STATUS_OPTIONS[0];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  useEffect(() => {
    function closeStatusDropdownOnOutsidePointer(event: PointerEvent) {
      const target = event.target;
      const dropdown = statusDropdownRef.current;

      if (
        target instanceof Node &&
        dropdown &&
        !dropdown.contains(target)
      ) {
        dropdown.open = false;
      }
    }

    document.addEventListener("pointerdown", closeStatusDropdownOnOutsidePointer);
    return () =>
      document.removeEventListener("pointerdown", closeStatusDropdownOnOutsidePointer);
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

  useEffect(() => {
    if (!isEditing) return;

    let active = true;

    async function loadTags() {
      setTagsLoading(true);
      setTagsError("");

      try {
        if (isPersonal) {
          const result = await getPersonalTags();
          if (active) setAvailableTags(result);
          return;
        }

        if (!companyId) {
          throw new Error("Selecione uma empresa para carregar as tags.");
        }

        const result = await getCompanyTags(companyId);
        if (active) setAvailableTags(result);
      } catch (loadError) {
        if (active) {
          setTagsError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar as tags.",
          );
        }
      } finally {
        if (active) setTagsLoading(false);
      }
    }

    void loadTags();

    return () => {
      active = false;
    };
  }, [companyId, isEditing, isPersonal]);

  function startEditing() {
    if (!record || !canEditRecord) return;

    setDraft({
      title: record.title,
      description: record.description,
      status: record.status,
      tagIds: record.tags.map((tag) => tag.id),
    });
    setSaveError("");
    setIsEditing(true);
  }

  function cancelEditing() {
    if (isSaving) return;
    setIsEditing(false);
    setDraft(null);
    setSaveError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!record || !draft || isSaving) return;

    const title = draft.title.trim();
    const description = draft.description.trim();

    if (!title) {
      setSaveError("Informe o título do registro.");
      return;
    }

    if (!description) {
      setSaveError("Informe a descrição da atividade.");
      return;
    }

    setSaveError("");
    setIsSaving(true);

    try {
      const payload = {
        title,
        description,
        status: draft.status,
        tagIds: draft.tagIds,
      };
      const updatedRecord = isPersonal
        ? await updatePersonalRecord(record.id, payload)
        : companyId
          ? await updateCompanyRecord(companyId, record.id, payload)
          : (() => {
              throw new Error("Selecione uma empresa para editar o registro.");
            })();

      setRecord(updatedRecord);
      setIsEditing(false);
      setDraft(null);
      onUpdated?.(updatedRecord);
    } catch (updateError) {
      setSaveError(
        updateError instanceof Error
          ? updateError.message
          : "Não foi possível salvar as alterações.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const wasUpdated = Boolean(
    record &&
      new Date(record.updatedAt).getTime() >
        new Date(record.createdAt).getTime(),
  );

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="record-details-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSaving) {
          dialogRef.current?.close();
        }
      }}
    >
      <div className={styles.header}>
        <h2 id="record-details-title">
          {isEditing ? "Editar registro" : "Detalhes do registro"}
        </h2>
        <button
          type="button"
          className={styles.close}
          onClick={() => dialogRef.current?.close()}
          disabled={isSaving}
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
      ) : record && isEditing && draft ? (
        <form className={styles.content} onSubmit={handleSubmit}>
          <div className={styles.editField}>
            <label htmlFor="record-edit-title">Título</label>
            <input
              id="record-edit-title"
              className={styles.editInput}
              value={draft.title}
              onChange={(event) =>
                setDraft({ ...draft, title: event.target.value })
              }
              maxLength={150}
              required
              disabled={isSaving}
            />
          </div>

          <div className={styles.editField}>
            <label htmlFor="record-edit-description">Descrição</label>
            <textarea
              id="record-edit-description"
              className={styles.editTextarea}
              value={draft.description}
              onChange={(event) =>
                setDraft({ ...draft, description: event.target.value })
              }
              maxLength={20000}
              rows={5}
              required
              disabled={isSaving}
            />
          </div>

          <div className={styles.editField}>
            <label htmlFor="record-edit-status">Status</label>
            <details
              ref={statusDropdownRef}
              className={styles.editStatusDropdown}
            >
              <summary className={styles.editStatusTrigger}>
                <span className={styles.editStatusValue}>
                  <span
                    className={styles.editStatusDot}
                    style={{ backgroundColor: selectedStatus.color }}
                  />
                  {selectedStatus.label}
                </span>
                <svg
                  className={styles.editStatusChevron}
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path
                    d="m4 6 4 4 4-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>
              <div className={styles.editStatusOptions} role="group" aria-label="Opções de status">
                {REGISTRO_STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`${styles.editStatusOption} ${
                      draft.status === option.value ? styles.editStatusOptionSelected : ""
                    }`}
                    onClick={() => {
                      setDraft((current) =>
                        current ? { ...current, status: option.value } : current,
                      );
                      statusDropdownRef.current?.removeAttribute("open");
                    }}
                    disabled={isSaving}
                    aria-pressed={draft.status === option.value}
                  >
                    <span
                      className={styles.editStatusDot}
                      style={{ backgroundColor: option.color }}
                    />
                    {option.label}
                  </button>
                ))}
              </div>
            </details>
          </div>

          <fieldset className={styles.editFieldset}>
            <legend>Tags</legend>
            {tagsLoading ? (
              <p className={styles.tagHint} role="status">Carregando tags…</p>
            ) : tagsError ? (
              <p className={styles.errorMessage} role="alert">{tagsError}</p>
            ) : availableTags.length === 0 ? (
              <p className={styles.tagHint}>Nenhuma tag cadastrada.</p>
            ) : (
              <div className={styles.editTags}>
                {availableTags.map((tag) => (
                  <label className={styles.editTag} key={tag.id}>
                    <input
                      type="checkbox"
                      checked={draft.tagIds.includes(tag.id)}
                      disabled={isSaving}
                      onChange={() =>
                        setDraft((current) => {
                          if (!current) return current;
                          const selected = current.tagIds.includes(tag.id);
                          return {
                            ...current,
                            tagIds: selected
                              ? current.tagIds.filter((id) => id !== tag.id)
                              : [...current.tagIds, tag.id],
                          };
                        })
                      }
                    />
                    <span
                      className={styles.tagColor}
                      style={{ backgroundColor: tag.color }}
                      aria-hidden="true"
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            )}
          </fieldset>

          {saveError && (
            <p role="alert" className={styles.errorMessage}>{saveError}</p>
          )}

          <div className={styles.editActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={cancelEditing}
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isSaving}
            >
              {isSaving ? "Salvando…" : "Salvar alterações"}
            </button>
          </div>
        </form>
      ) : record ? (
        <article className={`${styles.content} ${styles.viewContent}`}>
          <div className={styles.titleRow}>
            <h3>{record.title}</h3>
            <span
              className={styles.recordStatus}
              data-status={record.status}
            >
              {REGISTRO_STATUS_OPTIONS.find((option) => option.value === record.status)?.label}
            </span>
          </div>

          <p className={styles.metadata}>
            Por {record.author.name} · {formatDateTime(record.createdAt)}
            {wasUpdated && (
              <span className={styles.updatedAt}>
                <br />Editado em {formatDateTime(record.updatedAt)}
              </span>
            )}
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

          {canEditRecord && (
            <div className={styles.viewActions}>
              <button
                type="button"
                className={styles.saveButton}
                onClick={startEditing}
              >
                Editar registro
              </button>
            </div>
          )}
        </article>
      ) : null}
    </dialog>
  );
}
