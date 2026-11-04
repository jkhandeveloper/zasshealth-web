# Zass Health frontend testing and refinement report

Tested: 28 October 2026, Europe/London.

## Latest addition — patient self-registration and personal portal

Added patient registration, login/logout, dashboard, editable profile, appointment booking/cancellation and prescription pages. Login screens now include a Patient tab. Registration creates a patient in the same shared doctor/admin directory. Patient accounts have unique normalized email/phone values and salted PBKDF2 verifiers; raw passwords are not persisted.

Latest verification: **33 regression tests and 27 production route/asset tests passed (60 checks total)**. The final production build and TypeScript validation passed.

Browser tests verified: duplicate-email rejection, password confirmation mismatch, successful registration, profile editing, future-date slot refresh and booking, cancellation, incorrect-password rejection, logout and protected-page redirection. The self-registered patient's updated record appeared in both staff directories. A doctor-created prescription for that patient appeared in the patient portal and persisted after reload; a prescription assigned to a different patient did not appear. Patient dashboard/profile/registration were checked at a 390-pixel viewport without page-level horizontal overflow. The checked prescription workflow produced no browser warnings/errors.

A date-picker integration issue found during testing was fixed: the native date field no longer resets during a slot-selection render, and **Check available slots** explicitly refreshes the list for the chosen date. The corrected workflow saved a 29 October booking at 09:00 with the selected date intact.

The isolated patient test used localhost:3004 and fictional account details. It did not create a prefilled patient account on the user's normal localhost:3000 origin. Current previews: `qa/patient-dashboard.png`, `qa/patient-login.png`, and `qa/patient-register-mobile.png`. See `PATIENT-GUIDE.md` for usage and frontend-only limits.

## Latest visual refresh — supplied dashboard references

The doctor and admin layouts now follow the supplied reference images, using **Zass Health** branding. Clinic styling uses a navy sidebar, blue accents, three large summary cards, a calendar/upcoming-visits column and a recent-patients table. Admin styling uses a darker sidebar, teal accents, four summary cards, a revenue area/line graph, a user-distribution donut and a recent-doctors table.

The graph uses actual saved demo appointment fees over selectable 7/30/90-day ranges; the donut uses the saved directory counts. Decorative metric-card sparklines are illustrations and do not assert growth percentages. Existing forms, session checks and management workflows are retained.

The production build, 22 regression tests and 19 route/asset checks passed again after this refresh. Browser checks verified clinic filters, patient appointment details, selected calendar dates, admin date-range selection, report navigation, branding and 390-pixel mobile layouts without page overflow. The checked browser console contained no warnings or errors.

Latest previews: `qa/reference-clinic.png`, `qa/reference-admin.png`, `qa/reference-clinic-mobile.png`, and `qa/reference-admin-mobile.png`.

## Result

The requested doctor and super admin workflows work as a browser-local frontend demonstration. The production build and TypeScript validation passed. **41 automated checks passed**: 22 regression tests and 19 production route/asset checks. Interactive testing covered both workspaces in the embedded Chromium browser on Windows, including desktop and narrow phone layouts.

This verifies the scenarios below; it is not a guarantee that every possible browser or input combination is bug-free.

## How the website functions

| Area | Current behavior |
| --- | --- |
| Login | Doctor: `doctor@zasshealth.demo`; admin: `admin@zasshealth.demo`. Both use `demo1234`. Invalid credentials show an error. Password visibility can be toggled. |
| Sessions | Demo role and email are stored in sessionStorage. Protected pages check the matching role. Logout clears the session and presents a signed-out page. Browser focus and history restoration trigger another check. These are UI checks, not secure authentication. |
| Doctor dashboard | Counts are computed from saved records. Today's totals use appointment dates; completed visits and pending MR requests update from the data. |
| Availability | Days, consultation hours, slot duration and MR hours are saved locally. The default is Mon–Fri, 09:00–14:00, 15-minute slots, MR visits 14:00–15:00. Invalid and overlapping hours are rejected. Existing bookings are retained. |
| Calendar | Displays appointments by month. The mini-calendar carries the selected date into the full calendar. Appointment dialogs support rescheduling and cancellation. Booking checks working days, clinic hours, slot alignment, future time and overlapping intervals. |
| Patients | Name, ID and phone search; empty search results; global search; recorded history, allergies, appointments and prescriptions. All records are fictional. |
| MR requests | Sample brochure preview, approval and rejection. Decisions persist locally. The sample is not a real uploaded pharmaceutical brochure. |
| Prescriptions | Patient selection, multiple medicines, row removal, approved store selection and notes. Submission saves a simulated prescription into patient history. No prescription is transmitted. |
| Admin dashboard | Doctor/patient/MR/store counts and completed-visit fee revenue. Hour buckets include all hours represented by completed visits. |
| Doctor management | Approve, edit, block and unblock. Blank names/specialties are rejected. Blocking the clinic's demo doctor prevents its login until an admin unblocks it. |
| Partner management | MR review and medical-store approval/block/unblock. Only approved stores appear in the prescription store selector. |
| Reports | Apply a date range and export the applied results to native `.xlsx`. The workbook has styled headers, frozen first row, numeric fees and column filters. |
| CMS | Edit Home, About Us and Contact Us text; save locally and preview. Whitespace-only content is rejected. This does not publish a separate public marketing site. |
| Persistence | Data is stored under `zass-next-frontend-v1` in localStorage. Invalid stored records fall back to valid demo data, with the original raw value backed up under `zass-next-frontend-v1-recovery` when storage permits. |

Appointments remain attached to their real dates. Existing demo appointments from yesterday do not automatically move to today; a zero daily total can therefore be correct.

## Bugs fixed

1. **Interval collisions:** previously only identical start times were blocked. Overlapping intervals are now rejected, and existing durations remain stable when the slot setting changes.
2. **Past booking times:** bookings earlier today could be created. Date and time are now checked together.
3. **Invalid browser data:** valid JSON with missing records or orphan patient references could crash the app. A schema and relationship validation layer now provides a recovery path.
4. **Hidden dialog feedback:** toasts could sit beneath an open modal. Validation feedback now appears inside the active dialog.
5. **Incomplete revenue graph:** a fixed 09:00–14:00 axis omitted completed visits at other hours. Hour buckets now cover the represented hours; zero revenue no longer draws a misleading positive-height bar.
6. **Report format:** replaced legacy XML exports with actual Office Open XML `.xlsx` workbooks.
7. **Blank values:** whitespace-only CMS and doctor values now show validation errors; medicine and doctor fields are trimmed before saving.
8. **Session route state:** access is tied to the checked pathname rather than a stale boolean from the preceding screen, and session checks run on focus/history restoration.
9. **Blocked account behavior:** the clinic demo account now respects its blocked status.
10. **Mobile overflow:** constrained grid children and chart scrolling to their cards; fixed medicine fields and stacked report filters.
11. **Selected booking date:** new appointment dialogs now default to the selected calendar date when it is valid and not in the past.
12. **Ordering and identity:** appointment rows are sorted chronologically, recorded history is sorted newest first, and the profile reflects saved doctor details.
13. **Missing-page handling:** added a branded 404 screen and configured static preview/Nginx error handling.

## Visual and usability refinements

Consistent teal and sage palette; clearer typography and spacing; aligned patient identities; more readable status badges; sticky header; sidebar scrolling; mobile overlay navigation with close controls; stacked mobile form controls; password visibility toggle; inline validation; keyboard focus indicators; skip-to-content link; named dialogs; keyboard-scrollable tables; proper column header scopes; and reduced-motion support.

## Interactive browser checks

| Scenario | Result |
| --- | --- |
| Invalid doctor password; password visibility toggle; valid doctor login | Passed |
| Availability overlap rejection, slot change, save and reload | Passed |
| Existing-slot conflict shown inside booking dialog | Passed |
| New booking for 29 October; selected calendar date; reschedule; cancel | Passed |
| Patient ID search, no-results state and full history | Passed |
| Medicine add/remove, store selection, simulated submit and reload | Passed |
| Sample brochure, MR approve and MR reject | Passed |
| Admin login, overview counts and revenue display | Passed |
| Doctor approval, whitespace validation, edit, block/unblock | Passed |
| Blocked clinic login rejected; administrator restores access | Passed |
| Medical store approve, block and unblock | Passed |
| Header patient search opens the filtered admin patient directory | Passed |
| CMS blank-content rejection, save, preview, all tabs and reload | Passed |
| Invalid report date range; populated filter; empty filter | Passed |
| Actual `.xlsx` download for filtered records | Passed |
| Keyboard Escape closes a named patient-history dialog | Passed |
| Doctor and admin logout, followed by direct panel access | Passed — redirected to login |
| Production mobile prescription form | Passed — form stays within page width |
| Production mobile admin chart | Passed — horizontal scrolling stays inside the chart card |
| Production console on the checked clinic workflow | No warnings/errors observed |

At the measured 390-pixel phone viewport, page content width was 375 pixels after its scrollbar, and the prescription form was 341 pixels wide. On the admin screen the chart's 420-pixel content scrolled inside a 341-pixel card instead of widening the page. Desktop geometry was checked at 1440 pixels. Screenshots are in `qa/`.

The downloaded Excel file was opened as a ZIP archive and its worksheet XML parsed independently using .NET. It contained the six expected OOXML package parts and ten worksheet rows: one header plus the nine appointments in the applied range. Regression tests also verify ZIP checksums, XML escaping, Unicode and literal formula-like text. Microsoft Excel itself was not opened.

Tests used a separate localhost port (3002) to avoid overwriting the normal localhost:3000 demo data. The isolated QA origin contains deliberate test edits, including a cancelled booking and a fictional prescription.

## Automated checks

`npm test`: **22/22 passed** — strict dates/times, availability, interval overlap, rescheduling, cancellation, closing boundaries, storage recovery and relationships, revenue buckets, workbook package integrity and text escaping.

`npm run test:routes`: **19/19 passed** against the production static preview — 17 page URLs, branded HTTP 404, and production CSS serving.

`npm run build`: passed compilation, TypeScript checking and static page generation. `out/` contains the production frontend.

To repeat:

```powershell
npm test
npm run build
npm start
```

In a second terminal in this project:

```powershell
$env:QA_BASE_URL='http://127.0.0.1:3000'
npm run test:routes
```

For normal development use `npm run dev`, then open http://localhost:3000. If a server is already running, refresh the page; restart it if its configuration was loaded before these changes.

## Verification limits

- This remains **frontend only**. Real authentication/authorization, a shared database, clinical validation, notifications, real brochure uploads, payments and pharmacy delivery have not been implemented or tested.
- The client-side credentials and records are demonstrative and can be inspected or changed by a browser user. Do not enter real patient information.
- Browser testing used embedded Chromium; Firefox, Safari, real mobile hardware and assistive-technology certification were not tested. Accessibility improvements are basic usability work, not a full WCAG audit.
- Storage recovery and malformed data are regression-tested. Browser storage being entirely disabled was not simulated interactively.
- The exported site and local static server were tested. A live Nginx or Docker deployment was not started in this review; configuration files are supplied.
- No real messages, prescriptions or medical decisions were sent to external services.
