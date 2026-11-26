import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
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
        <Link
          href="/tela-principal"
          className={styles.brand}
          aria-label="Evidence — página inicial"
        >
          <Image
            src="/evidence-simbolo.svg"
            alt=""
            width={36}
            height={36}
            className={styles.brandIcon}
            priority
          />

          <span className={dmSerif.className}>Evidence</span>
        </Link>

        <Link href="/tela-principal" className={styles.backLink}>
          <span aria-hidden="true">←</span>
          Voltar ao início
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
            href="/gerenciar-empresa"
            className={styles.submitButton}
          >
            Voltar para as solicitações
          </Link>
        </div>
      </section>
    </main>
  );
}
