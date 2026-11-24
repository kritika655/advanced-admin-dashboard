import User from '../models/User.js';

export async function listUsers(req, res, next) {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 8));
    const { search = '', role, status } = req.query;
    const filter = {};
    if (search.trim()) {
      const safe = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [{ name: { $regex: safe, $options: 'i' } }, { email: { $regex: safe, $options: 'i' } }];
    }
    if (role && ['super_admin', 'admin', 'user'].includes(role)) filter.role = role;
    if (status && ['active', 'inactive'].includes(status)) filter.status = status;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      User.countDocuments(filter)
    ]);
    res.json({
      users: users.map(user => user.toSafeObject()),
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) }
    });
  } catch (err) { next(err); }
}

export async function createUser(req, res, next) {
  try {
    const { name, email, password, role = 'user', status = 'active' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must contain at least 8 characters.' });
    const allowedRoles = req.user.role === 'super_admin' ? ['super_admin', 'admin', 'user'] : ['admin', 'user'];
    if (!allowedRoles.includes(role)) return res.status(403).json({ message: 'You cannot assign this role.' });
    const user = await User.create({ name, email, password, role, status });
    res.status(201).json({ user: user.toSafeObject() });
  } catch (err) { next(err); }
}

export async function updateUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Only a super admin can modify a super admin.' });
    }
    const { name, email, role, status, password } = req.body;
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (status !== undefined) user.status = status;
    if (role !== undefined) {
      const allowedRoles = req.user.role === 'super_admin' ? ['super_admin', 'admin', 'user'] : ['admin', 'user'];
      if (!allowedRoles.includes(role)) return res.status(403).json({ message: 'You cannot assign this role.' });
      user.role = role;
    }
    if (password) {
      if (password.length < 8) return res.status(400).json({ message: 'Password must contain at least 8 characters.' });
      user.password = password;
    }
    await user.save();
    res.json({ user: user.toSafeObject() });
  } catch (err) { next(err); }
}

export async function deleteUser(req, res, next) {
  try {
    if (req.params.id === req.user._id.toString()) return res.status(400).json({ message: 'You cannot delete your own account.' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Only a super admin can delete a super admin.' });
    }
    await user.deleteOne();
    res.json({ message: 'User deleted successfully.' });
  } catch (err) { next(err); }
}
