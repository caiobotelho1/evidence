import type { Metadata } from "next";
import Link from "next/link";
import { Inter, DM_Serif_Display } from "next/font/google";
import CadastroForm from "../../features/auth/components/CadastroForm";
import styles from "./cadastro.module.css";

export const metadata: Metadata = {
  title: "Cadastro | Evidence",
};

// Fontes utilizadas no Figma
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

export default function CadastroPage() {
  return (
    <main
      className={`${styles.pagina} ${inter.variable} ${dmSerif.variable}`}
    >
      {/* Cabeçalho */}
      <header className={styles.cabecalho}>
        <Link href="/" className={styles.logo}>
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M7 19L18 8L27 25L16 29L7 19Z"
              stroke="#1F3D2E"
              strokeWidth="1.5"
            />
            <circle cx="18" cy="8" r="3.5" fill="#1F3D2E" />
            <circle cx="7" cy="19" r="3" fill="#4A6A41" />
            <circle cx="16" cy="29" r="4" fill="#1F3D2E" />
            <circle cx="29" cy="25" r="3" fill="#B65A46" />
          </svg>

          <span>Evidence</span>
        </Link>

        <Link href="/" className={styles.voltar}>
          <span aria-hidden="true">←</span>
          Voltar ao início
        </Link>
      </header>

      {/* Formulário de cadastro */}
      <section className={styles.container}>
        <CadastroForm />
      </section>
    </main>
  );
}

