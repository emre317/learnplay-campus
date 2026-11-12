import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import api, { errMsg } from '../api/client.js';
import MathText from '../components/MathText.jsx';
import { Drawer } from './Overlay.jsx';
import { GRADES, getPath, setPath, slugify, toForm } from './schemas.js';

const MAX_OPTIONS = 5;
const MIN_OPTIONS = 2;

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-brand' : 'bg-line'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
      {label}
    </label>
  );
}

function ListField({ field, value, onChange }) {
  const update = (i, key, v) => onChange(value.map((row, ri) => (ri === i ? { ...row, [key]: v } : row)));
  return (
    <div className="space-y-2">
      {value.map((row, i) => (
        <div key={i} className={`flex gap-2 ${field.stacked ? 'rounded-xl border border-line p-3' : 'items-center'}`}>
          <div className={`flex flex-1 gap-2 ${field.stacked ? 'flex-col' : ''}`}>
            {field.sub.map((s) => (s.area ? (
              <textarea key={s.name} rows={2} className="input" placeholder={s.placeholder} value={row[s.name] || ''} onChange={(e) => update(i, s.name, e.target.value)} />
            ) : (
              <input key={s.name} className={`input ${s.width || 'flex-1'} ${s.mono ? 'font-mono' : ''}`} placeholder={s.placeholder} value={row[s.name] || ''} onChange={(e) => update(i, s.name, e.target.value)} />
            )))}
          </div>
          <button type="button" aria-label="Satırı kaldır" onClick={() => onChange(value.filter((_, ri) => ri !== i))} className="self-start rounded-lg p-2.5 text-muted hover:bg-minus/10 hover:text-minus"><FiTrash2 /></button>
        </div>
      ))}
      <button type="button" className="btn-ghost py-2 text-xs" onClick={() => onChange([...value, { ...field.empty }])}><FiPlus /> {field.addLabel}</button>
    </div>
  );
}

function OptionsField({ options, correctIndex, onChange }) {
  const setOption = (i, v) => onChange(options.map((o, oi) => (oi === i ? v : o)), correctIndex);
  const remove = (i) => onChange(options.filter((_, oi) => oi !== i), correctIndex === i ? 0 : correctIndex > i ? correctIndex - 1 : correctIndex);
  return (
    <div className="space-y-2">
      {options.map((o, i) => {
        const correct = i === correctIndex;
        return (
          <div key={i} className="flex items-center gap-2">
            <button type="button" role="radio" aria-checked={correct} aria-label={`${String.fromCharCode(65 + i)} seçeneğini doğru cevap yap`} onClick={() => onChange(options, i)}
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border font-mono font-bold transition ${correct ? 'border-plus bg-plus text-white' : 'border-line text-muted hover:border-plus hover:text-plus'}`}>
              {String.fromCharCode(65 + i)}
            </button>
            <input className={`input ${correct ? 'border-plus' : ''}`} placeholder={`${String.fromCharCode(65 + i)} seçeneği`} value={o} onChange={(e) => setOption(i, e.target.value)} />
            {correct && <span className="chip hidden whitespace-nowrap bg-plus/15 text-plus sm:inline-flex">Doğru cevap</span>}
            <button type="button" aria-label="Seçeneği kaldır" disabled={options.length <= MIN_OPTIONS} onClick={() => remove(i)} className="rounded-lg p-2.5 text-muted hover:bg-minus/10 hover:text-minus disabled:pointer-events-none disabled:opacity-30"><FiTrash2 /></button>
          </div>
        );
      })}
      {options.length < MAX_OPTIONS && (
        <button type="button" className="btn-ghost py-2 text-xs" onClick={() => onChange([...options, ''], correctIndex)}><FiPlus /> Seçenek ekle</button>
      )}
    </div>
  );
}

export default function ResourceForm({ schema, item, lookups, onClose, onSaved }) {
  const editing = Boolean(item);
  const [form, setForm] = useState(() => toForm(schema, item));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [slugTouched, setSlugTouched] = useState(editing);

  const change = (name, value) => {
    setForm((prev) => {
      let next = setPath(prev, name, value);
      // Sınıf değişince o sınıfa ait olmayan ünite/konu seçimi temizlenir
      for (const f of schema.fields) {
        if (f.type === 'select' && f.name !== name && f.options(next, lookups).every((o) => o.value !== getPath(next, f.name))) {
          next = setPath(next, f.name, '');
        }
      }
      if (schema.autoSlug && !slugTouched && (name === 'title' || name === 'grade')) {
        next.slug = next.title.trim() ? `${next.grade}-${slugify(next.title)}` : '';
      }
      return next;
    });
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = schema.validate?.(form) || {};
    if (Object.keys(found).length) {
      setErrors(found);
      toast.error('Lütfen işaretli alanları kontrol edin.');
      return;
    }
    setBusy(true);
    try {
      let payload = schema.clean ? schema.clean(form) : form;
      for (const f of schema.fields) {
        if (f.type === 'number' && getPath(payload, f.name) === '') payload = setPath(payload, f.name, 0);
      }
      if (editing) await api.patch(`/admin/${schema.id}/${item._id}`, payload);
      else await api.post(`/admin/${schema.id}`, payload);
      toast.success(editing ? `${schema.singular} güncellendi.` : `${schema.singular} eklendi.`);
      onSaved();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const renderInput = (f) => {
    const value = getPath(form, f.name);
    const invalid = errors[f.name] ? 'border-minus' : '';
    switch (f.type) {
      case 'textarea':
        return (
          <>
            <textarea id={f.name} rows={f.rows || 3} spellCheck={false} className={`input ${f.mono ? 'font-mono text-xs' : ''} ${invalid}`} value={value} onChange={(e) => change(f.name, e.target.value)} />
            {f.preview && String(value).trim() && (
              <div className="mt-2 rounded-xl border border-dashed border-line bg-bg px-4 py-2 text-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Önizleme</p>
                <MathText>{value}</MathText>
              </div>
            )}
          </>
        );
      case 'number':
        return <input id={f.name} type="number" min={0} className={`input font-mono ${invalid}`} value={value} onChange={(e) => change(f.name, e.target.value === '' ? '' : Number(e.target.value))} />;
      case 'grade':
        return (
          <select id={f.name} className="input" value={value} onChange={(e) => change(f.name, Number(e.target.value))}>
            {GRADES.map((g) => <option key={g} value={g}>{g}. Sınıf</option>)}
          </select>
        );
      case 'select': {
        const opts = f.options(form, lookups);
        return (
          <>
            <select id={f.name} className={`input ${invalid}`} value={value} onChange={(e) => change(f.name, e.target.value)}>
              {f.placeholder && <option value="">{f.placeholder}</option>}
              {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {opts.length === 0 && f.emptyHint && <p className="mt-1.5 text-xs text-times">{f.emptyHint}</p>}
          </>
        );
      }
      case 'toggle':
        return <Toggle checked={Boolean(value)} onChange={(v) => change(f.name, v)} label={f.label} />;
      case 'grades':
        return (
          <div className="flex flex-wrap gap-2">
            {GRADES.map((g) => {
              const on = value.includes(g);
              return (
                <button key={g} type="button" aria-pressed={on} onClick={() => change(f.name, on ? value.filter((x) => x !== g) : [...value, g].sort())}
                  className={`btn px-3 py-2 ${on ? 'bg-brand text-white' : 'border border-line bg-surface text-muted'}`}>{g}. Sınıf</button>
              );
            })}
          </div>
        );
      case 'list':
        return <ListField field={f} value={value} onChange={(v) => change(f.name, v)} />;
      case 'options':
        return (
          <OptionsField options={form.options} correctIndex={form.correctIndex}
            onChange={(opts, ci) => { setForm((p) => ({ ...p, options: opts, correctIndex: ci })); setErrors((e) => ({ ...e, options: undefined })); }} />
        );
      default:
        return (
          <input id={f.name} type="text" maxLength={f.maxLength} placeholder={f.placeholder} className={`input ${f.mono ? 'font-mono' : ''} ${invalid}`} value={value}
            onChange={(e) => { if (f.name === 'slug') setSlugTouched(true); change(f.name, e.target.value); }} />
        );
    }
  };

  return (
    <Drawer
      title={editing ? `${schema.singular} düzenle` : `Yeni ${schema.singular.toLocaleLowerCase('tr-TR')}`}
      onClose={onClose}
      footer={(
        <>
          <button type="button" className="btn-ghost" onClick={onClose}>Vazgeç</button>
          <button type="submit" form="resource-form" disabled={busy} className="btn-primary">{busy ? 'Kaydediliyor…' : editing ? 'Değişiklikleri kaydet' : 'Kaydet'}</button>
        </>
      )}
    >
      <form id="resource-form" onSubmit={submit} className="grid grid-cols-2 gap-x-4 gap-y-5" noValidate>
        {schema.fields.map((f) => (
          <div key={f.name} className={f.half ? 'col-span-2 sm:col-span-1' : 'col-span-2'}>
            {f.type === 'toggle'
              ? <div className={f.half ? 'sm:pt-8' : ''}>{renderInput(f)}</div>
              : <><label className="label" htmlFor={f.name}>{f.label}</label>{renderInput(f)}</>}
            {errors[f.name] ? <p className="mt-1.5 text-xs font-medium text-minus">{errors[f.name]}</p> : f.hint && <p className="mt-1.5 text-xs text-muted">{f.hint}</p>}
          </div>
        ))}
      </form>
    </Drawer>
  );
}
