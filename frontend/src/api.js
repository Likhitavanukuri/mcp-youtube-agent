import axios from "axios";

const BACKEND_URL = "http://localhost:3000";

export const mcp = async (tool, input = {}) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/mcp`, {
      tool,
      input,
    });

    const data = response.data;

    // If backend returns a simple string (GPT reply), wrap it safely
    if (typeof data === "string") {
      return { text: data };
    }

    // If backend returns { error: ... }, pass it through
    if (data.error) {
      return { text: "⚠️ " + data.error };
    }

    return data;
  } catch (err) {
    console.error("MCP ERROR:", err);
    return { text: "❌ Backend unreachable." };
  }
};
