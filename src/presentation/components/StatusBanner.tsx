import { useEffect, useState, type ReactNode } from "react";

export interface StatusMessage {
  kind: "success" | "error";
  text: string;
}

export function useStatusMessage(timeoutMs = 4000) {
  const [message, setMessage] = useState<StatusMessage | null>(null);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), timeoutMs);
    return () => window.clearTimeout(timer);
  }, [message, timeoutMs]);

  return { message, setMessage };
}

export function StatusBanner({ message }: { message: StatusMessage | null }): ReactNode {
  if (!message) return null;
  const classes =
    message.kind === "success"
      ? "border-primary/40 bg-primary/10 text-primary"
      : "border-destructive/40 bg-destructive/10 text-destructive";

  return <div className={`mb-4 rounded-md border px-3 py-2 text-sm ${classes}`}>{message.text}</div>;
}
