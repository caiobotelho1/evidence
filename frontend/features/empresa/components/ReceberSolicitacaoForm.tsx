"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { useAuthUser } from "@/features/auth/components/AuthGate";

import {
  approveMembershipRequest,
  listPendingMembershipRequests,
  rejectMembershipRequest,
  type MembershipRequest,
} from "@/services/membership-requests.service";

import styles from "./ReceberSolicitacaoForm.module.css";

export default function SolicitacaoRecebida() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId") ?? "";

  return (
    <SolicitacaoContent
      key={companyId}
      companyId={companyId}
    />
  );
}

function SolicitacaoContent({
  companyId,
}: {
  companyId: string;
}) {
  const user = useAuthUser();
  const router = useRouter();

  // Verifica se o usuário pode analisar solicitações
  // da empresa recebida pela URL.

  const selectedCompany = user.memberships.find(
    (membership) =>
      membership.companyId === companyId &&
      membership.status === "ACTIVE" &&
      membership.permissions.includes("membership:review")
  );

  const selectedCompanyId = selectedCompany?.companyId ?? "";

  const [requestResult, setRequestResult] = useState<{
    companyId: string;
    requests: MembershipRequest[];
    error: string;
  } | null>(null);

  const [processingRequestId, setProcessingRequestId] =
    useState<string | null>(null);

  const currentResult =
    requestResult?.companyId === selectedCompanyId
      ? requestResult
      : null;

  const requests = currentResult?.requests ?? [];

  const loading =
    Boolean(selectedCompanyId) && currentResult === null;

  const error = currentResult?.error ?? "";

  // Busca somente as solicitações da empresa atual.

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
    if (!selectedCompanyId || processingRequestId !== null) {
      return;
    }

    setProcessingRequestId(request.id);

    try {
      const updatedRequest =
        decision === "approve"
          ? await approveMembershipRequest(
              selectedCompanyId,
              request.id
            )
          : await rejectMembershipRequest(
              selectedCompanyId,
              request.id
            );

      // Remove a solicitação processada da listagem.

      setRequestResult({
        companyId: selectedCompanyId,
        requests: requests.filter(
          (item) => item.id !== request.id
        ),
        error: "",
      });

      if (decision === "approve") {
        const params = new URLSearchParams({
          companyId: selectedCompanyId,
          funcionario: updatedRequest.user.name,
          empresa:
            updatedRequest.company.tradeName?.trim() ||
            updatedRequest.company.legalName,
          cargo:
            updatedRequest.jobTitle?.trim() ||
            "Não informado",
        });

        router.push(
          `/receber-solicitacao/aprovar?${params.toString()}`
        );
      } else {
        const params = new URLSearchParams({
          companyId: selectedCompanyId,
        });

        router.push(
          `/receber-solicitacao/recusar?${params.toString()}`
        );
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
      {!companyId ? (
        <div className={styles.emptyState}>
          <p>
            Selecione uma empresa na timeline para
            visualizar suas solicitações de participação.
          </p>

          <Link href="/tela-principal?ambiente=empresa">
            Ir para o ambiente da empresa
          </Link>
        </div>
      ) : !selectedCompany ? (
        <div className={styles.emptyState} role="alert">
          Você não possui permissão para analisar
          solicitações de participação desta empresa.
        </div>
      ) : (
        <>
          {error && (
            <p
              className={styles.errorMessage}
              role="alert"
            >
              {error}
            </p>
          )}

          {loading && (
            <p
              className={styles.statusMessage}
              role="status"
            >
              Carregando solicitações...
            </p>
          )}

          {!loading &&
            !error &&
            requests.length === 0 && (
              <div className={styles.emptyState}>
                Não há solicitações pendentes para esta empresa.
              </div>
            )}

          {!loading && requests.length > 0 && (
            <div className={styles.requestList}>
              {requests.map((request) => {
                const isProcessing =
                  processingRequestId === request.id;

                const isAnyProcessing =
                  processingRequestId !== null;

                return (
                  <article
                    key={request.id}
                    className={styles.requestCard}
                  >
                    {/* Informações da empresa */}

                    <div className={styles.infoCard}>
                      <div className={styles.iconContainer}>
                        <svg
                          viewBox="0 0 48 48"
                          fill="none"
                          aria-hidden="true"
                        >
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
                          {request.company.tradeName?.trim() ||
                            request.company.legalName}
                        </strong>
                      </div>
                    </div>

                    {/* Informações do funcionário */}

                    <div className={styles.infoCard}>
                      <div className={styles.iconContainer}>
                        <svg
                          viewBox="0 0 48 48"
                          fill="none"
                          aria-hidden="true"
                        >
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

                        <strong>
                          {request.user.name}
                        </strong>

                        <span>
                          {request.user.email}
                        </span>
                      </div>
                    </div>

                    {/* Cargo ou função */}

                    <div className={styles.field}>
                      <span className={styles.label}>
                        Cargo ou função na empresa
                      </span>

                      <div className={styles.fieldValue}>
                        {request.jobTitle || "Não informado"}
                      </div>
                    </div>

                    {/* Mensagem do funcionário */}

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

                    {/* Ações */}

                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.rejectButton}
                        onClick={() =>
                          void handleDecision(request, "reject")
                        }
                        disabled={isAnyProcessing}
                      >
                        {isProcessing
                          ? "Processando..."
                          : "Recusar solicitação"}
                      </button>

                      <button
                        type="button"
                        className={styles.approveButton}
                        onClick={() =>
                          void handleDecision(request, "approve")
                        }
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
