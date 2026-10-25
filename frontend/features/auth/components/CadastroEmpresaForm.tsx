
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import styles from "./CadastroEmpresaForm.module.css";

export default function CadastroEmpresaForm() {
  const [cnpj, setCnpj] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [nomeFantasia, setNomeFantasia] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  function formatarCNPJ(valor: string) {
    const numeros = valor.replace(/\D/g, "").slice(0, 14);

    return numeros
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  function formatarTelefone(valor: string) {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);

    if (numeros.length <= 2) {
      return numeros;
    }

    if (numeros.length <= 6) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    }

    if (numeros.length <= 10) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(
        2,
        6
      )}-${numeros.slice(6)}`;
    }

    return `(${numeros.slice(0, 2)}) ${numeros.slice(
      2,
      7
    )}-${numeros.slice(7)}`;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setMensagem("");

    const cnpjNumeros = cnpj.replace(/\D/g, "");

    if (!cnpj.trim() || !razaoSocial.trim() || !email.trim()) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    if (cnpjNumeros.length !== 14) {
      setErro("Informe um CNPJ com 14 dígitos.");
      return;
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailValido) {
      setErro("Informe um e-mail válido.");
      return;
    }

    // TODO: integrar com a API de cadastro de empresas.
    // O backend deverá validar o CNPJ, os dados da empresa
    // e a permissão do usuário responsável.
    //
    // Após confirmação do backend, redirecionar para a
    // página apropriada do fluxo.

    setMensagem(
      "Dados validados! O cadastro da empresa será concluído " +
        "quando a integração com o backend estiver disponível."
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.dadosEmpresa}>
        <div className={styles.field}>
          <label htmlFor="cnpj">CNPJ</label>
          <input
            id="cnpj"
            name="cnpj"
            type="text"
            inputMode="numeric"
            placeholder="Digite aqui"
            value={cnpj}
            onChange={(event) =>
              setCnpj(formatarCNPJ(event.target.value))
            }
            maxLength={18}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="razaoSocial">Razão social</label>
          <input
            id="razaoSocial"
            name="razaoSocial"
            type="text"
            placeholder="Digite aqui"
            value={razaoSocial}
            onChange={(event) =>
              setRazaoSocial(event.target.value)
            }
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="nomeFantasia">
            Nome fantasia (opcional)
          </label>
          <input
            id="nomeFantasia"
            name="nomeFantasia"
            type="text"
            placeholder="Digite aqui"
            value={nomeFantasia}
            onChange={(event) =>
              setNomeFantasia(event.target.value)
            }
          />
        </div>

        <div className={styles.contato}>
          <div className={styles.field}>
            <label htmlFor="telefone">
              Telefone da empresa (opcional)
            </label>
            <input
              id="telefone"
              name="telefone"
              type="tel"
              placeholder="Digite aqui"
              value={telefone}
              onChange={(event) =>
                setTelefone(formatarTelefone(event.target.value))
              }
              maxLength={15}
              autoComplete="tel"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">E-mail da empresa</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Digite aqui"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              required
            />
          </div>
        </div>
      </div>

      <p className={styles.observacao}>
        Você será o responsável pela empresa no Evidence e poderá
        aprovar solicitações de participação da equipe.
      </p>

      {erro && (
        <p className={styles.erro} role="alert">
          {erro}
        </p>
      )}

      {mensagem && (
        <p className={styles.mensagem} role="status">
          {mensagem}
        </p>
      )}

      <div className={styles.footer}>
        <Link
          href="/cadastro/sucesso"
          className={styles.laterLink}
        >
          Cadastrar depois
        </Link>

        <button type="submit" className={styles.submitButton}>
          Criar minha conta
        </button>
      </div>
    </form>
  );
}
