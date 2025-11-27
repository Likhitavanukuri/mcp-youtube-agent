import axios from "axios";

// 🔥 AUTO-SWITCH between Vercel deploy & local development
const BACKEND_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const mcp = async (tool, input = {}) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/mcp`, {
      tool,
      input,
    });

    const data = response.data;

    // If response is string, convert to object
    if (typeof data === "string") return { text: data };

    // If error message exists
    if (data.error) return { text: "⚠️ " + data.error };

    return data;
  } catch (err) {
    console.error("MCP ERROR:", err);
    return { text: "❌ Backend unreachable." };
  }
};
