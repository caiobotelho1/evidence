import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { DM_Serif_Display, Inter } from "next/font/google";

import SolicitarParticipacaoForm from "@/features/empresa/components/SolicitarParticipacaoForm";
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
          ← Voltar ao inicio
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
