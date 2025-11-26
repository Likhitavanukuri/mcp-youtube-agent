import { useState, useEffect } from "react";
import axios from "axios";
import { mcp } from "./api";

function App() {
  const [messages, setMessages] = useState([
    { sender: "youi", text: "Hi, I’m YOUI 🤖. Search anything on YouTube!" },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:3000/auth/status").catch(() => {});
  }, []);

  // ---------- VIDEO GRID ----------
  const renderVideos = (items) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "20px",
        padding: "10px",
      }}
    >
      {items.map((item, index) => {
        const snippet = item.snippet;
        const id = item.id?.videoId || item.id;

        return (
          <div
            key={index}
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <img
              src={snippet?.thumbnails?.high?.url}
              style={{ width: "100%", borderRadius: "12px" }}
            />

            <h3
              style={{
                marginTop: "10px",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              <a
                href={`https://www.youtube.com/watch?v=${id}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#d90429", textDecoration: "none" }}
              >
                {snippet?.title}
              </a>
            </h3>

            <p style={{ color: "#666", fontSize: "14px" }}>
              {snippet?.channelTitle}
            </p>
          </div>
        );
      })}
    </div>
  );

  // ---------- LOCAL CHAT REPLIES ----------
  const localReplies = {
    hi: "Hi! 👋 How can I help you?",
    hello: "Hello! 😊 What would you like to search?",
    hey: "Hey! 👋 What’s up?",
    "good morning": "Good morning! ☀️",
    "good evening": "Good evening! 🌙",
    "good night": "Good night! 😴",
    "how are you": "I’m YOUI and I’m doing great! 🤖",
    "who are you": "I'm YOUI, your YouTube AI Assistant 🎥",
  };

  const greetingKeywords = [
    "hi",
    "hello",
    "hey",
    "good morning",
    "good evening",
    "good night",
    "how are you",
    "who are you",
  ];

  // ---------- INTENT DETECTOR ----------
  const detectIntent = async (query) => {
    const lower = query.toLowerCase().trim();

    // GREETINGS — exact match
    if (greetingKeywords.includes(lower)) {
      return { text: localReplies[lower] };
    }

    // Extract number for maxResults
    const numberMatch = lower.match(/\b\d+\b/);
    const limit = numberMatch ? parseInt(numberMatch[0]) : 10;

    // Channel videos
    if (lower.startsWith("channel ")) {
      const name = query.replace("channel", "").trim();
      return await mcp("youtube.channelVideos", { channel: name });
    }

    // YouTube actions
    if (lower.includes("liked")) return await mcp("youtube.getLikedVideos");
    if (lower.includes("history")) return await mcp("youtube.getHistory");

    if (lower.startsWith("info "))
      return await mcp("youtube.videoInfo", {
        videoId: lower.split(" ")[1],
      });

    if (lower.startsWith("like "))
      return await mcp("youtube.likeVideo", {
        videoId: lower.split(" ")[1],
      });

    if (lower.startsWith("search "))
      return await mcp("youtube.search", {
        query: lower.replace("search", "").trim(),
        maxResults: limit,
      });

    // DEFAULT — always search with dynamic limit
    return await mcp("youtube.search", { query, maxResults: limit });
  };

  // ---------- SEND MESSAGE ----------
  const sendMessage = async () => {
    if (!input.trim()) return;

    const query = input;

    setMessages((prev) => [...prev, { sender: "user", text: query }]);

    let reply = "";

    if (query.toLowerCase().startsWith("channel"))
      reply = "Fetching channel videos…";
    else if (query.toLowerCase().includes("liked"))
      reply = "Fetching your liked videos…";
    else if (query.toLowerCase().includes("history"))
      reply = "Fetching your watch history…";
    else if (query.toLowerCase().startsWith("info"))
      reply = "Fetching video info…";
    else if (query.toLowerCase().startsWith("like"))
      reply = "Liking that video…";
    else reply = `Searching for "${query}"…`;

    setMessages((prev) => [...prev, { sender: "youi", text: reply }]);

    setInput("");
    setIsTyping(true);

    try {
      const response = await detectIntent(query);

      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: "youi", text: response }]);
        setIsTyping(false);
      }, 350);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "youi", text: "❌ Unable to fetch videos right now." },
      ]);
      setIsTyping(false);
    }
  };

  // ---------- VIDEO GRID OUTPUT ----------
  const getLatestVideoGrid = () => {
    const last = messages[messages.length - 1];
    if (last?.text?.items) return renderVideos(last.text.items);

    return (
      <div style={{ padding: "20px", color: "#777", fontSize: "16px" }}>
        Try searching <b>comedy</b>, <b>songs</b>, or
        <b> channel apna college</b>
      </div>
    );
  };

  // ---------- UI ----------
  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        gridTemplateColumns: "110px 1fr 480px",
        background: "#f4f5f7",
      }}
    >
      {/* SIDEBAR */}
      <div
        style={{
          background: "#fff",
          borderRight: "1px solid #eee",
          paddingTop: "25px",
          display: "flex",
          flexDirection: "column",
          gap: "25px",
          alignItems: "center",
        }}
      >
        <button
          style={sideBtn}
          onClick={async () => {
            const res = await mcp("youtube.getHistory");
            setMessages((p) => [...p, { sender: "youi", text: res }]);
          }}
        >
          History
        </button>

        <button
          style={sideBtn}
          onClick={async () => {
            const res = await mcp("youtube.getLikedVideos");
            setMessages((p) => [...p, { sender: "youi", text: res }]);
          }}
        >
          Liked
        </button>
      </div>

      {/* VIDEO GRID */}
      <div style={{ overflowY: "auto" }}>
        <div style={{ padding: "20px", fontSize: "26px", fontWeight: "700" }}>
          YOUI – YouTube Dashboard
        </div>
        {getLatestVideoGrid()}
      </div>

      {/* CHAT PANEL */}
      <div
        style={{
          borderLeft: "1px solid #eee",
          background: "#fff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                marginBottom: "14px",
                alignSelf:
                  msg.sender === "user" ? "flex-end" : "flex-start",
                background: msg.sender === "user" ? "#d9fdd3" : "#ffecec",
                padding: "12px 14px",
                borderRadius: "12px",
                maxWidth: "90%",
                fontSize: "16px",
              }}
            >
              <b>{msg.sender === "youi" ? "🤖 YOUI" : "👤 You"}</b>
              <div style={{ marginTop: "6px" }}>
                {typeof msg.text === "string" ? msg.text : ""}
              </div>
            </div>
          ))}

          {isTyping && (
            <div
              style={{
                background: "#ffecec",
                padding: "12px",
                borderRadius: "12px",
                width: "160px",
                opacity: 0.8,
              }}
            >
              YOUI is typing…
            </div>
          )}
        </div>

        {/* INPUT BOX */}
        <div
          style={{
            padding: "12px",
            borderTop: "1px solid #eee",
            display: "flex",
            alignItems: "center",
          }}
        >
          <input
            value={input}
            placeholder="Type hi, 5 comedy videos, or channel apna college…"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()} 
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #ccc",
              fontSize: "17px",
            }}
          />

          <button
            onClick={sendMessage}
            style={{
              marginLeft: "10px",
              background: "#d90429",
              color: "white",
              padding: "14px 20px",
              borderRadius: "10px",
              border: "none",
              fontSize: "17px",
              fontWeight: "600",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// Button style
const sideBtn = {
  padding: "12px",
  borderRadius: "10px",
  background: "#fafafa",
  border: "1px solid #ddd",
  width: "70px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "600",
};

export default App;
