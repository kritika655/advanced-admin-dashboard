import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

try {
  await connectDB();
  const email = 'admin@example.com';
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Seed account already exists: ${email}. No changes made.`);
  } else {
    await User.create({
      name: 'Dashboard Super Admin',
      email,
      password: 'Admin123!',
      role: 'super_admin',
      status: 'active'
    });
    console.log(`Created ${email} with the initial password Admin123!`);
    console.log('Sign in and change this password. Do not use these credentials in production.');
  }
} catch (error) {
  console.error('Could not seed admin:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
