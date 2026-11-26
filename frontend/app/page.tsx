import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import { DM_Serif_Display, Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-dm-serif",
  display: "swap",
});

export default function Home() {
  return (
    <main className={`${styles.page} ${inter.variable} ${dmSerifDisplay.variable}`}>
        <header className={styles.header}>
          <Link
            href="/"
            className={styles.brand}
            aria-label="Evidence — início"
          >
            <Image
              src="/evidence-simbolo.svg"
              alt=""
              width={36}
              height={36}
              className={styles.brandIcon}
              priority
            />

            <span className={dmSerifDisplay.className}>
              Evidence
            </span>
          </Link>

          <p className={styles.tagline}>
            Registros que conectam
          </p>
        </header>

      <section className={styles.hero} aria-labelledby="hero-title">
        <h1 id="hero-title" className={styles.title}>
          Evidence
        </h1>

        <p className={styles.subtitle}>
          Organize as evidências da sua vida pessoal
          <br className={styles.desktopBreak} /> e da sua empresa.
        </p>

        <p className={styles.description}>
          Guarde registros, conecte acontecimentos e encontre sua história.
        </p>

        <nav className={styles.actions} aria-label="Acesso à plataforma">
          <Link href="/cadastro" className={styles.primaryButton}>
            Não tenho conta
          </Link>

          <Link href="/login" className={styles.secondaryButton}>
            Já tenho conta
          </Link>
        </nav>
      </section>

      <footer className={styles.footer}>
        <svg
          className={styles.timeline}
          viewBox="0 0 1000 70"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10 35C160 35 190 0 330 18S580 70 670 37S850 28 990 35"
            stroke="#9BAF90"
            strokeWidth="1.5"
          />
          <circle cx="10" cy="35" r="5" fill="#EADFCC" />
          <circle cx="330" cy="18" r="10" fill="#4D7046" />
          <circle cx="670" cy="37" r="10" fill="#B85B44" />
          <circle cx="990" cy="35" r="5" fill="#9BAF90" />
        </svg>

        <p className={styles.footerText}>
          Pequenos registros. Uma história inteira.
        </p>
      </footer>
    </main>
  );
}