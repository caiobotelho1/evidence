type RegistroCardProps = {
  titulo: string;
  descricao?: string;
};

export function RegistroCard({ titulo, descricao }: RegistroCardProps) {
  return (
    <article className="rounded-lg border border-black/10 p-4 dark:border-white/15">
      <h2 className="font-semibold">{titulo}</h2>
      {descricao && <p className="mt-1 text-sm opacity-70">{descricao}</p>}
    </article>
  );
}
