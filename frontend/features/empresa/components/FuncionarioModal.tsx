
"use client";

import { useEffect } from "react";
import { DM_Serif_Display, Inter } from "next/font/google";
import styles from "./FuncionarioModal.module.css";

const inter = Inter({ subsets: ["latin"] });
const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

export type Funcionario = {
  id: string;
  nome: string;
  email: string;
  iniciais: string;
  telefone: string;
  dataEntrada: string;
};

type FuncionarioModalProps = {
  funcionario: Funcionario | null;
  nomeEmpresa: string;
  onClose: () => void;
  onRemove: (funcionario: Funcionario) => void;
};

function formatarTempo(dataEntrada: string): string {
  const inicio = new Date(`${dataEntrada}T12:00:00`);
  const hoje = new Date();

  let anos = hoje.getFullYear() - inicio.getFullYear();
  let meses = hoje.getMonth() - inicio.getMonth();

  if (hoje.getDate() < inicio.getDate()) meses--;

  if (meses < 0) {
    anos--;
    meses += 12;
  }

  if (anos < 0) return "Data futura";

  const partes = [];
  if (anos > 0) partes.push(`${anos} ${anos === 1 ? "ano" : "anos"}`);
  if (meses > 0) partes.push(`${meses} ${meses === 1 ? "mês" : "meses"}`);

  return partes.join(" e ") || "Menos de 1 mês";
}

function formatarData(dataEntrada: string): string {
  const [ano, mes] = dataEntrada.split("-").map(Number);
  const data = new Date(ano, mes - 1, 1);

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(data);
}

export default function FuncionarioModal({
  funcionario,
  nomeEmpresa,
  onClose,
  onRemove,
}: FuncionarioModalProps) {
  useEffect(() => {
    if (!funcionario) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [funcionario, onClose]);

  if (!funcionario) return null;

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`${styles.modal} ${inter.className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="funcionario-modal-title"
      >
        <div className={styles.header}>
          <span className={styles.breadcrumb}>
            FUNCIONÁRIO / {nomeEmpresa.toUpperCase()}
          </span>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fechar modal"
          >
            ×
          </button>
        </div>

        <div className={styles.profile}>
          <div className={styles.avatar}>
            {funcionario.iniciais}
          </div>

          <h2
            id="funcionario-modal-title"
            className={`${styles.name} ${dmSerif.className}`}
          >
            {funcionario.nome}
          </h2>
        </div>

        <div className={styles.divider} />

        <div className={styles.information}>
          <div className={styles.contactGrid}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>E-mail</span>
              <span className={styles.fieldValue}>
                {funcionario.email}
              </span>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Telefone</span>
              <span className={styles.fieldValue}>
                {funcionario.telefone}
              </span>
            </div>
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>
              Tempo na empresa
            </span>
            <span className={styles.fieldValue}>
              {formatarTempo(funcionario.dataEntrada)}
            </span>
            <span className={styles.since}>
              Desde {formatarData(funcionario.dataEntrada)}
            </span>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            type="button"
            className={styles.removeButton}
            onClick={() => onRemove(funcionario)}
          >
            Remover
          </button>
        </div>
      </div>
    </div>
  );
}
