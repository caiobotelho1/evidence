import type { Metadata } from "next";
import Link from "next/link";
import { DM_Serif_Display, Inter } from "next/font/google";
import styles from "./escolherAmbiente.module.css";

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
  title: "Escolher espaço | Evidence",
  description: "Escolha o espaço que deseja acessar no Evidence.",
};

export default function EscolherEspacoPage() {
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

      <section className={styles.content}>
        <div className={styles.intro}>
          <h1>Bem-vindo de volta!</h1>
          <p>Escolha o espaço que você quer acessar.</p>
        </div>

        <div className={styles.spaces}>
          <Link href="/pessoal" className={styles.personalCard}>
            <div className={styles.iconWrapper}>
              <svg
                viewBox="0 0 64 64"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="32"
                  cy="18"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  d="M11 56V52C11 39 20 33 32 33C44 33 53 39 53 52V56H11Z"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className={styles.description}>
              <h2>Pessoal</h2>
              <p>
                Seus momentos, documentos e registros em um só lugar.
              </p>
            </div>

            <div className={styles.access}>
              <span>Acessar espaço</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 12H20M14 6L20 12L14 18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Link>
          <Link href="/empresa" className={styles.companyCard}>
            <div className={styles.iconWrapper}>
              <svg
                viewBox="0 0 64 64"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="12"
                  y="6"
                  width="40"
                  height="52"
                  rx="3"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  d="M24 58V42H40V58"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 18H26M38 18H42M22 29H26M38 29H42"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className={styles.description}>
              <h2>Empresa</h2>
              <p>
                As evidências e os acontecimentos da sua equipe, conectados.
              </p>
            </div>

            <div className={styles.access}>
              <span>Acessar espaço</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 12H20M14 6L20 12L14 18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </Link>
        </div>

        <p className={styles.footerText}>
          Você pode alternar entre os espaços quando quiser.
        </p>
      </section>
    </main>
  );
}
