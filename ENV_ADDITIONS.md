# ─── Password Reset / Email (add these to your .env.local) ───────────────────

# Your app's public URL — used to build the reset link in the email
NEXT_PUBLIC_APP_URL=https://your-domain.com

# SMTP credentials (works with Gmail, Outlook, Zoho, Brevo, Mailgun SMTP, etc.)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false          # set to true if using port 465 (SSL)
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password   # Gmail: use an App Password, not your account password
SMTP_FROM=LawPortal <your@gmail.com>   # optional — defaults to SMTP_USER

# ─── Gmail quick-start ────────────────────────────────────────────────────────
# 1. Enable 2FA on your Google account
# 2. Go to myaccount.google.com > Security > App passwords
# 3. Generate one for "Mail" and paste it as SMTP_PASS above
#
# ─── Brevo (free 300 emails/day) ─────────────────────────────────────────────
# SMTP_HOST=smtp-relay.brevo.com
# SMTP_PORT=587
# SMTP_USER=your-brevo-login@example.com
# SMTP_PASS=your-brevo-smtp-key
#
# ─── Resend alternative ───────────────────────────────────────────────────────
# If you'd rather use Resend instead of Nodemailer, install the resend package:
#   npm install resend
# Then replace the nodemailer logic in /src/app/api/auth/forgot-password/route.js
# with: import { Resend } from 'resend'; const resend = new Resend(process.env.RESEND_API_KEY);
# RESEND_API_KEY=re_xxxxxxxxxxxx
