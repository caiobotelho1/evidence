import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-md bg-foreground px-4 py-2 font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
