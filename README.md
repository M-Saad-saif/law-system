# Law Portal – AI-Powered Legal Practice Management System

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black" />
  <img src="https://img.shields.io/badge/MongoDB-5.0-green" />
  <img src="https://img.shields.io/badge/Tailwind-3.0-38B2AC" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" />
</p>

<p align="center">
  <b>Production-grade legal tech platform for modern law firms.</b><br/>
  Case management • Hearings • AI tools • Document workflows • Automation
</p>

---

## Overview

**Law Portal** is a full-stack, production-ready **legal workflow system** designed to digitize and streamline law firm operations in Pakistan.

It centralizes **case management, hearings, document handling, reminders, and AI-powered utilities** into a single scalable platform built on **Next.js 14 App Router architecture**.

---

## Why This Project Matters

*  Solves **real-world inefficiencies** in legal practice
*  Introduces **AI-assisted legal workflows**
*  Demonstrates **production-grade architecture (full-stack in Next.js)**
*  Built with **scalability + maintainability** in mind

---

##  Key Features

### Core Legal System

* **Dashboard**

  * Real-time stats (cases, hearings)
  * Upcoming schedule visibility
  * Quick actions for productivity

* **Case Management System**

  * Full CRUD operations
  * FIR, PPC provisions, counsel details
  * Status tracking & structured records

* **Case Detail Engine**

  * Timeline of proceedings
  * Accused & bail tracking
  * Citations & legal notes

* **Calendar & Hearings**

  * Monthly visual calendar
  * Hearing highlights
  * Day-wise event breakdown

* **Reminders System**

  * Priority-based (High/Medium/Low)
  * Filters: Upcoming / Overdue / Completed

* **Law Books Library**

  * Upload & manage PDFs
  * Inline preview
  * Search & tagging

---

###  Advanced Features

* ** Auto Judgement Image Generator**

  * Converts case data → professional branded images
  * PNG/JPG export
  * Preview before download
  * Social media ready

* ** Authentication & Security**

  * JWT in httpOnly cookies
  * Protected routes via middleware
  * Role-based access (Admin / Lawyer / Associate)

---

###  Upcoming AI Features

*  AI Judgement Extractor
*  Cross-Examination Review System (PR-style workflow)
*  Automatic Legal Application Generator
*  Smart Judgement Library

---

##  Tech Stack

### Frontend

* Next.js 14 (App Router)
* React 18
* Tailwind CSS

### Backend

* Next.js API Routes
* MongoDB + Mongoose

### Auth & Security

* JWT + bcryptjs
* Middleware-based protection

### Utilities

* react-hot-toast
* date-fns
* html-to-image

---

##  Architecture

* **Monolithic Full-Stack (Next.js)**
* API Routes for backend logic
* MongoDB as primary datastore
* Modular component-based UI

```
Client (React UI)
     ↓
Next.js App Router
     ↓
API Routes (Backend Logic)
     ↓
MongoDB Database
```

---

##  Project Structure

```
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
├── components/
├── hooks/
├── lib/
├── models/
├── utils/
└── middleware.js
```

---

##  Setup & Installation

### 1. Clone Repository

```bash
git clone https://github.com/M-Saad-saif/law-system.git
cd law-system
npm install
```

### 2. Environment Variables

Create `.env.local`:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Create Upload Folders

```bash
mkdir -p public/uploads/books
mkdir -p public/uploads/judgement-images
```

### 4. Run Development Server

```bash
npm run dev
```

---

##  Demo Data

```bash
curl -X POST http://localhost:3000/api/seed
```

---

##  Database Design

* **User** → Authentication & roles
* **Case** → Core legal entity with nested data
* **Reminder** → Task tracking
* **Book** → PDF library
* **JudgementImage** → Generated assets

---

##  API Highlights

* `/api/auth/*` → Authentication
* `/api/cases/*` → Case management
* `/api/reminders/*` → Task system
* `/api/books/*` → Document handling
* `/api/judgement-images/*` → Image generation

---

##  Roadmap

### Q2 2026

* AI judgement parsing
* Cross-examination workflow

### Q3 2026

* Application generator
* Notifications system

### Q4 2026

* Mobile app
* Client portal

---

##  Final Thoughts

This project showcases:

* Real-world **legal domain understanding**
* Strong **full-stack engineering skills**
* Ability to design **scalable systems**
* Integration of **AI into traditional workflows**

