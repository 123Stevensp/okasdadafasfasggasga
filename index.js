require('dotenv').config();
const express = require('express');
const noblox = require('noblox.js');

const app = express();
app.use(express.json());

const GROUP_ID = parseInt(process.env.GROUP_ID);

async function startServer() {
    try {
        await noblox.setCookie(process.env.ROBLOX_COOKIE);
        const currentUser = await noblox.getAuthenticatedUser();
        console.log("✅ Eingeloggt als: " + currentUser.name);
    } catch (err) {
        console.error("❌ Login Fehler: " + err.message);
        return;
    }

    app.post('/rank', async (req, res) => {
        const userId = req.body.userId;
        const rankId = req.body.rankId;
        const apiKey = req.body.apiKey;

        console.log("📩 Ranking Anfrage: userId=" + userId + " rankId=" + rankId);

        if (apiKey !== process.env.API_KEY) {
            console.log("❌ Ungültiger API Key!");
            return res.status(401).json({ success: false, message: "Ungültiger API Key" });
        }

        if (!userId || !rankId) {
            console.log("❌ Fehlende Parameter!");
            return res.status(400).json({ success: false, message: "userId und rankId fehlen" });
        }

        try {
            await noblox.setRank(GROUP_ID, parseInt(userId), parseInt(rankId));
            console.log("✅ " + userId + " wurde auf Rang " + rankId + " gesetzt");
            return res.json({ success: true });
        } catch (err) {
            console.error("❌ Ranking Fehler: " + err.message);
            return res.status(500).json({ success: false, message: err.message });
        }
    });

    app.listen(process.env.PORT || 3000, function() {
        console.log("🚀 Server läuft auf Port " + (process.env.PORT || 3000));
    });
}

startServer();
