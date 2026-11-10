"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/services/api";
import { login } from "@/services/auth.service";
import styles from "./LoginForm.module.css";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      await login({ email, password });
      router.replace("/registros");
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="login-email">E-mail</label>

        <input
          id="login-email"
          name="email"
          type="email"
          placeholder="voce@exemplo.com"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="login-password">Senha</label>

        <div className={styles.passwordWrapper}>
          <input
            id="login-password"
            name="senha"
            type={showPassword ? "text" : "password"}
            placeholder="Digite sua senha"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            aria-controls="login-password"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
              {showPassword && <path d="m3 3 18 18" />}
            </svg>
          </button>
        </div>
      </div>

      <button
        type="button"
        className={styles.forgotPassword}
        onClick={() => {
          setError("");
          setMessage("A recuperação de senha ainda não está disponível.");
        }}
      >
        Esqueci minha senha
      </button>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className={styles.submitButton}
        disabled={submitting}
      >
        {submitting ? "Entrando..." : "Entrar"}
      </button>

      <p className={styles.message} role="status">
        {message}
      </p>
    </form>
  );
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const firstFieldError = error.fields
      ? Object.values(error.fields).flat()[0]
      : undefined;

    return firstFieldError ?? error.message;
  }

  return "Ocorreu um erro inesperado.";
}