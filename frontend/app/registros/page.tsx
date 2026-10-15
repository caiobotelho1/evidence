import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registros | Evidence",
};

export default function RegistrosPage() {
  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Registros</h1>
    </main>
  );
}
