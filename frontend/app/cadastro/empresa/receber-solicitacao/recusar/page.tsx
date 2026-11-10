import type { Metadata } from "next";
import Link from "next/link";
import { DM_Serif_Display, Inter } from "next/font/google";
import styles from "./recusaSolicitacao.module.css";

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
  title: "Solicitação recusada | Evidence",
  description: "Confirmação de recusa de participação na empresa.",
};

export default function RecusaSolicitacaoPage() {
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
        <div className={styles.rejectIcon} aria-hidden="true">
          <svg viewBox="0 0 64 64" fill="none">
            <circle
              cx="32"
              cy="32"
              r="29"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              d="M23 23L41 41M41 23L23 41"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className={styles.intro}>
          <h1>Solicitação recusada.</h1>

          <p>
            A participação do funcionário na sua empresa
            não foi aprovada.
          </p>
        </div>

        <div className={styles.footer}>
          <Link
            href="/cadastro/empresa/receber-solicitacao"
            className={styles.submitButton}
          >
            Voltar para as solicitações
          </Link>
        </div>
      </section>
    </main>
  );
}
