import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { youtubeAuthRouter } from "./auth.js";
import { handleMcpRequest } from "./mcp.js";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ⭐ LOAD TOKENS ON START (backup loader)
if (fs.existsSync("token.json")) {
  const saved = JSON.parse(fs.readFileSync("token.json"));
  if (saved.access_token) global.ACCESS_TOKEN = saved.access_token;
  if (saved.refresh_token) global.REFRESH_TOKEN = saved.refresh_token;
  if (saved.access_token) console.log("ACCESS TOKEN LOADED ON START");
}

// OAuth routes
app.use("/auth", youtubeAuthRouter);

// ⭐ MCP endpoint
app.post("/mcp", async (req, res) => {
  try {
    const response = await handleMcpRequest(req.body);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

// ⭐ LOGIN STATUS ROUTE (Frontend checks token)
app.get("/auth/status", (req, res) => {
  res.json({ loggedIn: !!global.ACCESS_TOKEN });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Backend running at http://localhost:3000");
});
