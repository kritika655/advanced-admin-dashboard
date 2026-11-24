import User from '../models/User.js';

export async function getStats(req, res, next) {
  try {
    const [totalUsers, activeUsers, admins, recentUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ role: { $in: ['admin', 'super_admin'] } }),
      User.find().sort({ createdAt: -1 }).limit(5)
    ]);
    res.json({
      stats: { totalUsers, activeUsers, admins, inactiveUsers: totalUsers - activeUsers },
      recentUsers: recentUsers.map(user => user.toSafeObject())
    });
  } catch (err) { next(err); }
}
