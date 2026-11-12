import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
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
        <Suspense fallback={<p>Carregando confirmação...</p>}>
          <ConteudoAprovacao searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}