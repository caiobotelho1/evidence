"use client";

import { useEffect, useId, useState } from "react";

import TagColorPicker from "./TagColorPicker";
import styles from "./TagModal.module.css";

import type {
  CreateTagInput,
  TagScope,
} from "../types";

type TagModalProps = {
  isOpen: boolean;
  onClose: () => void;
  scope: TagScope;
  companyId?: string;
  companyName?: string;
  onSubmit?: (
    data: CreateTagInput,
    scope: TagScope,
    companyId?: string
  ) => Promise<void>;
};

const DEFAULT_COLOR = "#476844";

export default function TagModal({
  isOpen,
  onClose,
  scope,
  companyId,
  companyName,
  onSubmit,
}: TagModalProps) {
  const titleId = useId();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || isSubmitting) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  function resetForm() {
    setName("");
    setDescription("");
    setColor(DEFAULT_COLOR);
    setError("");
  }

  function handleClose() {
    if (isSubmitting) return;

    resetForm();
    onClose();
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      setError("Informe o nome da tag.");
      return;
    }

    if (trimmedName.length > 100) {
      setError("O nome deve ter no máximo 100 caracteres.");
      return;
    }

    if (trimmedDescription.length > 500) {
      setError("A descrição deve ter no máximo 500 caracteres.");
      return;
    }

    if (scope === "company" && !companyId) {
      setError("Não foi possível identificar a empresa.");
      return;
    }

    if (!onSubmit) {
      setError("O cadastro de tags está indisponível.");
      return;
    }

    const data: CreateTagInput = {
      name: trimmedName,
      description: trimmedDescription || undefined,
      color,
    };

    try {
      setIsSubmitting(true);

      await onSubmit(
        data,
        scope,
        scope === "company" ? companyId : undefined
      );

      resetForm();
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar a tag."
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
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={isSubmitting}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            Nova tag
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
        </div>

        <div className={styles.contextBadge}>
          {scope === "personal"
            ? "Pessoal"
            : `Empresa${companyName ? ` · ${companyName}` : ""}`}
        </div>

        <form
          className={styles.form}
          onSubmit={handleSubmit}
        >
          <div className={styles.field}>
            <label
              htmlFor="tag-name"
              className={styles.fieldLabel}
            >
              Nome da tag *
            </label>

            <input
              id="tag-name"
              type="text"
              className={styles.input}
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Manutenção"
              maxLength={100}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className={styles.field}>
            <label
              htmlFor="tag-description"
              className={styles.fieldLabel}
            >
              Descrição (opcional)
            </label>

            <textarea
              id="tag-description"
              className={styles.textarea}
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Revisões e reparos de equipamentos."
              maxLength={500}
              rows={2}
              disabled={isSubmitting}
            />
          </div>

          <TagColorPicker
            value={color}
            onChange={(value) => {
              if (!isSubmitting) {
                setColor(value);
              }
            }}
          />

          {error && (
            <p
              className={styles.errorMessage}
              role="alert"
            >
              {error}
            </p>
          )}

          <div className={styles.actions}>
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
              {isSubmitting
                ? "Criando..."
                : "Criar tag"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
