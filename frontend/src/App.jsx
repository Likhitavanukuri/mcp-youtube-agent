import { useState, useEffect } from "react";
import axios from "axios";
import { mcp } from "./api";

function App() {
  const [messages, setMessages] = useState([
    { sender: "youi", text: "Hi, I’m YOUI 🤖. Search anything on YouTube!" },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // ⭐ NEW STATES
  const [likedIds, setLikedIds] = useState([]); // store liked video IDs
  const [history, setHistory] = useState([]); // store watch history

  // Load backend status + history
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/auth/status`)
      .catch(() => {});

    const saved = localStorage.getItem("watchHistory");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // Save watch history
  useEffect(() => {
    localStorage.setItem("watchHistory", JSON.stringify(history));
  }, [history]);

  // Extract video ID from URL
  const extractVideoId = (url) => {
    const match = url.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  // Add to watch history safely
  const addToHistory = (video) => {
    if (history.find((v) => v.id === video.id)) return;
    const updated = [...history, video];
    setHistory(updated);
  };

  // ---------- VIDEO GRID (START) ----------
  const renderVideos = (items) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "20px",
        padding: "10px",
      }}
    >
      {items.map((item, index) => {
        const snippet = item.snippet;
        const id = item.id?.videoId || item.id;

        const isLiked = likedIds.includes(id);

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
            {/* THUMBNAIL */}
            <a
              href={`https://www.youtube.com/watch?v=${id}`}
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                addToHistory({
                  id,
                  title: snippet?.title,
                  thumbnail: snippet?.thumbnails?.high?.url,
                  channel: snippet?.channelTitle,
                })
              }
            >
              <img
                src={snippet?.thumbnails?.high?.url}
                style={{ width: "100%", borderRadius: "12px" }}
              />
            </a>

            {/* TITLE */}
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
                onClick={() =>
                  addToHistory({
                    id,
                    title: snippet?.title,
                    thumbnail: snippet?.thumbnails?.high?.url,
                    channel: snippet?.channelTitle,
                  })
                }
              >
                {snippet?.title}
              </a>
            </h3>

            {/* CHANNEL */}
            <p style={{ color: "#666", fontSize: "14px" }}>
              {snippet?.channelTitle}
            </p>

            {/* ⭐ LIKED BADGE */}
            {isLiked && (
              <div
                style={{
                  fontSize: "14px",
                  color: "#2E7D32",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                👍 Liked
              </div>
            )}
            {/* ⭐ LIKE / UNLIKE BUTTON */}
            <button
              onClick={async () => {
                if (!isLiked) {
                  // REAL YOUTUBE LIKE
                  await mcp("youtube.likeVideo", { videoId: id });

                  setLikedIds((prev) => [...prev, id]);

                  setMessages((prev) => [
                    ...prev,
                    { sender: "youi", text: `👍 Liked: ${snippet?.title}` },
                  ]);
                } else {
                  // REAL YOUTUBE UNLIKE
                  await mcp("youtube.likeVideo", {
                    videoId: id,
                    rating: "none",
                  });

                  setLikedIds((prev) => prev.filter((v) => v !== id));

                  setMessages((prev) => [
                    ...prev,
                    { sender: "youi", text: `👎 Unliked: ${snippet?.title}` },
                  ]);
                }
              }}
              style={{
                marginTop: "10px",
                background: isLiked ? "#2E7D32" : "#888",
                color: "white",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "none",
                fontSize: "14px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              {isLiked ? "👍 Liked" : "👍 Like"}
            </button>
          </div>
        );
      })}
    </div>
  );

  // ---------- INTENT DETECTOR ----------
  const detectIntent = async (query) => {
    const lower = query.toLowerCase().trim();
    const numberMatch = lower.match(/\b\d+\b/);
    const limit = numberMatch ? parseInt(numberMatch[0]) : 10;

    // CHANNEL SEARCH
    if (lower.startsWith("channel "))
      return await mcp("youtube.channelVideos", {
        channel: lower.replace("channel", "").trim(),
      });

    // SHOW LIKED VIDEOS
    if (lower.includes("liked")) {
      const res = await mcp("youtube.getLikedVideos");
      if (res.items) setLikedIds(res.items.map((v) => v.id));
      return res;
    }

    // SHOW WATCH HISTORY
    if (lower.includes("history")) {
      return { items: history };
    }

    // VIDEO INFO
    if (lower.startsWith("info "))
      return await mcp("youtube.videoInfo", {
        videoId: lower.split(" ")[1],
      });

    // ⭐ LIKE BY LINK OR ID
    if (lower.startsWith("like ")) {
      const link = query.split(" ")[1];

      // If it's a URL
      if (link?.includes("youtube.com") || link?.includes("youtu.be")) {
        const vid = extractVideoId(link);
        if (!vid) return { text: "❌ Could not extract video ID." };

        setLikedIds((prev) => [...prev, vid]);

        return await mcp("youtube.likeVideo", { videoId: vid });
      }

      // If it's a raw video ID
      setLikedIds((prev) => [...prev, link]);

      return await mcp("youtube.likeVideo", { videoId: link });
    }

    // DEFAULT → SEARCH
    return await mcp("youtube.search", { query, maxResults: limit });
  };

  // ---------- SEND MESSAGE ----------
  const sendMessage = async () => {
    if (!input.trim()) return;
    const query = input;

    setMessages((prev) => [...prev, { sender: "user", text: query }]);
    setInput("");
    setIsTyping(true);

    setMessages((prev) => [
      ...prev,
      { sender: "youi", text: `Searching for "${query}"…` },
    ]);

    try {
      const response = await detectIntent(query);

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { sender: "youi", text: response },
        ]);
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
  const isMobile = window.innerWidth < 768;

  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "140px 1fr 480px",
        background: "#f4f5f7",
      }}
    >
      {/* ⭐ SIDEBAR */}
      {!isMobile && (
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
          {/* WATCH HISTORY BUTTON */}
          <button
            style={sideBtn}
            onClick={() =>
              setMessages((prev) => [
                ...prev,
                { sender: "youi", text: { items: history } },
              ])
            }
          >
            Watch History
          </button>

          {/* LIKED VIDEOS BUTTON */}
          <button
            style={sideBtn}
            onClick={async () => {
              const res = await mcp("youtube.getLikedVideos");

              if (res.items) setLikedIds(res.items.map((v) => v.id));

              setMessages((p) => [...p, { sender: "youi", text: res }]);
            }}
          >
            Liked Videos
          </button>
        </div>
      )}

      {/* ⭐ VIDEO GRID */}
      <div
        style={{
          overflowY: "auto",
          maxHeight: isMobile ? "50vh" : "100%",
        }}
      >
        <div style={{ padding: "20px", fontSize: "26px", fontWeight: "700" }}>
          YOUI – YouTube Dashboard
        </div>

        {getLatestVideoGrid()}
      </div>

      {/* ⭐ CHAT PANEL */}
      <div
        style={{
          borderLeft: isMobile ? "none" : "1px solid #eee",
          borderTop: isMobile ? "1px solid #eee" : "none",
          background: "#fff",
          display: "flex",
          flexDirection: "column",
          height: isMobile ? "50vh" : "100%",
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
                {typeof msg.text === "string"
                  ? msg.text
                  : msg.text?.items
                  ? "(showing results below)"
                  : JSON.stringify(msg.text)}
              </div>
            </div>
          ))}

          {/* YOUI IS TYPING */}
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

        {/* ⭐ INPUT BOX */}
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
            placeholder="Search videos, like link, or watch history…"
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

/* ⭐ SIDEBAR BUTTON STYLE */
const sideBtn = {
  padding: "12px",
  borderRadius: "10px",
  background: "#fafafa",
  border: "1px solid #ddd",
  width: "110px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "600",
};

export default App;

