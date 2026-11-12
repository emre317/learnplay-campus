import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiZap } from 'react-icons/fi';
import Logo from './Logo.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const link = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-brand-soft text-brand' : 'text-muted hover:text-ink'}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  const items = [
    { to: '/sinif/' + (user?.grade || 4), label: 'Konular' },
    { to: '/oyunlar', label: 'Oyunlar' },
    ...(user ? [{ to: '/panel', label: 'Panelim' }, { to: '/gelisim', label: 'Gelişim' }] : []),
    ...(user?.role === 'parent' || user?.role === 'admin' ? [{ to: '/veli', label: 'Veli' }] : []),
    ...(user?.role === 'admin' ? [{ to: '/yonetim', label: 'Yönetim' }] : []),
    { to: '/premium', label: 'Premium' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Logo />
        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {items.map((i) => <NavLink key={i.to} to={i.to} className={link}>{i.label}</NavLink>)}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <div className="hidden items-center gap-2 rounded-xl border border-line bg-surface px-3 py-1.5 sm:flex">
                <FiZap className="text-amber-400" />
                <span className="font-mono text-sm font-bold">{user.xp} XP</span>
                {user.isPremium && <span className="chip bg-amber-400/15 text-amber-500">PRO</span>}
              </div>
              <button onClick={async () => { await logout(); nav('/'); }} className="btn-ghost hidden sm:inline-flex" title="Çıkış">
                <FiLogOut />
              </button>
            </>
          ) : (
            <>
              <Link to="/giris" className="btn-ghost hidden sm:inline-flex">Giriş Yap</Link>
              <Link to="/kayit" className="btn-primary">Ücretsiz Başla</Link>
            </>
          )}
          <button className="grid h-10 w-10 place-items-center rounded-xl border border-line lg:hidden" onClick={() => setOpen(!open)} aria-label="Menü">
            {open ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-line px-4 py-3 lg:hidden" onClick={() => setOpen(false)}>
          {items.map((i) => <NavLink key={i.to} to={i.to} className={link}>{i.label}</NavLink>)}
          {user ? (
            <button onClick={logout} className="rounded-lg px-3 py-2 text-left text-sm text-minus">Çıkış yap</button>
          ) : (
            <NavLink to="/giris" className={link}>Giriş Yap</NavLink>
          )}
        </nav>
      )}
    </header>
  );
}
