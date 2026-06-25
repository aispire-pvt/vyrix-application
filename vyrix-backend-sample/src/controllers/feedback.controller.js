const userModel = require("../models/user.models");
const { sendFeedbackEmail } = require("../services/email.service");

// POST /api/feedback — a logged-in user sends a suggestion or bug report.
async function submitFeedback(req, res) {
    try {
        const { type, message } = req.body;

        const kind = type === "bug" ? "bug" : "suggestion";
        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: "Please enter a message" });
        }
        if (message.trim().length > 4000) {
            return res.status(400).json({ success: false, message: "Message is too long" });
        }

        const user = await userModel.findById(req.user.id).select("name email");

        await sendFeedbackEmail({
            type: kind,
            message: message.trim(),
            userEmail: user?.email,
            userName: user?.name,
        });

        return res.status(200).json({ success: true, message: "Thanks! Your feedback has been sent." });
    } catch (error) {
        console.error("submitFeedback error:", error);
        return res.status(500).json({ success: false, message: "Could not send your feedback. Please try again." });
    }
}

module.exports = { submitFeedback };
