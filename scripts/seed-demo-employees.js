import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: fileURLToPath(new URL('../server/.env', import.meta.url)) });

const password = process.env.DEMO_STAFF_PASSWORD;
if (!process.env.MONGO_URI) {
  throw new Error('Set MONGO_URI in server/.env before seeding demo employees.');
}
if (!password || password.length < 8) {
  throw new Error('Set DEMO_STAFF_PASSWORD to a local-only password of at least 8 characters before running this script.');
}

const employees = [
  { name: 'Demo General Technician', department: 'general', code: 'general' },
  { name: 'Demo Electrical Technician', department: 'electrical', code: 'electrical' },
  { name: 'Demo Plumbing Technician', department: 'plumbing', code: 'plumbing' },
  { name: 'Demo Appliance Technician', department: 'appliance', code: 'appliance' },
  { name: 'Demo RO Water Technician', department: 'ro-water', code: 'ro-water' },
  { name: 'Demo IT Technician', department: 'it-wifi', code: 'it-wifi' },
  { name: 'Demo Cleanliness Technician', department: 'cleanliness', code: 'cleanliness' },
  { name: 'Demo Furniture Technician', department: 'furniture', code: 'furniture' },
  { name: 'Demo Safety Technician', department: 'safety', code: 'safety' }
];
const scrypt = promisify(crypto.scrypt);
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  collegeId: { type: String, required: true, trim: true },
  collegeName: { type: String, required: true },
  role: { type: String, enum: ['student', 'technician', 'admin'], default: 'student' },
  department: { type: String, default: null },
  operationDomain: { type: String, enum: ['on-campus', 'off-campus'], default: 'on-campus' },
  staffApproved: { type: Boolean, default: false },
  rewardPoints: { type: Number, default: 0 },
  rewardedIssueIds: { type: [String], default: [] },
  emailVerified: { type: Boolean, default: false },
  verificationTokenHash: String,
  verificationExpiresAt: Date,
  verificationLastSentAt: Date,
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const createPasswordHash = async (value) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await scrypt(value, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
};

try {
  await mongoose.connect(process.env.MONGO_URI);
  const emails = employees.map((employee) => `demo.${employee.code}@reportx.test`);
  const existingUsers = await User.find({ email: { $in: emails } });
  const existingByEmail = new Map(existingUsers.map((user) => [user.email, user]));

  for (const employee of employees) {
    const email = `demo.${employee.code}@reportx.test`;
    const existing = existingByEmail.get(email);
    if (existing && (existing.role !== 'technician' || existing.department !== employee.department)) {
      throw new Error(`${email} already belongs to a non-demo account; no account was changed.`);
    }
  }

  for (const employee of employees) {
    const email = `demo.${employee.code}@reportx.test`;
    const user = existingByEmail.get(email) || new User({ email });
    user.name = employee.name;
    user.passwordHash = await createPasswordHash(password);
    user.collegeId = `DEMO-${employee.code.toUpperCase()}-001`;
    user.collegeName = 'ReportX Demo Operations';
    user.role = 'technician';
    user.department = employee.department;
    user.operationDomain = 'on-campus';
    user.staffApproved = true;
    user.emailVerified = true;
    user.verificationTokenHash = undefined;
    user.verificationExpiresAt = undefined;
    await user.save();
  }

  console.log('Demo employee accounts are ready (all accounts share the password you supplied):');
  for (const employee of employees) {
    console.log(`demo.${employee.code}@reportx.test — ${employee.department}`);
  }
  console.log('These .test email accounts are for local demonstrations and cannot receive email.');
} finally {
  await mongoose.disconnect();
}
