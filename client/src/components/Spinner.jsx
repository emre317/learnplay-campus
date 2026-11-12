export default function Spinner({ full }) {
  const el = (
    <div className="flex items-center gap-2 font-mono text-brand">
      <span className="animate-spin text-2xl">∞</span>
      <span className="text-sm text-muted">Hesaplanıyor…</span>
    </div>
  );
  return full ? <div className="grid min-h-[50vh] place-items-center">{el}</div> : el;
}
