import Link from "next/link";
import styles from "./AprovaSolicitacaoForm.module.css";

type DadosAprovacao = {
  funcionario: string;
  empresa: string;
  cargo: string;
};

export default function SolicitacaoAprovada({
  funcionario,
  empresa,
  cargo,
}: DadosAprovacao) {
  return (
    <div className={styles.container}>
      <div className={styles.successIcon} aria-hidden="true">
        <svg viewBox="0 0 64 64" fill="none">
          <circle
            cx="32"
            cy="32"
            r="29"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            d="M20 32L28 40L44 24"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className={styles.intro}>
        <h1>Solicitação aprovada!</h1>

        <p>
          A participação do funcionário na sua empresa foi confirmada.
        </p>
      </div>

      <div className={styles.infoPanel}>
        <div className={styles.panelHeader}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle
              cx="12"
              cy="7"
              r="4"
              stroke="currentColor"
              strokeWidth="1.7"
            />
            <path
              d="M4 21V19C4 15.5 7 13 12 13C17 13 20 15.5 20 19V21H4Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>

          <h2>Funcionário vinculado</h2>
        </div>

        <div className={styles.detailRow}>
          <span>Funcionário</span>
          <strong>{funcionario}</strong>
        </div>

        <div className={styles.detailRow}>
          <span>Empresa</span>
          <strong>{empresa}</strong>
        </div>

        <div className={styles.detailRow}>
          <span>Cargo</span>
          <strong>{cargo}</strong>
        </div>
      </div>

      <p className={styles.description}>
        O funcionário já pode acessar a empresa com a sua conta
        e começar a utilizar o sistema.
      </p>

      <div className={styles.footer}>
        <Link
          href="/cadastro/empresa/receber-solicitacao"
          className={styles.submitButton}
        >
          Voltar para as solicitações
        </Link>
      </div>
    </div>
  );
}