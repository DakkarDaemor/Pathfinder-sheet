import { createContext, useCallback, useContext, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import { Modal } from "./Modal";

export interface ConfirmOptions {
  title: string;
  body: string;
  confirmLabel?: string;
  destructive?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * App-wide confirmation dialog: every destructive action (delete character/companion,
 * overwrite on import, discard unsaved changes) goes through this single hook so the UX
 * stays consistent and no destructive action can accidentally skip confirmation.
 */
export function ConfirmProvider({ children }: PropsWithChildren) {
  const { t } = useTranslation();
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((confirmed: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const respond = useCallback((confirmed: boolean) => {
    resolverRef.current?.(confirmed);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  const value = useMemo(() => confirm, [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Modal
        open={options !== null}
        title={options?.title ?? ""}
        onClose={() => respond(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => respond(false)}>
              {t("actions.cancel")}
            </Button>
            <Button variant={options?.destructive ? "destructive" : "primary"} onClick={() => respond(true)}>
              {options?.confirmLabel ?? t("actions.confirm")}
            </Button>
          </>
        }
      >
        {options?.body}
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmProvider");
  return ctx;
}
