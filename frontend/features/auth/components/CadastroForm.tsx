"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import styles from "./CadastroForm.module.css";


type TipoUso = "pessoal" | "empresa";
type PapelEmpresa = "proprietario" | "funcionario";

export default function CadastroForm() {
  const [tipoUso, setTipoUso] = useState<TipoUso>("empresa");
  const [papel, setPapel] = useState<PapelEmpresa>("funcionario");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    // Integração com o backend será adicionada aqui.
    // Não atribua permissões apenas com base no radio selecionado.
    console.log("Formulário validado.");
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* Apresentação */}
      <div className={styles.apresentacao}>
        <h1>Oi, prazer em te conhecer.</h1>
        <p>Vamos começar pelos seus dados.</p>
      </div>

      {/* Dados pessoais */}
      <div className={styles.dados}>
        <div className={styles.field}>
          <label htmlFor="nome">Qual é o seu nome?</label>
          <input
            id="nome"
            name="nome"
            type="text"
            placeholder="Seu nome completo"
            autoComplete="name"
            required
          />
        </div>

        <div className={styles.linhaContato}>
          <div className={styles.field}>
            <label htmlFor="telefone">Telefone</label>
            <input
              id="telefone"
              name="telefone"
              type="tel"
              placeholder="(00) 00000-0000"
              autoComplete="tel"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="voce@exemplo.com"
              autoComplete="email"
              required
            />
          </div>
        </div>

        {/* Senhas */}
        <div className={styles.linhaSenhas}>
          <div className={styles.field}>
            <label htmlFor="senha">Senha</label>

            <div className={styles.inputSenha}>
              <input
                id="senha"
                name="senha"
                type={mostrarSenha ? "text" : "password"}
                placeholder="Crie uma senha"
                autoComplete="new-password"
                minLength={8}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />

              <button
                type="button"
                className={styles.botaoOlho}
                onClick={() => setMostrarSenha(!mostrarSenha)}
                aria-label={
                  mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                }
                aria-pressed={mostrarSenha}
              >
                <EyeIcon />
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmarSenha">
              Confirmar senha
            </label>

            <div className={styles.inputSenha}>
              <input
                id="confirmarSenha"
                name="confirmarSenha"
                type={mostrarConfirmacao ? "text" : "password"}
                placeholder="Repita sua senha"
                autoComplete="new-password"
                minLength={8}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
              />

              <button
                type="button"
                className={styles.botaoOlho}
                onClick={() =>
                  setMostrarConfirmacao(!mostrarConfirmacao)
                }
                aria-label={
                  mostrarConfirmacao
                    ? "Ocultar confirmação"
                    : "Mostrar confirmação"
                }
                aria-pressed={mostrarConfirmacao}
              >
                <EyeIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tipo de uso */}
      <fieldset className={styles.tipoUso}>
        <legend>
          Como você pretende usar o Evidence?
        </legend>

        <div className={styles.opcoesUso}>
          <label className={styles.opcao}>
            <input
              type="radio"
              name="tipoUso"
              value="pessoal"
              checked={tipoUso === "pessoal"}
              onChange={() => setTipoUso("pessoal")}
            />
            <span>Apenas para uso pessoal</span>
          </label>

          <label className={styles.opcao}>
            <input
              type="radio"
              name="tipoUso"
              value="empresa"
              checked={tipoUso === "empresa"}
              onChange={() => setTipoUso("empresa")}
            />
            <span>Também para minha empresa</span>
          </label>
        </div>
      </fieldset>

      {/* Vínculo com empresa */}
      {tipoUso === "empresa" && (
        <fieldset className={styles.areaEmpresa}>
          <legend>
            Você é responsável pela empresa?
          </legend>

          <div className={styles.opcoesPapel}>
            <label className={styles.opcao}>
              <input
                type="radio"
                name="papel"
                value="proprietario"
                checked={papel === "proprietario"}
                onChange={() => setPapel("proprietario")}
              />
              <span>
                Sim, quero cadastrar minha empresa
              </span>
            </label>

            <label className={styles.opcao}>
              <input
                type="radio"
                name="papel"
                value="funcionario"
                checked={papel === "funcionario"}
                onChange={() => setPapel("funcionario")}
              />
              <span>Não, sou funcionário(a)</span>
            </label>
          </div>

          {papel === "funcionario" && (
            <div className={styles.field}>
              <label htmlFor="empresa">
                Busque sua empresa
              </label>

              <input
                id="empresa"
                name="empresa"
                type="text"
                placeholder="Digite o nome ou CNPJ da empresa"
                required
              />
            </div>
          )}

          {papel === "proprietario" && (
            <div className={styles.field}>
              <label htmlFor="nomeEmpresa">
                Nome da sua empresa
              </label>

              <input
                id="nomeEmpresa"
                name="nomeEmpresa"
                type="text"
                placeholder="Digite o nome da empresa"
                required
              />
            </div>
          )}
        </fieldset>
      )}

      {/* Mensagem de erro */}
      {erro && (
        <p className={styles.erro} role="alert">
          {erro}
        </p>
      )}

      {/* Finalização */}
      <div className={styles.rodape}>
        <p>
          Já tem conta?{" "}
          <Link href="/login">Entrar</Link>
        </p>

        <button
          type="submit"
          className={styles.botaoCadastrar}
        >
          Criar minha conta
        </button>
      </div>
    </form>
  );
}

// Ícone para mostrar e ocultar senha
function EyeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
