import Logo from './Logo.jsx';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row">
        <Logo />
        <p className="font-mono text-xs text-muted">
          a² + b² = c² · © {new Date().getFullYear()} Learn Play Campus · Matematik, oynayarak öğrenilir.
        </p>
      </div>
    </footer>
  );
}
