"use client";

import { useEffect, useRef } from "react";
import type { ActivityRecordFilterCriteria } from "../filters/record-filters";
import type { ActivityRecordStatus } from "@/services/activity-record.service";
import styles from "./RecordFilters.module.css";

const STATUS_OPTIONS: { value: ActivityRecordStatus; label: string }[] = [
  { value: "PENDING", label: "Pendente" },
  { value: "IN_PROGRESS", label: "Em andamento" },
  { value: "COMPLETED", label: "Concluído" },
  { value: "CANCELED", label: "Cancelado" },
];

export interface RecordFilterTag {
  id: string;
  nome: string;
  cor: string;
}

export interface RecordFilterEmployee {
  id: string;
  name: string;
}

interface RecordFiltersProps {
  tags: RecordFilterTag[];
  tagsLoading: boolean;
  tagsError: string;
  employees: RecordFilterEmployee[];
  employeesLoading: boolean;
  employeesError: string;
  showEmployeeFilter: boolean;
  criteria: ActivityRecordFilterCriteria;
  onChange: (criteria: ActivityRecordFilterCriteria) => void;
}

export default function RecordFilters({
  tags,
  tagsLoading,
  tagsError,
  employees,
  employeesLoading,
  employeesError,
  showEmployeeFilter,
  criteria,
  onChange,
}: RecordFiltersProps) {
  const dropdownRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function closeOnOutsidePointer(event: PointerEvent) {
      const target = event.target;
      if (
        target instanceof Node &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        dropdownRef.current.open = false;
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, []);

  const activeFilterCount =
    Number(criteria.tagIds.length > 0) +
    Number(criteria.statuses.length > 0) +
    Number(Boolean(criteria.dateFrom || criteria.dateTo)) +
    Number(criteria.employeeIds.length > 0);
  const invalidDateRange =
    Boolean(criteria.dateFrom && criteria.dateTo) &&
    criteria.dateFrom > criteria.dateTo;

  function toggleValue(key: "tagIds" | "employeeIds", value: string) {
    const selected = criteria[key];
    const next = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];

    onChange({ ...criteria, [key]: next });
  }

  function toggleStatus(value: ActivityRecordStatus) {
    const statuses = criteria.statuses.includes(value)
      ? criteria.statuses.filter((status) => status !== value)
      : [...criteria.statuses, value];

    onChange({ ...criteria, statuses });
  }

  return (
    <details ref={dropdownRef} className={styles.dropdown}>
      <summary className={styles.trigger}>
        <span>Filtros</span>
        {activeFilterCount > 0 && (
          <span className={styles.count} aria-label={`${activeFilterCount} grupos de filtros ativos`}>
            {activeFilterCount}
          </span>
        )}
        <svg
          className={styles.chevron}
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

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Filtrar registros</h2>
          {activeFilterCount > 0 && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={() => onChange({
                tagIds: [],
                statuses: [],
                dateFrom: "",
                dateTo: "",
                employeeIds: [],
              })}
            >
              Limpar filtros
            </button>
          )}
        </div>

        <fieldset className={styles.group}>
          <legend>Tags</legend>
          {tagsError ? (
            <p className={styles.error} role="alert">{tagsError}</p>
          ) : tagsLoading ? (
            <p className={styles.empty} role="status">Carregando tags…</p>
          ) : tags.length > 0 ? (
            <div className={styles.options}>
              {tags.map((tag) => (
                <label key={tag.id} className={styles.option}>
                  <input
                    type="checkbox"
                    checked={criteria.tagIds.includes(tag.id)}
                    onChange={() => toggleValue("tagIds", tag.id)}
                  />
                  <span
                    className={styles.tagColor}
                    style={{ backgroundColor: tag.cor }}
                    aria-hidden="true"
                  />
                  <span>{tag.nome}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>Nenhuma tag disponível.</p>
          )}
        </fieldset>

        <fieldset className={styles.group}>
          <legend>Status</legend>
          <div className={styles.options}>
            {STATUS_OPTIONS.map((status) => (
              <label key={status.value} className={styles.option}>
                <input
                  type="checkbox"
                  checked={criteria.statuses.includes(status.value)}
                  onChange={() => toggleStatus(status.value)}
                />
                <span>{status.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend>Período de criação</legend>
          <div className={styles.dateFields}>
            <label>
              <span>De</span>
              <input
                type="date"
                value={criteria.dateFrom}
                max={criteria.dateTo || undefined}
                onChange={(event) => onChange({ ...criteria, dateFrom: event.target.value })}
              />
            </label>
            <label>
              <span>Até</span>
              <input
                type="date"
                value={criteria.dateTo}
                min={criteria.dateFrom || undefined}
                onChange={(event) => onChange({ ...criteria, dateTo: event.target.value })}
              />
            </label>
          </div>
          {invalidDateRange && (
            <p className={styles.error} role="alert">
              A data inicial deve ser anterior ou igual à data final.
            </p>
          )}
        </fieldset>

        {showEmployeeFilter && (
          <fieldset className={styles.group}>
            <legend>Funcionários</legend>
            {employeesLoading ? (
              <p className={styles.empty} role="status">Carregando funcionários…</p>
            ) : employeesError ? (
              <p className={styles.error} role="alert">{employeesError}</p>
            ) : employees.length > 0 ? (
              <div className={styles.options}>
                {employees.map((employee) => (
                  <label key={employee.id} className={styles.option}>
                    <input
                      type="checkbox"
                      checked={criteria.employeeIds.includes(employee.id)}
                      onChange={() => toggleValue("employeeIds", employee.id)}
                    />
                    <span>{employee.name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className={styles.empty}>Nenhum funcionário ativo.</p>
            )}
          </fieldset>
        )}
      </div>
    </details>
  );
}
