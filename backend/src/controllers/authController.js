import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function makeToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must contain at least 8 characters.' });
    const user = await User.create({ name, email, password, role: 'user' });
    res.status(201).json({ token: makeToken(user), user: user.toSafeObject() });
  } catch (err) { next(err); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Email or password is incorrect.' });
    }
    if (user.status !== 'active') return res.status(403).json({ message: 'This account is inactive. Contact an administrator.' });
    res.json({ token: makeToken(user), user: user.toSafeObject() });
  } catch (err) { next(err); }
}

export async function me(req, res) {
  res.json({ user: req.user.toSafeObject() });
}
