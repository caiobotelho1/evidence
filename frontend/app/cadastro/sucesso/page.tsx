import type { Metadata } from "next";
import Link from "next/link";
import { DM_Serif_Display, Inter } from "next/font/google";
import styles from "./cadastroSucesso.module.css";

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
  title: "Cadastro realizado | Evidence",
  description: "Confirmação de cadastro no Evidence.",
};

export default function CadastroSucessoPage() {
  return (
    <main
      className={`${styles.page} ${inter.variable} ${dmSerif.variable}`}
    >
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

      <section
        className={styles.card}
        aria-labelledby="sucesso-titulo"
      >
        {/* Apresentação do cadastro */}
        <div className={styles.presentation}>
          <div className={styles.checkIcon} aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none">
              <circle
                cx="32"
                cy="32"
                r="29"
                stroke="#1F3D2E"
                strokeWidth="3"
              />
              <path
                d="M19 32L28 41L45 23"
                stroke="#1F3D2E"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 id="sucesso-titulo" className={styles.title}>
            Cadastro realizado com sucesso!
          </h1>

          <p className={styles.subtitle}>
            Sua conta foi criada. Seja bem-vindo(a) ao Evidence!
          </p>
        </div>

        {/* Painel de confirmação */}
        <div className={styles.infoBox}>
          <div className={styles.infoHeading}>
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="#1F3D2E"
                strokeWidth="1.5"
              />
              <path
                d="M8 12L11 15L16 9"
                stroke="#1F3D2E"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <h2>Sua conta está pronta!</h2>
          </div>

          <p className={styles.infoText}>
            Agora você pode organizar seus registros, acompanhar
            suas atividades e explorar as funcionalidades do Evidence.
          </p>
        </div>

        {/* Acesso à conta */}
        <div className={styles.footer}>
          <p>
            Tudo pronto para começar a usar o Evidence.
          </p>

          <Link href="/login" className={styles.button}>
            Acessar minha conta
          </Link>
        </div>
      </section>
    </main>
  );
}
