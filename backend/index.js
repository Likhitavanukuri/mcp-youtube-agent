import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { youtubeAuthRouter } from "./auth.js";
import youtubeRoutes from "./youtubeRouter.js";
import { handleMcpRequest } from "./mcp.js";

dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// OAuth routes
app.use("/auth", youtubeAuthRouter);

// YouTube search route
app.use("/youtube", youtubeRoutes);

// MCP route
app.post("/mcp", async (req, res) => {
  try {
    const response = await handleMcpRequest(req.body);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
