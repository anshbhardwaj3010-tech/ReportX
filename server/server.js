import crypto from 'node:crypto';
import fs from 'node:fs';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import nodemailer from 'nodemailer';

dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)) });

const app = express();
const port = Number(process.env.PORT || 5000);
const clientOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((origin) => origin.trim());
const defaultClientOrigin = clientOrigins[0];
const publicAppUrl = process.env.PUBLIC_APP_URL || defaultClientOrigin;
const maintenanceEmail = process.env.MAINTENANCE_EMAIL;
const adminEmails = new Set((process.env.ADMIN_EMAILS || '').split(',').map((email) => email.trim().toLowerCase()).filter(Boolean));
const tokenSecret = process.env.JWT_SECRET;
const scrypt = promisify(crypto.scrypt);
const uploadsDirectory = fileURLToPath(new URL('./uploads/', import.meta.url));
const imageExtensions = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

fs.mkdirSync(uploadsDirectory, { recursive: true });

app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || clientOrigins.includes(origin));
  }
}));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(uploadsDirectory));

const imageUpload = multer({
  storage: multer.diskStorage({
    destination: uploadsDirectory,
    filename(_req, file, callback) {
      callback(null, `${crypto.randomUUID()}${imageExtensions[file.mimetype]}`);
    }
  }),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    if (!imageExtensions[file.mimetype]) return callback(new Error('Use a JPEG, PNG, or WebP image.'));
    callback(null, true);
  }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  collegeId: { type: String, required: true, trim: true },
  collegeName: { type: String, required: true },
  role: { type: String, enum: ['student', 'technician', 'admin'], default: 'student' },
  department: { type: String, default: null },
  staffApproved: { type: Boolean, default: false },
  rewardPoints: { type: Number, default: 0 },
  rewardedIssueIds: { type: [String], default: [] },
  emailVerified: { type: Boolean, default: false },
  verificationTokenHash: String,
  verificationExpiresAt: Date,
  verificationLastSentAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const issueSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  domain: { type: String, enum: ['on-campus', 'off-campus'], required: true },
  location: { type: String, required: true },
  urgency: { type: String, required: true },
  status: { type: String, enum: ['reported', 'in_progress', 'resolved'], default: 'reported' },
  reportedByUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportedByEmail: { type: String, required: true },
  reportedByName: { type: String, required: true },
  assignedTo: { type: String, default: 'Unassigned' },
  assignedToUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedToEmail: String,
  assignedDepartment: String,
  isGenuine: { type: Boolean, default: null },
  rejectionReason: String,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: Date,
  rewardPointsGranted: { type: Number, default: 0 },
  fixerEmail: String,
  upvotes: { type: Number, default: 1 },
  upvotedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  imageUrl: String,
  beforeImageUrl: String,
  afterImageUrl: String,
  resolutionNotes: String,
  studentVerified: { type: Boolean, default: false },
  rating: Number,
  activityLog: {
    type: [new mongoose.Schema({
      id: String,
      text: String,
      timestamp: { type: Date, default: Date.now },
      type: { type: String }
    }, { _id: false })],
    default: []
  },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Issue = mongoose.model('Issue', issueSchema);

const transporter = process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS
  ? nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    })
  : null;

const publicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  collegeId: user.collegeId,
  collegeName: user.collegeName,
  role: user.role === 'technician' && !user.staffApproved ? 'pending_technician' : user.role,
  department: user.department,
  staffApproved: user.staffApproved,
  rewardPoints: user.rewardPoints || 0,
  verified: user.emailVerified
});

const publicIssue = (issue) => ({
  id: issue.ticketId,
  title: issue.title,
  description: issue.description,
  category: issue.category,
  domain: issue.domain,
  location: issue.location,
  urgency: issue.urgency,
  status: issue.status,
  isGenuine: issue.isGenuine ?? null,
  rejectionReason: issue.rejectionReason || null,
  rewardPointsGranted: issue.rewardPointsGranted || 0,
  reportedBy: `${issue.reportedByName}`,
  reportedAt: issue.createdAt,
  upvotes: issue.upvotes,
  upvotedUsers: issue.upvotedUsers.map(String),
  assignedTo: issue.assignedTo,
  assignedToUser: issue.assignedToUser ? issue.assignedToUser.toString() : null,
  assignedToEmail: issue.assignedToEmail || null,
  assignedDepartment: issue.assignedDepartment || null,
  imageUrl: issue.imageUrl || issue.beforeImageUrl || null,
  beforeImageUrl: issue.beforeImageUrl || issue.imageUrl || null,
  afterImageUrl: issue.afterImageUrl || null,
  resolutionNotes: issue.resolutionNotes || null,
  studentVerified: issue.studentVerified,
  rating: issue.rating || null,
  activityLog: issue.activityLog.map((entry) => ({
    id: entry.id,
    text: entry.text,
    timestamp: entry.timestamp,
    type: entry.type
  }))
});

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) throw new Error('Email is not configured. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS.');
  await transporter.sendMail({ from: process.env.EMAIL_FROM || process.env.EMAIL_USER, to, subject, html });
};

const sendVerificationEmail = async (user, token) => {
  const verificationUrl = new URL('/', publicAppUrl);
  verificationUrl.searchParams.set('verifyToken', token);
  await sendEmail({
    to: user.email,
    subject: 'Verify your ReportX email address',
    html: `<p>Hello ${escapeHtml(user.name)},</p><p>Confirm your email to activate your ReportX account:</p><p><a href="${verificationUrl}">Verify email address</a></p><p>This link expires in 24 hours. If you did not create this account, ignore this message.</p>`
  });
};

const sendWelcomeEmail = (user) => sendEmail({
  to: user.email,
  subject: user.role === 'technician' ? 'Your ReportX maintenance application is verified' : 'Your ReportX account is verified',
  html: user.role === 'technician'
    ? `<p>Hello ${escapeHtml(user.name)},</p><p>Your email is verified. Your maintenance staff application is waiting for approval from the maintenance office.</p>`
    : `<p>Hello ${escapeHtml(user.name)},</p><p>Your email is verified and your ReportX account is ready to use.</p>`
});

const sendStaffApplicationEmail = (user) => maintenanceEmail ? sendEmail({
  to: maintenanceEmail,
  subject: `Maintenance staff application: ${user.name}`,
  html: `<p>A maintenance staff applicant verified their email.</p><p>Name: ${escapeHtml(user.name)}<br>Email: ${escapeHtml(user.email)}<br>Employee ID: ${escapeHtml(user.collegeId)}<br>Department: ${escapeHtml(user.department)}</p><p>Review and approve this application in the ReportX admin dashboard.</p>`
}) : Promise.resolve();

const sendIssueReceipt = async (issue) => {
  const emails = [sendEmail({
    to: issue.reportedByEmail,
    subject: `ReportX issue received: ${issue.ticketId}`,
    html: `<p>Hello ${escapeHtml(issue.reportedByName)},</p><p>Your report <strong>${escapeHtml(issue.ticketId)}: ${escapeHtml(issue.title)}</strong> was received.</p><p>Location: ${escapeHtml(issue.location)}<br>Status: ${escapeHtml(issue.status)}</p>`
  })];
  if (maintenanceEmail) {
    emails.push(sendEmail({
      to: maintenanceEmail,
      subject: `New issue awaiting assignment: ${issue.ticketId}`,
      html: `<p>A new issue needs maintenance-office review.</p><p>Ticket: ${escapeHtml(issue.ticketId)}<br>Title: ${escapeHtml(issue.title)}<br>Category: ${escapeHtml(issue.category)}<br>Location: ${escapeHtml(issue.location)}<br>Urgency: ${escapeHtml(issue.urgency)}<br>Reported by: ${escapeHtml(issue.reportedByName)} (${escapeHtml(issue.reportedByEmail)})</p><p>Assign an approved field employee in the ReportX admin dashboard.</p>`
    }));
  } else {
    console.warn('MAINTENANCE_EMAIL is not configured; report was not emailed to the maintenance office.');
  }
  await Promise.all(emails);
};

const sendReviewDecisionEmail = (issue) => sendEmail({
  to: issue.reportedByEmail,
  subject: issue.isGenuine ? `Issue verified: ${issue.ticketId}` : `Report review update: ${issue.ticketId}`,
  html: issue.isGenuine
    ? `<p>Your report <strong>${escapeHtml(issue.ticketId)}: ${escapeHtml(issue.title)}</strong> was verified by the maintenance office and can now be assigned.</p>`
    : `<p>Your report <strong>${escapeHtml(issue.ticketId)}: ${escapeHtml(issue.title)}</strong> was not verified as a genuine maintenance issue.</p><p>Reason: ${escapeHtml(issue.rejectionReason || 'Please contact the maintenance office for details.')}</p>`
});

const sendAssignmentEmail = async (issue, technician) => {
  await Promise.all([
    sendEmail({
      to: technician.email,
      subject: `Work order assigned: ${issue.ticketId}`,
      html: `<p>Hello ${escapeHtml(technician.name)},</p><p>You have been assigned <strong>${escapeHtml(issue.ticketId)}: ${escapeHtml(issue.title)}</strong>.</p><p>Department: ${escapeHtml(technician.department)}<br>Location: ${escapeHtml(issue.location)}<br>Urgency: ${escapeHtml(issue.urgency)}</p><p>Sign in to ReportX to track and update the work order.</p>`
    }),
    sendEmail({
      to: issue.reportedByEmail,
      subject: `Maintenance assigned to your issue: ${issue.ticketId}`,
      html: `<p>Your issue <strong>${escapeHtml(issue.ticketId)}: ${escapeHtml(issue.title)}</strong> has been assigned to ${escapeHtml(technician.name)} (${escapeHtml(technician.department)}).</p><p>Location: ${escapeHtml(issue.location)}<br>Status: ${escapeHtml(issue.status)}</p>`
    })
  ]);
};

const sendStatusEmail = async (issue) => {
  const recipients = [...new Set([issue.reportedByEmail, issue.fixerEmail].filter(Boolean))];
  await Promise.all(recipients.map((to) => sendEmail({
    to,
    subject: `ReportX ${issue.ticketId}: ${issue.status.replace('_', ' ')}`,
    html: `<p>Issue <strong>${escapeHtml(issue.ticketId)}: ${escapeHtml(issue.title)}</strong> is now ${escapeHtml(issue.status.replace('_', ' '))}.</p><p>Updated by: ${escapeHtml(issue.assignedTo)}<br>Resolution notes: ${escapeHtml(issue.resolutionNotes || 'No notes provided.')}</p>`
  })));
};

const emailTask = (promise) => promise.catch((error) => console.error('Email delivery failed:', error.message));

const createSession = (user) => {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub: user._id.toString(), iat: now, exp: now + 60 * 60 * 24 * 7 })).toString('base64url');
  const signature = crypto.createHmac('sha256', tokenSecret).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
};

const getAuthenticatedUser = async (req) => {
  const [header, payload, signature] = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').split('.');
  if (!header || !payload || !signature) throw new Error('Invalid session.');
  const expected = crypto.createHmac('sha256', tokenSecret).update(`${header}.${payload}`).digest();
  const actual = Buffer.from(signature, 'base64url');
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) throw new Error('Invalid session.');
  const claims = JSON.parse(Buffer.from(payload, 'base64url').toString());
  if (claims.exp <= Date.now() / 1000) throw new Error('Session expired. Please sign in again.');
  const user = await User.findById(claims.sub);
  if (!user?.emailVerified) throw new Error('Please verify your email first.');
  if (adminEmails.has(user.email) && user.role !== 'admin') {
    user.role = 'admin';
    user.staffApproved = true;
    await user.save();
  }
  return user;
};

const optionalAuth = async (req, res, next) => {
  if (!req.headers.authorization) return next();
  try {
    req.user = await getAuthenticatedUser(req);
    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const requireAuth = (req, res, next) => {
  if (!req.headers.authorization) return res.status(401).json({ error: 'Please sign in.' });
  return optionalAuth(req, res, next);
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Only maintenance-office admins can dispatch work.' });
  next();
};

const requireResolver = (req, res, next) => {
  if (req.user.role === 'technician' && !req.user.staffApproved) {
    return res.status(403).json({ error: 'Your maintenance staff application is waiting for office approval.' });
  }
  if (!['technician', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Only maintenance staff can update issue status.' });
  }
  next();
};

const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 }));

app.post('/api/uploads', requireAuth, imageUpload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Choose an image to upload.' });
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

app.get('/api/admin/staff-applications', requireAuth, requireAdmin, asyncRoute(async (_req, res) => {
  const applicants = await User.find({ role: 'technician', staffApproved: false, emailVerified: true }).sort({ createdAt: 1 });
  res.json(applicants.map(publicUser));
}));

app.get('/api/admin/technicians', requireAuth, requireAdmin, asyncRoute(async (_req, res) => {
  const technicians = await User.find({ role: 'technician', staffApproved: true, emailVerified: true }).sort({ name: 1 });
  res.json(technicians.map(publicUser));
}));

app.get('/api/admin/issues/pending-review', requireAuth, requireAdmin, asyncRoute(async (_req, res) => {
  const issues = await Issue.find({ isGenuine: null, status: 'reported' }).sort({ createdAt: 1 });
  res.json(issues.map(publicIssue));
}));

app.put('/api/admin/staff-applications/:userId/approve', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const technician = await User.findOneAndUpdate(
    { _id: req.params.userId, role: 'technician', staffApproved: false, emailVerified: true },
    { $set: { staffApproved: true } },
    { new: true }
  );
  if (!technician) return res.status(404).json({ error: 'Verified pending staff application not found.' });
  emailTask(sendEmail({
    to: technician.email,
    subject: 'Your ReportX maintenance staff account is approved',
    html: `<p>Hello ${escapeHtml(technician.name)},</p><p>The maintenance office approved your ${escapeHtml(technician.department)} account. You can now sign in to view assigned work orders.</p>`
  }));
  res.json({ user: publicUser(technician) });
}));

app.post('/api/auth/signup', asyncRoute(async (req, res) => {
  const { name, email, password, collegeId, collegeName, accountType = 'student', department } = req.body;
  const isMaintenanceStaff = accountType === 'maintenance';
  if (!['student', 'maintenance'].includes(accountType)) {
    return res.status(400).json({ error: 'Choose either student or maintenance staff signup.' });
  }
  if (![name, email, password, collegeId, collegeName].every((value) => typeof value === 'string' && value.trim())) {
    return res.status(400).json({ error: 'Name, email, password, college ID, and college are required.' });
  }
  if (isMaintenanceStaff && !['general', 'electrical', 'plumbing', 'appliance', 'ro-water', 'it-wifi', 'cleanliness', 'furniture', 'safety'].includes(department)) {
    return res.status(400).json({ error: 'Select a valid maintenance department.' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
    return res.status(400).json({ error: 'Enter a valid email and a password of at least 8 characters.' });
  }
  if (!transporter) return res.status(503).json({ error: 'Email delivery is not configured on the server.' });

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = `${salt}:${(await scrypt(password, salt, 64)).toString('hex')}`;
  const user = new User({
    name: name.trim(), email: email.trim().toLowerCase(), passwordHash,
    collegeId: collegeId.trim(), collegeName: collegeName.trim(),
    role: isMaintenanceStaff ? 'technician' : 'student',
    department: isMaintenanceStaff ? department : null,
    staffApproved: !isMaintenanceStaff,
    verificationTokenHash: crypto.createHash('sha256').update(verificationToken).digest('hex'),
    verificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    verificationLastSentAt: new Date()
  });

  try {
    await user.save();
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'An account with this email already exists.' });
    throw error;
  }
  try {
    await sendVerificationEmail(user, verificationToken);
  } catch (error) {
    await User.deleteOne({ _id: user._id });
    console.error('Verification email failed:', error.message);
    return res.status(503).json({ error: 'Could not send the verification email. Check the server email settings and try again.' });
  }
  res.status(201).json({ message: 'Account created. Check your inbox for the email verification link.' });
}));

app.post('/api/auth/resend-verification', asyncRoute(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const user = await User.findOne({ email, emailVerified: false });
  const genericMessage = 'If this email has an unverified account, a verification link has been sent. Check Inbox, Spam, and Promotions.';
  if (!user) return res.json({ message: genericMessage });

  const cooldownMs = 60 * 1000;
  if (user.verificationLastSentAt && Date.now() - user.verificationLastSentAt.getTime() < cooldownMs) {
    return res.json({ message: genericMessage });
  }

  const token = crypto.randomBytes(32).toString('hex');
  user.verificationTokenHash = crypto.createHash('sha256').update(token).digest('hex');
  user.verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  user.verificationLastSentAt = new Date();
  await user.save();
  await sendVerificationEmail(user, token);
  res.json({ message: genericMessage });
}));

app.post('/api/auth/verify', asyncRoute(async (req, res) => {
  const { token } = req.body;
  if (typeof token !== 'string') return res.status(400).json({ error: 'Verification token is required.' });
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOneAndUpdate({
    verificationTokenHash: tokenHash,
    verificationExpiresAt: { $gt: new Date() }
  }, {
    $set: { emailVerified: true },
    $unset: { verificationTokenHash: 1, verificationExpiresAt: 1 }
  }, { new: true });
  if (!user) return res.status(400).json({ error: 'This verification link is invalid or expired. Create a new account or contact support.' });
  emailTask(sendWelcomeEmail(user));
  if (user.role === 'technician') emailTask(sendStaffApplicationEmail(user));
  res.json({ message: 'Email verified. You can now sign in.' });
}));

app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: String(email || '').trim().toLowerCase() });
  if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
  if (!user.emailVerified) return res.status(403).json({ error: 'Verify your email using the link we sent before signing in.' });
  const [salt, storedHash] = user.passwordHash.split(':');
  const candidate = await scrypt(String(password || ''), salt, 64);
  if (!crypto.timingSafeEqual(candidate, Buffer.from(storedHash, 'hex'))) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  if (adminEmails.has(user.email) && user.role !== 'admin') {
    user.role = 'admin';
    user.staffApproved = true;
    await user.save();
  }
  res.json({ token: createSession(user), user: publicUser(user) });
}));

app.get('/api/auth/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

app.get('/api/issues', optionalAuth, asyncRoute(async (req, res) => {
  let filter = {};
  if (req.user?.role === 'technician') {
    filter = { assignedToUser: req.user._id, isGenuine: true };
  } else if (req.user?.role !== 'admin') {
    filter = req.user
      ? { $or: [{ isGenuine: { $ne: false } }, { reportedByUser: req.user._id }] }
      : { isGenuine: { $ne: false } };
  }
  const issues = await Issue.find(filter).sort({ createdAt: -1 });
  res.json(issues.map(publicIssue));
}));

app.post('/api/issues', requireAuth, asyncRoute(async (req, res) => {
  const { title, description, category, domain, location, urgency, imageUrl } = req.body;
  const required = [title, description, category, domain, location, urgency];
  if (!required.every((value) => typeof value === 'string' && value.trim())) {
    return res.status(400).json({ error: 'Complete all required issue fields.' });
  }
  const duplicate = await Issue.findOne({
    domain,
    location,
    category,
    status: { $ne: 'resolved' },
    isGenuine: { $ne: false }
  }).sort({ createdAt: -1 });
  if (duplicate) {
    return res.status(409).json({
      error: `An unresolved issue already exists for this category and location: ${duplicate.ticketId}.`,
      duplicate: publicIssue(duplicate)
    });
  }
  const issue = await Issue.create({
    ticketId: `REP-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    title, description, category, domain, location, urgency, imageUrl,
    beforeImageUrl: imageUrl,
    reportedByUser: req.user._id,
    reportedByEmail: req.user.email,
    reportedByName: req.user.name,
    upvotedUsers: [req.user._id],
    activityLog: [{
      id: crypto.randomUUID(),
      text: 'Issue reported',
      timestamp: new Date(),
      type: 'system'
    }]
  });
  emailTask(sendIssueReceipt(issue));
  res.status(201).json({ issue: publicIssue(issue) });
}));

app.put('/api/issues/:ticketId/review', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const { decision, reason } = req.body;
  if (!['genuine', 'rejected'].includes(decision)) {
    return res.status(400).json({ error: 'Choose whether this report is genuine or rejected.' });
  }
  if (decision === 'rejected' && !String(reason || '').trim()) {
    return res.status(400).json({ error: 'Provide a reason when rejecting a report.' });
  }

  const issue = await Issue.findOne({ ticketId: req.params.ticketId, status: 'reported', isGenuine: null });
  if (!issue) return res.status(409).json({ error: 'This report has already been reviewed or is no longer awaiting review.' });
  issue.isGenuine = decision === 'genuine';
  issue.rejectionReason = decision === 'rejected' ? String(reason).trim().slice(0, 500) : null;
  issue.reviewedBy = req.user._id;
  issue.reviewedAt = new Date();
  issue.activityLog.push({
    id: crypto.randomUUID(),
    text: decision === 'genuine' ? 'Maintenance office verified this as a genuine issue.' : `Maintenance office rejected this report: ${issue.rejectionReason}`,
    timestamp: issue.reviewedAt,
    type: 'review'
  });
  await issue.save();
  emailTask(sendReviewDecisionEmail(issue));
  res.json({ issue: publicIssue(issue) });
}));

app.put('/api/issues/:ticketId/assign', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const technician = await User.findOne({
    _id: req.body.technicianId,
    role: 'technician',
    staffApproved: true,
    emailVerified: true
  });
  if (!technician) return res.status(404).json({ error: 'Approved maintenance employee not found.' });

  const issue = await Issue.findOne({ ticketId: req.params.ticketId });
  if (!issue) return res.status(404).json({ error: 'Issue not found.' });
  if (issue.isGenuine !== true) return res.status(409).json({ error: 'Verify this report as genuine before assigning it.' });
  if (technician.department !== 'general' && technician.department !== issue.category) {
    return res.status(400).json({ error: 'Choose a technician from the matching department or general maintenance.' });
  }

  issue.assignedToUser = technician._id;
  issue.assignedTo = technician.name;
  issue.assignedToEmail = technician.email;
  issue.assignedDepartment = technician.department;
  issue.activityLog.push({
    id: crypto.randomUUID(),
    text: `Assigned to ${technician.name} (${technician.department}).`,
    timestamp: new Date(),
    type: 'assignment'
  });
  await issue.save();
  emailTask(sendAssignmentEmail(issue, technician));
  res.json({ issue: publicIssue(issue) });
}));

app.post('/api/issues/:ticketId/upvote', requireAuth, asyncRoute(async (req, res) => {
  const issue = await Issue.findOne({ ticketId: req.params.ticketId });
  if (!issue) return res.status(404).json({ error: 'Issue not found.' });
  const alreadyUpvoted = issue.upvotedUsers.some((id) => id.equals(req.user._id));
  issue.upvotedUsers = alreadyUpvoted
    ? issue.upvotedUsers.filter((id) => !id.equals(req.user._id))
    : [...issue.upvotedUsers, req.user._id];
  issue.upvotes = issue.upvotedUsers.length;
  await issue.save();
  res.json({ issue: publicIssue(issue) });
}));

app.put('/api/issues/:ticketId/status', requireAuth, requireResolver, asyncRoute(async (req, res) => {
  const { status, afterImageUrl, resolutionNotes } = req.body;
  if (!['in_progress', 'resolved'].includes(status)) return res.status(400).json({ error: 'Invalid issue status.' });
  const issue = await Issue.findOne({ ticketId: req.params.ticketId });
  if (!issue) return res.status(404).json({ error: 'Issue not found.' });
  if (issue.isGenuine !== true) return res.status(409).json({ error: 'The maintenance office must verify this report before work can begin.' });
  if (req.user.role === 'technician' && (!req.user.staffApproved || !issue.assignedToUser?.equals(req.user._id))) {
    return res.status(403).json({ error: 'This work order is not assigned to your account.' });
  }
  if (status === 'in_progress' && issue.status !== 'reported') {
    return res.status(409).json({ error: 'Only a reported work order can be started.' });
  }
  if (status === 'resolved' && issue.status !== 'in_progress') {
    return res.status(409).json({ error: 'Start work before resolving this issue.' });
  }
  issue.status = status;
  issue.assignedTo = req.user.name;
  issue.fixerEmail = req.user.email;
  if (afterImageUrl) issue.afterImageUrl = afterImageUrl;
  if (resolutionNotes) issue.resolutionNotes = resolutionNotes;
  issue.activityLog.push({
    id: crypto.randomUUID(),
    text: `Status updated to ${status.replace('_', ' ')}${resolutionNotes ? ` - ${resolutionNotes}` : ''}`,
    timestamp: new Date(),
    type: 'status'
  });
  await issue.save();
  let rewardPointsAwarded = 0;
  if (status === 'resolved' && issue.isGenuine === true) {
    const rewardResult = await User.updateOne(
      { _id: issue.reportedByUser, rewardedIssueIds: { $ne: issue.ticketId } },
      { $inc: { rewardPoints: 50 }, $addToSet: { rewardedIssueIds: issue.ticketId } }
    );
    if (rewardResult.modifiedCount === 1) {
      rewardPointsAwarded = 50;
      issue.rewardPointsGranted = rewardPointsAwarded;
      issue.activityLog.push({
        id: crypto.randomUUID(),
        text: 'Genuine issue fully resolved. Reporter awarded 50 reward points.',
        timestamp: new Date(),
        type: 'reward'
      });
      await issue.save();
    }
  }
  emailTask(sendStatusEmail(issue));
  res.json({ issue: publicIssue(issue), rewardPointsAwarded });
}));

app.post('/api/issues/:ticketId/comments', requireAuth, asyncRoute(async (req, res) => {
  const text = String(req.body.text || '').trim();
  if (!text || text.length > 1000) return res.status(400).json({ error: 'Comment must be between 1 and 1000 characters.' });
  const issue = await Issue.findOne({ ticketId: req.params.ticketId });
  if (!issue) return res.status(404).json({ error: 'Issue not found.' });
  issue.activityLog.push({
    id: crypto.randomUUID(),
    text: `${req.user.name}: ${text}`,
    timestamp: new Date(),
    type: 'comment'
  });
  await issue.save();
  res.json({ issue: publicIssue(issue) });
}));

app.post('/api/issues/:ticketId/rating', requireAuth, asyncRoute(async (req, res) => {
  const rating = Number(req.body.rating);
  const issue = await Issue.findOne({ ticketId: req.params.ticketId, reportedByUser: req.user._id });
  if (!issue) return res.status(404).json({ error: 'Issue not found.' });
  if (issue.status !== 'resolved' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Only resolved issues can receive a 1 to 5 star rating.' });
  }
  issue.studentVerified = true;
  issue.rating = rating;
  issue.activityLog.push({
    id: crypto.randomUUID(),
    text: `Reporter rated the resolution ${rating} out of 5 stars.`,
    timestamp: new Date(),
    type: 'rating'
  });
  await issue.save();
  res.json({ issue: publicIssue(issue) });
}));

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Image must be 8 MB or smaller.' });
  }
  if (error.message === 'Use a JPEG, PNG, or WebP image.') {
    return res.status(400).json({ error: error.message });
  }
  res.status(500).json({ error: 'The server could not complete the request.' });
});

if (!process.env.MONGO_URI || !tokenSecret) {
  console.error('Set MONGO_URI and JWT_SECRET in server/.env before starting the API.');
  process.exit(1);
}

if (!maintenanceEmail) {
  console.warn('MAINTENANCE_EMAIL is not set; issue and staff-application emails will not reach the maintenance office.');
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(port, '0.0.0.0', () => console.log(`ReportX API listening on port ${port}`));
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });