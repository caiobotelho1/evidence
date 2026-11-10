import type { Metadata } from "next";
import { AuthGate } from "@/features/auth/components/AuthGate";
import { UserMenu } from "@/features/auth/components/UserMenu";

export const metadata: Metadata = {
  title: "Registros | Evidence",
};

export default function RegistrosPage() {
  return (
    <AuthGate>
      <main className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Registros</h1>
          <UserMenu />
        </div>
      </main>
    </AuthGate>
  );
}
