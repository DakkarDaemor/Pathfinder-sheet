import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "destructive" | "ghost";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "bg-muted text-foreground hover:opacity-80 border border-border",
  destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
  ghost: "bg-transparent text-foreground hover:bg-muted",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = "secondary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium
        transition-colors disabled:cursor-not-allowed disabled:opacity-50
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
