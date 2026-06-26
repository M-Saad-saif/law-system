import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import connectDB from "@/lib/db";
import User from "@/models/User";
import PasswordReset from "@/models/PasswordReset";

// 1 hour expiry
const TOKEN_TTL_MS = 60 * 60 * 1000;

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function POST(request) {
  try {
    await connectDB();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required." },
        { status: 400 },
      );
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If an account with that email exists, a reset link has been sent.",
      });
    }

    await PasswordReset.deleteMany({ userId: user._id, used: false });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await PasswordReset.create({
      userId: user._id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

    const transporter = createTransporter();

    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: user.email,
        subject: "Reset your LawPortal password",
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Reset your password</title>
        </head>
        <body style="margin:0;padding:0;background:#0a0a0a;font-family:system-ui,-apple-system,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="padding:32px 40px 24px;border-bottom:1px solid rgba(255,255,255,0.06);">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background:linear-gradient(135deg,#027f7e,#025f5e);width:40px;height:40px;border-radius:10px;text-align:center;vertical-align:middle;">
                            <span style="color:#fff;font-size:20px;">⚖️</span>
                          </td>
                          <td style="padding-left:12px;">
                            <span style="color:#fff;font-size:18px;font-weight:700;">LawPortal</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding:32px 40px;">
                      <h2 style="margin:0 0 8px;color:#fff;font-size:22px;font-weight:600;">Password Reset Request</h2>
                      <p style="margin:0 0 24px;color:rgba(255,255,255,0.5);font-size:14px;line-height:1.6;">
                        Hi ${user.name},<br/><br/>
                        We received a request to reset your LawPortal password.
                        Click the button below to choose a new one. This link will expire in <strong style="color:rgba(255,255,255,0.7);">1 hour</strong>.
                      </p>
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background:#027f7e;border-radius:8px;">
                            <a href="${resetUrl}" style="display:inline-block;padding:12px 28px;color:#fff;font-size:14px;font-weight:600;text-decoration:none;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);">
                      <p style="margin:0;color:rgba(255,255,255,0.2);font-size:11px;">
                        LawPortal · Legal Practice Management · Pakistan
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      });
    } catch (err) {
    }

    return NextResponse.json({
      success: true,
      message:
        "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
