import Link from "next/link";

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-black/10 px-6 py-4 dark:border-white/15">
      <Link href="/" className="text-lg font-semibold">
        Evidence
      </Link>
      <nav className="flex gap-4 text-sm">
        <Link href="/registros">Registros</Link>
        <Link href="/login">Entrar</Link>
        <Link href="/cadastro">Cadastrar</Link>
      </nav>
    </header>
  );
}
