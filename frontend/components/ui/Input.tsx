import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-md border border-black/15 bg-transparent px-3 py-2 outline-none focus:border-foreground dark:border-white/20 ${className}`}
      {...props}
    />
  );
}
