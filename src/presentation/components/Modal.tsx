import type { PropsWithChildren, ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  footer?: ReactNode;
}

export function Modal({ open, title, onClose, footer, children }: PropsWithChildren<ModalProps>) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-border bg-card text-card-foreground shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border px-4 py-3">
          <h2 id="modal-title" className="text-base font-semibold">
            {title}
          </h2>
        </div>
        <div className="px-4 py-4 text-sm">{children}</div>
        {footer ? <div className="flex justify-end gap-2 border-t border-border px-4 py-3">{footer}</div> : null}
      </div>
    </div>
  );
}
