
import type { Metadata } from "next";
import Link from "next/link";
import { DM_Serif_Display, Inter } from "next/font/google";

import CadastroForm from "@/features/auth/components/CadastroForm";
import styles from "./cadastro.module.css";

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
  title: "Cadastro | Evidence",
  description: "Crie sua conta no Evidence.",
};

export default function CadastroPage() {
  return (
    <main
      className={`${styles.page} ${inter.variable} ${dmSerif.variable}`}
    >
      <header className={styles.header}>
        <Link
          href="/"
          className={styles.brand}
          aria-label="Evidence — página inicial"
        >
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
          <span aria-hidden="true">←</span> Voltar ao início
        </Link>
      </header>

      <section className={styles.card} aria-labelledby="cadastro-titulo">
        <div className={styles.intro}>
          <h1 id="cadastro-titulo">Oi, prazer em te conhecer.</h1>
          <p>Vamos começar pelos seus dados.</p>
        </div>

        <CadastroForm />
      </section>
    </main>
  );
}
