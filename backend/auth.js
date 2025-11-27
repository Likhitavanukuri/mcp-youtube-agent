import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

export const youtubeAuthRouter = express.Router();

export const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// ⭐ Use new REFRESH_TOKEN from .env
oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

// ⭐ Generate access token automatically on backend startup
oauth2Client.getAccessToken().then((res) => {
  global.ACCESS_TOKEN = res.token;
  console.log("✔ Backend generated ACCESS_TOKEN automatically");
});

// OPTIONAL login route (not required anymore)
youtubeAuthRouter.get("/login", (req, res) => {
  res.send("Login not required. Backend uses REFRESH_TOKEN from .env");
});

// Status
youtubeAuthRouter.get("/status", (req, res) => {
  res.json({ loggedIn: !!global.ACCESS_TOKEN });
});
