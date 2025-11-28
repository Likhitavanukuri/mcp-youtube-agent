import { useState, useEffect } from "react";
import axios from "axios";
import { mcp } from "./api";

function App() {
  const [messages, setMessages] = useState([
    { sender: "youi", text: "Hi, I’m YOUI 🤖. Search anything on YouTube!" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [likedIds, setLikedIds] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentGrid, setCurrentGrid] = useState(null);

  const [lastSearch, setLastSearch] = useState("");

  // ⭐ NEW: Recommendation list separate from main grid
  const [recommendList, setRecommendList] = useState([]);

  // Load backend + history
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

  // Extract video ID
  const extractVideoId = (url) => {
    const match = url.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  // Add to watch history
  const addToHistory = (video) => {
    if (history.find((v) => v.id === video.id)) return;

    const fullItem = {
      id: video.id,
      snippet: {
        title: video.title,
        channelTitle: video.channel,
        thumbnails: {
          high: { url: video.thumbnail },
        },
      },
    };

    setHistory((prev) => [...prev, fullItem]);
  };

  // ---------- RENDER MAIN VIDEO GRID ----------
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
  );

  // ---------- RENDER RECOMMENDATION SMALL CARDS ----------
  const renderRecommendList = () => (
    <div style={{ width: "100%", padding: "10px" }}>
      <h4 style={{ fontSize: "16px", marginBottom: "10px" }}>Recommended</h4>

      {recommendList.length === 0 && (
        <div style={{ fontSize: "13px", color: "#666" }}>
          No recommendations yet.
        </div>
      )}

      {recommendList.map((item, i) => {
        const snippet = item.snippet;
        const id = item.id?.videoId || item.id;
        const isLiked = likedIds.includes(id);

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              background: "#fff",
              marginBottom: "10px",
              padding: "8px",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
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
                style={{
                  width: "70px",
                  height: "50px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginRight: "10px",
                }}
              />
            </a>

            <div style={{ flex: 1, fontSize: "13px" }}>
              {snippet?.title.length > 40
                ? snippet?.title.slice(0, 40) + "..."
                : snippet?.title}
            </div>

            <button
              onClick={async () => {
                if (!isLiked) {
                  await mcp("youtube.likeVideo", { videoId: id });
                  setLikedIds((prev) => [...prev, id]);
                } else {
                  await mcp("youtube.likeVideo", {
                    videoId: id,
                    rating: "none",
                  });
                  setLikedIds((prev) => prev.filter((v) => v !== id));
                }
              }}
              style={{
                background: isLiked ? "#2E7D32" : "#777",
                color: "white",
                border: "none",
                padding: "8px",
                borderRadius: "6px",
                cursor: "pointer",
                marginLeft: "10px",
              }}
            >
              👍
            </button>
          </div>
        );
      })}
    </div>
  );

  // ---------- BUILD RECOMMENDATIONS ----------
  const buildRecommendations = async () => {
    let keyword = "";

    if (lastSearch.length > 2) keyword = lastSearch;
    else if (history.length > 0)
      keyword = history[history.length - 1]?.snippet?.title;
    else if (likedIds.length > 0) keyword = "recommended videos";

    if (!keyword) keyword = "trending videos";

    const res = await mcp("youtube.search", {
      query: keyword,
      maxResults: 5,
    });

    if (res.items) setRecommendList(res.items);
  };

  // ---------- DETECT INTENT ----------
  const detectIntent = async (query) => {
    const lower = query.toLowerCase().trim();
    const numberMatch = lower.match(/\b\d+\b/);
    const limit = numberMatch ? parseInt(numberMatch[0]) : 10;

    setLastSearch(query);
    buildRecommendations();

    if (lower.startsWith("channel ")) {
      const res = await mcp("youtube.channelVideos", {
        channel: lower.replace("channel", "").trim(),
      });
      if (res.items) setCurrentGrid(res.items);
      return res;
    }

    if (lower.includes("liked")) {
      const res = await mcp("youtube.getLikedVideos");
      if (res.items) {
        setLikedIds(res.items.map((v) => v.id));
        setCurrentGrid(res.items);
      }
      return res;
    }

    if (lower.includes("history")) {
      setCurrentGrid(history);
      return { items: history };
    }

    if (lower.startsWith("info ")) {
      return await mcp("youtube.videoInfo", {
        videoId: lower.split(" ")[1],
      });
    }

    if (lower.startsWith("like ")) {
      const part = lower.split(" ")[1];
      let vid = part;

      if (part.includes("youtube.com") || part.includes("youtu.be")) {
        vid = extractVideoId(part);
      }

      setLikedIds((p) => [...p, vid]);
      return await mcp("youtube.likeVideo", { videoId: vid });
    }

    if (lower.includes("recommend")) {
      buildRecommendations();
      return { status: "recommend updated" };
    }

    const res = await mcp("youtube.search", {
      query,
      maxResults: limit,
    });

    if (res.items) setCurrentGrid(res.items);

    return res;
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
      }, 300);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "youi", text: "❌ Error fetching videos." },
      ]);
      setIsTyping(false);
    }
  };

  // ---------- UI ----------
  const isMobile = window.innerWidth < 768;

  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        gridTemplateColumns: isMobile
          ? "1fr"
          : "180px 1fr 480px",
        background: "#f4f5f7",
      }}
    >
      {/* SIDEBAR + RECOMMEND LIST */}
      {!isMobile && (
        <div
          style={{
            background: "#fff",
            borderRight: "1px solid #eee",
            paddingTop: "25px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflowY: "auto",
          }}
        >
          <button
            style={sideBtn}
            onClick={() => setCurrentGrid(history)}
          >
            Watch History
          </button>

          <button
            style={sideBtn}
            onClick={async () => {
              const res = await mcp("youtube.getLikedVideos");

              if (res.items) {
                setLikedIds(res.items.map((v) => v.id));
                setCurrentGrid(res.items);
              }
            }}
          >
            Liked Videos
          </button>

          <button
            style={sideBtn}
            onClick={buildRecommendations}
          >
            Recommendations
          </button>

          {/* RECOMMENDATION SIDEBAR LIST */}
          <div style={{ marginTop: "20px", width: "100%" }}>
            {renderRecommendList()}
          </div>
        </div>
      )}

      {/* MAIN VIDEO GRID */}
      <div style={{ overflowY: "auto", maxHeight: isMobile ? "50vh" : "100%" }}>
        <div style={{ padding: "20px", fontSize: "26px", fontWeight: "700" }}>
          YOUI – YouTube Dashboard
        </div>
        {currentGrid ? renderVideos(currentGrid) : null}
      </div>

      {/* CHAT PANEL */}
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
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
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

        {/* INPUT AREA */}
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
            placeholder="Search videos, like URL, show recommendations…"
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
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// Sidebar button style
const sideBtn = {
  padding: "12px",
  borderRadius: "10px",
  background: "#fafafa",
  border: "1px solid #ddd",
  width: "120px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "600",
  textAlign: "center",
};

export default App;
