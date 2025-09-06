# MERN Alumni Portal (Kongu-style)
Features:
- JWT auth (roles: student, alumni, admin). Students must use `@kongu.edu` email at signup.
- Admin adds alumni manually (enforced department list & sections A–F) or via Excel upload.
- Alumni must be graduated (pass-out year and course duration checked).
- Department/Section-wise listing + counts API.
- Congrats email on successful alumni creation (Nodemailer).
- Real-time chat via Socket.IO (admin↔alumni, student↔alumni).
- React minimal UI for login/signup, admin dashboard, alumni list, and chat.
## Quick start
### 1) Server
```bash
cd server
cp .env.example .env
# Fill SMTP creds (you can create Ethereal test account)
npm i
npm run dev
```
### 2) Client
```bash
cd client
npm i
# set API base if different:
# echo "VITE_API_BASE=http://localhost:5000/api" > .env
npm run dev
```
Open http://localhost:5173
## Excel format
Columns: `name,email,department,section,passOutYear,courseDurationYears`
Notes:
- Departments are fixed; sections limited to A–F.
- Admin-only endpoints: POST /api/alumni, POST /api/alumni/upload, GET /api/alumni/stats
- Chat uses user IDs; create test users (admin, alumni, student).
- Email sending is best-effort; failures won't block API.
