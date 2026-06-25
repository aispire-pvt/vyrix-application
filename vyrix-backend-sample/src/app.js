const express         = require("express");
const cors            = require("cors");
const cookieParser    = require("cookie-parser");
const authRoutes      = require("./routes/auth.routes");
const onboardingRoutes = require("./routes/onboarding.routes");
const feedbackRoutes  = require("./routes/feedback.routes");
const catalogRoutes   = require("./routes/catalog.routes");

const app = express();

app.use(cors({
    origin:      process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// ponytail: in-memory rate limit, single-instance only; swap to redis-rate-limit if scaling
const _rl = new Map();
function rateLimit(max, windowMs) {
    return (req, res, next) => {
        const key = req.ip;
        const now = Date.now();
        const e = _rl.get(key) || { n: 0, t: now };
        if (now - e.t > windowMs) { e.n = 0; e.t = now; }
        e.n++;
        _rl.set(key, e);
        if (e.n > max) return res.status(429).json({ success: false, message: "Too many requests, please try again later" });
        next();
    };
}

const authLimit = rateLimit(10, 15 * 60 * 1000); // 10 per 15 min per IP

app.use("/api/auth/login",    authLimit);
app.use("/api/auth/register", authLimit);
app.use("/api/auth/google",   authLimit);
app.use("/api/onboarding/send-otp",   rateLimit(5, 10 * 60 * 1000));
app.use("/api/onboarding/verify-otp", rateLimit(10, 10 * 60 * 1000));

app.use("/api/auth",       authRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/feedback",   feedbackRoutes);
app.use("/api/catalog",    catalogRoutes);

module.exports = app;
