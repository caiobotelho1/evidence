"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/features/auth/components/AuthGate";
import {
  approveMembershipRequest,
  listPendingMembershipRequests,
  rejectMembershipRequest,
  type MembershipRequest,
} from "@/services/membership-requests.service";
import styles from "./ReceberSolicitacaoForm.module.css";

export default function SolicitacaoRecebida() {
  const user = useAuthUser();
  const router = useRouter();

  // Empresas nas quais o usuário pode analisar solicitações.
  const companies = useMemo(() => {
    const companyIds = new Set<string>();

    return user.memberships.filter((membership) => {
      const hasPermission =
        membership.status === "ACTIVE" &&
        membership.permissions.includes("membership:review");

      if (!hasPermission || companyIds.has(membership.companyId)) {
        return false;
      }

      companyIds.add(membership.companyId);
      return true;
    });
  }, [user.memberships]);

  // Seleciona inicialmente a primeira empresa disponível.
  const [selectedCompanyId, setSelectedCompanyId] = useState(
    () => companies[0]?.companyId ?? ""
  );

  // Guarda o resultado da consulta e possíveis erros.
  const [requestResult, setRequestResult] = useState<{
    companyId: string;
    requests: MembershipRequest[];
    error: string;
  } | null>(null);

  const [processingRequestId, setProcessingRequestId] = useState<string | null>(
    null
  );

  // Só utiliza o resultado se pertencer à empresa selecionada.
  const currentResult =
    requestResult?.companyId === selectedCompanyId ? requestResult : null;

  const requests = currentResult?.requests ?? [];
  const loading = Boolean(selectedCompanyId) && currentResult === null;
  const error = currentResult?.error ?? "";

  // Busca as solicitações da empresa selecionada.
  useEffect(() => {
    if (!selectedCompanyId) return;

    let cancelled = false;

    listPendingMembershipRequests(selectedCompanyId)
      .then((data) => {
        if (!cancelled) {
          setRequestResult({
            companyId: selectedCompanyId,
            requests: data.filter(
              (request) => request.status === "PENDING"
            ),
            error: "",
          });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setRequestResult({
            companyId: selectedCompanyId,
            requests: [],
            error:
              err instanceof Error
                ? err.message
                : "Não foi possível carregar as solicitações.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCompanyId]);

  // Aprova ou recusa uma solicitação pela API.
  async function handleDecision(
    request: MembershipRequest,
    decision: "approve" | "reject"
  ) {
    if (!selectedCompanyId) return;

    setProcessingRequestId(request.id);

    try {
      const updatedRequest =
        decision === "approve"
          ? await approveMembershipRequest(selectedCompanyId, request.id)
          : await rejectMembershipRequest(selectedCompanyId, request.id);

      if (decision === "approve") {
        const params = new URLSearchParams({
          funcionario: updatedRequest.user.name,
          empresa:
            updatedRequest.company.tradeName?.trim() ||
            updatedRequest.company.legalName,
          cargo: updatedRequest.jobTitle?.trim() || "Não informado",
        });

        router.push(
          `/cadastro/empresa/receber-solicitacao/aprovar?${params.toString()}`
        );
      } else {
        router.push("/cadastro/empresa/receber-solicitacao/recusar");
      }
    } catch (err: unknown) {
      setRequestResult({
        companyId: selectedCompanyId,
        requests,
        error:
          err instanceof Error
            ? err.message
            : "Não foi possível atualizar a solicitação. Tente novamente.",
      });
    } finally {
      setProcessingRequestId(null);
    }
  }

  return (
    <div className={styles.container}>
      {companies.length === 0 ? (
        <div className={styles.emptyState}>
          Você não possui uma empresa ativa com permissão para analisar
          solicitações de participação.
        </div>
      ) : (
        <>
          {companies.length > 1 && (
            <div className={styles.companySelector}>
              <label htmlFor="company-select">Selecione a empresa</label>

              <select
                id="company-select"
                value={selectedCompanyId}
                onChange={(event) => {
                  setRequestResult(null);
                  setSelectedCompanyId(event.target.value);
                }}
              >
                {companies.map((company) => (
                  <option key={company.companyId} value={company.companyId}>
                    {company.company.tradeName || company.company.legalName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <p className={styles.errorMessage} role="alert">
              {error}
            </p>
          )}

          {loading && (
            <p className={styles.statusMessage} role="status">
              Carregando solicitações...
            </p>
          )}

          {!loading && !error && selectedCompanyId && requests.length === 0 && (
            <div className={styles.emptyState}>
              Não há solicitações pendentes para esta empresa.
            </div>
          )}

          {!loading && requests.length > 0 && (
            <div className={styles.requestList}>
              {requests.map((request) => {
                const isProcessing = processingRequestId === request.id;
                const isAnyProcessing = processingRequestId !== null;

                return (
                  <article key={request.id} className={styles.requestCard}>
                    <div className={styles.infoCard}>
                      <div className={styles.iconContainer}>
                        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                          <rect
                            x="12"
                            y="5"
                            width="24"
                            height="38"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="3"
                          />
                          <path
                            d="M20 43V32H28V43"
                            stroke="currentColor"
                            strokeWidth="3"
                          />
                          <path
                            d="M19 14H21M27 14H29M19 22H21M27 22H29"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                      <div className={styles.divider} />

                      <div className={styles.infoText}>
                        <span>Empresa</span>
                        <strong>
                          {request.company.tradeName ||
                            request.company.legalName}
                        </strong>
                      </div>
                    </div>

                    <div className={styles.infoCard}>
                      <div className={styles.iconContainer}>
                        <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
                          <circle
                            cx="24"
                            cy="13"
                            r="8"
                            stroke="currentColor"
                            strokeWidth="3"
                          />
                          <path
                            d="M9 41V36C9 29 15 25 24 25C33 25 39 29 39 36V41H9Z"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>

                      <div className={styles.divider} />

                      <div className={styles.infoText}>
                        <span>Funcionário</span>
                        <strong>{request.user.name}</strong>
                        <span>{request.user.email}</span>
                      </div>
                    </div>

                    <div className={styles.field}>
                      <span className={styles.label}>
                        Cargo ou função na empresa
                      </span>

                      <div className={styles.fieldValue}>
                        {request.jobTitle || "Não informado"}
                      </div>
                    </div>

                    {request.message?.trim() && (
                      <div className={styles.field}>
                        <span className={styles.label}>
                          Mensagem do funcionário
                        </span>

                        <div className={styles.messageBox}>
                          {request.message}
                        </div>
                      </div>
                    )}

                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.rejectButton}
                        onClick={() => void handleDecision(request, "reject")}
                        disabled={isAnyProcessing}
                      >
                        {isProcessing
                          ? "Processando..."
                          : "Recusar solicitação"}
                      </button>

                      <button
                        type="button"
                        className={styles.approveButton}
                        onClick={() => void handleDecision(request, "approve")}
                        disabled={isAnyProcessing}
                      >
                        {isProcessing
                          ? "Processando..."
                          : "Aprovar solicitação"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}