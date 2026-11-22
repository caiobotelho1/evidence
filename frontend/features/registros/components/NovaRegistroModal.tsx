"use client";

import { useCallback, useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import styles from "./NovaRegistroModal.module.css";
import type { Tag } from "@/services/tag.service";
import { REGISTRO_STATUS_OPTIONS, type RegistroStatus } from "../status-options";

export type CreateRegistroDraft = {
  title: string;
  description: string;
  status: RegistroStatus;
  tagIds: string[];
  files: File[];
};

type NovaRegistroModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRegistroDraft) => Promise<void>;
  tags: Tag[];
  tagsLoading?: boolean;
  tagsError?: string;
};

function getTagBackgroundColor(color: string): string {
  const normalizedColor = color.replace("#", "");

  if (!/^[0-9a-fA-F]{6}$/.test(normalizedColor)) {
    return "rgba(156, 174, 143, 0.14)";
  }

  const red = parseInt(normalizedColor.slice(0, 2), 16);
  const green = parseInt(normalizedColor.slice(2, 4), 16);
  const blue = parseInt(normalizedColor.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, 0.14)`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;

  const units = ["KB", "MB", "GB", "TB"];
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
  }).format(size)} ${units[unitIndex]}`;
}

export default function NovaRegistroModal({
  isOpen,
  onClose,
  onSubmit,
  tags,
  tagsLoading = false,
  tagsError = "",
}: NovaRegistroModalProps) {
  const titleId = useId();
  const attachmentInputId = useId();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<RegistroStatus>("PENDING");

  const statusDropdownRef = useRef<HTMLDetailsElement>(null);
  const tagsDropdownRef = useRef<HTMLDetailsElement>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const selectedTags = tags.filter((tag) =>
    selectedTagIds.includes(tag.id)
  );

  const selectedStatus =
    REGISTRO_STATUS_OPTIONS.find((option) => option.value === status) ??
    REGISTRO_STATUS_OPTIONS[0];

  const handleClose = useCallback(() => {
    if (isSubmitting) return;

    setTitle("");
    setDescription("");
    setStatus("PENDING");
    setSelectedTagIds([]);
    setSelectedFiles([]);
    setError("");
    onClose();
  }, [isSubmitting, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    function closeSelectorsOnOutsidePointer(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(target)
      ) {
        statusDropdownRef.current.open = false;
      }

      if (
        tagsDropdownRef.current &&
        !tagsDropdownRef.current.contains(target)
      ) {
        tagsDropdownRef.current.open = false;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", closeSelectorsOnOutsidePointer);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", closeSelectorsOnOutsidePointer);
    };
  }, [isOpen, handleClose]);

  function handleFileSelection(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);

    if (files.length === 0) return;

    setSelectedFiles((previousFiles) => {
      const nextFiles = [...previousFiles];

      for (const file of files) {
        const alreadySelected = nextFiles.some(
          (selectedFile) =>
            selectedFile.name === file.name &&
            selectedFile.size === file.size &&
            selectedFile.lastModified === file.lastModified
        );

        if (!alreadySelected) {
          nextFiles.push(file);
        }
      }

      return nextFiles;
    });

    // Permite selecionar novamente o mesmo arquivo depois de removê-lo.
    input.value = "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      setError("Informe o título do registro.");
      return;
    }

    if (!trimmedDescription) {
      setError("Informe a descrição da atividade.");
      return;
    }

    if (trimmedTitle.length > 150) {
      setError("O título deve ter no máximo 150 caracteres.");
      return;
    }

    setError("");

    try {
      setIsSubmitting(true);

      await onSubmit({
        title: trimmedTitle,
        description: trimmedDescription,
        status,
        tagIds: selectedTagIds,
        files: selectedFiles,
      });

      setTitle("");
      setDescription("");
      setStatus("PENDING");
      setSelectedTagIds([]);
      setSelectedFiles([]);
      setError("");
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível criar o registro."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !isSubmitting
        ) {
          handleClose();
        }
      }}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={isSubmitting}
      >
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            Novo registro
          </h2>

          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Fechar modal"
          >
            ×
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="registro-title" className={styles.fieldLabel}>
              Título *
            </label>

            <input
              id="registro-title"
              type="text"
              className={styles.input}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex.: Reunião com a equipe"
              maxLength={150}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className={styles.field}>
            <label
              htmlFor="registro-description"
              className={styles.fieldLabel}
            >
              Descrição *
            </label>

            <textarea
              id="registro-description"
              className={styles.textarea}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Descreva a atividade realizada..."
              rows={4}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className={styles.metadataFields}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                Status
              </label>

              <details
                ref={statusDropdownRef}
                className={styles.statusDropdown}
              >
                <summary className={styles.statusTrigger}>
                  <span className={styles.statusValue}>
                    <span
                      className={styles.statusDot}
                      style={{ backgroundColor: selectedStatus.color }}
                    />
                    {selectedStatus.label}
                  </span>

                  <svg
                    className={styles.statusChevron}
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

                <div className={styles.statusOptions} role="group" aria-label="Opções de status">
                  {REGISTRO_STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`${styles.statusOption} ${
                        status === option.value ? styles.statusOptionSelected : ""
                      }`}
                      onClick={() => {
                        setStatus(option.value);
                        statusDropdownRef.current?.removeAttribute("open");
                      }}
                      aria-pressed={status === option.value}
                    >
                      <span
                        className={styles.statusDot}
                        style={{ backgroundColor: option.color }}
                      />
                      {option.label}
                    </button>
                  ))}
                </div>
              </details>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>
                Tags
              </label>

              <div className={styles.tagSelector}>
                <div className={styles.tagSelectedArea}>
                  {selectedTags.map((tag) => (
                    <span
                      key={tag.id}
                      className={styles.tagChip}
                      style={{
                        backgroundColor: getTagBackgroundColor(tag.color),
                      }}
                    >
                      <span>{tag.name}</span>

                      <button
                        type="button"
                        className={styles.removeTagButton}
                        onClick={() =>
                          setSelectedTagIds((previous) =>
                            previous.filter((id) => id !== tag.id)
                          )
                        }
                        disabled={isSubmitting}
                        aria-label={`Remover tag ${tag.name}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  {selectedTags.length === 0 && (
                    <span className={styles.tagPlaceholder}>
                      Selecionar tags...
                    </span>
                  )}

                  <details
                    ref={tagsDropdownRef}
                    className={styles.tagsDropdown}
                  >
                    <summary
                      className={styles.tagsTrigger}
                      aria-label="Abrir opções de tags"
                    >
                      <svg
                        className={styles.tagsChevron}
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

                    <div className={styles.tagsOptions}>
                      {tagsLoading ? (
                        <p className={styles.tagsMessage}>
                          Carregando tags...
                        </p>
                      ) : tagsError ? (
                        <p className={styles.tagsError}>
                          {tagsError}
                        </p>
                      ) : tags.length === 0 ? (
                        <p className={styles.tagsMessage}>
                          Nenhuma tag cadastrada.
                        </p>
                      ) : (
                        tags.map((tag) => {
                          const isSelected = selectedTagIds.includes(tag.id);

                          return (
                            <button
                              key={tag.id}
                              type="button"
                              className={`${styles.tagOption} ${
                                isSelected ? styles.tagOptionSelected : ""
                              }`}
                              onClick={() =>
                                setSelectedTagIds((previous) =>
                                  isSelected
                                    ? previous.filter((id) => id !== tag.id)
                                    : [...previous, tag.id]
                                )
                              }
                              aria-pressed={isSelected}
                            >
                              <span
                                className={styles.tagOptionColor}
                                style={{ backgroundColor: tag.color }}
                              />
                              <span>{tag.name}</span>
                              <span className={styles.tagCheck}>
                                {isSelected ? "✓" : ""}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>

          <section
            className={styles.attachmentsSection}
            aria-labelledby={`${attachmentInputId}-title`}
          >
            <h3
              id={`${attachmentInputId}-title`}
              className={styles.fieldLabel}
            >
              Anexos
            </h3>

            <div className={styles.attachmentArea}>
              <svg
                className={styles.attachmentIcon}
                viewBox="0 0 32 32"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M18.7 5.3H9.3C8 5.3 6.9 6.4 6.9 7.7V24.3C6.9 25.6 8 26.7 9.3 26.7H22.7C24 26.7 25.1 25.6 25.1 24.3V11.7L18.7 5.3Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M18.7 5.3V11.7H25.1M12 17.3H20M12 21.3H20"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <p className={styles.attachmentTitle}>
                Arquivos e documentos
              </p>

              <p className={styles.attachmentDescription}>
                Selecione um ou mais arquivos para acompanhar este registro.
              </p>

              <input
                id={attachmentInputId}
                className={styles.fileInput}
                type="file"
                multiple
                disabled={isSubmitting}
                onChange={handleFileSelection}
                aria-label="Selecionar arquivos para o registro"
              />

              <label
                htmlFor={attachmentInputId}
                className={`${styles.attachmentPicker} ${
                  isSubmitting ? styles.attachmentPickerDisabled : ""
                }`}
              >
                Selecionar arquivos
              </label>
            </div>

            {selectedFiles.length > 0 && (
              <ul
                className={styles.selectedFilesList}
                aria-label="Arquivos selecionados"
              >
                {selectedFiles.map((file, index) => (
                  <li
                    key={`${file.name}-${file.lastModified}-${file.size}`}
                    className={styles.selectedFileItem}
                  >
                    <div className={styles.selectedFileInfo}>
                      <span
                        className={styles.selectedFileName}
                        title={file.name}
                      >
                        {file.name}
                      </span>

                      <span className={styles.selectedFileSize}>
                        {formatFileSize(file.size)}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={styles.removeFileButton}
                      onClick={() =>
                        setSelectedFiles((previousFiles) =>
                          previousFiles.filter(
                            (_, fileIndex) => fileIndex !== index
                          )
                        )
                      }
                      disabled={isSubmitting}
                      aria-label={`Remover arquivo ${file.name}`}
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {error && (
            <p className={styles.errorMessage} role="alert">
              {error}
            </p>
          )}

          <footer className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Criando..." : "Criar registro"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
