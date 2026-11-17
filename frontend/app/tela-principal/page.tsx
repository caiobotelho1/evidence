import { Suspense } from "react";
import { AuthGate } from "@/features/auth/components/AuthGate";
import DashboardClient from "./telaPrincipal";

export default function Page() {
  return (
    <AuthGate>
      <Suspense fallback={<div>Carregando...</div>}>
        <DashboardClient />
      </Suspense>
    </AuthGate>
  );
}
