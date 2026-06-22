const express= require("express");
const cors= require("cors");
const authRoutes= require("./routes/auth.routes");
const onboardingRoutes=require("./routes/onboarding.routes");
const documentRoutes=require("./routes/document.routes");
const folderRoutes=require("./routes/folder.routes");
const cookerParser= require("cookie-parser");

const app= express();

// Allow the Vite frontend to call the API with cookies (credentials).
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());
app.use(cookerParser());

app.use("/api/auth",authRoutes);
app.use("/api/onboarding",onboardingRoutes);
app.use("/api/docs",documentRoutes);
app.use("/api/folders",folderRoutes);

module.exports= app;