import express from "express";
import { google } from "googleapis";
import { oauth2Client } from "./auth.js";

const router = express.Router();

const youtube = google.youtube({
  version: "v3",
  auth: oauth2Client,
});

// ⭐ Search YouTube
router.get("/search", async (req, res) => {
  try {
    const q = req.query.q;

    const response = await youtube.search.list({
      part: "snippet",
      q,
      maxResults: 10,
      type: "video",
    });

    res.json(response.data);
  } catch (error) {
    console.error("YouTube API Error:", error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

export default router;
