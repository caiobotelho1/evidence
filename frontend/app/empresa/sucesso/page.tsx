import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { DM_Serif_Display, Inter } from "next/font/google";
import styles from "./cadastroEmpresaSucesso.module.css";

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
  title: "Empresa cadastrada | Evidence",
  description: "Confirmação de cadastro de empresa no Evidence.",
};

export default function EmpresaSucessoPage() {
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
        <div className={styles.successIcon} aria-hidden="true">
          <svg viewBox="0 0 64 64" fill="none">
            <circle
              cx="32"
              cy="32"
              r="29"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M19 32L28 41L45 23"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className={styles.intro}>
          <h1>Empresa cadastrada com sucesso!</h1>
          <p>
            Sua empresa foi cadastrada no Evidence e está pronta
            para começar.
          </p>
        </div>

        <div className={styles.infoPanel}>
          <span className={styles.panelIcon} aria-hidden="true">
            ✓
          </span>

          <div className={styles.panelContent}>
            <h2>Seu espaço empresarial está pronto!</h2>
            <p>
              Agora você pode organizar os registros da sua empresa,
              acompanhar atividades e gerenciar as solicitações de
              participação da sua equipe.
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          <p>
            Tudo pronto para começar a usar o Evidence com sua equipe.
          </p>

          <Link href="/tela-principal" className={styles.submitButton}>
            Acessar minha conta
          </Link>
        </div>
      </section>
    </main>
  );
}
