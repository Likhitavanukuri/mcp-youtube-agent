import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL; // ⬅ use Vercel env

export const mcp = async (tool, input = {}) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/mcp`, {
      tool,
      input,
    });

    const data = response.data;

    if (typeof data === "string") {
      return { text: data };
    }

    if (data.error) {
      return { text: "⚠️ " + data.error };
    }

    return data;
  } catch (err) {
    console.error("MCP ERROR:", err);
    return { text: "❌ Backend unreachable." };
  }
};
