"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DM_Serif_Display, Inter } from "next/font/google";
import { useSearchParams, useRouter } from "next/navigation";
import {getMyCompanies, type MyCompany,} from "@/services/company.service";

import iconUser from "../../imgs/icon_user.png";
import iconMenu from "../../imgs/icon_menu.png";
import iconSeta from "../../imgs/icon_seta.png";

import TagModal from "@/features/tags/components/TagModal";
import MenuAmbiente from "../../features/ambiente/components/MenuAmbiente";
import MenuTags from "../../features/ambiente/components/MenuTags";

import {
  createPersonalTag,
  createCompanyTag,
  getPersonalTags,
  getCompanyTags,
} from "@/services/tag.service";

import type {
  CreateTagInput,
  TagScope,
} from "@/features/tags/types";

import type { Tag } from "@/services/tag.service";

import styles from "./telaPrincipal.module.css";

const inter = Inter({ subsets: ["latin"] });

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

type Ambiente = "pessoal" | "empresa";

export default function DashboardClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const ambienteAtual: Ambiente =
    searchParams.get("ambiente") === "empresa"
      ? "empresa"
      : "pessoal";

  const isPessoal = ambienteAtual === "pessoal";

  const setAmbienteAtual = (ambiente: Ambiente) => {
    router.push(`/tela-principal?ambiente=${ambiente}`);
  };

  // A empresa ativa ainda precisa ser conectada.
 const [companies, setCompanies] = useState<MyCompany[]>([]);
const [selectedCompanyId, setSelectedCompanyId] = useState("");
const [companiesLoading, setCompaniesLoading] = useState(true);
const [companiesError, setCompaniesError] = useState("");

useEffect(() => {
  let cancelled = false;

  async function loadCompanies() {
    try {
      const result = await getMyCompanies();

      if (cancelled) return;

      setCompanies(result);

      // Seleciona automaticamente apenas se houver uma empresa.
     if (result.length === 1) {
        setSelectedCompanyId(result[0].id);
      }
    } catch (error) {
      if (!cancelled) {
        setCompaniesError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar as empresas."
        );
      }
    } finally {
      if (!cancelled) {
        setCompaniesLoading(false);
      }
    }
  }
 
  void loadCompanies();

  return () => {
    cancelled = true;
  };
}, []);

const selectedCompany = companies.find(
  (company) => company.id === selectedCompanyId
); 
const companyId = selectedCompany?.id;

const companyName =
  selectedCompany?.tradeName ??
  selectedCompany?.legalName;

  // Temporário: substituir pelo papel do usuário autenticado.
  const papelEmpresa: "proprietario" | "funcionario" =
    selectedCompany?.role === "OWNER"
      ? "proprietario"
      : "funcionario";

  const [isTagModalOpen, setIsTagModalOpen] =
    useState(false);

  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsError, setTagsError] = useState("");

  // Carrega as tags do ambiente selecionado.
  useEffect(() => {
    let cancelled = false;

    async function loadTags() {
      setTags([]);
      setTagsError("");

      try {
        if (!isPessoal && !companyId) {
          return;
        }

        const result = isPessoal
          ? await getPersonalTags()
          : await getCompanyTags(companyId!);

        if (!cancelled) {
          setTags(result);
        }
      } catch (error) {
        if (!cancelled) {
          setTagsError(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar as tags."
          );
        }
      }
    }
    void loadTags();

    return () => {
      cancelled = true;
    };
  }, [isPessoal, companyId]);

  async function handleCreateTag(
    data: CreateTagInput,
    scope: TagScope,
    selectedCompanyId?: string
  ): Promise<void> {
    const newTag =
      scope === "personal"
        ? await createPersonalTag(data)
        : await (async () => {
            if (!selectedCompanyId) {
              throw new Error(
                "Nenhuma empresa selecionada."
              );
            }

            return createCompanyTag(
              selectedCompanyId,
              data
            );
          })();

    setTags((previousTags) => [
      ...previousTags,
      newTag,
    ]);
  }

  const menuTags = tags.map((tag) => ({
    id: tag.id,
    nome: tag.name,
    cor: tag.color,
  }));
  return (
    <div
      className={`${styles.dashboard} ${inter.className}`}
    >
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
            <circle
              cx="18"
              cy="7"
              r="3.4"
              fill="#1F3D2E"
            />
            <circle
              cx="8"
              cy="18"
              r="3.4"
              fill="#4A6A41"
            />
            <circle
              cx="15"
              cy="29"
              r="3.4"
              fill="#1F3D2E"
            />
            <circle
              cx="29"
              cy="22"
              r="3.4"
              fill="#B65A46"
            />
          </svg>

          <span className={dmSerif.className}>
            Evidence
          </span>
        </Link>
        <div className={styles.headerActions}>
          <div
            className={styles.environmentSwitcher}
            role="group"
            aria-label="Selecionar ambiente"
          >
            <button
              type="button"
              className={`${
                styles.environmentButton
              } ${
                isPessoal
                  ? styles.environmentActive
                  : ""
              }`}
              onClick={() =>
                setAmbienteAtual("pessoal")
              }
              aria-pressed={isPessoal}
            >
              Pessoal
            </button>

            <button
              type="button"
              className={`${
                styles.environmentButton
              } ${
                !isPessoal
                  ? styles.environmentActive
                  : ""
              }`}
              onClick={() =>
                setAmbienteAtual("empresa")
              }
              aria-pressed={!isPessoal}
            >
              Empresa
            </button>
          </div>

          <details className={styles.menu}>
            <summary className={styles.menuButton}>
              <Image
                src={iconMenu}
                alt=""
                width={20}
                height={20}
              />

              <span>Menu</span>

              <Image
                src={iconSeta}
                alt=""
                width={18}
                height={18}
              />
            </summary>

            <div className={styles.dropdown}>
              <MenuAmbiente
                ambiente={ambienteAtual}
                papelEmpresa={papelEmpresa}
                onCriarTag={() =>
                  setIsTagModalOpen(true)
                }
              />
            </div>
          </details>
        </div>
      </header>

      <main className={styles.main}>
        <nav
          className={styles.breadcrumb}
          aria-label="Localização"
        >
          <span>
            {isPessoal ? "Pessoal" : "Empresa"}
          </span>

          <span className={styles.separator}>
            /
          </span>

          <span className={styles.currentPage}>
            Timeline
          </span>
        </nav>
        <section className={styles.titleSection}>
          <div className={styles.environment}>
            <Image
              src={iconUser}
              alt=""
              width={18}
              height={18}
            />

            <span>
              {isPessoal
                ? "ESPAÇO PESSOAL"
                : "ESPAÇO EMPRESA"}
            </span>
          </div>

          <h1
            className={`${styles.title} ${dmSerif.className}`}
          >
            Sua história
          </h1>
        </section>

        <section className={styles.searchSection}>
          <input
            type="search"
            placeholder="Digite aqui"
            aria-label="Buscar registros"
            className={styles.searchInput}
          />

          <details className={styles.tagsDropdown}>
            <summary className={styles.filterButton}>
              <span>Tags</span>

              <Image
                src={iconSeta}
                alt=""
                width={18}
                height={18}
              />
            </summary>

            <div className={styles.tagsDropdownContent}>
              {tagsError ? (
                <p role="alert">{tagsError}</p>
              ) : (
                <MenuTags tags={menuTags} />
              )}
            </div>
          </details>
          <button
            type="button"
            className={styles.newRecordButton}
            disabled
          >
            <span
              className={styles.plusIcon}
              aria-hidden="true"
            >
              +
            </span>

            <span>Novo registro</span>
          </button>
        </section>

        {/* Timeline será implementada posteriormente */}
        <section
          className={styles.timelineSection}
          aria-label="Timeline de registros"
        />
      </main>
      <TagModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        scope={isPessoal ? "personal" : "company"}
        companyId={companyId}
        companyName={companyName}
        onSubmit={handleCreateTag}
      />
    </div>
  );
}
  