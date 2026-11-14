"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DM_Serif_Display, Inter } from "next/font/google";
import { useSearchParams, useRouter } from "next/navigation";

import iconUser from "../../imgs/icon_user.png";
import iconMenu from "../../imgs/icon_menu.png";
import iconSeta from "../../imgs/icon_seta.png";

import TagModal from "@/features/tags/components/TagModal";
import MenuAmbiente from "../../features/ambiente/components/MenuAmbiente";
import MenuTags from "../../features/ambiente/components/MenuTags";
import styles from "./telaPrincipal.module.css";

const inter = Inter({ subsets: ["latin"] });

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

type Ambiente = "pessoal" | "empresa";

const tagsExemplo = [
  { id: "1", nome: "Documentos", cor: "#1F3D2E" },
  { id: "2", nome: "Financeiro", cor: "#B65A46" },
  { id: "3", nome: "Outros registros", cor: "#4A6A41" },
];

export default function DashboardClient() {
 const searchParams = useSearchParams();
  const router = useRouter();

  const ambienteAtual: Ambiente =
    searchParams.get("ambiente") === "empresa"
      ? "empresa"
      : "pessoal";

  const setAmbienteAtual = (ambiente: Ambiente) => {
    router.push(`/tela-principal?ambiente=${ambiente}`);
  };

  const papelEmpresa: "proprietario" | "funcionario" =
    "proprietario";

  const isPessoal = ambienteAtual === "pessoal";

  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  
  return (
    <div className={`${styles.dashboard} ${inter.className}`}>
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

        <div className={styles.headerActions}>
          <div
            className={styles.environmentSwitcher}
            role="group"
            aria-label="Selecionar ambiente"
          >
            <button
              type="button"
              className={`${styles.environmentButton} ${
                isPessoal ? styles.environmentActive : ""
              }`}
              onClick={() => setAmbienteAtual("pessoal")}
              aria-pressed={isPessoal}
            >
              Pessoal
            </button>

            <button
              type="button"
              className={`${styles.environmentButton} ${
                !isPessoal ? styles.environmentActive : ""
              }`}
              onClick={() => setAmbienteAtual("empresa")}
              aria-pressed={!isPessoal}
            >
              Empresa
            </button>
          </div>

          <details className={styles.menu}>
            <summary className={styles.menuButton}>
              <Image
                src={iconMenu}
                alt=""
                width={20}
                height={20}
              />

              <span>Menu</span>

              <Image
                src={iconSeta}
                alt=""
                width={18}
                height={18}
              />
            </summary>

            <div className={styles.dropdown}>
              <div className={styles.dropdown}>
                <MenuAmbiente
                  ambiente={ambienteAtual}
                  papelEmpresa={papelEmpresa}
                  onCriarTag={() => setIsTagModalOpen(true)}
                />
              </div>
            </div>
          </details>
        </div>
      </header>

      <main className={styles.main}>
        <nav
          className={styles.breadcrumb}
          aria-label="Localização"
        >
          <span>{isPessoal ? "Pessoal" : "Empresa"}</span>

          <span className={styles.separator}>/</span>

          <span className={styles.currentPage}>Timeline</span>
        </nav>

        <section className={styles.titleSection}>
          <div className={styles.environment}>
              <Image
                src={iconUser}
                alt=""
                width={18}
                height={18}
              />

            <span>
              {isPessoal ? "ESPAÇO PESSOAL" : "ESPAÇO EMPRESA"}
            </span>
          </div>

          <h1
            className={`${styles.title} ${dmSerif.className}`}
          >
            Sua história
          </h1>
        </section>

        <section className={styles.searchSection}>
          <input
            type="search"
            placeholder="Digite aqui"
            aria-label="Buscar registros"
            className={styles.searchInput}
          />

        <details className={styles.tagsDropdown}>
          <summary className={styles.filterButton}>
            <span>Tags</span>

            <Image
              src={iconSeta}
              alt=""
              width={18}
              height={18}
            />
          </summary>

          <div className={styles.tagsDropdownContent}>
            <MenuTags tags={tagsExemplo} />
          </div>
        </details>

          <button
            type="button"
            className={styles.newRecordButton}
            disabled
          >
            <span
              className={styles.plusIcon}
              aria-hidden="true"
            >
              +
            </span>

            <span>Novo registro</span>
          </button>
        </section>

        {/* Timeline será implementada posteriormente */}
        <section
          className={styles.timelineSection}
          aria-label="Timeline de registros"
        />
      </main>


        <TagModal
          isOpen={isTagModalOpen}
          onClose={() => setIsTagModalOpen(false)}
          scope={isPessoal ? "personal" : "company"}
          onSubmit={(data, scope, companyId) => {
            console.log("Tag:", data);
            console.log("Ambiente:", scope);
            console.log("Empresa:", companyId);
          }}
        />

    </div>
  );
}
