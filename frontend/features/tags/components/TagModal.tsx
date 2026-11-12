"use client";

import { useEffect, useId, useState } from "react";

import TagColorPicker from "./TagColorPicker";
import styles from "./TagModal.module.css";

import type {
  CreateTagInput,
  TagCompanyOption,
  TagScope,
} from "../types";

type TagModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (
    data: CreateTagInput,
    scope: TagScope,
    companyId?: string
  ) => void;
  companies?: TagCompanyOption[];
};

const DEFAULT_COLOR = "#476844";

export default function TagModal({
  isOpen,
  onClose,
  onSubmit,
  companies = [],
}: TagModalProps) {
  const titleId = useId();

  const [scope, setScope] = useState<TagScope>("personal");
  const [companyId, setCompanyId] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);

  const [error, setError] = useState("");

  const availableCompanies = companies;

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  function resetForm() {
    setScope("personal");
    setCompanyId("");
    setName("");
    setDescription("");
    setColor(DEFAULT_COLOR);
    setError("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleScopeChange(value: TagScope) {
    setScope(value);
    setCompanyId("");
    setError("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      setError("Selecione uma empresa.");
      return;
    }

    const data: CreateTagInput = {
      name: trimmedName,
      description: trimmedDescription || undefined,
      color,
    };

    onSubmit?.(
      data,
      scope,
      scope === "company" ? companyId : undefined
    );

    if (onSubmit) {
      handleClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            Nova tag
          </h2>

          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Fechar modal"
          >
            ×
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <fieldset className={styles.scopeFieldset}>
            <legend className={styles.fieldLabel}>
              Onde deseja utilizar esta tag?
            </legend>

            <label className={styles.radioOption}>
              <input
                type="radio"
                name="tagScope"
                value="personal"
                checked={scope === "personal"}
                onChange={() => handleScopeChange("personal")}
              />
              <span>Uso pessoal</span>
            </label>

            <label className={styles.radioOption}>
              <input
                type="radio"
                name="tagScope"
                value="company"
                checked={scope === "company"}
                onChange={() => handleScopeChange("company")}
              />
              <span>Empresa</span>
            </label>
          </fieldset>

          {scope === "company" && (
            <div className={styles.field}>
              <label
                htmlFor="tag-company"
                className={styles.fieldLabel}
              >
                Empresa
              </label>

              <select
                id="tag-company"
                className={styles.input}
                value={companyId}
                onChange={(event) =>
                  setCompanyId(event.target.value)
                }
                required
              >
                <option value="">Selecione uma empresa</option>

                {availableCompanies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>

            </div>
          )}

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
              onChange={(event) => setName(event.target.value)}
              placeholder="Manutenção"
              maxLength={100}
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
            />
          </div>

          <TagColorPicker
            value={color}
            onChange={setColor}
          />

          {error && (
            <p className={styles.errorMessage} role="alert">
              {error}
            </p>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={styles.submitButton}
            >
              Criar tag
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}