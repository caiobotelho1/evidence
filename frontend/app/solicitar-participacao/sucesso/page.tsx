import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { DM_Serif_Display, Inter } from "next/font/google";
import styles from "./solicitarSucesso.module.css";

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
  title: "Solicitação enviada | Evidence",
  description: "Confirmação de solicitação de entrada em empresa.",
};

type SearchParams = {
  empresa?: string | string[];
  cargo?: string | string[];
};

type DetalhesProps = {
  searchParams: Promise<SearchParams>;
};

async function DetalhesSolicitacao({ searchParams }: DetalhesProps) {
  const parametros = await searchParams;

  const empresa =
    typeof parametros.empresa === "string" && parametros.empresa.trim()
      ? parametros.empresa.trim()
      : "empresa informada";

  const cargo =
    typeof parametros.cargo === "string" && parametros.cargo.trim()
      ? parametros.cargo.trim()
      : "Não informado";

  return (
    <>
      <div className={styles.intro}>
        <h1>Solicitação enviada!</h1>

        <p>
          Seu pedido para participar da {empresa} foi enviado ao responsável.
        </p>
      </div>

      <div className={styles.statusPanel}>
        <div className={styles.statusHeader}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M12 6V12L16 14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <h2>Aguardando aprovação</h2>
        </div>

        <div className={styles.detailRow}>
          <span>Empresa</span>
          <strong>{empresa}</strong>
        </div>

        <div className={styles.detailRow}>
          <span>Cargo informado</span>
          <strong>{cargo}</strong>
        </div>
      </div>
    </>
  );
}

export default function SolicitacaoSucessoPage({
  searchParams,
}: DetalhesProps) {
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
        <div className={styles.successIcon} aria-hidden="true">
          <svg viewBox="0 0 64 64" fill="none">
            <circle
              cx="32"
              cy="32"
              r="29"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              d="M20 32L28 40L44 24"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <Suspense
          fallback={
            <div className={styles.intro}>
              <h1>Solicitação enviada!</h1>
              <p role="status">Carregando os dados da solicitação...</p>
            </div>
          }
        >
          <DetalhesSolicitacao searchParams={searchParams} />
        </Suspense>

        <p className={styles.description}>
          Você poderá acompanhar o status pela sua conta. O acesso à
          empresa será liberado após a aprovação do responsável.
        </p>

        <div className={styles.footer}>
          <p>
            Enquanto aguarda, você pode continuar usando sua conta pessoal.
          </p>

          <Link href="/tela-principal" className={styles.submitButton}>
            Acessar minha conta
          </Link>
        </div>
      </section>
    </main>
  );
}
