# Learn Play Campus

4, 5, 6, 7 ve 8. sınıf öğrencileri için **yalnızca matematiğe odaklanan** öğrenme ve oyun platformu.
Konu anlatım föyleri, kısa ders videoları, alıştırmalar, testler ve matematik oyunları.

Proje planı: [`docs/proje-baslangic-plani.pdf`](docs/proje-baslangic-plani.pdf)

## Teknolojiler

| Katman | Kullanılanlar |
| --- | --- |
| İstemci (`client/`) | React 18, Vite, React Router, Tailwind CSS (dark/light), Framer Motion, KaTeX + react-markdown, Axios |
| Sunucu (`server/`) | Node.js, Express 5, MongoDB + Mongoose, JWT + bcrypt, Helmet, express-validator, rate limit |

## Kurulum

Gereksinimler: Node.js 20+, çalışan bir MongoDB (yerel ya da Atlas).

```bash
npm run install:all
cp server/.env.example server/.env   # MONGO_URI ve JWT_SECRET değerlerini düzenleyin
npm run seed                         # örnek 4. sınıf verisi + demo hesaplar
npm run dev                          # API :5000, web :5173
```

Seed sonrası demo hesaplar (yalnızca geliştirme içindir):

- Yönetici: `admin@learnplay.campus` / `admin123`
- Öğrenci: `ogrenci@learnplay.campus` / `ogrenci123`

## Modüller

- **Giriş sistemi** — öğrenci / veli kaydı, JWT ile oturum, rol bazlı yetki (student, parent, admin)
- **Sınıf → Ünite → Konu** hiyerarşisi (`/sinif/:grade`, `/konu/:slug`)
- **Konu sayfası** — föy (Markdown + LaTeX), ders videosu, çözümlü örnekler
- **Alıştırma ve test** — süresiz / süreli, otomatik değerlendirme, açıklamalı çözümler
- **Oyunlar** — Çarpım Yarışı, Büyük mü Küçük mü?, Kesir Eşleştir (`client/src/games`)
- **Oyunlaştırma** — XP, seviye, günlük seri, rozetler, liderlik tablosu
- **Gelişim raporu** ve **veli paneli**
- **Yönetim paneli** — ünite / konu / soru / oyun ekleme (JSON ile toplu yükleme), kullanıcı planı yönetimi
- **Premium** — ücretsiz üyede konu başına 5 soru ve seçili videolar; premium'da tüm video, oyun ve testler açık.
  Ödeme sağlayıcısı henüz bağlı değil (`server/src/controllers/billingController.js`).

## İçerik formatı

Metin alanlarında (konu özeti, soru, seçenek, çözüm) Markdown ve `$...$` arasında LaTeX kullanılabilir.

```json
{
  "topic": "<konu _id>", "grade": 4, "outcome": "M.4.1.1.1",
  "difficulty": "kolay | orta | zor | yeni-nesil",
  "text": "$24 \\times 3$ kaçtır?", "options": ["62", "72", "74", "84"],
  "correctIndex": 1, "solution": "$20\\times3 + 4\\times3 = 72$", "isPremium": false
}
```
