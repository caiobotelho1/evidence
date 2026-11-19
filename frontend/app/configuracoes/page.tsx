"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { DM_Serif_Display, Inter } from "next/font/google";
import EditarDadosModal, {type DadosPessoais,} from "@/features/configuracoes/components/EditarDadosModal";
import AlterarSenhaModal, {type AlteracaoSenha,} from "@/features/configuracoes/components/AlterarSenhaModal";
import {getUserProfile,updateUserProfile,changeUserPassword,type UserProfile,} from "@/services/users.service";
import { ApiError } from "@/services/api";
import styles from "./configuracoes.module.css";

const inter = Inter({ subsets: ["latin"] });

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

function converterDados(usuario: UserProfile): DadosPessoais {
  return {
    nome: usuario.name,
    email: usuario.email,
    telefone: usuario.phone,
  };
}

export default function ConfiguracoesPage() {
  const [usuario, setUsuario] = useState<DadosPessoais | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [modalDadosAberto, setModalDadosAberto] = useState(false);
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);

  const carregarUsuario = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const profile = await getUserProfile();
      setUsuario(converterDados(profile));
    } catch (error) {
      setUsuario(null);
      setErro(
        error instanceof ApiError
          ? error.message
          : "Não foi possível carregar seus dados."
      );
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarUsuario();
  }, [carregarUsuario]);

  async function handleSalvarDados(dados: DadosPessoais) {
    const profile = await updateUserProfile({
      name: dados.nome,
      email: dados.email,
      phone: dados.telefone,
    });

    setUsuario(converterDados(profile));
    setMensagem("Dados pessoais atualizados com sucesso.");
  }

  async function handleSalvarSenha(dados: AlteracaoSenha) {
    await changeUserPassword({
      currentPassword: dados.senhaAtual,
      newPassword: dados.novaSenha,
    });

    setMensagem("Senha alterada com sucesso.");
  }

  return (
    <div className={`${styles.page} ${inter.className}`}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M18 7L8 18L15 29L29 22L18 7Z"
              stroke="#1F3D2E"
              strokeWidth="1.2"
            />
            <circle cx="18" cy="7" r="3.4" fill="#1F3D2E" />
            <circle cx="8" cy="18" r="3.4" fill="#4A6A41" />
            <circle cx="15" cy="29" r="3.4" fill="#1F3D2E" />
            <circle cx="29" cy="22" r="3.4" fill="#B65A46" />
          </svg>

          <span className={dmSerif.className}>Evidence</span>
        </Link>

        <Link
          href="/tela-principal"
          className={styles.backLink}
        >
          <span aria-hidden="true">←</span>
          Voltar à timeline
        </Link>
      </header>

      <main className={styles.main}>
        <span className={styles.eyebrow}>MINHA CONTA</span>

        <h1 className={`${styles.title} ${dmSerif.className}`}>
          Configurações
        </h1>

        <p className={styles.subtitle}>
          Cuide da sua conta e dos espaços que fazem parte dela.
        </p>

        {mensagem && (
          <p role="status" style={{ color: "#1f3d2e" }}>
            {mensagem}
          </p>
        )}

        {erro && (
          <div role="alert">
            <p style={{ color: "#a34237" }}>{erro}</p>
            <button
              type="button"
              className={styles.outlineButton}
              onClick={() => void carregarUsuario()}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {carregando ? (
          <p className={styles.subtitle}>Carregando seus dados...</p>
        ) : (
          <div className={styles.grid}>
            <section className={styles.card}>
              <h2>Dados pessoais</h2>

              <p>Suas informações de contato no Evidence.</p>

              <div className={styles.fields}>
                <div className={styles.field}>
                  <span>Nome completo</span>
                  <strong>{usuario?.nome ?? "—"}</strong>
                </div>

                <div className={styles.field}>
                  <span>E-mail</span>
                  <strong>{usuario?.email ?? "—"}</strong>
                </div>

                <div className={styles.field}>
                  <span>Telefone</span>
                  <strong>{usuario?.telefone ?? "—"}</strong>
                </div>
              </div>

              <button
                type="button"
                className={styles.outlineButton}
                disabled={!usuario}
                onClick={() => {
                  setMensagem("");
                  setModalDadosAberto(true);
                }}
              >
                Editar dados
              </button>
            </section>

            <div className={styles.rightColumn}>
              <section className={styles.card}>
                <h2>Segurança da conta</h2>

                <p>
                  Altere sua senha para manter sua conta protegida.
                </p>

                <button
                  type="button"
                  className={styles.outlineButton}
                  disabled={!usuario}
                  onClick={() => {
                    setMensagem("");
                    setModalSenhaAberto(true);
                  }}
                >
                  Alterar senha
                </button>
              </section>

              <section className={styles.card}>
                <h2>Minhas empresas</h2>

                <p>
                  Sua conta pessoal também pode ter uma empresa.
                </p>

                <p>
                  Cadastre agora ou quando precisar. Você usará o
                  mesmo acesso e será responsável pela empresa.
                </p>

                <Link
                  href="/cadastro/empresa"
                  className={styles.primaryButton}
                >
                  Cadastrar empresa
                </Link>
              </section>
            </div>
          </div>
        )}
      </main>

      {modalDadosAberto && usuario && (
        <EditarDadosModal
          aberto={modalDadosAberto}
          dados={usuario}
          onClose={() => setModalDadosAberto(false)}
          onSave={handleSalvarDados}
        />
      )}

      {modalSenhaAberto && (
        <AlterarSenhaModal
          aberto={modalSenhaAberto}
          onClose={() => setModalSenhaAberto(false)}
          onSave={handleSalvarSenha}
        />
      )}
    </div>
  );
}
