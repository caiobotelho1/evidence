import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { DM_Serif_Display, Inter } from "next/font/google";
import { AuthGate } from "@/features/auth/components/AuthGate";
import SolicitacaoRecebida from "@/features/empresa/components/ReceberSolicitacaoForm";
import styles from "./receberSolicitacao.module.css";

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
  title: "Solicitação de participação | Evidence",
  description: "Gerenciamento de solicitações de entrada na empresa.",
};

export default function SolicitacoesPage() {
  return (
    <AuthGate>
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

          <Link
            href="/gerenciar-empresa"
            className={styles.backLink}
          >
            <span aria-hidden="true">←</span>
            Voltar ao gerenciamento
          </Link>
        </header>

        <section className={styles.card}>
          <div className={styles.intro}>
            <h1>Solicitação de participação.</h1>

            <p>
              Consulte e gerencie as solicitações de entrada nas empresas que você administra.
            </p>
          </div>

          <SolicitacaoRecebida />
        </section>
      </main>
    </AuthGate>
  );
}