import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function LoginForm() {
  return (
    <form className="flex w-full max-w-sm flex-col gap-4">
      <Input type="email" name="email" placeholder="E-mail" required />
      <Input type="password" name="senha" placeholder="Senha" required />
      <Button type="submit">Entrar</Button>
    </form>
  );
}
