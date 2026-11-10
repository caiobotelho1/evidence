"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import styles from "./SolicitarParticipacaoForm.module.css";

type Empresa = {
  nome: string;
  cnpj: string;
};

function formatarCNPJ(valor: string) {
  const numeros = valor.replace(/\D/g, "").slice(0, 14);

  return numeros
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export default function SolicitarParticipacaoForm() {
  const [cnpj, setCnpj] = useState("");
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [cargo, setCargo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  function buscarEmpresa() {
    setErro("");
    setAviso("");
    setEmpresa(null);

    const numeros = cnpj.replace(/\D/g, "");

    if (numeros.length !== 14) {
      setErro("Informe um CNPJ com 14 dígitos.");
      return;
    }

    setEmpresa({
      nome: "Empresa de demonstração",
      cnpj: formatarCNPJ(numeros),
    });
    
    setAviso(
      "Esta empresa é fictícia. " +
      "A busca real dependerá da integração com a API."
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    if (!empresa) {
      setErro("Busque e selecione uma empresa antes de continuar.");
      return;
    }

    if (!cargo.trim()) {
      setErro("Informe seu cargo ou função na empresa.");
      return;
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.busca}>
        <div className={styles.field}>
          <label htmlFor="cnpj">CNPJ da empresa</label>
          <input
            id="cnpj"
            name="cnpj"
            type="text"
            inputMode="numeric"
            placeholder="Digite aqui"
            value={cnpj}
            onChange={(event) => {
              setCnpj(formatarCNPJ(event.target.value));
              setEmpresa(null);
              setAviso("");
            }}
            maxLength={18}
            required
          />
        </div>

        <button
          type="button"
          className={styles.searchButton}
          onClick={buscarEmpresa}
        >
          Buscar empresa
        </button>
      </div>

      {empresa && (
        <section className={styles.resultado} aria-label="Resultado da busca">
          <span className={styles.resultadoLabel}>
            EMPRESA DE DEMONSTRAÇÃO
          </span>

          <h2>{empresa.nome}</h2>
          <p className={styles.cnpjResultado}>CNPJ: {empresa.cnpj}</p>
          <p className={styles.resultadoDescricao}>
            Confira se esta é a empresa da qual você deseja participar.
          </p>
        </section>
      )}

      <div className={styles.field}>
        <label htmlFor="cargo">Cargo ou função na empresa</label>
        <input
          id="cargo"
          name="cargo"
          type="text"
          placeholder="Digite aqui"
          value={cargo}
          onChange={(event) => setCargo(event.target.value)}
          required
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="mensagem">
          Mensagem para o responsável (opcional)
        </label>
        <textarea
          id="mensagem"
          name="mensagem"
          placeholder="Digite aqui"
          value={mensagem}
          onChange={(event) => setMensagem(event.target.value)}
          rows={4}
        />
      </div>

      <div className={styles.observacao}>
        <span className={styles.infoIcon} aria-hidden="true">i</span>
        <p>
          Sua participação será liberada após a aprovação do responsável.
        </p>
      </div>

      {erro && (
        <p className={styles.erro} role="alert">
          {erro}
        </p>
      )}

      {aviso && (
        <p className={styles.aviso} role="status">
          {aviso}
        </p>
      )}

      <div className={styles.footer}>
        <Link href="/cadastro/sucesso" className={styles.laterLink}>
          Fazer isso depois
        </Link>

        <button type="submit" className={styles.submitButton}>
          Criar minha conta
        </button>
      </div>
    </form>
  );
}
