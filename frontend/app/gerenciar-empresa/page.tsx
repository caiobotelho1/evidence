"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DM_Serif_Display, Inter } from "next/font/google";

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

export default function GerenciarEmpresaPage() {
  const [menuEmpresaAberto, setMenuEmpresaAberto] = useState(false);

  const [empresas, setEmpresas] = useState<MyCompany[]>([]);

  const [empresaSelecionadaId, setEmpresaSelecionadaId] =
    useState("");

  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);

  const [funcionarioSelecionado, setFuncionarioSelecionado] =
    useState<Funcionario | null>(null);

  const [carregandoEmpresas, setCarregandoEmpresas] = useState(true);

  const [carregandoFuncionarios, setCarregandoFuncionarios] =
    useState(false);

  const [carregandoDetalhes, setCarregandoDetalhes] = useState(false);

  const [removendo, setRemovendo] = useState(false);

  const [erroEmpresas, setErroEmpresas] = useState<string | null>(null);

  const [erroFuncionarios, setErroFuncionarios] =
    useState<string | null>(null);

  const [erroOperacao, setErroOperacao] = useState<string | null>(null);

  const empresa = empresas.find(
    (item) => item.id === empresaSelecionadaId
  );

  const seletorDesabilitado =
    carregandoDetalhes ||
    removendo ||
    Boolean(funcionarioSelecionado);

  // Fecha o dropdown ao clicar fora ou pressionar Escape.
  useEffect(() => {
    if (!menuEmpresaAberto) return;

    function fecharMenu(event: MouseEvent) {
      if (
        event.target instanceof Element &&
        !event.target.closest(`.${styles.companyDropdown}`)
      ) {
        setMenuEmpresaAberto(false);
      }
    }

    function fecharComEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuEmpresaAberto(false);
        document.getElementById("empresa-atual")?.focus();
      }
    }

    document.addEventListener("click", fecharMenu);
    document.addEventListener("keydown", fecharComEscape);

    return () => {
      document.removeEventListener("click", fecharMenu);
      document.removeEventListener("keydown", fecharComEscape);
    };
  }, [menuEmpresaAberto]);

  // Carrega todas as empresas que o usuário pode gerenciar.
  useEffect(() => {
    let cancelado = false;

    async function carregarEmpresas() {
      setCarregandoEmpresas(true);
      setErroEmpresas(null);

      try {
        const resultado = await getMyCompanies();

        const empresasProprietarias = resultado.filter(
          (item) => item.role === "OWNER"
        );

        if (cancelado) return;

        setEmpresas(empresasProprietarias);

        // Seleciona automaticamente quando houver apenas uma empresa.
        if (empresasProprietarias.length === 1) {
          setEmpresaSelecionadaId(empresasProprietarias[0].id);
        }
      } catch (error) {
        if (!cancelado) {
          setErroEmpresas(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar suas empresas."
          );
        }
      } finally {
        if (!cancelado) {
          setCarregandoEmpresas(false);
        }
      }
    }

    void carregarEmpresas();

    return () => {
      cancelado = true;
    };
  }, []);

  // Carrega os funcionários sempre que a empresa selecionada mudar.
  useEffect(() => {
    let cancelado = false;

    async function carregarFuncionarios() {
      setFuncionarios([]);
      setErroFuncionarios(null);

      if (!empresaSelecionadaId) {
        setCarregandoFuncionarios(false);
        return;
      }

      setCarregandoFuncionarios(true);

      try {
        const membros = await getCompanyMembers(
          empresaSelecionadaId
        );

        if (!cancelado) {
          setFuncionarios(membros.map(converterFuncionario));
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
  }, [empresaSelecionadaId]);

  // Altera a empresa selecionada.
  function selecionarEmpresa(companyId: string) {
    setMenuEmpresaAberto(false);

    document.getElementById("empresa-atual")?.focus();

    if (seletorDesabilitado) return;

    // Evita recarregar a empresa que já está selecionada.
    if (companyId === empresaSelecionadaId) return;

    setFuncionarios([]);
    setFuncionarioSelecionado(null);
    setErroFuncionarios(null);
    setErroOperacao(null);
    setCarregandoFuncionarios(Boolean(companyId));
    setEmpresaSelecionadaId(companyId);
  }

  // Carrega os detalhes do funcionário selecionado.
  async function abrirFuncionario(funcionario: Funcionario) {
    if (!empresa || carregandoDetalhes || removendo) return;

    setMenuEmpresaAberto(false);
    setCarregandoDetalhes(true);
    setErroOperacao(null);

    try {
      const member = await getCompanyMember(
        empresa.id,
        funcionario.id
      );

      setFuncionarioSelecionado(converterFuncionario(member));
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
      await removeCompanyMember(empresa.id, funcionario.id);

      setFuncionarios((atuais) =>
        atuais.filter((item) => item.id !== funcionario.id)
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
          href="/tela-principal?ambiente=empresa"
          className={styles.logo}
        >
          <Image
            src="/evidence-simbolo.svg"
            alt=""
            width={36}
            height={36}
            priority
          />

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

        {/* Seletor de empresas */}
        <div className={styles.companySelector}>
          <label
            id="empresa-label"
            htmlFor={
              !carregandoEmpresas &&
              !erroEmpresas &&
              empresas.length > 1
                ? "empresa-atual"
                : undefined
            }
            className={styles.companySelectorLabel}
          >
            Empresa
          </label>

          {carregandoEmpresas ? (
            <p
              className={styles.companySelectorStatus}
              role="status"
            >
              Carregando empresas...
            </p>
          ) : erroEmpresas ? (
            <p className={styles.error} role="alert">
              {erroEmpresas}
            </p>
          ) : empresas.length === 0 ? (
            <p className={styles.companySelectorStatus}>
              Nenhuma empresa disponível para gerenciamento.
            </p>
          ) : empresas.length === 1 ? (
            <p className={styles.companySelectorName}>
              {empresas[0].tradeName?.trim() ||
                empresas[0].legalName}
            </p>
          ) : (
            <div className={styles.companyDropdown}>
              <button
                id="empresa-atual"
                type="button"
                className={styles.companyDropdownButton}
                aria-expanded={menuEmpresaAberto}
                aria-controls={
                  menuEmpresaAberto
                    ? "empresa-dropdown-content"
                    : undefined
                }
                aria-labelledby="empresa-label empresa-atual"
                disabled={seletorDesabilitado}
                onClick={() =>
                  setMenuEmpresaAberto((atual) => !atual)
                }
              >
                <span>
                  {empresa?.tradeName?.trim() ||
                    empresa?.legalName ||
                    "Selecione uma empresa"}
                </span>

                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={
                    menuEmpresaAberto
                      ? styles.dropdownArrowOpen
                      : styles.dropdownArrow
                  }
                  aria-hidden="true"
                >
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {menuEmpresaAberto && !seletorDesabilitado && (
                <div
                  id="empresa-dropdown-content"
                  className={styles.companyDropdownContent}
                >
                  <button
                    type="button"
                    className={`${styles.companyDropdownItem} ${
                      !empresaSelecionadaId
                        ? styles.companyDropdownActive
                        : ""
                    }`}
                    aria-pressed={!empresaSelecionadaId}
                    onClick={() => selecionarEmpresa("")}
                  >
                    <span>Selecione uma empresa</span>
                  </button>

                  {empresas.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`${styles.companyDropdownItem} ${
                        empresaSelecionadaId === item.id
                          ? styles.companyDropdownActive
                          : ""
                      }`}
                      aria-pressed={
                        empresaSelecionadaId === item.id
                      }
                      onClick={() => selecionarEmpresa(item.id)}
                    >
                      <span>
                        {item.tradeName?.trim() ||
                          item.legalName}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {!carregandoEmpresas &&
          empresas.length > 1 &&
          !empresa && (
            <p className={styles.companySelectorStatus}>
              Selecione uma empresa para gerenciar seus funcionários.
            </p>
          )}

        {erroOperacao && (
          <p className={styles.error} role="alert">
            {erroOperacao}
          </p>
        )}

        {empresa && (
          <>
            {/* Solicitações de participação */}
            <Link
              href={{
                pathname: "/receber-solicitacao",
                query: { companyId: empresa.id },
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

                {!carregandoFuncionarios && !erroFuncionarios && (
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
                <p className={styles.error} role="alert">
                  {erroFuncionarios}
                </p>
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
        )}
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
