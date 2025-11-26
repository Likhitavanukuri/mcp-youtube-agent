import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";

import { youtubeAuthRouter } from "./auth.js";
import { handleMcpRequest } from "./mcp.js";

dotenv.config();

const app = express();

// CORS (use allowed origin from env)
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());

// ⭐ LOAD TOKENS ON START (OPTIONAL, SAFE)
if (fs.existsSync("token.json")) {
  const saved = JSON.parse(fs.readFileSync("token.json"));
  if (saved.access_token) global.ACCESS_TOKEN = saved.access_token;
  if (saved.refresh_token) global.REFRESH_TOKEN = saved.refresh_token;
  if (saved.access_token) console.log("ACCESS TOKEN LOADED ON START");
}

// OAuth routes
app.use("/auth", youtubeAuthRouter);

// MCP endpoint
app.post("/mcp", async (req, res) => {
  try {
    const response = await handleMcpRequest(req.body);
    res.json(response);
  } catch (error) {
    console.error("MCP error:", error);
    res.status(500).json({ error: error.toString() });
  }
});

// Login status route
app.get("/auth/status", (req, res) => {
  res.json({ loggedIn: !!global.ACCESS_TOKEN });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "mcp-youtube-agent-server" });
});

// ⭐ FIXED: dynamic port binding for Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
