import { Suspense } from "react";
import DashboardClient from "./telaPrincipal";

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <DashboardClient />
    </Suspense>
  );
}