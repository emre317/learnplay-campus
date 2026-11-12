/**
 * Ödeme altyapısı yer tutucusu.
 * Gerçek ödeme sağlayıcısı (iyzico / PayTR / Stripe) seçildiğinde burada
 * checkout oturumu oluşturulup webhook ile plan aktifleştirilecek.
 */
export const PLANS = [
  { id: 'free', name: 'Ücretsiz', price: 0, period: 'ay', features: ['Konu özetleri ve föyler', 'Seçili ders videoları', 'Konu başına 5 alıştırma sorusu', 'Temel ilerleme takibi'] },
  { id: 'premium-monthly', name: 'Premium Aylık', price: 199, period: 'ay', features: ['Tüm ders videoları', 'Tüm matematik oyunları', 'Sınırsız test ve soru bankası', 'Açıklamalı çözümler', 'Detaylı gelişim raporu', 'Veli paneli'] },
  { id: 'premium-yearly', name: 'Premium Yıllık', price: 1490, period: 'yıl', highlight: true, features: ['Premium Aylık\'taki her şey', '%37 tasarruf', 'LGS hazırlık denemeleri (yakında)'] },
];

export function getPlans(_req, res) {
  res.json({ plans: PLANS });
}

export function checkout(_req, res) {
  res.status(501).json({ message: 'Ödeme sistemi yakında aktif olacak.' });
}
