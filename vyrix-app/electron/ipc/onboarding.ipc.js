const fs   = require("fs");
const path = require("path");
const { apiFetch, getToken } = require("./auth.ipc");

function apiFetchMultipart(apiPath, fields, filePath) {
    return new Promise((resolve, reject) => {
        const https = require("https");
        const http  = require("http");
        const { URL } = require("url");

        const API   = process.env.API_URL || "https://vyrix-app.onrender.com";
        const token = getToken();
        const url   = new URL(`${API}${apiPath}`);

        const boundary = "----VyrixBoundary" + Date.now().toString(16);
        const parts = [];

        // Text fields
        for (const [key, val] of Object.entries(fields)) {
            parts.push(
                `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${val}\r\n`
            );
        }

        // Optional file
        let fileBuffer = null;
        if (filePath) {
            fileBuffer = fs.readFileSync(filePath);
            const filename = path.basename(filePath);
            const mime     = filePath.match(/\.(png|gif|webp)$/i) ? `image/${filePath.split(".").pop()}` : "image/jpeg";
            parts.push(
                `--${boundary}\r\nContent-Disposition: form-data; name="profile_pic"; filename="${filename}"\r\nContent-Type: ${mime}\r\n\r\n`
            );
        }

        const preamble = Buffer.from(parts.join(""));
        const epilogue = Buffer.from(`\r\n--${boundary}--\r\n`);
        const bodyLen  = preamble.length + (fileBuffer ? fileBuffer.length : 0) + epilogue.length;

        const headers = {
            "Content-Type":   `multipart/form-data; boundary=${boundary}`,
            "Content-Length": bodyLen,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const transport = url.protocol === "https:" ? https : http;
        const req = transport.request(
            {
                hostname: url.hostname,
                port:     url.port || (url.protocol === "https:" ? 443 : 80),
                path:     url.pathname + url.search,
                method:   "POST",
                headers,
            },
            (res) => {
                let data = "";
                res.on("data", (c) => (data += c));
                res.on("end", () => {
                    try { resolve(JSON.parse(data)); }
                    catch { resolve(data); }
                });
            }
        );
        req.on("error", reject);
        req.write(preamble);
        if (fileBuffer) req.write(fileBuffer);
        req.write(epilogue);
        req.end();
    });
}

function register(ipcMain) {
    ipcMain.handle("onboarding:sendOtp", async () => {
        return apiFetch("/api/onboarding/send-otp", { method: "POST", body: {} });
    });

    ipcMain.handle("onboarding:verifyOtp", async (_, otp) => {
        return apiFetch("/api/onboarding/verify-otp", { method: "POST", body: { otp } });
    });

    ipcMain.handle("onboarding:saveProfile", async (_, username, profession, filePath) => {
        return apiFetchMultipart("/api/onboarding/profile", { username, profession }, filePath || null);
    });
}

module.exports = { register };
