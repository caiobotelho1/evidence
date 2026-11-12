
"use client";

import { useState } from "react";
import Link from "next/link";

import { AuthGate } from "@/features/auth/components/AuthGate";
import { UserMenu } from "@/features/auth/components/UserMenu";
import TagModal from "@/features/tags/components/TagModal";

export default function RegistrosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <AuthGate>
      <main className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">
            Registros
          </h1>

          <Link href="/cadastro/empresa">
            Cadastrar empresa
          </Link>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
          >
            + Nova tag
          </button>

          <UserMenu />
        </div>

        <TagModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          companies={[
            { id: "1", name: "Empresa Teste" },
          ]}
          onSubmit={(data, scope, companyId) => {
            console.log("Tag:", data);
            console.log("Tipo:", scope);
            console.log("Empresa:", companyId);
          }}
        />
      </main>
    </AuthGate>
  );
}
