"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ApiError } from "@/services/api";
import {
  getCompanyByCnpj,
  type CompanyByCnpj,
} from "@/services/companies.service";
import { createMembershipRequest } from "@/services/memberships.service";

import styles from "./SolicitarParticipacaoForm.module.css";

function formatarCNPJ(valor: string) {
  const numeros = valor.replace(/\D/g, "").slice(0, 14);

  return numeros
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export default function SolicitarParticipacaoForm() {
  const router = useRouter();

  const [cnpj, setCnpj] = useState("");
  const [empresa, setEmpresa] = useState<CompanyByCnpj | null>(null);
  const [cargo, setCargo] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  const [buscando, setBuscando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function buscarEmpresa() {
    setErro("");
    setAviso("");
    setEmpresa(null);

    const numeros = cnpj.replace(/\D/g, "");

    if (numeros.length !== 14) {
      setErro("Informe um CNPJ com 14 dígitos.");
      return;
    }

    setBuscando(true);

    try {
      const resultado = await getCompanyByCnpj(numeros);

      setEmpresa(resultado);
      setAviso("Empresa encontrada! Confira os dados antes de continuar.");
    } catch (error) {
      setErro(mensagemDeErro(error, "busca"));
    } finally {
      setBuscando(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setAviso("");

    if (!empresa) {
      setErro("Busque e selecione uma empresa antes de continuar.");
      return;
    }

    if (!cargo.trim()) {
      setErro("Informe seu cargo ou função na empresa.");
      return;
    }

    setEnviando(true);

    try {
      const solicitacao = await createMembershipRequest(empresa.id, {
        jobTitle: cargo.trim(),
        message: mensagem.trim() || undefined,
      });

      const parametros = new URLSearchParams({
        empresa: empresa.tradeName || empresa.legalName,
        cargo: solicitacao.jobTitle,
      });

      router.push(
        `/cadastro/solicitar-participacao/sucesso?${parametros.toString()}`
      );
    } catch (error) {
      setErro(mensagemDeErro(error, "solicitacao"));
      setEnviando(false);
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
              setErro("");
            }}
            maxLength={18}
            required
          />
        </div>

        <button
          type="button"
          className={styles.searchButton}
          onClick={buscarEmpresa}
          disabled={buscando || enviando}
        >
          {buscando ? "Buscando..." : "Buscar empresa"}
        </button>
      </div>

      {empresa && (
        <section className={styles.resultado} aria-label="Resultado da busca">
          <span className={styles.resultadoLabel}>
            EMPRESA ENCONTRADA
          </span>

          <h2>{empresa.tradeName || empresa.legalName}</h2>

          {empresa.tradeName && (
            <p>{empresa.legalName}</p>
          )}

          <p className={styles.cnpjResultado}>
            CNPJ: {formatarCNPJ(empresa.cnpj)}
          </p>

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
          maxLength={100}
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
          maxLength={500}
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

        <button
          type="submit"
          className={styles.submitButton}
          disabled={enviando || buscando}
        >
          {enviando ? "Enviando solicitação..." : "Enviar solicitação"}
        </button>
      </div>
    </form>
  );
}

function mensagemDeErro(
  error: unknown,
  operacao: "busca" | "solicitacao"
): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Sua sessão não está ativa. Faça login novamente para continuar.";
    }

    if (error.status === 404 && operacao === "busca") {
      return "Não encontramos uma empresa com esse CNPJ.";
    }

    const primeiroErro = error.fields
      ? Object.values(error.fields).flat()[0]
      : undefined;

    return primeiroErro ?? error.message;
  }

  return "Ocorreu um erro inesperado. Tente novamente.";
}
