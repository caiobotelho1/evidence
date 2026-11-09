"use client";

import styles from "./ReceberSolicitacaoForm.module.css";

type Solicitacao = {
  id: string;
  empresa: string;
  funcionario: string;
  cargo: string;
  mensagem?: string;
};

export default function SolicitacaoRecebida() {
  //receber os dados reais da solicitação pela API.
  const solicitacao: Solicitacao = {
    id: "1",
    empresa: "Nome da Empresa",
    funcionario: "Nome do Funcionário",
    cargo: "Auxiliar administrativo",
    mensagem:
      "Olá! Gostaria de fazer parte da equipe e contribuir " +
      "com as atividades administrativas da empresa.",
  };

  function handleAprovar() {
    //integrar com a API para aprovar a solicitação.
  }

  function handleRecusar() {
    //integrar com a API para recusar a solicitação.
  }

  return (
    <div className={styles.container}>
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
          <strong>{solicitacao.empresa}</strong>
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
          <strong>{solicitacao.funcionario}</strong>
        </div>
      </div>

      {/* Cargo informado */}
      <div className={styles.field}>
        <span className={styles.label}>
          Cargo ou função na empresa
        </span>

        <div className={styles.fieldValue}>
          {solicitacao.cargo}
        </div>
      </div>

      {/* Mensagem opcional */}
      {solicitacao.mensagem?.trim() && (
        <div className={styles.field}>
          <span className={styles.label}>
            Mensagem do funcionário
          </span>

          <div className={styles.messageBox}>
            {solicitacao.mensagem}
          </div>
        </div>
      )}

      {/* Ações */}
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.rejectButton}
          onClick={handleRecusar}
          disabled
          title="Disponível após a integração com a API"
        >
          Recusar solicitação
        </button>

        <button
          type="button"
          className={styles.approveButton}
          onClick={handleAprovar}
          disabled
          title="Disponível após a integração com a API"
        >
          Aprovar solicitação
        </button>
      </div>
    </div>
  );
}
