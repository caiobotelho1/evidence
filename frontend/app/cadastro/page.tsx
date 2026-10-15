import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cadastro | Evidence",
};

export default function CadastroPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Cadastro</h1>
    </main>
  );
}
