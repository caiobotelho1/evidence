import Link from "next/link";
import { DM_Serif_Display, Inter } from "next/font/google";
import {
  ChevronDown,
  Menu as MenuIcon,
  Plus,
  UserRound,
} from "lucide-react";

import styles from "./telaPrincipal.module.css";

const inter = Inter({
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

export default function DashboardPage() {
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

          <span className={dmSerif.className}>
            Evidence
          </span>
        </Link>

        <div className={styles.headerActions}>
          <div className={styles.environmentSlot} />

          <details className={styles.menu}>

            <summary className={styles.menuButton}>
              <MenuIcon size={20} strokeWidth={1.8} />

              <span>Menu</span>

              <ChevronDown size={18} strokeWidth={1.8} />
            </summary>

            <div className={styles.dropdown}>
            </div>

          </details>

        </div>
      </header>

      <main className={styles.main}>
        <nav
          className={styles.breadcrumb}
          aria-label="Localização"
        >
          <span></span>

          <span className={styles.separator}>/</span>

          <span className={styles.currentPage}>
            Timeline
          </span>
        </nav>

        <section className={styles.titleSection}>

          <div className={styles.environment}>
            <UserRound size={18} strokeWidth={1.5} />

            <span>ESPAÇO </span>
          </div>

          <h1 className={`${styles.title} ${dmSerif.className}`}>
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

          <button
            type="button"
            className={styles.filterButton}
            disabled
          >
            <span>Tags</span>

            <ChevronDown size={18} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            className={styles.newRecordButton}
            disabled
          >
            <Plus size={18} strokeWidth={1.8} />

            <span>Novo registro</span>
          </button>

        </section>

        <section
          className={styles.timelineSection}
          aria-label="Timeline de registros"
        >

        </section>

      </main>
    </div>
  );
}
