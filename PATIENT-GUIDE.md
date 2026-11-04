# Patient portal

## Open the patient section

Run `npm run dev` from this project and open http://localhost:3000. Select **Patient** on the login screen.

- Login: http://localhost:3000/patient/login/
- Register: http://localhost:3000/patient/register/
- Dashboard: http://localhost:3000/patient/dashboard/
- Profile: http://localhost:3000/patient/profile/
- Appointments: http://localhost:3000/patient/appointments/
- Prescriptions: http://localhost:3000/patient/prescriptions/

## Create your account

Select **Create your patient account**. Enter a fictional full name, a unique phone number, age, email, gender, optional allergies, password and matching confirmation. Passwords must be 8–128 characters. Use a test password that you do not use elsewhere.

Successful registration signs you into the patient dashboard and creates a patient entry in the clinic and admin patient lists. Your patient ID is assigned automatically. Existing records are preserved. Duplicate email addresses and phone numbers are rejected.

## Use your workspace

- **Dashboard:** your upcoming visits, prescription count and patient summary.
- **My profile:** update your name, phone, age, gender and allergy information; view recorded visit history. Login email remains unchanged.
- **My appointments:** choose a visit date, check available slots and select a time. Bookings use the clinic's saved hours and slot duration. Past and overlapping visits are rejected. Confirmed upcoming visits can be cancelled through a confirmation dialog.
- **My prescriptions:** see prescriptions the doctor saved against your patient ID. Other patients' prescriptions are excluded from this screen.
- **Sign out:** clears the patient session and opens a patient-specific logout page. Direct access to patient workspace pages then returns to login.

## Demo boundaries

The patient account and clinical demo records are stored in this browser, for this site's origin. They are not shared between devices, browsers, or different localhost ports. Patient account verifiers are stored under `zass-patient-accounts-v1`; shared records remain under `zass-next-frontend-v1`. Sessions use the existing sessionStorage key.

Salted PBKDF2 verifiers prevent storing the raw patient password, but browser-local role checks and data filtering are not production access control. All stored data can be inspected by a browser user. A production portal needs a secured backend, server-managed authentication, email/phone verification, authorization and protected clinical storage. Do not enter real patient information.

Appointments currently belong to the existing single clinic; no payment is collected. Prescription delivery remains simulated. Existing seeded patients do not automatically receive login accounts and cannot be claimed simply by entering their phone number.


Doctor selection: In My appointments, select an approved doctor (name and specialty), choose a date, then an available slot. Each appointment stores its doctor. Occupied intervals disappear for that doctor across patient accounts in the same browser; cancellation releases the slot. Legacy appointments belong to doctor 1. All doctors currently share clinic hours. Booking rechecks current storage, with Web Locks coordinating patient bookings across supported browser tabs. Cross-device booking requires a shared backend.
