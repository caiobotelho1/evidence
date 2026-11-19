"use client";

import { useEffect, useState } from "react";
import { useAuthUser } from "@/features/auth/components/AuthGate";
import Link from "next/link";
import Image from "next/image";
import { DM_Serif_Display, Inter } from "next/font/google";
import { useSearchParams, useRouter } from "next/navigation";
import {getMyCompanies, type MyCompany,} from "@/services/company.service";

import iconUser from "../../imgs/icon_user.png";
import iconMenu from "../../imgs/icon_menu.png";
import iconSeta from "../../imgs/icon_seta.png";

import TagModal from "@/features/tags/components/TagModal";
import NovaRegistroModal, {
  type CreateRegistroDraft,
} from "@/features/registros/components/NovaRegistroModal";
import MenuAmbiente from "../../features/ambiente/components/MenuAmbiente";
import MenuTags from "../../features/ambiente/components/MenuTags";
import Timeline, {
  type RegistroTimeline,
} from "@/features/ambiente/components/Timeline";

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

import {
  createPersonalRecord,
  createCompanyRecord,
  getPersonalRecords,
  getCompanyRecords,
  type ActivityRecord,
} from "@/services/activity-record.service";

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
  const user = useAuthUser();
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

const selectedMembership = user.memberships.find(
  (membership) =>
    membership.companyId === companyId &&
    membership.status === "ACTIVE"
);

const canCreateRecord = isPessoal
  ? user.personalPermissions.includes("record:write")
  : Boolean(
      selectedMembership?.permissions.includes("record:write")
    );

const canOpenRecordModal = isPessoal
  ? canCreateRecord
  : !companiesLoading &&
    !companiesError &&
    Boolean(companyId) &&
    canCreateRecord;

const recordCreationMessage = isPessoal
  ? canCreateRecord
    ? ""
    : "Você não tem permissão para criar registros pessoais."
  : companiesLoading || companiesError
    ? ""
    : companies.length === 0
      ? "Nenhuma empresa disponível para criar registros."
      : !companyId
        ? "Selecione uma empresa para criar um registro."
        : !canCreateRecord
          ? "Você não tem permissão para criar registros nesta empresa."
          : "";

  // Temporário: substituir pelo papel do usuário autenticado.
  const papelEmpresa: "proprietario" | "funcionario" =
    selectedCompany?.role === "OWNER"
      ? "proprietario"
      : "funcionario";

  const [isTagModalOpen, setIsTagModalOpen] =
    useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] =
    useState(false);

  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsError, setTagsError] = useState("");
  const [tagsLoading, setTagsLoading] = useState(false);

  // Carrega as tags do ambiente selecionado.
  useEffect(() => {
    let cancelled = false;

    async function loadTags() {
      setTags([]);
      setTagsError("");
      setTagsLoading(true);

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
      } finally {
        if (!cancelled) {
          setTagsLoading(false);
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

  const [records, setRecords] = useState<ActivityRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRecords() {
      const canLoad = isPessoal || Boolean(companyId);

      setRecords([]);
      setRecordsError("");
      setRecordsLoading(canLoad);

      if (!canLoad) return;

      try {
        const result = isPessoal
          ? await getPersonalRecords()
          : await getCompanyRecords(companyId!);

        if (!cancelled) {
          setRecords(result);
        }
      } catch (error) {
        if (!cancelled) {
          setRecordsError(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os registros."
          );
        }
      } finally {
        if (!cancelled) {
          setRecordsLoading(false);
        }
      }
    }

    void loadRecords();

    return () => {
      cancelled = true;
    };
  }, [isPessoal, companyId]);

  const registrosTimeline: RegistroTimeline[] = records.map((record) => ({
    id: record.id,
    titulo: record.title,
    autor: record.author.name,
    data: record.createdAt,
    descricao: record.description,
    tags: record.tags.map((tag) => ({
      id: tag.id,
      nome: tag.name,
      cor: tag.color,
    })),
  }));

  async function handleCreateRecord(
    data: CreateRegistroDraft
  ): Promise<void> {
    if (data.files.length > 0) {
      throw new Error(
        "O anexo de arquivos ainda não está disponível. Remova os arquivos para salvar o registro."
      );
    }

    const payload = {
      title: data.title,
      description: data.description,
      status: data.status,
      tagIds: data.tagIds,
    };

    let record: ActivityRecord;

    if (isPessoal) {
      record = await createPersonalRecord(payload);
    } else {
      if (!companyId) {
        throw new Error("Nenhuma empresa selecionada.");
      }

      record = await createCompanyRecord(companyId, payload);
    }

    setRecords((previousRecords) => [record, ...previousRecords]);
  }

  return (
    <div
      className={`${styles.dashboard} ${inter.className}`}
    >
      <header className={styles.header}>
      <Link
        href="/"
        aria-label="Evidence — página inicial"
        className={styles.logo}
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

          {!isPessoal && (
            <div className={styles.companySelector}>
              <label
                htmlFor="empresa-atual"
                className={styles.companySelectorLabel}
              >
                Empresa
              </label>

              {companiesLoading ? (
                <p className={styles.companySelectorStatus} role="status">
                  Carregando empresas...
                </p>
              ) : companiesError ? (
                <p className={styles.companySelectorError} role="alert">
                  {companiesError}
                </p>
              ) : companies.length === 0 ? (
                <p className={styles.companySelectorStatus} role="status">
                  Nenhuma empresa disponível para sua conta.
                </p>
              ) : companies.length === 1 ? (
                <p className={styles.companySelectorName}>
                  {companies[0].tradeName?.trim() || companies[0].legalName}
                </p>
              ) : (
                <select
                  id="empresa-atual"
                  className={styles.companySelect}
                  value={selectedCompanyId}
                  onChange={(event) =>
                    setSelectedCompanyId(event.target.value)
                  }
                >
                  <option value="">Selecione uma empresa</option>

                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.tradeName?.trim() || company.legalName}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
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
            disabled={!canOpenRecordModal}
            onClick={() => setIsRecordModalOpen(true)}
            aria-describedby={
              recordCreationMessage
                ? "record-creation-message"
                : undefined
            }
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

        {recordCreationMessage && (
          <p
            id="record-creation-message"
            className={styles.recordCreationMessage}
            role="status"
          >
            {recordCreationMessage}
          </p>
        )}

      <section
        className={styles.timelineSection}
        aria-label="Timeline de registros"
      >
        {recordsLoading ? (
          <p className={styles.recordCreationMessage} role="status">
            Carregando registros...
          </p>
        ) : recordsError ? (
          <p className={styles.recordCreationMessage} role="alert">
            {recordsError}
          </p>
        ) : (
          <Timeline registros={registrosTimeline} />
        )}
      </section>
      </main>
      <TagModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        scope={isPessoal ? "personal" : "company"}
        companyId={companyId}
        companyName={companyName}
        onSubmit={handleCreateTag}
      />

      <NovaRegistroModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSubmit={handleCreateRecord}
        tags={tags}
        tagsLoading={tagsLoading}
        tagsError={tagsError}
      />
    </div>
  );
}
  