const nodemailer = require("nodemailer");

// Cache a single transporter so we don't re-create an Ethereal test account
// (or re-open a Gmail connection) on every email.
let transporterPromise = null;

async function getTransporter() {
    if (transporterPromise) return transporterPromise;

    transporterPromise = (async () => {
        // If real Gmail credentials are provided, use them; otherwise fall back
        // to an Ethereal test inbox (no real delivery — preview URL in console).
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            console.log("[email] Using Gmail SMTP as", process.env.EMAIL_USER);
            return nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
        }

        console.log(
            "[email] No EMAIL_USER/EMAIL_PASS set — using Ethereal test account (emails are not delivered, open the preview URL)."
        );
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    })();

    return transporterPromise;
}

// Sender shown to the recipient. Uses the configured Gmail address if present.
const FROM_ADDRESS = process.env.EMAIL_USER
    ? `"Vyrix" <${process.env.EMAIL_USER}>`
    : '"Vyrix" <no-reply@vyrix.com>';

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

async function sendOTPEmail(email, otp) {
    const transporter = await getTransporter();

    const info = await transporter.sendMail({
        from: FROM_ADDRESS,
        to: email,
        subject: "Your Vyrix verification code",
        text:
            `Hello,\n\n` +
            `Use the verification code below to confirm your email address and continue setting up your Vyrix account.\n\n` +
            `Verification code: ${otp}\n\n` +
            `This code will expire in 10 minutes. If you didn't request this code, you can safely ignore this email.\n\n` +
            `— The Vyrix Team`,
        html: buildHtml(otp),
    });

    // For Ethereal, this prints a URL where the email can be viewed in a browser.
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log("[email] Preview URL:", previewUrl);

    return info;
}

module.exports = { sendOTPEmail };
