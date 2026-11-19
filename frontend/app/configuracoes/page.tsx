"use client";

import Link from "next/link";
import { DM_Serif_Display, Inter } from "next/font/google";
import styles from "./configuracoes.module.css";

const inter = Inter({ subsets: ["latin"] });

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

export default function ConfiguracoesPage() {
  const usuario = {
    nome: "Ana Silva",
    email: "ana.silva@example.com",
    telefone: "(11) 99999-1234",
  };

  return (
    <div className={`${styles.page} ${inter.className}`}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M18 7L8 18L15 29L29 22L18 7Z"
              stroke="#1F3D2E"
              strokeWidth="1.2"
            />
            <circle cx="18" cy="7" r="3.4" fill="#1F3D2E" />
            <circle cx="8" cy="18" r="3.4" fill="#4A6A41" />
            <circle cx="15" cy="29" r="3.4" fill="#1F3D2E" />
            <circle cx="29" cy="22" r="3.4" fill="#B65A46" />
          </svg>
          <span className={dmSerif.className}>Evidence</span>
        </Link>

        <Link
          href="/tela-principal"
          className={styles.backLink}
        >
          <span aria-hidden="true">←</span>
          Voltar à timeline
        </Link>
      </header>

      <main className={styles.main}>
        <span className={styles.eyebrow}>MINHA CONTA</span>
        <h1 className={`${styles.title} ${dmSerif.className}`}>
          Configurações
        </h1>
        <p className={styles.subtitle}>
          Cuide da sua conta e dos espaços que fazem parte dela.
        </p>

        <div className={styles.grid}>
          <section className={styles.card}>
            <h2>Dados pessoais</h2>
            <p>Suas informações de contato no Evidence.</p>

            <div className={styles.fields}>
              <div className={styles.field}>
                <span>Nome completo</span>
                <strong>{usuario.nome}</strong>
              </div>
              <div className={styles.field}>
                <span>E-mail</span>
                <strong>{usuario.email}</strong>
              </div>
              <div className={styles.field}>
                <span>Telefone</span>
                <strong>{usuario.telefone}</strong>
              </div>
            </div>

            <button type="button" className={styles.outlineButton}>
              Editar dados
            </button>
          </section>

          <div className={styles.rightColumn}>
            <section className={styles.card}>
              <h2>Segurança da conta</h2>
              <p>Altere sua senha para manter sua conta protegida.</p>
              <button type="button" className={styles.outlineButton}>
                Alterar senha
              </button>
            </section>

            <section className={styles.card}>
              <h2>Minhas empresas</h2>
              <p>Sua conta pessoal também pode ter uma empresa.</p>
              <p>
                Cadastre agora ou quando precisar. Você usará o
                mesmo acesso e será responsável pela empresa.
              </p>
              <Link
                href="/cadastro/empresa"
                className={styles.primaryButton}
              >
                Cadastrar empresa
              </Link>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
