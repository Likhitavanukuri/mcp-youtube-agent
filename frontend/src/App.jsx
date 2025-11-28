import { useState, useEffect } from "react";
import axios from "axios";
import { mcp } from "./api";

function App() {
  const [messages, setMessages] = useState([
    { sender: "youi", text: "Hi, I’m YOUI 🤖. Search anything on YouTube!" },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // ⭐ Local states
  const [likedIds, setLikedIds] = useState([]);
  const [history, setHistory] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [currentGrid, setCurrentGrid] = useState(null);

  // Load backend + history
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/auth/status`)
      .catch(() => {});

    const saved = localStorage.getItem("watchHistory");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("watchHistory", JSON.stringify(history));
  }, [history]);

  // Extract Video ID
  const extractVideoId = (url) => {
    const match = url.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  // Save watch history
  const addToHistory = (video) => {
    if (history.find((v) => v.id === video.id)) return;

    const fullItem = {
      id: video.id,
      snippet: {
        title: video.title,
        channelTitle: video.channel,
        thumbnails: { high: { url: video.thumbnail } },
      },
    };

    setHistory((prev) => [...prev, fullItem]);
  };

  // 📌 Render video cards
  const renderVideos = (items) =>
    items?.length ? (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
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

              <h3
                style={{
                  marginTop: "10px",
                  fontSize: "15px",
                  fontWeight: "600",
                }}
              >
                {snippet?.title}
              </h3>

              <p style={{ color: "#666", fontSize: "14px" }}>
                {snippet?.channelTitle}
              </p>

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

              <button
                onClick={async () => {
                  if (!isLiked) {
                    await mcp("youtube.likeVideo", { videoId: id });
                    setLikedIds((prev) => [...prev, id]);

                    setMessages((prev) => [
                      ...prev,
                      { sender: "youi", text: `👍 Liked: ${snippet?.title}` },
                    ]);
                  } else {
                    await mcp("youtube.likeVideo", {
                      videoId: id,
                      rating: "none",
                    });
                    setLikedIds((prev) => prev.filter((v) => v !== id));
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
    ) : (
      <div style={{ padding: "20px", color: "#777" }}>No videos</div>
    );

  // 🔍 Intent handler
  const detectIntent = async (query) => {
    const lower = query.toLowerCase().trim();
    const numberMatch = lower.match(/\b\d+\b/);
    const limit = numberMatch ? parseInt(numberMatch[0]) : 10;

    // CHANNEL
    if (lower.startsWith("channel ")) {
      const res = await mcp("youtube.channelVideos", {
        channel: lower.replace("channel", "").trim(),
      });
      if (res.items) setCurrentGrid(res.items);
      updateRecommendations(res.items, history, likedIds);
      return res;
    }

    // WATCH HISTORY
    if (lower.includes("history")) {
      setCurrentGrid(history);
      updateRecommendations(history, history, likedIds);
      return { items: history };
    }

    // LIKED VIDEOS
    if (lower.includes("liked")) {
      const res = await mcp("youtube.getLikedVideos");
      if (res.items) {
        setLikedIds(res.items.map((v) => v.id));
        setCurrentGrid(res.items);
        updateRecommendations(res.items, history, res.items);
      }
      return res;
    }

    // LIKE (URL or ID)
    if (lower.startsWith("like ")) {
      const part = query.split(" ")[1];

      let vid = part;
      if (part.includes("youtube.com") || part.includes("youtu.be")) {
        vid = extractVideoId(part);
      }

      setLikedIds((p) => [...p, vid]);
      return await mcp("youtube.likeVideo", { videoId: vid });
    }

    // DEFAULT — SEARCH
    const res = await mcp("youtube.search", {
      query,
      maxResults: limit,
    });

    if (res.items) {
      setCurrentGrid(res.items);
      updateRecommendations(res.items, history, likedIds);
    }

    return res;
  };

  // ⭐ MERGE RECOMMENDATIONS
  const updateRecommendations = (searchRes, historyList, likedList) => {
    const combined = [
      ...(searchRes || []),
      ...(historyList || []),
      ...(likedList || []),
    ];

    // Remove duplicates
    const unique = [];
    const seen = new Set();

    combined.forEach((v) => {
      const id = v.id?.videoId || v.id;
      if (!seen.has(id)) {
        seen.add(id);
        unique.push(v);
      }
    });

    setRecommendations(unique.slice(0, 12)); // max 12
  };

  // SEND message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const query = input;
    setMessages((prev) => [...prev, { sender: "user", text: query }]);
    setInput("");
    setIsTyping(true);

    const response = await detectIntent(query);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "youi", text: response },
      ]);
      setIsTyping(false);
    }, 300);
  };

  // Final video section
  const mainGrid = currentGrid ? renderVideos(currentGrid) : (
    <div style={{ padding: "20px", color: "#777" }}>
      Try searching: <b>devops</b>, <b>songs</b>, <b>travel</b>
    </div>
  );

  const isMobile = window.innerWidth < 768;

  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "200px 1fr 420px",
        background: "#f4f5f7",
      }}
    >
      {/* SIDEBAR */}
      {!isMobile && (
        <div
          style={{
            background: "#fff",
            borderRight: "1px solid #eee",
            paddingTop: "25px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            alignItems: "center",
            width: "200px",
            paddingLeft: "10px",
            paddingRight: "10px",
          }}
        >
          <button style={sideBtn} onClick={() => {
            setCurrentGrid(history);
            updateRecommendations(history, history, likedIds);
          }}>Watch History</button>

          <button style={sideBtn} onClick={async () => {
            const res = await mcp("youtube.getLikedVideos");
            if (res.items) {
              setLikedIds(res.items.map(v => v.id));
              setCurrentGrid(res.items);
              updateRecommendations(res.items, history, res.items);
            }
          }}>Liked Videos</button>

          <button style={sideBtn}>Recommendations</button>

          <div style={{ width: "100%", marginTop: "20px" }}>
            {recommendations.length > 0 &&
              recommendations.map((item, i) => {
                const snippet = item.snippet;
                const id = item.id?.videoId || item.id;

                return (
                  <div key={i} style={{ marginBottom: "14px" }}>
                    <img
                      src={snippet?.thumbnails?.medium?.url}
                      style={{
                        width: "100%",
                        borderRadius: "10px",
                        marginBottom: "6px",
                      }}
                    />
                    <div style={{ fontSize: "12px", fontWeight: "600" }}>
                      {snippet?.title?.slice(0, 45)}...
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* MAIN PANEL */}
      <div style={{ overflowY: "auto" }}>
        <div
          style={{
            padding: "20px",
            fontSize: "26px",
            fontWeight: "700",
          }}
        >
          YOUI – YouTube Dashboard
        </div>

        {mainGrid}
      </div>

      {/* CHAT PANEL */}
      <div
        style={{
          background: "#fff",
          borderLeft: "1px solid #eee",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                marginBottom: "12px",
                background: msg.sender === "user" ? "#d9fdd3" : "#ffecec",
                padding: "12px",
                borderRadius: "12px",
                maxWidth: "90%",
                alignSelf:
                  msg.sender === "user" ? "flex-end" : "flex-start",
              }}
            >
              <b>{msg.sender === "user" ? "👤 You" : "🤖 YOUI"}</b>
              <div style={{ marginTop: "4px" }}>
                {typeof msg.text === "string"
                  ? msg.text
                  : "(showing results below)"}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            padding: "12px",
            borderTop: "1px solid #eee",
            display: "flex",
          }}
        >
          <input
            value={input}
            placeholder="Search videos, like URL, or watch history…"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #ccc",
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

// FIXED SIDEBAR BUTTON STYLE
const sideBtn = {
  padding: "12px",
  borderRadius: "10px",
  background: "#fafafa",
  border: "1px solid #ddd",
  width: "160px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
  textAlign: "center",
  whiteSpace: "nowrap",
  overflow: "hidden",
};

export default App;
