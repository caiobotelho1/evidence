
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
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

interface SolicitacoesPageProps {
  searchParams: Promise<{
    companyId?: string | string[];
  }>;
}

// Componente responsável pelos dados da URL.
// Será renderizado dentro do Suspense.

async function SolicitacoesContent({
  searchParams,
}: SolicitacoesPageProps) {
  const params = await searchParams;

  const companyId =
    typeof params.companyId === "string"
      ? params.companyId
      : "";

  const dashboardHref = companyId
    ? `/tela-principal?ambiente=empresa&companyId=${encodeURIComponent(companyId)}`
    : "/tela-principal?ambiente=empresa";

  const managementHref = companyId
    ? `/gerenciar-empresa?ambiente=empresa&companyId=${encodeURIComponent(companyId)}`
    : "/gerenciar-empresa?ambiente=empresa";

  return (
    <>
      <header className={styles.header}>
        <Link
          href={dashboardHref}
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

          <span className={dmSerif.className}>
            Evidence
          </span>
        </Link>

        <Link
          href={managementHref}
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
            Consulte e gerencie as solicitações de
            entrada na empresa selecionada.
          </p>
        </div>

        <Suspense
          fallback={<p>Carregando solicitações...</p>}
        >
          <SolicitacaoRecebida />
        </Suspense>
      </section>
    </>
  );
}

// Componente principal da página.

export default function SolicitacoesPage({
  searchParams,
}: SolicitacoesPageProps) {
  return (
    <AuthGate>
      <main
        className={`${styles.page} ${inter.variable} ${dmSerif.variable}`}
      >
        <Suspense
          fallback={
            <section className={styles.card}>
              <p role="status">
                Carregando solicitações...
              </p>
            </section>
          }
        >
          <SolicitacoesContent
            searchParams={searchParams}
          />
        </Suspense>
      </main>
    </AuthGate>
  );
}
