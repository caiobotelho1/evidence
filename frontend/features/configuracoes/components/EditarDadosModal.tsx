"use client";

import { useEffect, useState, type FormEvent } from "react";
import { DM_Serif_Display, Inter } from "next/font/google";
import { ApiError } from "@/services/api";
import styles from "./ConfiguracoesModal.module.css";

const inter = Inter({ subsets: ["latin"] });

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

export type DadosPessoais = {
  nome: string;
  email: string;
  telefone: string;
};

type Props = {
  aberto: boolean;
  dados: DadosPessoais;
  onClose: () => void;
  onSave: (dados: DadosPessoais) => Promise<void>;
};

export default function EditarDadosModal({
  aberto,
  dados,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<DadosPessoais>(dados);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!aberto || salvando) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [aberto, salvando, onClose]);

  function atualizarCampo(
    campo: keyof DadosPessoais,
    valor: string
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
    setErro("");
  }

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (salvando) return;

    const nome = form.nome.trim();
    const email = form.email.trim().toLowerCase();
    const telefone = form.telefone.trim();

    if (nome.length < 3) {
      setErro("Informe o nome completo.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErro("Informe um e-mail válido.");
      return;
    }

    if (!/^\d{10,11}$/.test(telefone.replace(/\D/g, ""))) {
      setErro("Informe um telefone válido com DDD.");
      return;
    }

    setSalvando(true);
    setErro("");

    try {
      await onSave({ nome, email, telefone });
      onClose();
    } catch (error) {
      setErro(
        error instanceof ApiError
          ? error.message
          : "Não foi possível salvar suas alterações."
      );
    } finally {
      setSalvando(false);
    }
  }

  if (!aberto) return null;

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (
          !salvando &&
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        className={`${styles.modal} ${inter.className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="editar-dados-title"
        aria-describedby="editar-dados-description"
      >
        <h2
          id="editar-dados-title"
          className={`${styles.title} ${dmSerif.className}`}
        >
          Editar dados pessoais
        </h2>

        <p
          id="editar-dados-description"
          className={styles.description}
        >
          Atualize suas informações de contato.
        </p>

        <form className={styles.form} onSubmit={salvar}>
          <div className={styles.field}>
            <label
              className={styles.label}
              htmlFor="editar-nome"
            >
              Nome completo
            </label>
            <input
              id="editar-nome"
              className={styles.input}
              value={form.nome}
              onChange={(event) =>
                atualizarCampo("nome", event.target.value)
              }
              autoComplete="name"
              disabled={salvando}
              required
            />
          </div>

          <div className={styles.field}>
            <label
              className={styles.label}
              htmlFor="editar-email"
            >
              E-mail
            </label>
            <input
              id="editar-email"
              type="email"
              className={styles.input}
              value={form.email}
              onChange={(event) =>
                atualizarCampo("email", event.target.value)
              }
              autoComplete="email"
              disabled={salvando}
              required
            />
          </div>

          <div className={styles.field}>
            <label
              className={styles.label}
              htmlFor="editar-telefone"
            >
              Telefone
            </label>
            <input
              id="editar-telefone"
              type="tel"
              className={styles.input}
              value={form.telefone}
              onChange={(event) =>
                atualizarCampo("telefone", event.target.value)
              }
              autoComplete="tel"
              disabled={salvando}
              required
            />
          </div>

          {erro && (
            <p className={styles.error} role="alert">
              {erro}
            </p>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={salvando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className={styles.saveButton}
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
