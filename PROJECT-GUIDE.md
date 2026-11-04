# Zass Health — Next.js frontend

Doctor / clinic and super admin workspaces built with Next.js App Router, React and TypeScript. Responsive layouts, reusable UI components, and fictional data persisted in browser localStorage. No backend is required.

## Start

```powershell
npm install
npm run dev
```

Open http://localhost:3000. Doctor login: `/login/` with `doctor@zasshealth.demo`. Admin login: `/admin/login/` with `admin@zasshealth.demo`. Both use password `demo1234` and the forms are prefilled. Demo sessions use sessionStorage and panel pages redirect to the appropriate login when no matching session is present. Sign out opens `/logout/` or `/admin/logout/`, clears the session and shows a confirmation page. This is browser-only UI behavior, not secure server authentication.

## Screens

- Doctor dashboard, weekly availability (Mon–Fri, 09:00–14:00, 15 minute slots, MR visits 14:00–15:00), calendar with cancel/reschedule, searchable patients and histories, MR approval with sample brochure previews, and multi-medicine prescriptions with store selection.
- Admin dashboard with hourly revenue graph, doctor approve/edit/block, patient directory, MR and medical store management, date-filtered native Excel `.xlsx` reports, and Home / About Us / Contact Us editing and preview.
- Booking validates working days, slot alignment, clinic hours, past times and overlapping appointment intervals. Existing appointments retain their original duration when slot settings change.
- Blocked clinic accounts cannot enter the demo panel. Invalid saved browser data is backed up under `zass-next-frontend-v1-recovery` and replaced in memory with a fresh valid workspace.

## Verification

`npm test` runs the regression tests (Node.js with TypeScript stripping support, such as Node 22.18+). `npm run build` checks TypeScript and creates the static export. See `TESTING-REPORT.md` for the tested workflows, fixes and verification limits.

## Production / Nginx

```powershell
npm run build
```

The static website is generated in `out/`. Serve that folder with Nginx using the included configuration. No Node.js server is needed after export. `npm start` runs the included local static preview; do not use `next start` for this static export. On Windows, `nginx.windows.conf` points to this project's `out/` folder and listens locally on port 8081.

Alternatively, with Docker running:

```powershell
docker build -t zass-health-next .
docker run --rm -p 8080:80 zass-health-next
```

Open http://localhost:8080.

## Demo boundaries

Login, approvals, brochures, records, revenue and delivery are simulations. No prescriptions are transmitted. Use fictional information only. Changes stay in localStorage under `zass-next-frontend-v1`; clear that key to reset. Production authentication, authorization, clinical records and messaging require a secured backend. System fonts keep the app independent of external font services.
