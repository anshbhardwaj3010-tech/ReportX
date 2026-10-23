# ReportX

ReportX is a campus and community facilities reporting app. Students and residents can submit and follow issues; administrators review and assign work; approved technicians update progress and provide resolution evidence.

## Features

- Student, administrator, and technician workspaces
- Campus and off-campus issue reporting with photo/video evidence
- AI-assisted evidence review, duplicate detection, and issue upvotes
- Interactive maps, work-order dispatch, activity history, and CSV exports
- Opt-in GPS issue pins, current-location map controls, and staff directions for campus and city reports
- Email verification and email updates when server email is configured
- Persistent contact inquiries delivered to the facilities email address
- Responsive landing page, light/dark theme, and installable offline app shell
- Automatic local development proxy for API and uploaded media requests

## Requirements

- Node.js 20.19+ or 22.12+
- MongoDB connection
- Optional: Cloudinary, Gemini API, and SMTP credentials for media hosting, AI assessment, and email

## Setup

1. Install dependencies with `npm install`.
2. Configure the environment variables in `server/.env` (see `DATABASE_EMAIL_SETUP.md` for database and email setup).
3. Start the API in one terminal: `npm run server`.
4. Start the web app in another terminal: `npm run dev`.
5. Open the local URL printed by Vite. API requests and local media are proxied to `http://127.0.0.1:5000`, including when Vite selects an alternate port. If the API uses a different port, set `API_PROXY_TARGET` to its origin before starting Vite.

For a production client build, run `npm run build`. To preview it locally, run `npm run preview`. For production, set `VITE_API_URL` to the deployed API base ending in `/api` and configure the API's `CLIENT_URL` to the deployed client origin.

## Deploy with Vercel, Render, and MongoDB Atlas

Deployment configuration is included in `vercel.json` and `render.yaml`. The Render blueprint uses a paid web service and a 1 GB persistent disk for local uploads; review current provider plans and costs before provisioning it.

1. Push this project to GitHub without committing `.env` files, credentials, or private uploads.
2. Create or confirm a MongoDB Atlas database user and network access policy. Use the production database URI as the Render `MONGO_URI`.
3. In Render, create a Blueprint from the repository and review the `reportx-api` service settings. Set `MONGO_URI`, the Vercel frontend origin in `CLIENT_URL`, and that same public site URL in `PUBLIC_APP_URL`.
4. Set the real `ADMIN_EMAILS`, `MAINTENANCE_EMAIL`, SMTP values, Gemini key, and optional Cloudinary credentials in Render's secret environment settings. Do not paste secrets into repository files.
5. Wait for Render's `/api/health` check to report healthy and copy the API origin, for example `https://reportx-api.onrender.com`.
6. Import the repository into Vercel. Set `VITE_API_URL` to the API origin plus `/api` (for example `https://reportx-api.onrender.com/api`) before building, then deploy.
7. Confirm `CLIENT_URL` on Render exactly matches the production Vercel domain (include `https://`; add a comma-separated custom domain if used). Redeploy/restart the API after changing it.
8. Test signup and email verification, a report with video, admin review and assignment, technician resolution, contact form delivery, uploaded media after an API restart, notification persistence, and the installed app's offline landing page.

The Render persistent disk is required for media stored locally by the API. It is not shared between multiple instances, so do not scale the API horizontally with this storage strategy. For multi-instance deployments, configure Cloudinary or another object-storage provider and verify upload retention before removing the disk. Production deployment still requires real provider accounts, configured secrets, and a manual workflow test; the checked-in files do not deploy the app by themselves.

## Environment configuration

The server reads `server/.env`. Required application settings include a MongoDB connection string and JWT secret. Email verification, status emails, and the contact form also require `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`, and `MAINTENANCE_EMAIL`. Optional settings include `CLIENT_URL`, `PUBLIC_APP_URL`, `PORT`, Cloudinary credentials, and the Gemini API key/model.

Never commit `.env` files or real credentials.

## Validation

- `npm run build` — production client build
- `npm run lint` — Oxlint
- `.\scripts\validate-all.ps1` — repository workflow, skill, agent, template, and script validators

The repository does not currently define a dedicated automated application test suite.
