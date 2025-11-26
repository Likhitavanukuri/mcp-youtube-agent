import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { youtubeAuthRouter } from "./auth.js";
import { handleMcpRequest } from "./mcp.js";
import fs from "fs";

dotenv.config();

const app = express();

// ⭐ FIXED CORS — ALLOW EVERYTHING (no invalid characters)
app.use(cors({ origin: "*" }));
app.use(express.json());

// Load tokens
if (fs.existsSync("token.json")) {
  const saved = JSON.parse(fs.readFileSync("token.json"));
  if (saved.access_token) global.ACCESS_TOKEN = saved.access_token;
  if (saved.refresh_token) global.REFRESH_TOKEN = saved.refresh_token;
}

// OAuth routes
app.use("/auth", youtubeAuthRouter);

// MCP Route
app.post("/mcp", async (req, res) => {
  try {
    const response = await handleMcpRequest(req.body);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// Login status
app.get("/auth/status", (req, res) => {
  res.json({ loggedIn: !!global.ACCESS_TOKEN });
});

// PORT FIX
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
