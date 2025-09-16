const express = require("express");
const webpush = require("web-push");
const app = express();

app.use(express.static("public"));
app.use(express.json());

// VAPIDキー
const VAPID_KEYS = {
  publicKey: "BJYGAQgw2pA3xMk4yCKACorIMax3mtWYy6FDBdoJof-QiDqzZzImpkDEmuV0VghL007x6XdofSM3n8xSq7z3aE4",
  privateKey: "6B8XiSEAmONRZNAyuSMET9YxRG2S12WCKUcMdj_cYq8"
};

webpush.setVapidDetails(
  "mailto:example@example.com",
  VAPID_KEYS.publicKey,
  VAPID_KEYS.privateKey
);

// 通知API
app.post("/notify", async (req, res) => {
  const { subscription, title, body } = req.body;
  try {
    await webpush.sendNotification(subscription, JSON.stringify({ title, body }));
    res.sendStatus(201);
  } catch (err) {
    console.error("通知エラー:", err);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

