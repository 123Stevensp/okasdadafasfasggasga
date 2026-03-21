require('dotenv').config();
const express = require('express');
const noblox = require('noblox.js');

const app = express();
app.use(express.json());

const GROUP_ID = parseInt(process.env.GROUP_ID);

// Noblox mit Cookie einloggen
async function startServer() {
    await noblox.setCookie(process.env.ROBLOX_COOKIE);
    const currentUser = await noblox.getCurrentUser();
    console.log(`✅ Logged in as: ${currentUser.UserName}`);

    // Ranking Endpoint
    app.post('/rank', async (req, res) => {
        const { userId, rankId, apiKey } = req.body;

        // Einfacher API Key Schutz
        if (apiKey !== process.env.API_KEY) {
            return res.status(401).json({ success: false, message: 'Invalid API Key' });
        }

        try {
            await noblox.setRank(GROUP_ID, userId, rankId);
            console.log(`✅ ${userId} has been ranked to ${rankId}`);
            res.json({ success: true });
        } catch (err) {
            console.error(`❌ Error: ${err}`);
            res.status(500).json({ success: false, message: err.toString() });
        }
    });

    app.listen(process.env.PORT, () => {
        console.log(`🚀 Server is running on ${process.env.PORT}`);
    });
}

startServer();