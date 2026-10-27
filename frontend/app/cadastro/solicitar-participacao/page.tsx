import type { Metadata } from "next";
import Link from "next/link";
import { DM_Serif_Display, Inter } from "next/font/google";

import SolicitarParticipacaoForm from "@/features/auth/components/SolicitarParticipacaoForm";
import styles from "./solicitarParticipacao.module.css";

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
  title: "Solicitar participação | Evidence",
  description: "Solicite sua participação em uma empresa no Evidence.",
};

export default function SolicitarParticipacaoPage() {
  return (
    <main className={`${styles.page} ${inter.variable} ${dmSerif.variable}`}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandSymbol} aria-hidden="true">
            <svg viewBox="0 0 36 36" fill="none">
              <path
                d="M7 17L17 7L28 23L17 29L7 17Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="18" cy="5" r="3" fill="#1F3D2E" />
              <circle cx="5" cy="18" r="3" fill="#4A6A41" />
              <circle cx="15" cy="31" r="3" fill="#1F3D2E" />
              <circle cx="31" cy="23" r="3" fill="#B65A46" />
            </svg>
          </span>
          <span>Evidence</span>
        </Link>

        <Link href="/" className={styles.backLink}>
          ← Voltar ao início
        </Link>
      </header>

      <section className={styles.card} aria-labelledby="titulo-solicitacao">
        <div className={styles.intro}>
          <h1 id="titulo-solicitacao">Faça parte da sua empresa.</h1>
          <p>Encontre sua empresa e solicite sua participação.</p>
        </div>

        <SolicitarParticipacaoForm />
      </section>
    </main>
  );
}
