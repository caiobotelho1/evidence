import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DM_Serif_Display, Inter } from "next/font/google";
import { LoginForm } from "@/features/auth/components/LoginForm";
import styles from "./login.module.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Login | Evidence",
};

export default function LoginPage() {
  return (
    <div className={`${styles.page} ${inter.className}`}>
      <header className={styles.header}>
        <Link
          href="/"
          aria-label="Evidence — página inicial"
          className={styles.brand}
        >
          <Image
            src="/evidence-simbolo.svg"
            alt=""
            width={36}
            height={36}
            loading="eager"
          />

          <span className={dmSerifDisplay.className}>Evidence</span>
        </Link>

        <Link href="/" className={styles.backLink}>
          <span aria-hidden="true">←</span>
          Voltar ao início
        </Link>
      </header>

      <main className={styles.main}>
        <section
          aria-labelledby="login-title"
          className={styles.card}
        >
          <h1
            id="login-title"
            className={`${styles.title} ${dmSerifDisplay.className}`}
          >
            Olá, quem é você?
          </h1>

          <p className={styles.subtitle}>
            Entre para continuar a sua história.
          </p>

          <div className={styles.formContainer}>
            <LoginForm />
          </div>

          <p className={styles.signup}>
            Ainda não tem conta?{" "}
            <Link href="/cadastro">Cadastre-se</Link>
          </p>
        </section>
      </main>
    </div>
  );
}