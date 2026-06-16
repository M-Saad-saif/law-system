# LexisPortal — Subscription & Billing System

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Changes](#database-changes)
3. [Trial Workflow](#trial-workflow)
4. [Subscription Workflow](#subscription-workflow)
5. [Payment Workflow](#payment-workflow)
6. [Admin Approval Workflow](#admin-approval-workflow)
7. [Middleware Explanation](#middleware-explanation)
8. [Cron Setup Instructions](#cron-setup-instructions)
9. [Environment Variables](#environment-variables)
10. [Local Testing Instructions](#local-testing-instructions)
11. [Production Deployment Instructions](#production-deployment-instructions)

---

## Architecture Overview

The subscription system follows a **Chamber-based model**: every Senior Lawyer owns
one Chamber (their firm). The Chamber holds the single Subscription. Junior Lawyers
inherit their Senior's Chamber subscription — they never have their own.

```
User (Senior Lawyer)
  └─ Chamber (firm)
        └─ Subscription (one per chamber)
        └─ PaymentRequests
```

### Key Files Added / Modified

| Path                                                   | Purpose                                                  |
| ------------------------------------------------------ | -------------------------------------------------------- |
| `src/models/Chamber.js`                                | Chamber/Company model                                    |
| `src/models/Subscription.js`                           | Subscription with statuses & lifecycle dates             |
| `src/models/PaymentRequest.js`                         | Manual payment requests with unique invoice + amount     |
| `src/lib/subscriptionService.js`                       | All subscription business logic (single source of truth) |
| `src/lib/withSubscription.js`                          | API middleware wrapper that enforces subscription access |
| `src/hooks/useSubscription.js`                         | React hook + SubscriptionGate component for frontend     |
| `src/app/api/auth/register/route.js`                   | calls `bootstrapChamberForSenior` on signup              |
| `src/app/api/billing/route.js`                         | GET subscription info / POST submit payment request      |
| `src/app/api/admin/payments/route.js`                  | Admin: list all payment requests                         |
| `src/app/api/admin/payments/[id]/route.js`             | Admin: approve or reject a payment                       |
| `src/app/api/admin/subscriptions/[chamberId]/route.js` | Admin: block, cancel, grant temp access                  |
| `src/app/api/cron/expire-subscriptions/route.js`       | Cron: auto-expire stale subscriptions                    |
| `src/app/(dashboard)/billing/page.js`                  | Billing UI for users                                     |
| `src/app/(dashboard)/admin/payments/page.js`           | Admin Payment Verification panel                         |
| `src/app/(dashboard)/layout.js`                        | wraps app in SubscriptionProvider + SubscriptionGate     |
| `src/components/layout/Sidebar.js`                     | adds Billing + Admin Payments nav links                  |
| `src/middleware.js`                                    | cookie-based fast subscription guard                     |
| `vercel.json`                                          | adds daily cron for subscription expiry                  |

All 55 existing protected API routes were migrated from `withAuth` to `withSubscription`
automatically, so backend enforcement is universal.

---

## Database Changes

### New Collections

#### `chambers`

```js
{
  _id:        ObjectId,
  name:       String,       // e.g. "Muhammad Saad Saif's Chmaber"
  owner:      ObjectId,     // ref: User (Senior Lawyer) -> Muhammad Saad Saif ID
  createdAt:  Date,
  updatedAt:  Date
}
```

#### `subscriptions`

```js
{
  _id:                    ObjectId,
  chamber:                ObjectId,     // ref: Chamber (unique)
  status:                 String,       // trialing | active | expired | temporary_active | blocked | cancelled
  trial_started_at:       Date,
  trial_ends_at:          Date,         // trial_started_at + 7 days
  subscription_starts_at: Date,         // set on payment approval
  subscription_ends_at:   Date,         // subscription_starts_at + 30 days
  temp_access_ends_at:    Date,         // set when admin grants temporary_active
  createdAt:              Date,
  updatedAt:              Date
}
```

#### `paymentrequests`

```js
{
  _id:            ObjectId,
  chamber:        ObjectId,     // ref: Chamber
  invoice_id:     String,       // unique — INV-last dig of user chamber ID-random
  payable_amount: Number,       // unique — BASE_PRICE + sequential offset
  payment_method: String,       // raast | easypaisa | jazzcash | bank_transfer | other
  reference_id:   String,       // user-entered transaction reference
  screenshot_url: String,       // uploaded payment proof URL
  submitted_at:   Date,
  verified_at:    Date,
  admin_notes:    String,
  status:         String,       // pending | approved | rejected
  createdAt:      Date,
  updatedAt:      Date
}
```

## Trial Workflow

```
Senior Lawyer registers
        │
        ▼
User record created
        │
        ▼
bootstrapChamberForSenior() called automatically
        │
        ├─ Chamber created  { owner: userId, name: "..." }
        │
        └─ Subscription created {
               status: "trialing",
               trial_started_at: now,
               trial_ends_at: now + 7 days
           }
        │
        ▼
Full platform access for 7 days
        │
        ▼
Cron runs daily at midnight
        │
        ▼
trial_ends_at < now?
        │
       YES
        │
        ▼
status → "expired"
All users in this chamber lose access.
They are redirected to /billing.
```

---

## Subscription Workflow

```
status: "expired"
        │
User visits /billing
        │
Senior Lawyer submits PaymentRequest
        │
        ├─ Unique invoice ID generated: INV-YYYY-NNNNN
        └─ Unique payable amount: 5000 + sequential offset
        │
Admin reviews in /admin/payments
        │
        ├─ APPROVE ──────────────────────────────────────────┐
        │                                                     │
        │   PaymentRequest.status = "approved"               │
        │   Subscription.status   = "active"                 │
        │   subscription_starts_at = now                     │
        │   subscription_ends_at   = now + 30 days           │
        │   → All chamber users regain access immediately     │
        │                                                     │
        └─ REJECT ────────────────────────────────────────────┘
            PaymentRequest.status = "rejected"
            Admin notes stored and shown to user
            Subscription remains "expired"

Cron runs daily:
  active → expired  when subscription_ends_at < now
```

---

## Payment Workflow

```
1. User visits /billing
2. System displays:
   - Subscription status badge
   - Trial / subscription expiry date
   - Invoice ID (generated per request)
   - Unique payable amount (helps admin identify payment)
   - Bank / Raast / EasyPaisa payment instructions
3. User transfers exact amount
4. User fills in:
   - Payment method
   - Transaction reference ID
   - Screenshot (optional)
5. POST /api/billing → PaymentRequest created (status: pending)
6. User sees "Under Review" state on /billing
7. Access remains blocked until admin approves
```

### Unique Amount Strategy

- Base price: PKR 5,000 (configurable via `BASE_PLAN_PRICE` in `PaymentRequest.js`)
- Each new request adds +1 offset: 5001, 5002, 5003, …
- Wraps at 9999 then repeats (effectively unique within any billing cycle)
- Purpose: admin can identify the payment in Raast/EasyPaisa history by exact amount

---

## Admin Approval Workflow

### Access

Admins can reach the panel via:

- Sidebar: **Payment Verification** link (visible only to admins)
- Direct URL: `/admin/payments`

### Panel Features

- Filter by status: All / Pending / Approved / Rejected
- Search by invoice ID, company name, owner name, reference ID
- Each card shows: company, owner, amount, method, reference ID, submission date, current sub status
- **Review** button opens modal for approve/reject
- **Proof** button opens payment screenshot in new tab
- **Temp** button opens temporary access grant modal

### Approve

- `PATCH /api/admin/payments/:id` with `{ action: "approve" }`
- Sets subscription to `active` for 30 days
- Access restored immediately for all chamber users

### Reject

- `PATCH /api/admin/payments/:id` with `{ action: "reject", admin_notes: "..." }`
- Admin notes are shown to the user on the billing page
- Chamber remains expired; user can resubmit

### Temporary Access

- `PATCH /api/admin/subscriptions/:chamberId` with `{ action: "grant_temp", days: 3 }`
- Sets status to `temporary_active` for N days
- Auto-expires via cron

### Other Admin Actions (via API)

```http
PATCH /api/admin/subscriptions/:chamberId
Body: { "action": "block" }        → status: blocked
Body: { "action": "cancel" }       → status: cancelled
Body: { "action": "reactivate" }   → status: active (30 days)
```

---

## Middleware Explanation

### Backend: `withSubscription` (src/lib/withSubscription.js)

Wraps every protected API route handler. Pipeline:

```
Request
  → withAuth (verify JWT, extract user)
  → skip if user.role === "admin"
  → getChamberForUser(userId)
     senior  → Chamber.findOne({ owner: userId })
     junior  → User.findById(userId).createdBy → Chamber.findOne({ owner: createdBy })
  → Subscription.findOne({ chamber: chamberId })
  → check status ∈ [trialing, active, temporary_active]
  → ALLOW → handler(request, context, user)
  → DENY  → 403 JSON { message: "..." }
```

All 55 protected routes use `withSubscription`. The `/api/billing` and `/api/admin/*`
routes intentionally use `withAuth` directly so they remain accessible when expired.

### Frontend: `SubscriptionGate` (src/hooks/useSubscription.js)

React component wrapping all dashboard pages:

```
Mount
  → fetch /api/billing
  → if user is admin → render children
  → if status ∈ allowed → render children
  → else → router.replace("/billing")
```

---

## Cron Setup Instructions

### Vercel (Production)

The cron is already configured in `vercel.json`:

```json
{
  "path": "/api/cron/expire-subscriptions",
  "schedule": "0 0 * * *"
}
```

This runs daily at **00:00 UTC**. Vercel calls the endpoint automatically with the
`Authorization: Bearer <CRON_SECRET>` header.

Set the `CRON_SECRET` environment variable in Vercel Dashboard → Project Settings →
Environment Variables. Use any long random string.

### Local / Manual Testing

```bash
# Trigger expiry check manually (no secret required locally if CRON_SECRET is unset)
curl http://localhost:3000/api/cron/expire-subscriptions

# With secret
curl -H "Authorization: Bearer your_secret" \
     http://localhost:3000/api/cron/expire-subscriptions
```

---

## Local Testing Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

```bash
cp .env.example .env.local
# Fill in MONGODB_URI, JWT_SECRET, CRON_SECRET, NEXT_PUBLIC_* values
```

### 3. Run development server

```bash
npm run dev
```

### 4. Test the trial flow

1. Register a new Senior Lawyer account at `/register`
2. Check MongoDB — a `Chamber` and `Subscription` (status: `trialing`) should exist
3. Log in and verify full dashboard access

### 5. Simulate trial expiry

```js
// Run in MongoDB shell or Compass:
db.subscriptions.updateOne(
  { status: "trialing" },
  { $set: { trial_ends_at: new Date(Date.now() - 1000) } },
);
```

Then call the cron endpoint:

```bash
curl http://localhost:3000/api/cron/expire-subscriptions
```

Refresh the app — you should be redirected to `/billing`.

### 6. Test payment submission

1. On `/billing`, fill in a reference ID and submit
2. Check MongoDB `paymentrequests` collection

### 7. Test admin approval

1. Log in as an admin user
2. Go to `/admin/payments`
3. Click **Review** → **Approve**
4. Subscription status should change to `active`
5. Log back in as the lawyer — full access should be restored

---

```

## Subscription Status Reference

| Status             | Access          | Set By                 |
| ------------------ | --------------- | ---------------------- |
| `trialing`         |  Full         | Auto on registration   |
| `active`           |  Full         | Admin approves payment |
| `temporary_active` |  Full         | Admin grants manually  |
| `expired`          |  Billing only | Cron (trial/sub ends)  |
| `blocked`          |  Billing only | Admin manually         |
| `cancelled`        |  Billing only | Admin manually         |
```
