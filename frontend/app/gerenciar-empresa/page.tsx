"use client";

import { useState } from "react";
import Link from "next/link";
import { DM_Serif_Display, Inter } from "next/font/google";

import FuncionarioModal, {
  type Funcionario,
} from "@/features/empresa/components/FuncionarioModal";

import styles from "./gerenciarEmpresa.module.css";

const inter = Inter({ subsets: ["latin"] });

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

const funcionarios: Funcionario[] = [
  {
    id: "1",
    nome: "Funcionário 1",
    email: "funcionario1@example.com",
    iniciais: "f1",
    telefone: "(11) 9XXXX-0101",
    dataEntrada: "2025-07-01",
  },
  {
    id: "2",
    nome: "Funcionário 2",
    email: "funcionario2@example.com",
    iniciais: "f2",
    telefone: "(11) 9XXXX-0102",
    dataEntrada: "2025-08-01",
  },
  {
    id: "3",
    nome: "Funcionário 3",
    email: "funcionario3@example.com",
    iniciais: "f3",
    telefone: "(11) 9XXXX-0103",
    dataEntrada: "2025-09-01",
  },
  {
    id: "4",
    nome: "Funcionário 4",
    email: "funcionario4@example.com",
    iniciais: "f4",
    telefone: "(11) 9XXXX-0104",
    dataEntrada: "2025-10-01",
  },
];

export default function GerenciarEmpresaPage() {
  const nomeEmpresa = "Empresa Exemplo LTDA";
  const quantidadeSolicitacoes = 1;

  const [funcionarioSelecionado, setFuncionarioSelecionado] =
    useState<Funcionario | null>(null);

  function handleRemove(funcionario: Funcionario) {
    // A remoção real será integrada ao backend posteriormente.
    console.log("Remoção ainda não implementada:", funcionario.id);
  }

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
          href="/tela-principal?ambiente=empresa"
          className={styles.backLink}
        >
          <span aria-hidden="true">←</span>
          Voltar à timeline
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.breadcrumb}>
          EMPRESA <span>/</span> GERENCIAR
        </div>

        <h1 className={`${styles.title} ${dmSerif.className}`}>
          {nomeEmpresa}
        </h1>

        <Link
          href="/cadastro/empresa/receber-solicitacao"
          className={styles.requestsSection}
        >
          <span className={styles.requestsLabel}>
            Solicitações de participação
          </span>

          <span className={styles.requestsInfo}>
            <span>
              {quantidadeSolicitacoes}{" "}
              {quantidadeSolicitacoes === 1
                ? "solicitação"
                : "solicitações"}
            </span>
            <span aria-hidden="true">→</span>
          </span>
        </Link>

        <section className={styles.employeesSection}>
          <div className={styles.sectionHeader}>
            <h2
              className={`${styles.sectionTitle} ${dmSerif.className}`}
            >
              Funcionários
            </h2>

            <span className={styles.employeeCount}>
              {funcionarios.length} pessoas
            </span>
          </div>

          <div className={styles.employeesGrid}>
            {funcionarios.map((funcionario, index) => (
              <button
                type="button"
                key={funcionario.id}
                className={styles.employeeCard}
                onClick={() => setFuncionarioSelecionado(funcionario)}
                aria-label={`Visualizar detalhes de ${funcionario.nome}`}
              >
                <span
                  className={`${styles.avatar} ${
                    index % 2 === 0
                      ? styles.avatarGreen
                      : styles.avatarBeige
                  }`}
                >
                  {funcionario.iniciais}
                </span>

                <span className={styles.employeeInfo}>
                  <span className={styles.employeeName}>
                    {funcionario.nome}
                  </span>

                  <span className={styles.employeeEmail}>
                    {funcionario.email}
                  </span>
                </span>

                <span className={styles.cardArrow} aria-hidden="true">
                  ›
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>

      <FuncionarioModal
        funcionario={funcionarioSelecionado}
        nomeEmpresa={nomeEmpresa}
        onClose={() => setFuncionarioSelecionado(null)}
        onRemove={handleRemove}
      />
    </div>
  );
}
