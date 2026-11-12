export function notFound(req, res) {
  res.status(404).json({ message: `Bulunamadı: ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Bu kayıt zaten mevcut.' });
  }
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ message: err.message });
  }
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Sunucu hatası' });
}
