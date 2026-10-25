"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import styles from "./CadastroForm.module.css";

type TipoUso = "pessoal" | "empresa";
type VinculoEmpresa = "responsavel" | "funcionario";
type MomentoCadastro = "agora" | "depois";
type SolicitacaoEmpresa = "agora" | "depois";

export default function CadastroForm() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const [tipoUso, setTipoUso] = useState<TipoUso>("pessoal");

  const [vinculo, setVinculo] = useState<VinculoEmpresa | null>(null);

  const [momentoCadastro, setMomentoCadastro] =
    useState<MomentoCadastro>("agora");

  const [solicitacaoEmpresa, setSolicitacaoEmpresa] =
    useState<SolicitacaoEmpresa>("agora");

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const usaEmpresa = tipoUso === "empresa";
  const responsavel = usaEmpresa && vinculo === "responsavel";
  const funcionario = usaEmpresa && vinculo === "funcionario";

  function alterarTipoUso(valor: TipoUso) {
    setTipoUso(valor);
    setVinculo(null);
    setErro("");
    setMensagem("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setMensagem("");

    if (
      !nome.trim() ||
      !telefone.trim() ||
      !email.trim() ||
      !senha ||
      !confirmarSenha
    ) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas informadas não coincidem.");
      return;
    }

    if (usaEmpresa && !vinculo) {
      setErro("Informe seu vínculo com a empresa.");
      return;
    }

    if (responsavel && momentoCadastro === "agora") {
      setMensagem(
        "Dados validados. Após a criação e autenticação da conta, " +
          "você será encaminhado ao cadastro de empresa."
      );
      return;
    }

    if (funcionario && solicitacaoEmpresa === "agora") {
      setMensagem(
        "Dados validados. Após criar sua conta, você poderá " +
          "solicitar participação na empresa."
      );
      return;
    }

    setMensagem(
      "Dados validados. A criação da conta estará disponível " +
        "quando o formulário for integrado à API."
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.dados}>
        <div className={styles.field}>
          <label htmlFor="nome">Qual é o seu nome?</label>
          <input
            id="nome"
            name="nome"
            type="text"
            placeholder="Digite aqui"
            autoComplete="name"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            required
          />
        </div>

        <div className={styles.contato}>
          <div className={styles.field}>
            <label htmlFor="telefone">Telefone</label>
            <input
              id="telefone"
              name="telefone"
              type="tel"
              placeholder="Digite aqui"
              autoComplete="tel"
              value={telefone}
              onChange={(event) => setTelefone(event.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Digite aqui"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.senhas}>
          <div className={styles.field}>
            <label htmlFor="senha">Senha</label>

            <div className={styles.passwordWrapper}>
              <input
                id="senha"
                name="senha"
                type={mostrarSenha ? "text" : "password"}
                placeholder="Digite aqui"
                autoComplete="new-password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                required
              />

              <button
                type="button"
                className={styles.showPassword}
                onClick={() => setMostrarSenha(!mostrarSenha)}
                aria-label={
                  mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                }
                aria-pressed={mostrarSenha}
              >
                {mostrarSenha ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmarSenha">Confirmar senha</label>

            <div className={styles.passwordWrapper}>
              <input
                id="confirmarSenha"
                name="confirmarSenha"
                type={mostrarConfirmacao ? "text" : "password"}
                placeholder="Digite aqui"
                autoComplete="new-password"
                value={confirmarSenha}
                onChange={(event) =>
                  setConfirmarSenha(event.target.value)
                }
                required
              />

              <button
                type="button"
                className={styles.showPassword}
                onClick={() =>
                  setMostrarConfirmacao(!mostrarConfirmacao)
                }
                aria-label={
                  mostrarConfirmacao
                    ? "Ocultar confirmação de senha"
                    : "Mostrar confirmação de senha"
                }
                aria-pressed={mostrarConfirmacao}
              >
                {mostrarConfirmacao ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <fieldset className={styles.tipoUso}>
        <legend>Como você pretende usar o Evidence?</legend>

        <div className={styles.opcoesUso}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="tipoUso"
              value="pessoal"
              checked={tipoUso === "pessoal"}
              onChange={() => alterarTipoUso("pessoal")}
            />
            <span>Apenas para uso pessoal</span>
          </label>

          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="tipoUso"
              value="empresa"
              checked={tipoUso === "empresa"}
              onChange={() => alterarTipoUso("empresa")}
            />
            <span>Também para minha empresa</span>
          </label>
        </div>
      </fieldset>

      {usaEmpresa && (
        <section
          className={styles.painelEmpresa}
          aria-label="Seu vínculo com a empresa"
        >
          <fieldset className={styles.grupoEmpresa}>
            <legend>Você é responsável pela empresa?</legend>

            <div className={styles.opcoesEmpresa}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="vinculo"
                  value="responsavel"
                  checked={vinculo === "responsavel"}
                  onChange={() => {
                    setVinculo("responsavel");
                    setErro("");
                    setMensagem("");
                  }}
                />
                <span>Sim, sou responsável pela empresa</span>
              </label>

              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="vinculo"
                  value="funcionario"
                  checked={vinculo === "funcionario"}
                  onChange={() => {
                    setVinculo("funcionario");
                    setErro("");
                    setMensagem("");
                  }}
                />
                <span>Não, sou funcionário(a)</span>
              </label>
            </div>
          </fieldset>

          {responsavel && (
            <fieldset className={styles.grupoEmpresa}>
              <legend>
                Quando deseja cadastrar sua empresa?
              </legend>

              <div className={styles.opcoesEmpresa}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="momentoCadastro"
                    value="agora"
                    checked={momentoCadastro === "agora"}
                    onChange={() => setMomentoCadastro("agora")}
                  />
                  <span>Cadastrar agora</span>
                </label>

                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="momentoCadastro"
                    value="depois"
                    checked={momentoCadastro === "depois"}
                    onChange={() => setMomentoCadastro("depois")}
                  />
                  <span>Cadastrar depois</span>
                </label>
              </div>

              <p className={styles.observacao}>
                Você também poderá cadastrar sua empresa mais
                tarde, pela sua conta.
              </p>
            </fieldset>
          )}

          {funcionario && (
            <fieldset className={styles.grupoEmpresa}>
              <legend>
                Deseja solicitar participação na sua empresa?
              </legend>

              <div className={styles.opcoesEmpresa}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="solicitacaoEmpresa"
                    value="agora"
                    checked={solicitacaoEmpresa === "agora"}
                    onChange={() => setSolicitacaoEmpresa("agora")}
                  />
                  <span>
                    Sim, solicitar logo após criar minha conta
                  </span>
                </label>

                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="solicitacaoEmpresa"
                    value="depois"
                    checked={solicitacaoEmpresa === "depois"}
                    onChange={() => setSolicitacaoEmpresa("depois")}
                  />
                  <span>Vou fazer isso depois</span>
                </label>
              </div>
            </fieldset>
          )}
        </section>
      )}

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
        <p className={styles.loginText}>
          Já tem conta? <Link href="/login">Entrar</Link>
        </p>

        <button type="submit" className={styles.submitButton}>
          Continuar
        </button>
      </div>
    </form>
  );
}
