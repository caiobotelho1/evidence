import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { DM_Serif_Display, Inter } from "next/font/google";

import CadastroEmpresaForm from "@/features/empresa/components/CadastroEmpresaForm";
import styles from "./cadastroEmpresa.module.css";

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
  title: "Cadastrar empresa | Evidence",
  description: "Cadastre sua empresa no Evidence.",
};

export default function CadastroEmpresaPage() {
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

      <section
        className={styles.card}
        aria-labelledby="cadastro-empresa-titulo"
      >
        <div className={styles.intro}>
          <h1 id="cadastro-empresa-titulo">
            Vamos cadastrar sua empresa.
          </h1>

          <p>
            Informe os dados abaixo para começar a usar o Evidence
            com sua equipe.
          </p>
        </div>

        <CadastroEmpresaForm/>
      </section>
    </main>
  );
}
