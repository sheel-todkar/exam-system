const crypto = require('crypto');
const User = require('../models/User');
const { sign } = require('../utils/jwt');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email });
  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const safeUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return res.json({
    token: sign(safeUser),
    user: safeUser,
  });
}

async function register(req, res) {
  const { name, email, password, role = 'student' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'A user with that email already exists' });
  }

  const user = await User.create({
    name,
    email,
    role,
    passwordHash: hashPassword(password),
  });

  const safeUser = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return res.status(201).json({ token: sign(safeUser), user: safeUser });
}

module.exports = {
  login,
  register,
};

