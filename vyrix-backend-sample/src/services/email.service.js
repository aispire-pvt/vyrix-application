const nodemailer = require("nodemailer");

// ---------- Email content (shared by all delivery methods) ----------

function buildHtml(otp) {
    return `
    <div style="margin:0;padding:0;background-color:#000000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:480px;margin:0 auto;padding:40px 32px;color:#e1e1e1;">
        <h1 style="margin:0 0 24px;font-size:24px;font-weight:600;color:#ffffff;letter-spacing:0.5px;">Vyrix</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c7c7c7;">Hello,</p>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#c7c7c7;">
          Use the verification code below to confirm your email address and continue setting up your Vyrix account.
        </p>
        <div style="margin:0 0 24px;padding:20px;background-color:#1e1e1e;border-radius:11px;text-align:center;">
          <span style="font-size:32px;font-weight:700;letter-spacing:10px;color:#ffffff;">${otp}</span>
        </div>
        <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#c7c7c7;">
          This code will expire in <strong style="color:#ffffff;">10 minutes</strong>.
        </p>
        <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#c7c7c7;">
          If you didn't request this code, you can safely ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #2a2a2a;margin:24px 0;" />
        <p style="margin:0;font-size:12px;color:#6b6b6b;">This is an automated message from Vyrix. Please do not reply to this email.</p>
      </div>
    </div>`;
}

function buildText(otp) {
    return (
        `Hello,\n\n` +
        `Use the verification code below to confirm your email address and continue setting up your Vyrix account.\n\n` +
        `Verification code: ${otp}\n\n` +
        `This code will expire in 10 minutes. If you didn't request this code, you can safely ignore this email.\n\n` +
        `— The Vyrix Team`
    );
}

const SUBJECT = "Your Vyrix verification code";
const SENDER_EMAIL = process.env.BREVO_SENDER || process.env.EMAIL_USER || "no-reply@vyrix.com";
const SENDER_NAME = "Vyrix";

// ---------- Method 1: Brevo HTTP API (works on hosts that block SMTP, e.g. Render) ----------

async function sendViaBrevo(email, otp) {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
            accept: "application/json",
        },
        body: JSON.stringify({
            sender: { name: SENDER_NAME, email: SENDER_EMAIL },
            to: [{ email }],
            subject: SUBJECT,
            htmlContent: buildHtml(otp),
            textContent: buildText(otp),
        }),
    });

    if (!res.ok) {
        const detail = await res.text();
        throw new Error(`Brevo send failed (${res.status}): ${detail}`);
    }
    console.log("[email] Sent via Brevo API to", email);
}

// ---------- Method 2: SMTP (Gmail or Ethereal) — used for local development ----------

let transporterPromise = null;

async function getTransporter() {
    if (transporterPromise) return transporterPromise;

    transporterPromise = (async () => {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            console.log("[email] Using Gmail SMTP as", process.env.EMAIL_USER);
            return nodemailer.createTransport({
                service: "gmail",
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
            });
        }
        console.log("[email] No email credentials set — using Ethereal test inbox (preview URL in console).");
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: { user: testAccount.user, pass: testAccount.pass },
        });
    })();

    return transporterPromise;
}

async function sendViaSmtp(email, otp) {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
        from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
        to: email,
        subject: SUBJECT,
        text: buildText(otp),
        html: buildHtml(otp),
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log("[email] Preview URL:", previewUrl);
}

// ---------- Public API ----------

// Prefer the Brevo HTTP API when a key is present (required on Render);
// otherwise fall back to SMTP for local development.
async function sendOTPEmail(email, otp) {
    if (process.env.BREVO_API_KEY) {
        return sendViaBrevo(email, otp);
    }
    return sendViaSmtp(email, otp);
}

module.exports = { sendOTPEmail };
