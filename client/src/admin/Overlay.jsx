import { useEffect } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

function useEscape(onClose) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
}

/** Sağdan açılan form paneli. */
export function Drawer({ title, onClose, footer, children }) {
  useEscape(onClose);
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-xl flex-col border-l border-line bg-surface shadow-2xl">
        <header className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Kapat" className="rounded-lg p-2 text-muted hover:bg-bg hover:text-ink"><FiX size={18} /></button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <footer className="flex justify-end gap-3 border-t border-line px-6 py-4">{footer}</footer>}
      </div>
    </div>
  );
}

/** Ortada açılan pencere. */
export function Modal({ title, onClose, footer, children, wide = false }) {
  useEscape(onClose);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative flex max-h-[90vh] w-full flex-col rounded-2xl border border-line bg-surface shadow-2xl ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
        <header className="flex items-center justify-between px-6 pt-5">
          <h2 className="text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Kapat" className="rounded-lg p-2 text-muted hover:bg-bg hover:text-ink"><FiX size={18} /></button>
        </header>
        <div className="overflow-y-auto px-6 py-4">{children}</div>
        {footer && <footer className="flex justify-end gap-3 px-6 pb-5">{footer}</footer>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, message, confirmLabel = 'Sil', busy, onConfirm, onClose }) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={(
        <>
          <button type="button" className="btn-ghost" onClick={onClose}>Vazgeç</button>
          <button type="button" disabled={busy} className="btn bg-minus text-white hover:brightness-110" onClick={onConfirm}>{busy ? 'Siliniyor…' : confirmLabel}</button>
        </>
      )}
    >
      <div className="flex gap-3 text-sm">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-minus/15 text-minus"><FiAlertTriangle /></span>
        <div className="space-y-2 text-muted">{message}</div>
      </div>
    </Modal>
  );
}
