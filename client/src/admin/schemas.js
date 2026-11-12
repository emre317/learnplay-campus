import { GAMES } from '../games/index.js';

export const GRADES = [4, 5, 6, 7, 8];
export const DIFFICULTIES = [
  { value: 'kolay', label: 'Kolay' },
  { value: 'orta', label: 'Orta' },
  { value: 'zor', label: 'Zor' },
  { value: 'yeni-nesil', label: 'Yeni Nesil' },
];
export const difficultyLabel = (v) => DIFFICULTIES.find((d) => d.value === v)?.label || v;

const TR = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' };
export const slugify = (text) =>
  String(text || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/[çğıöşü]/g, (c) => TR[c])
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const required = (form, names) =>
  Object.fromEntries(names.filter((n) => !String(form[n] ?? '').trim()).map((n) => [n, 'Bu alan zorunlu.']));

/**
 * Her içerik türü için form alanları. Alan tipleri ResourceForm içinde çizilir.
 * `options(form, lookups)` → seçenekler forma göre değişebilir (ör. sınıfa göre üniteler).
 */
export const RESOURCES = [
  {
    id: 'units',
    label: 'Üniteler',
    singular: 'Ünite',
    empty: { grade: 4, order: 1, title: '', description: '', icon: '∑' },
    fields: [
      { name: 'title', label: 'Ünite adı', type: 'text', placeholder: 'örn. Doğal Sayılar' },
      { name: 'grade', label: 'Sınıf', type: 'grade', half: true },
      { name: 'order', label: 'Sıra', type: 'number', half: true, hint: 'Sınıf içindeki sırası' },
      { name: 'icon', label: 'Simge', type: 'text', maxLength: 4, half: true, hint: 'Kartta görünen kısa simge: ∑ ½ ± 123' },
      { name: 'description', label: 'Açıklama', type: 'textarea', rows: 3 },
    ],
    validate: (f) => required(f, ['title']),
    sample: { grade: 4, order: 1, title: 'Ünite adı', description: '', icon: '∑' },
  },
  {
    id: 'topics',
    label: 'Konular',
    singular: 'Konu',
    autoSlug: true,
    empty: {
      grade: 4, unit: '', order: 1, title: '', slug: '', summary: '', outcomes: [], examples: [], worksheetUrl: '',
      video: { url: '', durationSec: 0, isPremium: true }, isPremium: false,
    },
    fields: [
      { name: 'title', label: 'Konu adı', type: 'text', placeholder: 'örn. Çarpma İşlemi' },
      { name: 'grade', label: 'Sınıf', type: 'grade', half: true },
      { name: 'order', label: 'Sıra', type: 'number', half: true, hint: 'Ünite içindeki sırası' },
      {
        name: 'unit', label: 'Ünite', type: 'select', placeholder: 'Ünite seçin',
        options: (f, l) => l.units.filter((u) => u.grade === f.grade).map((u) => ({ value: u._id, label: u.title })),
        emptyHint: 'Bu sınıfta henüz ünite yok. Önce Üniteler sekmesinden ekleyin.',
      },
      { name: 'slug', label: 'Adres (slug)', type: 'text', mono: true, hint: 'Konu sayfasının adresi: /konu/…  Konu adından otomatik üretilir.' },
      { name: 'summary', label: 'Konu özeti', type: 'textarea', rows: 7, mono: true, preview: true, hint: 'Markdown ve $formül$ yazabilirsiniz.' },
      {
        name: 'outcomes', label: 'Kazanımlar', type: 'list', addLabel: 'Kazanım ekle', empty: { code: '', text: '' },
        sub: [{ name: 'code', placeholder: 'M.4.1.1.1', width: 'w-32', mono: true }, { name: 'text', placeholder: 'Kazanım metni' }],
      },
      {
        name: 'examples', label: 'Çözümlü örnekler', type: 'list', addLabel: 'Örnek ekle', empty: { question: '', solution: '' }, stacked: true,
        sub: [{ name: 'question', placeholder: 'Soru', area: true }, { name: 'solution', placeholder: 'Çözüm', area: true }],
      },
      { name: 'worksheetUrl', label: 'Föy bağlantısı (PDF)', type: 'text', placeholder: 'https://…' },
      { name: 'video.url', label: 'Video bağlantısı', type: 'text', placeholder: 'https://…' },
      { name: 'video.durationSec', label: 'Video süresi (saniye)', type: 'number', half: true },
      { name: 'video.isPremium', label: 'Video yalnızca Premium', type: 'toggle', half: true },
      { name: 'isPremium', label: 'Konunun tamamı yalnızca Premium', type: 'toggle' },
    ],
    validate: (f) => required(f, ['title', 'unit', 'slug']),
    clean: (f) => ({
      ...f,
      outcomes: f.outcomes.filter((o) => o.code.trim() || o.text.trim()),
      examples: f.examples.filter((e) => e.question.trim() || e.solution.trim()),
    }),
    sample: { unit: '<ünite _id>', grade: 4, order: 1, title: 'Konu adı', slug: '4-konu-adi', summary: '## Başlık\n\nMetin ve $formül$', outcomes: [{ code: 'M.4.1.1.1', text: 'Kazanım' }], examples: [{ question: '', solution: '' }], worksheetUrl: '', video: { url: '', durationSec: 0, isPremium: true }, isPremium: false },
  },
  {
    id: 'questions',
    label: 'Sorular',
    singular: 'Soru',
    empty: { grade: 4, topic: '', outcome: '', difficulty: 'kolay', text: '', image: '', options: ['', '', '', ''], correctIndex: 0, solution: '', isPremium: false },
    fields: [
      { name: 'grade', label: 'Sınıf', type: 'grade', half: true },
      { name: 'difficulty', label: 'Zorluk', type: 'select', half: true, options: () => DIFFICULTIES },
      {
        name: 'topic', label: 'Konu', type: 'select', placeholder: 'Konu seçin',
        options: (f, l) => l.topics.filter((t) => t.grade === f.grade).map((t) => ({ value: t._id, label: t.title })),
        emptyHint: 'Bu sınıfta henüz konu yok. Önce Konular sekmesinden ekleyin.',
      },
      { name: 'text', label: 'Soru metni', type: 'textarea', rows: 3, preview: true, hint: 'Markdown ve $formül$ yazabilirsiniz.' },
      { name: 'options', label: 'Seçenekler', type: 'options', hint: 'Doğru seçeneği soldaki düğmeyle işaretleyin.' },
      { name: 'solution', label: 'Çözüm açıklaması', type: 'textarea', rows: 3, preview: true },
      { name: 'outcome', label: 'Kazanım kodu', type: 'text', half: true, mono: true, placeholder: 'M.4.1.1.1' },
      { name: 'image', label: 'Görsel bağlantısı', type: 'text', half: true, placeholder: 'https://…' },
      { name: 'isPremium', label: 'Yalnızca Premium', type: 'toggle' },
    ],
    validate: (f) => {
      const e = required(f, ['topic', 'text']);
      if (f.options.some((o) => !String(o).trim())) e.options = 'Tüm seçenekleri doldurun ya da boş olanı kaldırın.';
      return e;
    },
    sample: [{ topic: '<konu _id>', grade: 4, outcome: 'M.4.1.1.1', difficulty: 'kolay', text: 'Soru metni', options: ['A', 'B', 'C', 'D'], correctIndex: 0, solution: 'Çözüm açıklaması', isPremium: false }],
  },
  {
    id: 'games',
    label: 'Oyunlar',
    singular: 'Oyun',
    empty: { key: '', title: '', description: '', grades: [4], isPremium: true },
    fields: [
      { name: 'title', label: 'Oyun adı', type: 'text' },
      {
        name: 'key', label: 'Oyun bileşeni', type: 'select', placeholder: 'Bileşen seçin',
        options: () => Object.entries(GAMES).map(([k, g]) => ({ value: k, label: `${g.emoji} ${k}` })),
        hint: 'Uygulamada kodlanmış oyunlardan biri. Her bileşen yalnızca bir kez eklenebilir.',
      },
      { name: 'description', label: 'Açıklama', type: 'textarea', rows: 3 },
      { name: 'grades', label: 'Sınıflar', type: 'grades' },
      { name: 'isPremium', label: 'Yalnızca Premium', type: 'toggle' },
    ],
    validate: (f) => ({ ...required(f, ['title', 'key']), ...(f.grades.length ? {} : { grades: 'En az bir sınıf seçin.' }) }),
    sample: { key: 'speed-multiply', title: 'Oyun adı', description: '', grades: [4], isPremium: true },
  },
];

export const getPath = (obj, path) => path.split('.').reduce((a, k) => a?.[k], obj);
export const setPath = (obj, path, value) => {
  const keys = path.split('.');
  const copy = structuredClone(obj);
  let t = copy;
  keys.slice(0, -1).forEach((k) => { t[k] = t[k] ?? {}; t = t[k]; });
  t[keys[keys.length - 1]] = value;
  return copy;
};

/** Kayıttan (ya da boş şablondan) yalnızca formdaki alanları içeren form durumu üretir. */
export function toForm(schema, item) {
  let form = {};
  for (const f of schema.fields) {
    const v = item ? getPath(item, f.name) : undefined;
    form = setPath(form, f.name, structuredClone(v ?? getPath(schema.empty, f.name)));
  }
  if (schema.id === 'questions') form.correctIndex = item?.correctIndex ?? 0;
  return form;
}
