import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET tanımlı değil. server/.env dosyasını oluşturun (.env.example).');
  process.exit(1);
}

connectDB(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`✓ API http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('MongoDB bağlantı hatası:', err.message);
    process.exit(1);
  });
