"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DM_Serif_Display, Inter } from "next/font/google";

import { AuthGate } from "@/features/auth/components/AuthGate";
import RecordDetailsBox from "@/features/ambiente/components/RecordDetailsBox";
import {
  getCompanyRecords,
  getPersonalRecords,
  type ActivityRecord,
  type ActivityRecordListFilters,
} from "@/services/activity-record.service";
import styles from "./registros.module.css";

const inter = Inter({ subsets: ["latin"] });
const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

const EMPTY_FILTERS: ActivityRecordListFilters = {
  search: "",
  tagIds: [],
  statuses: [],
  dateFrom: "",
  dateTo: "",
  employeeIds: [],
};

const STATUS_LABELS: Record<ActivityRecord["status"], string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluído",
  CANCELED: "Cancelado",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(new Date(value));
}

function RegistrosContent() {
  const searchParams = useSearchParams();
  const isCompanyEnvironment = searchParams.get("ambiente") === "empresa";
  const companyId = searchParams.get("companyId") ?? "";
  const [records, setRecords] = useState<ActivityRecord[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRecords() {
      setRecords([]);
      setSelectedRecordId("");
      setError("");

      if (isCompanyEnvironment && !companyId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const result = isCompanyEnvironment
          ? await getCompanyRecords(companyId, EMPTY_FILTERS)
          : await getPersonalRecords(EMPTY_FILTERS);

        if (!cancelled) {
          setRecords(
            [...result].sort(
              (first, second) =>
                new Date(second.createdAt).getTime() -
                new Date(first.createdAt).getTime(),
            ),
          );
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar os registros.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadRecords();

    return () => {
      cancelled = true;
    };
  }, [companyId, isCompanyEnvironment]);

  const dashboardHref = isCompanyEnvironment
    ? "/tela-principal?ambiente=empresa"
    : "/tela-principal?ambiente=pessoal";

  return (
    <main className={`${styles.page} ${inter.className}`}>
      <header className={styles.header}>
        <Link
          href="/"
          aria-label="Evidence — página inicial"
          className={styles.brand}
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

        <Link className={styles.backLink} href={dashboardHref}>
          <span aria-hidden="true">←</span>
          Voltar à timeline
        </Link>
      </header>

      <div className={styles.content}>
        <div className={styles.pageTitle}>
          <h1>Registros</h1>
          <p>
            {isCompanyEnvironment
              ? "Registros da empresa"
              : "Seus registros pessoais"}
          </p>
        </div>

        <section className={styles.list} aria-label="Lista de registros">
          {loading ? (
            <p className={styles.message} role="status">
              Carregando registros…
            </p>
          ) : isCompanyEnvironment && !companyId ? (
            <div className={styles.message}>
              <p>Volte ao ambiente da empresa e selecione uma empresa para ver os registros.</p>
              <Link href={dashboardHref}>Ir para o ambiente da empresa</Link>
            </div>
          ) : error ? (
            <p className={`${styles.message} ${styles.error}`} role="alert">
              {error}
            </p>
          ) : records.length === 0 ? (
            <p className={styles.message}>Ainda não há registros neste ambiente.</p>
          ) : (
            records.map((record) => (
              <button
                key={record.id}
                className={styles.record}
                type="button"
                onClick={() => setSelectedRecordId(record.id)}
                aria-label={`Ver detalhes de ${record.title}`}
              >
                <span className={styles.recordHeader}>
                  <span className={styles.title}>{record.title}</span>
                  <span
                    className={styles.status}
                    data-status={record.status}
                  >
                    {STATUS_LABELS[record.status]}
                  </span>
                </span>
                <span className={styles.metadata}>
                  <span>{formatDate(record.createdAt)}</span>
                  <span>Por {record.author.name}</span>
                </span>
                <span className={styles.tags}>
                  {record.tags.length ? (
                    record.tags.map((tag) => (
                      <span
                        className={styles.tag}
                        key={tag.id}
                        style={{ borderColor: tag.color }}
                      >
                        <span
                          className={styles.tagColor}
                          style={{ backgroundColor: tag.color }}
                          aria-hidden="true"
                        />
                        {tag.name}
                      </span>
                    ))
                  ) : (
                    <span className={styles.noTags}>Sem tags</span>
                  )}
                </span>
              </button>
            ))
          )}
        </section>

        {selectedRecordId && (
          <RecordDetailsBox
            recordId={selectedRecordId}
            isPersonal={!isCompanyEnvironment}
            companyId={companyId || undefined}
            onClose={() => setSelectedRecordId("")}
          />
        )}
      </div>
    </main>
  );
}

export default function RegistrosPage() {
  return (
    <AuthGate>
      <Suspense fallback={<main className={styles.page}>Carregando registros…</main>}>
        <RegistrosContent />
      </Suspense>
    </AuthGate>
  );
}
