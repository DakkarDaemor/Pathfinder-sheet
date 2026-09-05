import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const inputClasses =
  "w-full rounded-md border border-border bg-card px-2 py-1.5 text-sm text-card-foreground " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

interface FieldProps {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="text" {...props} className={`${inputClasses} ${props.className ?? ""}`} />;
}

export function NumberInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="number" {...props} className={`${inputClasses} ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClasses} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClasses} ${props.className ?? ""}`} />;
}

export function Checkbox(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      {...props}
      className={`h-4 w-4 rounded border-border accent-primary ${props.className ?? ""}`}
    />
  );
}
