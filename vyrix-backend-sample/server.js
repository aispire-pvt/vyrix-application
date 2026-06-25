require("dotenv").config();

const REQUIRED = ["MONGO_URI", "JWT_SECRET"];
const missing = REQUIRED.filter(k => !process.env[k]);
if (missing.length) { console.error("Missing required env vars:", missing.join(", ")); process.exit(1); }
if (process.env.JWT_SECRET.length < 32) { console.error("JWT_SECRET must be at least 32 characters"); process.exit(1); }

const app = require("./src/app");
const connectDB = require("./src/db/db");
connectDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
});