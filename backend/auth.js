import express from "express";
import { google } from "googleapis";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

export const youtubeAuthRouter = express.Router();

export const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// ⭐ Load saved token.json automatically
if (fs.existsSync("token.json")) {
  console.log("🔄 Loading saved tokens...");
  const saved = JSON.parse(fs.readFileSync("token.json", "utf8"));
  oauth2Client.setCredentials({
    refresh_token: saved.refresh_token,
  });

  // Auto-generate a fresh access token on backend startup
  oauth2Client.getAccessToken().then((r) => {
    global.ACCESS_TOKEN = r.token;
    console.log("✔ Auto-generated ACCESS TOKEN from refresh token");
  });
}

// 🔐 ONE-TIME LOGIN (only if token.json doesn't exist)
youtubeAuthRouter.get("/login", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/youtube.force-ssl",
    ],
  });

  res.redirect(url);
});

// Google callback
youtubeAuthRouter.get("/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    global.ACCESS_TOKEN = tokens.access_token;

    // ⭐ Save permanently
    fs.writeFileSync("token.json", JSON.stringify(tokens, null, 2));
    console.log("💾 Saved tokens to token.json");

    res.send("🎉 Authentication successful! You NEVER need to login again.");
  } catch (err) {
    console.log("CALLBACK ERROR:", err);
    res.send("❌ Authentication failed.");
  }
});

// Status route
youtubeAuthRouter.get("/status", (req, res) => {
  res.json({ loggedIn: global.ACCESS_TOKEN != null });
});
