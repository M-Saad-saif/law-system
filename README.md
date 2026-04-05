# LawPortal — Legal Practice Management System

A production-ready law firm management portal built for Pakistani lawyers with Next.js 14, MongoDB, and Tailwind CSS.

---

## Features

- **Dashboard** — Stats overview (total, active, today's, tomorrow's hearings), recent cases table, quick actions
- **Case Management** — Full CRUD with case details, provisions, counsel info, FIR number, hearing dates
- **Case Detail View** — Tabbed interface: Overview, Proceedings timeline, Accused/Bail info, Citations, Quick Notes
- **Calendar** — Monthly calendar highlighting hearing/proceeding dates, upcoming events sidebar, day-click modal
- **Law Books** — PDF upload library with drag & drop, inline iframe viewer, search
- **Reminders** — Priority-based reminders with upcoming/overdue/completed filters
- **Settings** — Profile management, demo data seeder
- **Authentication** — JWT via httpOnly cookies, middleware-protected routes

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | JavaScript (ES Modules) |
| Database | MongoDB via Mongoose |
| Auth | JWT + bcryptjs |
| Styling | Tailwind CSS |
| Fonts | Playfair Display + DM Sans |
| Toasts | react-hot-toast |
| File Upload | Native FormData + fs/promises |
| Date Utils | date-fns |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.js
│   │   └── register/page.js
│   ├── (dashboard)/
│   │   ├── dashboard/page.js
│   │   ├── cases/
│   │   │   ├── page.js              # Cases list
│   │   │   ├── new/page.js          # Create case
│   │   │   └── [id]/
│   │   │       ├── page.js          # Case detail (tabbed)
│   │   │       └── edit/page.js     # Edit case
│   │   ├── calendar/page.js
│   │   ├── books/page.js
│   │   ├── reminders/page.js
│   │   └── settings/page.js
│   └── api/
│       ├── auth/                    # login, register, logout, me
│       ├── cases/                   # CRUD + proceedings, notes, citations, accused
│       ├── cases/stats/             # Dashboard metrics
│       ├── hearings/                # Calendar events
│       ├── books/                   # PDF upload/delete
│       ├── reminders/               # CRUD
│       └── seed/                    # Demo data
├── components/
│   ├── layout/
│   │   ├── Sidebar.js
│   │   └── Topbar.js
│   ├── cases/
│   │   ├── CaseForm.js
│   │   ├── ProceedingsTab.js
│   │   ├── CitationsTab.js
│   │   ├── NotesTab.js
│   │   └── AccusedTab.js
│   └── ui/
│       ├── index.js                 # Modal, Spinner, StatCard, TabBar, etc.
│       └── ToastProvider.js
├── hooks/useAuth.js                 # Auth context + hook
├── lib/
│   ├── db.js                        # MongoDB connection
│   ├── auth.js                      # JWT utilities
│   └── api.js                       # withAuth middleware
├── models/
│   ├── User.js
│   ├── Case.js
│   └── BookReminder.js
├── middleware.js                    # Route protection
└── utils/
    ├── api.js                       # Fetch client
    └── helpers.js                   # Date formatting, cn(), etc.
```

---

## Setup & Installation

### Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com) — free tier works)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.local` and fill in your values:

```bash
# .env.local
MONGODB_URI=mongodb://localhost:27017/lexis-portal
JWT_SECRET=your-super-secret-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**For MongoDB Atlas:**
```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/lexis-portal?retryWrites=true&w=majority
```

### 3. Create uploads directory

```bash
mkdir -p public/uploads/books
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Data

After starting the server, seed demo data in two ways:

**Option A — Settings page:**
1. Register an account
2. Go to Settings → click "Seed Demo Data"

**Option B — API call:**
```bash
curl -X POST http://localhost:3000/api/seed
```

**Demo credentials (after seeding):**
```
Email:    demo@LawPortal.com
Password: Demo@12345
```

This creates 5 sample cases (criminal, civil, family, tax, bail), 3 reminders, and realistic proceeding history.

---

## Database Schema

### User
```
name, email, password (hashed), role (admin/lawyer/associate),
phone, barCouncilNo, isActive
```

### Case
```
userId, caseTitle, caseNumber, suitNo, courtType, courtName,
caseType, counselFor, oppositeCounsel{name,contact},
provisions[], filingDate, nextHearingDate, nextProceedingDate,
status, judgeName, firNo, clientName, clientContact,
phone, proceedings[], citations[], accused[], documents[], notes[]
```

### Book
```
userId, name, author, description, fileUrl, fileSize, tags[]
```

### Reminder
```
userId, title, description, dateTime, isCompleted, priority,
linkedCase (ref: Case)
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/me` | Update profile |
| GET | `/api/cases` | List cases (search, filter, paginate) |
| POST | `/api/cases` | Create case |
| GET | `/api/cases/:id` | Get case with all sub-documents |
| PUT | `/api/cases/:id` | Update case |
| DELETE | `/api/cases/:id` | Delete case |
| GET | `/api/cases/stats` | Dashboard metrics |
| POST | `/api/cases/:id/proceedings` | Add proceeding |
| DELETE | `/api/cases/:id/proceedings` | Remove proceeding |
| POST | `/api/cases/:id/citations` | Add citation |
| DELETE | `/api/cases/:id/citations` | Remove citation |
| POST | `/api/cases/:id/notes` | Add note |
| DELETE | `/api/cases/:id/notes` | Remove note |
| POST | `/api/cases/:id/accused` | Add accused |
| GET | `/api/hearings` | Calendar events by month/year |
| GET | `/api/books` | List books |
| POST | `/api/books` | Upload PDF |
| DELETE | `/api/books/:id` | Delete book |
| GET | `/api/reminders` | List reminders (filter: upcoming/overdue/completed) |
| POST | `/api/reminders` | Create reminder |
| PUT | `/api/reminders/:id` | Update reminder |
| DELETE | `/api/reminders/:id` | Delete reminder |
| POST | `/api/seed` | Seed demo data (dev only) |

---

## Production Deployment

### Build
```bash
npm run build
npm start
```

### Environment checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use a strong `JWT_SECRET` (32+ random chars)
- [ ] Use MongoDB Atlas or a managed MongoDB instance
- [ ] Set up a reverse proxy (nginx/Caddy) for HTTPS
- [ ] Configure `NEXT_PUBLIC_APP_URL` to your domain

### Vercel (recommended)
```bash
npm install -g vercel
vercel
```
Set all `.env.local` variables in the Vercel dashboard.

---

## Notes

- **File uploads** are stored in `public/uploads/`. In production, use S3 or Cloudinary instead.
- **Prerender warnings** during `next build` are expected — all routes are server-rendered on demand (not statically exported). `npm start` and `npm run dev` work correctly.
- The seed endpoint is blocked in production (`NODE_ENV=production`).
"# law-system" 
