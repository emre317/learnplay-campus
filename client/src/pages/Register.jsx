import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from './AuthLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../api/client.js';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', grade: 4, role: 'student' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const u = await register({ ...form, grade: Number(form.grade) });
      toast.success('Hesabın oluşturuldu! 🎉');
      nav(u.role === 'parent' ? '/veli' : '/panel');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title="Kampüse katıl" subtitle="Birkaç saniyede ücretsiz hesabını oluştur.">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-line bg-surface p-1">
          {[['student', 'Öğrenciyim'], ['parent', 'Veliyim']].map(([v, l]) => (
            <button type="button" key={v} onClick={() => setForm({ ...form, role: v })}
              className={`rounded-lg py-2 text-sm font-semibold transition ${form.role === v ? 'bg-brand text-white' : 'text-muted'}`}>{l}</button>
          ))}
        </div>
        <div>
          <label className="label">Ad Soyad</label>
          <input className="input" required minLength={2} value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label className="label">E-posta</label>
          <input className="input" type="email" required value={form.email} onChange={set('email')} />
        </div>
        <div>
          <label className="label">Şifre</label>
          <input className="input" type="password" required minLength={6} value={form.password} onChange={set('password')} placeholder="En az 6 karakter" />
        </div>
        {form.role === 'student' && (
          <div>
            <label className="label">Sınıfın</label>
            <div className="grid grid-cols-5 gap-2">
              {[4, 5, 6, 7, 8].map((g) => (
                <button type="button" key={g} onClick={() => setForm({ ...form, grade: g })}
                  className={`rounded-xl border py-2.5 font-mono font-bold transition ${Number(form.grade) === g ? 'border-brand bg-brand-soft text-brand' : 'border-line'}`}>{g}</button>
              ))}
            </div>
          </div>
        )}
        <button className="btn-primary w-full py-3" disabled={busy}>{busy ? 'Oluşturuluyor…' : 'Hesap Oluştur'}</button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Zaten hesabın var mı? <Link to="/giris" className="font-semibold text-brand">Giriş yap</Link>
      </p>
    </AuthLayout>
  );
}
