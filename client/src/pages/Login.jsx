import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from './AuthLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../api/client.js';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const u = await login(form.email, form.password);
      toast.success(`Hoş geldin, ${u.name.split(' ')[0]}!`);
      nav(loc.state?.from || (u.role === 'admin' ? '/yonetim' : u.role === 'parent' ? '/veli' : '/panel'));
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Tekrar hoş geldin 👋" subtitle="Kaldığın yerden devam etmek için giriş yap.">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">E-posta</label>
          <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="ornek@mail.com" />
        </div>
        <div>
          <label className="label">Şifre</label>
          <input className="input" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••" />
        </div>
        <button className="btn-primary w-full py-3" disabled={busy}>{busy ? 'Giriş yapılıyor…' : 'Giriş Yap'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Hesabın yok mu? <Link to="/kayit" className="font-semibold text-brand">Ücretsiz kayıt ol</Link>
      </p>
    </AuthLayout>
  );
}
