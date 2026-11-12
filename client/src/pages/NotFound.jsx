import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4 text-center">
      <div>
        <p className="font-mono text-7xl font-bold text-brand">404 ÷ 0</p>
        <p className="mt-4 text-muted">Bu sayfa tanımsız. Tıpkı sıfıra bölmek gibi.</p>
        <Link to="/" className="btn-primary mt-6">Ana sayfaya dön</Link>
      </div>
    </div>
  );
}
