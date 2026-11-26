import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { DM_Serif_Display, Inter } from "next/font/google";

import SolicitacaoAprovada from "@/features/empresa/components/AprovaSolicitacao";
import styles from "./aprovaSolicitacao.module.css";

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
  title: "Solicitação aprovada | Evidence",
  description: "Confirmação de aprovação de participação na empresa.",
};

type Props = {
  searchParams: Promise<{
    funcionario?: string | string[];
    empresa?: string | string[];
    cargo?: string | string[];
  }>;
};

async function ConteudoAprovacao({ searchParams }: Props) {
  const params = await searchParams;

  const funcionario =
    typeof params.funcionario === "string"
      ? params.funcionario
      : "Funcionário";

  const empresa =
    typeof params.empresa === "string"
      ? params.empresa
      : "Empresa";

  const cargo =
    typeof params.cargo === "string"
      ? params.cargo
      : "Não informado";

  return (
    <SolicitacaoAprovada
      funcionario={funcionario}
      empresa={empresa}
      cargo={cargo}
    />
  );
}

export default function SolicitacaoAprovadaPage({ searchParams }: Props) {
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

        <Link
          href="/tela-principal"
          className={styles.backLink}
        >
          <span aria-hidden="true">←</span>
          Voltar ao início
        </Link>
      </header>

      <section className={styles.card}>
        <Suspense fallback={<p>Carregando confirmação...</p>}>
          <ConteudoAprovacao searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}