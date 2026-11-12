import { User } from '../models/index.js';
import { signToken } from '../middleware/auth.js';

const cookieOpts = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function sendAuth(res, user, status = 200) {
  const token = signToken(user);
  res.cookie('token', token, cookieOpts).status(status).json({ token, user });
}

export async function register(req, res) {
  const { name, email, password, grade, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Bu e-posta ile kayıtlı bir hesap var.' });
  const user = await User.create({
    name,
    email,
    password,
    grade,
    role: role === 'parent' ? 'parent' : 'student', // admin kayıtla oluşturulamaz
  });
  sendAuth(res, user, 201);
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'E-posta veya şifre hatalı.' });
  }
  sendAuth(res, user);
}

export function logout(_req, res) {
  res.clearCookie('token').json({ message: 'Çıkış yapıldı.' });
}

export function me(req, res) {
  res.json({ user: req.user });
}

export async function updateMe(req, res) {
  const { name, grade } = req.body;
  if (name) req.user.name = name;
  if (grade) req.user.grade = grade;
  await req.user.save();
  res.json({ user: req.user });
}
