# Lexis Portal — Legal Practice Management System

A production-ready law firm management portal built for Pakistani legal professionals. Streamlines case management, hearings, document library, reminders, and automated judgement image generation.

**Live Demo Credentials (after seeding):**

- Email: `demo@LawPortal.com`
- Password: `Demo@12345`

---

## 📌 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [Demo Data](#-demo-data)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Production Deployment](#-production-deployment)
- [Recent Updates](#-recent-updates)
- [Roadmap](#-roadmap)
- [Contributors](#-contributors)

---

## ✨ Features

### Core Legal Practice Tools

| Module                | Description                                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**         | Real-time stats overview (total/active cases, today's/tomorrow's hearings), recent cases table, quick action shortcuts |
| **Case Management**   | Full CRUD operations with case details, PPC provisions, counsel info, FIR number, hearing dates, status tracking       |
| **Case Detail View**  | Tabbed interface: Overview, Proceedings Timeline, Accused/Bail Info, Citations, Quick Notes                            |
| **Calendar**          | Monthly calendar with hearing/proceeding date highlighting, upcoming events sidebar, day-click modal for details       |
| **Law Books Library** | PDF upload with drag & drop, inline iframe viewer, search functionality, file metadata storage                         |
| **Reminders**         | Priority-based reminders (High/Medium/Low) with filters: Upcoming, Overdue, Completed                                  |
| **Authentication**    | JWT stored in httpOnly cookies, middleware-protected routes, role-based access (Admin/Lawyer/Associate)                |

### Advanced Legal Tech (Recently Added)

| Module                             | Description                                                                                                                                                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Auto Judgement Image Generator** | Branded, formatted images for legal judgements. Input case details → automatically generates shareable JPG/PNG with firm logo, color scheme, and professional typography. Perfect for social media and client reporting. |

### Coming Soon (In Development)

- 🤖 **AI Judgement Extractor** – 7-section structured summary from raw judgement text
- 📚 **Saved Judgements Library** – Curated repository with tags, notes, and "Most Important" flags
- ✍️ **Cross-Examination Q&A Review Module** – Collaborative drafting with senior approval workflow
- 📄 **Automatic Application Generator** – Bail, adjournment, exemption applications pre-filled from case data

---

## 🛠 Tech Stack

| Layer                | Technology                        |
| -------------------- | --------------------------------- |
| **Framework**        | Next.js 14 (App Router)           |
| **Language**         | JavaScript (ES Modules)           |
| **Database**         | MongoDB with Mongoose ODM         |
| **Authentication**   | JWT + bcryptjs (httpOnly cookies) |
| **Styling**          | Tailwind CSS                      |
| **Fonts**            | Playfair Display + DM Sans        |
| **Notifications**    | react-hot-toast                   |
| **File Upload**      | Native FormData + fs/promises     |
| **Date Utilities**   | date-fns                          |
| **Image Generation** | html-to-image + file-saver        |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.js
│   │   └── register/page.js
│   ├── (dashboard)/
│   │   ├── dashboard/page.js
│   │   ├── cases/
│   │   │   ├── page.js
│   │   │   ├── new/page.js
│   │   │   └── [id]/
│   │   ├── calendar/page.js
│   │   ├── books/page.js
│   │   ├── reminders/page.js
│   │   ├── judgement-image-generator/page.js
│   │   └── settings/page.js
│   └── api/
│       ├── auth/
│       ├── cases/
│       ├── cases/stats/
│       ├── hearings/
│       ├── books/
│       ├── reminders/
│       ├── judgement-images/
│       └── seed/
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
│   ├── judgement-image/
│   │   ├── JudgementCard.jsx
│   │   └── JudgementForm.jsx
│   └── ui/
│       ├── index.js
│       └── ToastProvider.js
├── hooks/
│   └── useAuth.js
├── lib/
│   ├── db.js
│   ├── auth.js
│   └── api.js
├── models/
│   ├── User.js
│   ├── Case.js
│   ├── BookReminder.js
│   └── JudgementImage.js
├── middleware.js
└── utils/
    ├── api.js
    └── helpers.js
```

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas — free tier works)

### Step 1: Clone & Install

```bash
git clone https://github.com/M-Saad-saif/law-system.git
cd law-system
npm install
```

### Step 2: Environment Configuration

Create `.env.local` in the root directory:

```env
# .env.local
MONGODB_URI=mongodb://localhost:27017/lexis-portal
JWT_SECRET=your-super-secret-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**For MongoDB Atlas (recommended for production):**

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/lexis-portal?retryWrites=true&w=majority
```

### Step 3: Create Uploads Directory for Localhost

```bash
mkdir -p public/uploads/books
mkdir -p public/uploads/judgement-images
```

### Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🧪 Demo Data

After starting the server, populate with sample data:

**Option A — Via Settings UI:**

1. Register an account
2. Navigate to **Settings → Seed Demo Data**

**Option B — Via API (development only):**

```bash
curl -X POST http://localhost:3000/api/seed
```

**What gets created:**

- 5 sample cases (criminal, civil, family, tax, bail)
- 3 priority reminders
- Realistic proceeding history with dates

---

## 📊 Database Schema

### User

```javascript
(name,
  email,
  password(hashed),
  role(admin / lawyer / associate),
  phone,
  barCouncilNo,
  isActive);
```

### Case

```javascript
userId, caseTitle, caseNumber, suitNo, courtType, courtName,
caseType, counselFor, oppositeCounsel {name, contact},
provisions[], filingDate, nextHearingDate, nextProceedingDate,
status, judgeName, firNo, clientName, clientContact,
proceedings[], citations[], accused[], documents[], notes[]
```

### Book (Law Books Library)

```javascript
userId, name, author, description, fileUrl, fileSize, tags[]
```

### Reminder

```javascript
userId, title, description, dateTime, isCompleted, priority,
linkedCase (ref: Case)
```

### JudgementImage (NEW)

```javascript
caseId (ref), userId, imageUrl, inputData (judgement details),
templateVersion, downloadCount, shareCount, createdAt
```

---

## 📡 API Reference

### Authentication

| Method | Endpoint             | Description               |
| ------ | -------------------- | ------------------------- |
| POST   | `/api/auth/register` | Register new user         |
| POST   | `/api/auth/login`    | Login with email/password |
| POST   | `/api/auth/logout`   | Logout (clears cookie)    |
| GET    | `/api/auth/me`       | Get current user profile  |
| PUT    | `/api/auth/me`       | Update profile            |

### Cases

| Method | Endpoint                     | Description                           |
| ------ | ---------------------------- | ------------------------------------- |
| GET    | `/api/cases`                 | List cases (search, filter, paginate) |
| POST   | `/api/cases`                 | Create new case                       |
| GET    | `/api/cases/:id`             | Get case with all sub-documents       |
| PUT    | `/api/cases/:id`             | Update case                           |
| DELETE | `/api/cases/:id`             | Delete case                           |
| GET    | `/api/cases/stats`           | Dashboard metrics                     |
| POST   | `/api/cases/:id/proceedings` | Add proceeding entry                  |
| DELETE | `/api/cases/:id/proceedings` | Remove proceeding                     |
| POST   | `/api/cases/:id/citations`   | Add citation                          |
| DELETE | `/api/cases/:id/citations`   | Remove citation                       |
| POST   | `/api/cases/:id/notes`       | Add quick note                        |
| DELETE | `/api/cases/:id/notes`       | Remove note                           |
| POST   | `/api/cases/:id/accused`     | Add accused person                    |

### Calendar & Reminders

| Method | Endpoint             | Description                                 |
| ------ | -------------------- | ------------------------------------------- |
| GET    | `/api/hearings`      | Calendar events by month/year               |
| GET    | `/api/reminders`     | List reminders (upcoming/overdue/completed) |
| POST   | `/api/reminders`     | Create reminder                             |
| PUT    | `/api/reminders/:id` | Update reminder                             |
| DELETE | `/api/reminders/:id` | Delete reminder                             |

### Law Books

| Method | Endpoint         | Description                      |
| ------ | ---------------- | -------------------------------- |
| GET    | `/api/books`     | List all uploaded PDFs           |
| POST   | `/api/books`     | Upload PDF (multipart/form-data) |
| DELETE | `/api/books/:id` | Delete book                      |

### Judgement Images (NEW)

| Method | Endpoint                | Description                          |
| ------ | ----------------------- | ------------------------------------ |
| POST   | `/api/judgement-images` | Generate and save judgement image    |
| GET    | `/api/judgement-images` | Fetch recent images for current user |

### Development

| Method | Endpoint    | Description                            |
| ------ | ----------- | -------------------------------------- |
| POST   | `/api/seed` | Seed demo data (blocked in production) |

---

## ☁️ Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Checklist (Production)

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (32+ random characters)
- [ ] Use MongoDB Atlas (or managed DB service)
- [ ] Configure `NEXT_PUBLIC_APP_URL` to your domain
- [ ] Set up HTTPS (reverse proxy with nginx/Caddy)

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Set all `.env.local` variables in the Vercel Dashboard.

### File Uploads in Production

Current implementation uses local filesystem (`public/uploads/`). For production, switch to:

- **AWS S3** (recommended)
- **Cloudinary** (easier setup)
- **Vercel Blob Storage** (if using Vercel)

---

## 📅 Recent Updates

**April 8, 2026**

- ✅ **Auto Judgement Image Generator** – Fully functional with branded templates
- ✅ PNG/JPEG export with one-click download
- ✅ Preview before saving
- ✅ Recent images gallery on generator page
- ✅ Database persistence for generated images

**April 7, 2026**

- ✅ Overdue notification bar
- ✅ Legal ticker component

**April 6, 2026**

- ✅ Initial production build
- ✅ Complete case management system
- ✅ Authentication with JWT cookies
- ✅ Calendar and reminders module

---

## 🗺 Roadmap

### Q2 2026 (Current Sprint)

- [ ] **AI Judgement Extractor** – Parse raw judgement text into 7 structured sections
- [ ] **Saved Judgements Library** – Personal/team repository with tags and notes
- [ ] **Cross-Examination Q&A Review Module** – Collaborative drafting workflow

### Q3 2026

- [ ] Automatic Application Generator (Bail, Adjournment, Exemption)
- [ ] Advanced search with full-text indexing
- [ ] Email notifications for hearings and reminders

### Q4 2026

- [ ] Mobile app (React Native)
- [ ] Client portal for case tracking
- [ ] Billing and invoicing module

---

## 👥 Contributors

- **Muhammad Saad Saif** – Lead Developer  
  [GitHub](https://github.com/M-Saad-saif)

---

## ⚠️ Important Notes

1. **File Uploads:** Currently stored locally in `public/uploads/`. For production, migrate to S3/Cloudinary.
2. **Prerender Warnings:** Expected during `next build` – all routes are server-rendered on demand, not statically exported.
3. **Seed Endpoint:** Automatically disabled when `NODE_ENV=production`.

---

## 🆘 Support

For issues or feature requests:

- Open an issue on [GitHub](https://github.com/M-Saad-saif/law-system/issues)
- Contact development team at GenZomate

---

**Built with Next.js 14, MongoDB, and Tailwind CSS – Optimized for Pakistani legal practice.**

```

```
