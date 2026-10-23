# ReportX database and email setup

The web app reads and writes issues through the Express API. The API stores users, issues, contact inquiries, and per-user notifications in MongoDB Atlas. Open browser sessions poll for issue and notification changes every five seconds; notifications remain available after signing out and back in.

## 1. Create a MongoDB Atlas database

1. Create a free Atlas project and an M0 cluster.
2. In **Database Access**, create a database user with a strong password. Grant only the `readWrite` role for the ReportX database.
3. In **Network Access**, add your current IP address. Avoid `0.0.0.0/0` except for a temporary test; remove it afterward.
4. Choose **Connect > Drivers**, select Node.js, and copy the connection string. Replace the password placeholder and specify the database name, for example `reportx_db`. URL-encode reserved characters in the password.

## 2. Configure email sending

For Gmail SMTP, enable 2-Step Verification and create an App Password. Use that App Password, not your normal Google password. Other SMTP providers can be used by setting their host, port, and credentials.

Copy `server/.env.example` to `server/.env`, then set:

- `MONGO_URI`: the Atlas connection string
- `JWT_SECRET`: a private random value; generate one with `node --input-type=module -e "import crypto from 'node:crypto'; console.log(crypto.randomBytes(32).toString('hex'))"`
- `GEMINI_API_KEY`: a Google AI Studio API key for photo/video evidence screening; keep it only in `server/.env`
- `GEMINI_MODEL`: optional model override; defaults to `gemini-3.6-flash`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, and `EMAIL_PASS`: your SMTP settings
- `EMAIL_FROM`: the sender name/address allowed by the SMTP account
- `MAINTENANCE_EMAIL`: the real maintenance-office mailbox; new issue reports, verified staff applications, and contact inquiries are sent there
- `ADMIN_EMAILS`: comma-separated list of office admin email addresses; only verified accounts matching this server-only allowlist are promoted to admin on sign-in
- `CLIENT_URL`: comma-separated browser origins allowed to call the API
- `PUBLIC_APP_URL`: fallback frontend URL for verification emails if the request has no approved browser origin

Never commit `server/.env` or share its values. The repository ignores environment files; only `.env.example` is intended to be committed.

## 3. Run the app

From the project root, use two terminals:

```powershell
npm run server
```

```powershell
npm run dev
```

Open the Vite URL printed by the second command. The API listens on port 5000. Vite proxies `/api` and `/uploads` to the API, so development works even when Vite has to use another port. Contact inquiries require valid SMTP settings and `MAINTENANCE_EMAIL`; the form shows an explicit error if delivery is not configured. If Atlas or email settings are missing or incorrect, the API reports the relevant startup/request error rather than using fallback credentials.

If sign-in or signup shows **Could not reach the ReportX API** (or a browser-level “Failed to fetch”), check the API terminal. The API will not start until both `MONGO_URI` and `JWT_SECRET` are set. After editing `server/.env`, stop and restart `npm run server`; changing the file does not update an already-running process. In production, make sure `VITE_API_URL` points to the reachable API and that the deployed browser origin is allowed by `CLIENT_URL`.

The production client includes an installable offline shell. It caches the app shell and same-origin static assets; submitting reports, uploading evidence, and contacting facilities still require an internet connection. Report drafts are saved in the current browser profile, keyed to the signed-in user, and removed when that user signs out or successfully submits the report. Browser geolocation requires user permission and a secure context (HTTPS in production); exact coordinates are attached to the report, so use it only for the issue location. Coordinates are shared with the report owner, campus/city admins, and the technician assigned to that report. City addresses without GPS coordinates remain text-only on the map rather than being assigned a guessed pin. Admin and technician dashboards show operation-specific maps, and staff can open directions for reports with coordinates.

Verification links use the approved browser origin that initiated signup or resend, so links opened from the deployed app return to that app instead of a hard-coded local URL. For production, set `CLIENT_URL` to your deployed frontend origin and set `PUBLIC_APP_URL` to that same public URL as a fallback. Set the frontend build variable `VITE_API_URL` to the deployed API base URL ending in `/api` (for example, `https://your-api-host.example/api`). Redeploy/restart after changing these settings. If you already received a link that points to localhost or a private network address, use **Resend verification email** after updating the settings; the old link destination cannot be changed.

Adding `JWT_SECRET` later does not by itself require creating the account again. User records remain in MongoDB, so restart the API and sign in with the existing verified account. If signup never completed successfully, submit it once the API is running. If the email is already registered but not verified, switch to **Create account** and use **Resend verification email** rather than signing up again.

## 4. Use the app from a phone on the same Wi-Fi

1. Connect the computer and phone to the same Wi-Fi network. On Windows, run `ipconfig` and note the computer's **IPv4 Address** for that Wi-Fi adapter (for example, `192.168.1.25`).
2. Add the phone-facing Vite origin to `CLIENT_URL` in `server/.env`, separated by a comma. For example: `CLIENT_URL=http://localhost:5173,http://192.168.1.25:5173`. Replace the example address with the computer's actual IPv4 address.
3. Set `PUBLIC_APP_URL` to that same phone-facing address as a fallback, for example `PUBLIC_APP_URL=http://192.168.1.25:5173`. New verification links use the address from which signup or resend was requested, when that origin is allowed by `CLIENT_URL`.
4. Restart the API. Start Vite with `npm run dev -- --host 0.0.0.0` so it accepts connections from the local network.
5. On both the PC and phone, open `http://192.168.1.25:5173`, using the same actual computer address. If Windows Firewall asks, allow Node.js on your private network.
6. Browser GPS is blocked on a phone when this LAN address uses plain HTTP. Use `localhost` on the development computer or an HTTPS URL (such as a trusted HTTPS development tunnel) to test live location from a phone.
7. Every report must include a video (MP4, WebM, or MOV up to 12 MB); a photo (JPEG, PNG, or WebP up to 8 MB) is optional. The AI sends the report description and attached evidence to Google's Gemini API for screening. Do not upload private or sensitive footage without permission.

AI screening is a triage aid, not a forensic authenticity detector. A video Gemini judges to clearly match the issue with at least 90% confidence and no risk flags is accepted automatically. Reports Gemini marks suspicious or uncertain are not saved; users are asked to provide clearer, original evidence and retry. If screening is unavailable, the report is saved as unverified in the admin manual-review queue and cannot be assigned until an admin verifies it. Exact re-uploads of a video already used on another report are blocked. Visual screening cannot prove that a file came from Google or another website; reliable source attribution requires reverse-image/video search. Admins can reopen unassigned AI-approved reports for review.

Uploaded images are kept on the API host in `server/uploads`; issue records in MongoDB store their image paths. This is suitable for local development. For deployment, use persistent disk storage or move the uploads to object storage such as Cloudinary or S3, because many hosting platforms erase local files when a service restarts.

## 5. Staff signup and maintenance dispatch

1. Students create a student account and verify their email before reporting issues.
2. Maintenance employees choose **Maintenance staff** at signup, select either **City Operations** or **Campus Operations**, enter their employee ID and department, and verify their email. Their account remains pending until an admin approves it, and employees can only receive work orders from their selected operation.
3. Set `ADMIN_EMAILS` to the verified account email(s) of the maintenance-office admins, restart the API, then sign out and back in. The API promotes only those verified allowlisted accounts to admin; public signup cannot select the admin role. The **Office dashboard** navigation button appears only for admins.
4. Admins can switch between City and Campus Operations. Reports, staff applications, approved employees, dispatch, and the City map are scoped to the selected operation. Employees cannot be assigned across City/Campus scopes.
5. Each new report is emailed to the reporter and `MAINTENANCE_EMAIL`. The maintenance office assigns it to an approved employee in the matching operation and department (or general maintenance). Assignment emails go to the employee and reporter.
6. Employees see and update only their assigned tickets in their selected operation. Status changes notify the reporter and assigned employee.
7. AI screens new report evidence before accepting it. Uncertain or suspicious evidence is rejected at submission; admins can reopen unassigned AI-approved reports for review. Rejected reports require a reason and cannot be assigned. The reporter earns 50 stored reward points once the genuine report is fully resolved; duplicate completion requests do not award points again.

Existing maintenance accounts without an operation scope are migrated to **Campus Operations** on the next API startup. Any open or in-progress work order assigned across a City/Campus boundary is safely reopened as unassigned so it can be dispatched to the correct team.

### Local demo employee accounts

For a local demonstration without creating employee mailboxes, open PowerShell in the project root, choose your own temporary demo password, and run:

```powershell
$env:DEMO_STAFF_PASSWORD = 'Choose-A-Local-Demo-Password'
npm run seed:demo-employees
```

The script creates or refreshes one already-approved **Campus Operations** employee account per department. All nine accounts use the password you supplied:

- `demo.general@reportx.test`
- `demo.electrical@reportx.test`
- `demo.plumbing@reportx.test`
- `demo.appliance@reportx.test`
- `demo.ro-water@reportx.test`
- `demo.it-wifi@reportx.test`
- `demo.cleanliness@reportx.test`
- `demo.furniture@reportx.test`
- `demo.safety@reportx.test`

Sign in as an admin, refresh the page, and the approved employees will appear in the admin dashboard and assignment selectors. These `.test` addresses are reserved for demonstrations and do not receive email. Use this only with a local/demo database and never deploy these accounts or their shared password to a public service.

The verification link expires after 24 hours. Passwords are stored as scrypt hashes, and API sessions are signed and expire after seven days.