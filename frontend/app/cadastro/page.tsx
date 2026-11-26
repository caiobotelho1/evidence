import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
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
        aria-label="Evidence — página inicial"
        className={styles.brand}
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

      <Link href="/" className={styles.backLink}>
        <span aria-hidden="true">←</span>
        Voltar ao início
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
