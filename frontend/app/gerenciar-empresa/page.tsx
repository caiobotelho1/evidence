"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { DM_Serif_Display, Inter } from "next/font/google";

import { AuthGate } from "@/features/auth/components/AuthGate";

import FuncionarioModal, {
  type Funcionario,
} from "@/features/empresa/components/FuncionarioModal";

import {
  getMyCompanies,
  getCompanyMembers,
  getCompanyMember,
  removeCompanyMember,
  type CompanyMember,
  type MyCompany,
} from "@/services/company.service";

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

function GerenciarEmpresaContent() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId") ?? "";

  return (
    <GerenciarEmpresa
      key={companyId}
      companyId={companyId}
    />
  );
}

function GerenciarEmpresa({
  companyId,
}: {
  companyId: string;
}) {
  const [empresa, setEmpresa] = useState<MyCompany | null>(null);

  const [funcionarios, setFuncionarios] =
    useState<Funcionario[]>([]);

  const [funcionarioSelecionado, setFuncionarioSelecionado] =
    useState<Funcionario | null>(null);

  const [carregandoEmpresa, setCarregandoEmpresa] =
    useState(true);

  const [carregandoFuncionarios, setCarregandoFuncionarios] =
    useState(true);

  const [carregandoDetalhes, setCarregandoDetalhes] =
    useState(false);

  const [removendo, setRemovendo] = useState(false);

  const [erroEmpresa, setErroEmpresa] =
    useState<string | null>(null);

  const [erroFuncionarios, setErroFuncionarios] =
    useState<string | null>(null);

  const [erroOperacao, setErroOperacao] =
    useState<string | null>(null);

  const dashboardHref = companyId
    ? `/tela-principal?ambiente=empresa&companyId=${encodeURIComponent(companyId)}`
    : "/tela-principal?ambiente=empresa";

  // Identifica a empresa recebida pela URL e verifica
  // se o usuário é proprietário dela.

  useEffect(() => {
    let cancelado = false;

    async function carregarEmpresa() {
      setEmpresa(null);
      setErroEmpresa(null);

      if (!companyId) {
        setCarregandoEmpresa(false);
        return;
      }

      setCarregandoEmpresa(true);

      try {
        const empresas = await getMyCompanies();

        const empresaAtual = empresas.find(
          (item) =>
            item.id === companyId &&
            item.role === "OWNER"
        );

        if (cancelado) return;

        if (!empresaAtual) {
          setErroEmpresa(
            "Você não tem permissão para gerenciar esta empresa ou ela não está disponível."
          );

          return;
        }

        setEmpresa(empresaAtual);
      } catch (error) {
        if (!cancelado) {
          setErroEmpresa(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar a empresa."
          );
        }
      } finally {
        if (!cancelado) {
          setCarregandoEmpresa(false);
        }
      }
    }

    void carregarEmpresa();

    return () => {
      cancelado = true;
    };
  }, [companyId]);

  // Carrega somente os funcionários da empresa atual.

  const empresaId = empresa?.id;

  useEffect(() => {
    let cancelado = false;

    async function carregarFuncionarios() {
      setFuncionarios([]);
      setErroFuncionarios(null);

      if (!empresaId) {
        return;
      }

      setCarregandoFuncionarios(true);

      try {
        const membros = await getCompanyMembers(empresaId);

        if (!cancelado) {
          setFuncionarios(
            membros.map(converterFuncionario)
          );
        }
      } catch (error) {
        if (!cancelado) {
          setErroFuncionarios(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os funcionários."
          );
        }
      } finally {
        if (!cancelado) {
          setCarregandoFuncionarios(false);
        }
      }
    }

    void carregarFuncionarios();

    return () => {
      cancelado = true;
    };
  }, [empresaId]);

  // Carrega os detalhes do funcionário selecionado.

  async function abrirFuncionario(funcionario: Funcionario) {
    if (!empresa || carregandoDetalhes || removendo) return;

    setCarregandoDetalhes(true);
    setErroOperacao(null);

    try {
      const member = await getCompanyMember(
        empresa.id,
        funcionario.id
      );

      setFuncionarioSelecionado(
        converterFuncionario(member)
      );
    } catch (error) {
      setErroOperacao(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os detalhes do funcionário."
      );
    } finally {
      setCarregandoDetalhes(false);
    }
  }

  // Remove um funcionário da empresa.

  async function handleRemove(funcionario: Funcionario) {
    if (!empresa || removendo) return;

    const confirmado = window.confirm(
      `Deseja realmente remover ${funcionario.nome} da empresa?`
    );

    if (!confirmado) return;

    setRemovendo(true);
    setErroOperacao(null);

    try {
      await removeCompanyMember(
        empresa.id,
        funcionario.id
      );

      setFuncionarios((atuais) =>
        atuais.filter(
          (item) => item.id !== funcionario.id
        )
      );

      setFuncionarioSelecionado(null);
    } catch (error) {
      setErroOperacao(
        error instanceof Error
          ? error.message
          : "Não foi possível remover o funcionário."
      );
    } finally {
      setRemovendo(false);
    }
  }

  const nomeEmpresa =
    empresa?.tradeName?.trim() ||
    empresa?.legalName ||
    "Gerenciar empresa";

  return (
    <div className={`${styles.page} ${inter.className}`}>
      <header className={styles.header}>
        <Link
          href={dashboardHref}
          className={styles.logo}
          aria-label="Evidence — página inicial"
        >
          <Image
            src="/evidence-simbolo.svg"
            alt=""
            width={36}
            height={36}
            priority
          />

          <span className={dmSerif.className}>
            Evidence
          </span>
        </Link>

        <Link
          href={dashboardHref}
          className={styles.backLink}
        >
          <span aria-hidden="true">←</span>
          Voltar à timeline
        </Link>
      </header>

      <main className={styles.main}>
        <nav
          className={styles.breadcrumb}
          aria-label="Localização"
        >
          EMPRESA <span aria-hidden="true">/</span>
          <span aria-current="page">GERENCIAR</span>
        </nav>

        <h1 className={`${styles.title} ${dmSerif.className}`}>
          {nomeEmpresa}
        </h1>

        {carregandoEmpresa ? (
          <p role="status">
            Carregando empresa...
          </p>
        ) : !companyId ? (
          <div>
            <p>
              Volte à timeline e selecione uma empresa
              para gerenciar seus funcionários.
            </p>

            <Link
              href={dashboardHref}
              className={styles.backLink}
            >
              Ir para o ambiente da empresa
            </Link>
          </div>
        ) : erroEmpresa ? (
          <p className={styles.error} role="alert">
            {erroEmpresa}
          </p>
        ) : empresa ? (
          <>
            {erroOperacao && (
              <p className={styles.error} role="alert">
                {erroOperacao}
              </p>
            )}

            {/* Solicitações de participação */}

            <Link
              href={{
                pathname: "/receber-solicitacao",
                query: {
                  companyId: empresa.id,
                },
              }}
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

            {/* Funcionários */}

            <section className={styles.employeesSection}>
              <div className={styles.sectionHeader}>
                <h2
                  className={`${styles.sectionTitle} ${dmSerif.className}`}
                >
                  Funcionários
                </h2>

                {!carregandoFuncionarios &&
                  !erroFuncionarios && (
                    <span className={styles.employeeCount}>
                      {funcionarios.length}{" "}
                      {funcionarios.length === 1
                        ? "pessoa"
                        : "pessoas"}
                    </span>
                  )}
              </div>

              {carregandoFuncionarios ? (
                <p role="status">
                  Carregando funcionários...
                </p>
              ) : erroFuncionarios ? (
                <p
                  className={styles.error}
                  role="alert"
                >
                  {erroFuncionarios}
                </p>
              ) : funcionarios.length === 0 ? (
                <p>
                  Nenhum funcionário ativo nesta empresa.
                </p>
              ) : (
                <div className={styles.employeesGrid}>
                  {funcionarios.map((funcionario, index) => (
                    <button
                      type="button"
                      key={funcionario.id}
                      className={styles.employeeCard}
                      disabled={carregandoDetalhes || removendo}
                      onClick={() =>
                        void abrirFuncionario(funcionario)
                      }
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

                      <span
                        className={styles.cardArrow}
                        aria-hidden="true"
                      >
                        ›
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </main>

      <FuncionarioModal
        funcionario={funcionarioSelecionado}
        nomeEmpresa={nomeEmpresa}
        onClose={() => {
          if (!removendo) {
            setFuncionarioSelecionado(null);
          }
        }}
        onRemove={(funcionario) =>
          void handleRemove(funcionario)
        }
      />
    </div>
  );
}

export default function GerenciarEmpresaPage() {
  return (
    <AuthGate>
      <Suspense
        fallback={
          <main className={styles.page}>
            Carregando empresa...
          </main>
        }
      >
        <GerenciarEmpresaContent />
      </Suspense>
    </AuthGate>
  );
}
