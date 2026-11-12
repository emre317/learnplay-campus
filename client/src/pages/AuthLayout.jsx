import MathBackground from '../components/MathBackground.jsx';
import Logo from '../components/Logo.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand via-indigo-600 to-fuchsia-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="graph-paper absolute inset-0 opacity-30 [--grid:255_255_255]" />
        <div className="relative [&_span]:!text-white"><Logo /></div>
        <div className="relative">
          <p className="font-mono text-6xl font-bold leading-tight">f(öğren) = <br />oyna + başar</p>
          <p className="mt-6 max-w-md text-white/80">4–8. sınıf öğrencileri için tamamen matematiğe odaklanmış öğrenme kampüsü.</p>
        </div>
        <div aria-hidden="true" />
      </div>
      <div className="relative flex items-center justify-center p-6">
        <div className="lg:hidden"><MathBackground count={10} /></div>
        <div className="absolute right-6 top-6"><ThemeToggle /></div>
        <div className="relative w-full max-w-md">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
