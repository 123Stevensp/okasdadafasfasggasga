require('dotenv').config();
const express = require('express');
const noblox = require('noblox.js');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 🔍 ENV DEBUG (VERY IMPORTANT ON RAILWAY)
console.log("==== ENV DEBUG ====");
console.log("GROUP_ID raw:", process.env.GROUP_ID);
console.log("GROUP_ID parsed:", parseInt(process.env.GROUP_ID));
console.log("COOKIE exists:", !!process.env.ROBLOX_COOKIE);
console.log("COOKIE length:", process.env.ROBLOX_COOKIE?.length);
console.log("API_KEY exists:", !!process.env.API_KEY);
console.log("===================");

// ✅ Validate ENV
const GROUP_ID = parseInt(process.env.GROUP_ID);

if (!GROUP_ID || isNaN(GROUP_ID)) {
    console.error("❌ GROUP_ID ist ungültig!");
    process.exit(1);
}

if (!process.env.ROBLOX_COOKIE) {
    console.error("❌ ROBLOX_COOKIE fehlt!");
    process.exit(1);
}

if (!process.env.API_KEY) {
    console.error("❌ API_KEY fehlt!");
    process.exit(1);
}

// 🚀 Start function
async function startServer() {
    try {
        console.log("🔐 Versuche Login...");

        await noblox.setCookie(process.env.ROBLOX_COOKIE);

        const user = await noblox.getAuthenticatedUser();
        console.log(`✅ Eingeloggt als: ${user.name} (ID: ${user.id})`);

    } catch (err) {
        console.error("❌ LOGIN FEHLER:", err.message);
        process.exit(1); // ⬅️ Hard stop if login fails
    }

    // 📩 Route
    app.post('/rank', async (req, res) => {
        const apiKey = req.headers['x-api-key'];

        if (apiKey !== process.env.API_KEY) {
            console.log("❌ Ungültiger API Key:", apiKey);
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const userId = parseInt(req.body.userId);
        const rankId = parseInt(req.body.rankId);

        console.log(`📩 Anfrage: userId=${userId}, rankId=${rankId}`);

        if (isNaN(userId) || isNaN(rankId)) {
            console.log("❌ Ungültige Parameter");
            return res.status(400).json({
                success: false,
                message: "userId und rankId müssen Zahlen sein"
            });
        }

        try {
            await noblox.setRank(GROUP_ID, userId, rankId);

            console.log(`✅ Erfolgreich: ${userId} → Rang ${rankId}`);

            return res.json({
                success: true
            });

        } catch (err) {
            console.error("❌ RANKING FEHLER:", err.message);

            return res.status(500).json({
                success: false,
                message: err.message
            });
        }
    });

    // 🧪 Health check route (VERY useful on Railway)
    app.get('/', (req, res) => {
        res.send("✅ Server läuft!");
    });

    app.listen(PORT, () => {
        console.log(`🚀 Server läuft auf Port ${PORT}`);
    });
}

startServer();
