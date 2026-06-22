// Transactional email via the Brevo HTTP API.
// (Render and most PaaS hosts block raw SMTP, so we use Brevo's REST endpoint.)

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
const SENDER_EMAIL = process.env.BREVO_SENDER || "no-reply@vyrix.com";
const SENDER_NAME = "Vyrix";

async function sendOTPEmail(email, otp) {
    // Dev convenience: with no Brevo key configured, log the code instead of failing.
    if (!process.env.BREVO_API_KEY) {
        console.log(`[email] BREVO_API_KEY not set — dev fallback. OTP for ${email}: ${otp}`);
        return;
    }

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

module.exports = { sendOTPEmail };
