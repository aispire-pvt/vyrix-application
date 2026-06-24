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

app.use(express.json({ limit: "10mb" }));   // tiptap content can be a few MB
app.use(cookieParser());

app.use("/api/auth",     authRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/catalog",  catalogRoutes);

module.exports = app;
