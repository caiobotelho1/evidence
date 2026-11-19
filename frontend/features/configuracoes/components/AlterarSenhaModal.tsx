
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { DM_Serif_Display, Inter } from "next/font/google";
import styles from "./ConfiguracoesModal.module.css";

const inter = Inter({ subsets: ["latin"] });
const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

export type AlteracaoSenha = {
  senhaAtual: string;
  novaSenha: string;
};

type Props = {
  aberto: boolean;
  onClose: () => void;
  onSave: (dados: AlteracaoSenha) => void;
};

export default function AlterarSenhaModal({
  aberto,
  onClose,
  onSave,
}: Props) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!aberto) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [aberto, onClose]);

  function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!senhaAtual) {
      setErro("Informe sua senha atual.");
      return;
    }

    if (novaSenha.length < 8) {
      setErro("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (novaSenha === senhaAtual) {
      setErro("A nova senha deve ser diferente da senha atual.");
      return;
    }

    if (novaSenha !== confirmacao) {
      setErro("As senhas não coincidem.");
      return;
    }

    onSave({ senhaAtual, novaSenha });
    onClose();
  }

  if (!aberto) return null;

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
        aria-labelledby="alterar-senha-title"
      >
        <h2
          id="alterar-senha-title"
          className={`${styles.title} ${dmSerif.className}`}
        >
          Alterar senha
        </h2>

        <p className={styles.description}>
          Informe sua senha atual e escolha uma nova.
        </p>

        <form className={styles.form} onSubmit={salvar}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="senha-atual">
              Senha atual
            </label>
            <input
              id="senha-atual"
              type="password"
              className={styles.input}
              placeholder="Digite sua senha atual"
              autoComplete="current-password"
              value={senhaAtual}
              onChange={(event) => {
                setSenhaAtual(event.target.value);
                setErro("");
              }}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="nova-senha">
              Nova senha
            </label>
            <input
              id="nova-senha"
              type="password"
              className={styles.input}
              placeholder="Crie uma nova senha"
              autoComplete="new-password"
              value={novaSenha}
              onChange={(event) => {
                setNovaSenha(event.target.value);
                setErro("");
              }}
              minLength={8}
              required
            />
            <p className={styles.hint}>
              Use pelo menos 8 caracteres.
            </p>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirmar-senha">
              Confirmar nova senha
            </label>
            <input
              id="confirmar-senha"
              type="password"
              className={styles.input}
              placeholder="Repita a nova senha"
              autoComplete="new-password"
              value={confirmacao}
              onChange={(event) => {
                setConfirmacao(event.target.value);
                setErro("");
              }}
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
            >
              Cancelar
            </button>

            <button type="submit" className={styles.saveButton}>
              Salvar nova senha
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
