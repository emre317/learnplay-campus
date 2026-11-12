import { Link } from 'react-router-dom';

export default function Logo({ className = '' }) {
  return (
    <Link to="/" className={`group flex items-center gap-2.5 ${className}`}>
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-brand text-white shadow-glow transition group-hover:rotate-6">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
          <path d="M5 7h14M12 7v10M6 17h12" />
        </svg>
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-amber-400 ring-2 ring-surface" />
      </span>
      <span className="font-display text-lg font-bold leading-none">
        Learn<span className="text-brand">Play</span>
        <span className="block text-[10px] font-semibold uppercase tracking-[.3em] text-muted">Campus</span>
      </span>
    </Link>
  );
}
