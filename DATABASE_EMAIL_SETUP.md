# ReportX database and email setup

The web app reads and writes issues through the Express API. The API stores users and issues in MongoDB Atlas. It polls for issue changes every five seconds so open browser sessions see updates without demo or browser-local records.

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
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, and `EMAIL_PASS`: your SMTP settings
- `EMAIL_FROM`: the sender name/address allowed by the SMTP account
- `MAINTENANCE_EMAIL`: the real maintenance-office mailbox; new issue reports and verified staff applications are sent there
- `ADMIN_EMAILS`: comma-separated list of office admin email addresses; only verified accounts matching this server-only allowlist are promoted to admin on sign-in
- `CLIENT_URL`: comma-separated browser origins allowed to call the API
- `PUBLIC_APP_URL`: the one canonical URL placed in verification emails; set this to an address every device can reach

Never commit `server/.env` or share its values. The repository ignores environment files; only `.env.example` is intended to be committed.

## 3. Run the app

From the project root, use two terminals:

```powershell
npm run server
```

```powershell
npm run dev
```

Open the Vite URL printed by the second command. The API listens on port 5000. If Atlas or email settings are missing or incorrect, the API reports the relevant startup/request error rather than using fallback credentials.

## 4. Use the app from a phone on the same Wi-Fi

1. Connect the computer and phone to the same Wi-Fi network. On Windows, run `ipconfig` and note the computer's **IPv4 Address** for that Wi-Fi adapter (for example, `192.168.1.25`).
2. Add the phone-facing Vite origin to `CLIENT_URL` in `server/.env`, separated by a comma. For example: `CLIENT_URL=http://localhost:5173,http://192.168.1.25:5173`. Replace the example address with the computer's actual IPv4 address.
3. Set `PUBLIC_APP_URL` to that same phone-facing address, for example `PUBLIC_APP_URL=http://192.168.1.25:5173`. Verification links always use this canonical URL, regardless of whether signup was started from localhost or the phone-facing address.
4. Restart the API. Start Vite with `npm run dev -- --host 0.0.0.0` so it accepts connections from the local network.
5. On both the PC and phone, open `http://192.168.1.25:5173`, using the same actual computer address. If Windows Firewall asks, allow Node.js on your private network.
6. In the report or repair form, tap **Take photo** to open the rear camera, or **Choose photo** to select an existing image. JPEG, PNG, and WebP images up to 8 MB are accepted.

Uploaded images are kept on the API host in `server/uploads`; issue records in MongoDB store their image paths. This is suitable for local development. For deployment, use persistent disk storage or move the uploads to object storage such as Cloudinary or S3, because many hosting platforms erase local files when a service restarts.

## 5. Staff signup and maintenance dispatch

1. Students create a student account and verify their email before reporting issues.
2. Maintenance employees choose **Maintenance staff** at signup, enter their employee ID and department, and verify their email. Their account remains pending until an admin approves it.
3. Set `ADMIN_EMAILS` to the verified account email(s) of the maintenance-office admins, restart the API, then sign out and back in. The API promotes only those verified allowlisted accounts to admin; public signup cannot select the admin role. The **Office dashboard** navigation button appears only for admins.
4. Each new report is emailed to the reporter and `MAINTENANCE_EMAIL`. The maintenance office assigns it to an approved employee in the matching department (or general maintenance). Assignment emails go to the employee and reporter.
5. Employees see and update only their assigned tickets. Status changes notify the reporter and assigned employee.
6. New reports remain pending until an admin checks the details/location/evidence and marks them genuine. Rejected reports require a reason and cannot be assigned. The reporter earns 50 stored reward points once the genuine report is fully resolved; duplicate completion requests do not award points again.

The verification link expires after 24 hours. Passwords are stored as scrypt hashes, and API sessions are signed and expire after seven days.