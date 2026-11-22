"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthUser } from "@/features/auth/components/AuthGate";
import Link from "next/link";
import Image from "next/image";
import { DM_Serif_Display, Inter } from "next/font/google";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getCompanyMembers,
  getMyCompanies,
  type CompanyMember,
  type MyCompany,
} from "@/services/company.service";

import iconUser from "../../imgs/icon_user.png";
import iconMenu from "../../imgs/icon_menu.png";
import iconSeta from "../../imgs/icon_seta.png";

import TagModal from "@/features/tags/components/TagModal";
import NovaRegistroModal, {
  type CreateRegistroDraft,
} from "@/features/registros/components/NovaRegistroModal";
import MenuAmbiente from "../../features/ambiente/components/MenuAmbiente";
import MenuTags from "@/features/ambiente/components/MenuTags";
import RecordFilters from "@/features/ambiente/components/RecordFilters";
import Timeline, {
  type RegistroTimeline,
} from "@/features/ambiente/components/Timeline";
import RecordDetailsBox from "@/features/ambiente/components/RecordDetailsBox";

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
  type ActivityRecordListFilters,
  type ActivityRecord,
} from "@/services/activity-record.service";

import type { Tag } from "@/services/tag.service";
import type { ActivityRecordFilterCriteria } from "@/features/ambiente/filters/record-filters";
import styles from "./telaPrincipal.module.css";

const inter = Inter({ subsets: ["latin"] });

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

type Ambiente = "pessoal" | "empresa";

const EMPTY_RECORD_FILTERS: ActivityRecordFilterCriteria = {
  tagIds: [],
  statuses: [],
  dateFrom: "",
  dateTo: "",
  employeeIds: [],
};

export default function DashboardClient() {
  const tagListDropdownRef = useRef<HTMLDetailsElement>(null);
  const user = useAuthUser();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    function closeTagListOnOutsidePointer(event: PointerEvent) {
      const target = event.target;
      if (
        target instanceof Node &&
        tagListDropdownRef.current &&
        !tagListDropdownRef.current.contains(target)
      ) {
        tagListDropdownRef.current.open = false;
      }
    }

    document.addEventListener("pointerdown", closeTagListOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeTagListOnOutsidePointer);
  }, []);

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
const isCompanyOwner = !isPessoal && selectedCompany?.role === "OWNER";

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

  const recordScopeKey = `${isPessoal ? "personal" : "company"}:${companyId ?? ""}`;
  const [recordControls, setRecordControls] = useState({
    scopeKey: "",
    query: "",
    criteria: EMPTY_RECORD_FILTERS,
  });
  const activeRecordControls = recordControls.scopeKey === recordScopeKey
    ? recordControls
    : { scopeKey: recordScopeKey, query: "", criteria: EMPTY_RECORD_FILTERS };
  const recordSearchQuery = activeRecordControls.query;
  const recordFilterCriteria = activeRecordControls.criteria;
  const recordFilterCriteriaKey = JSON.stringify(recordFilterCriteria);
  const [debouncedRecordSearchQuery, setDebouncedRecordSearchQuery] = useState("");
  const setRecordSearchQuery = (query: string) => {
    setRecordControls({ ...activeRecordControls, scopeKey: recordScopeKey, query });
  };
  const setRecordFilterCriteria = (criteria: ActivityRecordFilterCriteria) => {
    setRecordControls({ ...activeRecordControls, scopeKey: recordScopeKey, criteria });
  };

  const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([]);
  const [companyMembersLoading, setCompanyMembersLoading] = useState(false);
  const [companyMembersError, setCompanyMembersError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCompanyMembers() {
      setCompanyMembers([]);
      setCompanyMembersError("");

      if (!companyId || !isCompanyOwner) {
        setCompanyMembersLoading(false);
        return;
      }

      setCompanyMembersLoading(true);

      try {
        const members = await getCompanyMembers(companyId);
        if (!cancelled) setCompanyMembers(members);
      } catch (error) {
        if (!cancelled) {
          setCompanyMembersError(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os funcionários.",
          );
        }
      } finally {
        if (!cancelled) setCompanyMembersLoading(false);
      }
    }

    void loadCompanyMembers();

    return () => {
      cancelled = true;
    };
  }, [companyId, isCompanyOwner]);

  const [recordResults, setRecordResults] = useState<{
    scopeKey: string;
    items: ActivityRecord[];
  }>({ scopeKey: "", items: [] });
  const records = recordResults.scopeKey === recordScopeKey
    ? recordResults.items
    : [];
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState("");
  const [recordRefreshKey, setRecordRefreshKey] = useState(0);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setDebouncedRecordSearchQuery(recordSearchQuery),
      300,
    );

    return () => window.clearTimeout(timeoutId);
  }, [recordSearchQuery]);

  const recordListFilters = useMemo(() => {
    const criteria = JSON.parse(recordFilterCriteriaKey) as ActivityRecordFilterCriteria;

    return {
      search: debouncedRecordSearchQuery,
      tagIds: criteria.tagIds,
      statuses: criteria.statuses,
      dateFrom: criteria.dateFrom,
      dateTo: criteria.dateTo,
      employeeIds: isCompanyOwner ? criteria.employeeIds : [],
    } satisfies ActivityRecordListFilters;
  }, [recordFilterCriteriaKey, debouncedRecordSearchQuery, isCompanyOwner]);

  useEffect(() => {
    let cancelled = false;

    async function loadRecords() {
      const canLoad = isPessoal || Boolean(companyId);

      setRecordsError("");
      setRecordsLoading(canLoad);

      if (!canLoad) return;

      try {
        const result = isPessoal
          ? await getPersonalRecords(recordListFilters)
          : await getCompanyRecords(companyId!, recordListFilters);

        if (!cancelled) {
          setRecordResults({ scopeKey: recordScopeKey, items: result });
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
  }, [
    isPessoal,
    companyId,
    recordScopeKey,
    recordListFilters,
    recordRefreshKey,
  ]);

  const registrosTimeline: RegistroTimeline[] = records.map((record) => ({
    id: record.id,
    titulo: record.title,
    autor: record.author.name,
    data: record.createdAt,
    status: record.status,
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

    if (isPessoal) {
      await createPersonalRecord(payload);
    } else {
      if (!companyId) {
        throw new Error("Nenhuma empresa selecionada.");
      }

      await createCompanyRecord(companyId, payload);
    }

    const currentFilters = {
      ...recordListFilters,
      search: recordSearchQuery.trim(),
    };

    try {
      const refreshedRecords = isPessoal
        ? await getPersonalRecords(currentFilters)
        : await getCompanyRecords(companyId!, currentFilters);

      setRecordResults({ scopeKey: recordScopeKey, items: refreshedRecords });
    } catch (error) {
      const reason = error instanceof Error ? `: ${error.message}` : ".";
      setRecordsError(
        `Registro salvo, mas não foi possível atualizar a listagem${reason}`,
      );
    }
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
                companyId={companyId}
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

        <section className={styles.searchSection} aria-label="Busca e filtros de registros">
          <input
            type="search"
            placeholder="Buscar por título ou conteúdo"
            aria-label="Buscar por título ou conteúdo"
            className={styles.searchInput}
            value={recordSearchQuery}
            onChange={(event) => setRecordSearchQuery(event.target.value)}
          />

          <RecordFilters
            tags={menuTags}
            tagsLoading={tagsLoading}
            tagsError={tagsError}
            employees={companyMembers.map((member) => ({
              id: member.user.id,
              name: member.user.name,
            }))}
            employeesLoading={companyMembersLoading}
            employeesError={companyMembersError}
            showEmployeeFilter={Boolean(isCompanyOwner)}
            criteria={recordFilterCriteria}
            onChange={setRecordFilterCriteria}
          />

          <details ref={tagListDropdownRef} className={styles.tagsDropdown}>
            <summary className={styles.filterButton}>
              <span>Tags</span>
              <Image src={iconSeta} alt="" width={18} height={18} />
            </summary>
            <div className={styles.tagsDropdownContent}>
              {tagsError ? (
                <p role="alert">{tagsError}</p>
              ) : tagsLoading ? (
                <p role="status">Carregando tags...</p>
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
          <Timeline
            registros={registrosTimeline}
            onOpenDetails={setSelectedRecordId}
          />
        )}
      </section>
      </main>
      {selectedRecordId && (
        <RecordDetailsBox
          recordId={selectedRecordId}
          isPersonal={isPessoal}
          companyId={companyId}
          onClose={() => setSelectedRecordId(null)}
          onUpdated={() => setRecordRefreshKey((current) => current + 1)}
        />
      )}
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

