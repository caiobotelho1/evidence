"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, type AuthUser } from "@/services/auth.service";

const AuthUserContext = createContext<AuthUser | null>(null);


export function useAuthUser(): AuthUser {
  const user = useContext(AuthUserContext);

  if (!user) {
    throw new Error("useAuthUser deve ser usado dentro de <AuthGate>.");
  }

  return user;
}


export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let cancelado = false;

    getCurrentUser()
      .then((atual) => {
        if (cancelado) return;

        if (atual) {
          setUser(atual);
        } else {
          router.replace("/login");
        }
      })
      .catch(() => {
        if (!cancelado) {
          setErro("Não foi possível verificar sua sessão. Tente novamente.");
        }
      });

    return () => {
      cancelado = true;
    };
  }, [router]);

  if (erro) {
    return (
      <main className="flex flex-1 flex-col p-6">
        <p role="alert">{erro}</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex flex-1 flex-col p-6">
        <p role="status">Verificando sua sessão...</p>
      </main>
    );
  }

  return (
    <AuthUserContext.Provider value={user}>{children}</AuthUserContext.Provider>
  );
}
