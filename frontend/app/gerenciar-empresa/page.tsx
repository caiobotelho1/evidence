"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { DM_Serif_Display, Inter } from "next/font/google";
import FuncionarioModal, {type Funcionario,} from "@/features/empresa/components/FuncionarioModal";
import {getMyCompanies,getCompanyMembers,getCompanyMember,removeCompanyMember,type CompanyMember,type MyCompany,} from "@/services/company.service";
import styles from "./gerenciarEmpresa.module.css";

const inter = Inter({ subsets: ["latin"] });

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

function converterFuncionario(member: CompanyMember): Funcionario {
  const nome = member.user.name.trim();

  const iniciais = nome
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0))
    .join("")
    .toUpperCase();

  return {
    id: member.id,
    nome,
    email: member.user.email,
    iniciais,
    telefone: member.user.phone || "Não informado",
    dataEntrada: (member.decidedAt ?? member.createdAt).slice(0, 10),
  };
}

export default function GerenciarEmpresaPage() {
  const [empresa, setEmpresa] = useState<MyCompany | null>(null);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [funcionarioSelecionado, setFuncionarioSelecionado] =
    useState<Funcionario | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);
  const [removendo, setRemovendo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro(null);

    try {
      const empresas = await getMyCompanies();

      const empresaProprietaria = empresas.find(
        (item) => item.role === "OWNER"
      );

      if (!empresaProprietaria) {
        setEmpresa(null);
        setFuncionarios([]);
        setErro("Nenhuma empresa disponível para gerenciamento.");
        return;
      }

      setEmpresa(empresaProprietaria);

      const membros = await getCompanyMembers(empresaProprietaria.id);

      setFuncionarios(membros.map(converterFuncionario));
    } catch (error) {
      console.error("Erro ao carregar empresa:", error);
      setErro("Não foi possível carregar os dados da empresa.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  async function abrirFuncionario(funcionario: Funcionario) {
    if (!empresa || carregandoDetalhes) return;

    setCarregandoDetalhes(true);
    setErro(null);

    try {
      const member = await getCompanyMember(
        empresa.id,
        funcionario.id
      );

      setFuncionarioSelecionado(converterFuncionario(member));
    } catch (error) {
      console.error("Erro ao consultar funcionário:", error);
      setErro("Não foi possível carregar os detalhes do funcionário.");
    } finally {
      setCarregandoDetalhes(false);
    }
  }

  async function handleRemove(funcionario: Funcionario) {
    if (!empresa || removendo) return;

    const confirmado = window.confirm(
      `Deseja realmente remover ${funcionario.nome} da empresa?`
    );

    if (!confirmado) return;

    setRemovendo(true);
    setErro(null);

    try {
      await removeCompanyMember(empresa.id, funcionario.id);

      setFuncionarios((atuais) =>
        atuais.filter((item) => item.id !== funcionario.id)
      );

      setFuncionarioSelecionado(null);
    } catch (error) {
      console.error("Erro ao remover funcionário:", error);
      setErro("Não foi possível remover o funcionário.");
    } finally {
      setRemovendo(false);
    }
  }

  const nomeEmpresa =
    empresa?.tradeName || empresa?.legalName || "Gerenciar empresa";

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
          {carregando ? "Carregando..." : nomeEmpresa}
        </h1>

        {erro && (
          <p role="alert" style={{ color: "#B65A46", marginBottom: 20 }}>
            {erro}
          </p>
        )}

        {empresa && (
          <>
            <Link
              href="/cadastro/empresa/receber-solicitacao"
              className={styles.requestsSection}
            >
              <span className={styles.requestsLabel}>
                Solicitações de participação
              </span>

              <span className={styles.requestsInfo}>
                <span>Ver solicitações</span>
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
                  {funcionarios.length}{" "}
                  {funcionarios.length === 1 ? "pessoa" : "pessoas"}
                </span>
              </div>

              {carregando ? (
                <p>Carregando funcionários...</p>
              ) : funcionarios.length === 0 ? (
                <p>Nenhum funcionário ativo nesta empresa.</p>
              ) : (
                <div className={styles.employeesGrid}>
                  {funcionarios.map((funcionario, index) => (
                    <button
                      type="button"
                      key={funcionario.id}
                      className={styles.employeeCard}
                      disabled={carregandoDetalhes || removendo}
                      onClick={() => void abrirFuncionario(funcionario)}
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
              )}
            </section>
          </>
        )}
      </main>

      <FuncionarioModal
        funcionario={funcionarioSelecionado}
        nomeEmpresa={nomeEmpresa}
        onClose={() => {
          if (!removendo) setFuncionarioSelecionado(null);
        }}
        onRemove={(funcionario) => void handleRemove(funcionario)}
      />
    </div>
  );
}
