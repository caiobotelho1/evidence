import type { Metadata } from "next";
import Link from "next/link";
import { DM_Serif_Display, Inter } from "next/font/google";
import styles from "./solicitarSucesso.module.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-dm-serif",
});

export const metadata: Metadata = {
  title: "Solicitação enviada | Evidence",
  description: "Confirmação de solicitação de entrada em empresa.",
};

export default function SolicitacaoSucessoPage() {
  const empresa = "Nome da Empresa";
  const cargo = "Auxiliar administrativo";

  return (
    <main
      className={`${styles.page} ${inter.variable} ${dmSerif.variable}`}
    >
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <svg
            className={styles.logo}
            viewBox="0 0 36 36"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M7 17L17 7L28 23L17 29L7 17Z"
              stroke="#1F3D2E"
              strokeWidth="1.5"
            />
            <circle cx="18" cy="5" r="3" fill="#1F3D2E" />
            <circle cx="5" cy="18" r="3" fill="#4A6A41" />
            <circle cx="15" cy="31" r="3" fill="#1F3D2E" />
            <circle cx="31" cy="23" r="3" fill="#B65A46" />
          </svg>

          <span>Evidence</span>
        </Link>

        <Link href="/" className={styles.backLink}>
          ← Voltar ao início
        </Link>
      </header>

      <section className={styles.card}>
        <div className={styles.successIcon} aria-hidden="true">
          <svg viewBox="0 0 64 64" fill="none">
            <circle
              cx="32"
              cy="32"
              r="29"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              d="M20 32L28 40L44 24"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className={styles.intro}>
          <h1>Solicitação enviada!</h1>

          <p>
            Seu pedido para participar da {empresa} foi enviado ao responsável.
          </p>
        </div>

        <div className={styles.statusPanel}>
          <div className={styles.statusHeader}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M12 6V12L16 14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <h2>Aguardando aprovação</h2>
          </div>

          <div className={styles.detailRow}>
            <span>Empresa</span>
            <strong>{empresa}</strong>
          </div>

          <div className={styles.detailRow}>
            <span>Cargo informado</span>
            <strong>{cargo}</strong>
          </div>
        </div>

        <p className={styles.description}>
          Você poderá acompanhar o status pela sua conta. O acesso à
          empresa será liberado após a aprovação do responsável.
        </p>

        <div className={styles.footer}>
          <p>
            Enquanto aguarda, você pode continuar usando sua conta pessoal.
          </p>

          <Link href="/login" className={styles.submitButton}>
            Acessar minha conta
          </Link>
        </div>
      </section>
    </main>
  );
}
