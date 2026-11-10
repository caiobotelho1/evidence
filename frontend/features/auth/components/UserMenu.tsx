"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { logout } from "@/services/auth.service";
import { useAuthUser } from "./AuthGate";

export function UserMenu() {
  const router = useRouter();
  const user = useAuthUser();
  const [saindo, setSaindo] = useState(false);
  const [erro, setErro] = useState("");

  async function sair() {
    setSaindo(true);
    setErro("");

    try {
      await logout();
      router.replace("/login");
    } catch {
      setErro("Não foi possível sair. Tente novamente.");
      setSaindo(false);
    }
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span>{user.name}</span>

      <Button type="button" onClick={sair} disabled={saindo}>
        {saindo ? "Saindo..." : "Sair"}
      </Button>

      {erro && <p role="alert">{erro}</p>}
    </div>
  );
}
