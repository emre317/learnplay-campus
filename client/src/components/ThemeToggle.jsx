import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button onClick={toggle} aria-label="Tema değiştir" className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface transition hover:bg-brand-soft">
      {theme === 'dark' ? <FiSun className="text-amber-400" /> : <FiMoon />}
    </button>
  );
}
