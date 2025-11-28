import { useState, useEffect } from "react";
import axios from "axios";
import { mcp } from "./api";

function App() {
  const [messages, setMessages] = useState([
    { sender: "youi", text: "Hi, I’m YOUI 🤖. Search anything on YouTube!" },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // ⭐ Local store for liked videos
  const [likedIds, setLikedIds] = useState([]);

  // ⭐ Local store for watch history
  const [history, setHistory] = useState([]);

  // ⭐ Controls what appears in the middle grid
  const [currentGrid, setCurrentGrid] = useState(null);

  // ⭐ Track last search keyword for recommendations
  const [lastSearch, setLastSearch] = useState("");

  // Load backend + history from localStorage
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

  // Extract YouTube video ID
  const extractVideoId = (url) => {
    const match = url.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  // ⭐ Add to history — builds a full video object
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

  // ---------- VIDEO GRID ----------
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
              >
                {snippet?.title}
              </a>
            </h3>

            <p style={{ color: "#666", fontSize: "14px" }}>
              {snippet?.channelTitle}
            </p>

            {/* LIKED BADGE */}
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

            {/* LIKE / UNLIKE BUTTON */}
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
  // ---------- RECOMMENDATION LOGIC ----------
  const fetchRecommendations = async () => {
    let keyword = "";

    // 1️⃣ Highest priority → last search keyword
    if (lastSearch && lastSearch.length > 2) {
      keyword = lastSearch;
    }

    // 2️⃣ Next → last watched video title
    else if (history.length > 0) {
      const last = history[history.length - 1];
      keyword = last.snippet?.title || "";
    }

    // 3️⃣ Fallback → liked videos titles combined
    else if (likedIds.length > 0) {
      keyword = "recommended videos"; // safe fallback
    }

    // 4️⃣ Last fallback → trending
    if (!keyword) keyword = "trending videos";

    setMessages((prev) => [
      ...prev,
      { sender: "youi", text: `🔍 Getting recommendations for "${keyword}"…` },
    ]);

    const res = await mcp("youtube.search", {
      query: keyword,
      maxResults: 10,
    });

    if (res.items) {
      setCurrentGrid(res.items);
    }

    return res;
  };

  // ---------- INTENT DETECTOR ----------
  const detectIntent = async (query) => {
    const lower = query.toLowerCase().trim();
    const numberMatch = lower.match(/\b\d+\b/);
    const limit = numberMatch ? parseInt(numberMatch[0]) : 10;

    // ⭐ Track last search
    setLastSearch(query);

    // ----- CHANNEL VIDEOS -----
    if (lower.startsWith("channel ")) {
      const res = await mcp("youtube.channelVideos", {
        channel: lower.replace("channel", "").trim(),
      });

      if (res.items) setCurrentGrid(res.items);
      return res;
    }

    // ----- LIKED VIDEOS -----
    if (lower.includes("liked")) {
      const res = await mcp("youtube.getLikedVideos");

      if (res.items) {
        setLikedIds(res.items.map((v) => v.id));
        setCurrentGrid(res.items);
      }
      return res;
    }

    // ----- WATCH HISTORY -----
    if (lower.includes("history")) {
      setCurrentGrid(history);
      return { items: history };
    }

    // ----- VIDEO INFO -----
    if (lower.startsWith("info ")) {
      return await mcp("youtube.videoInfo", {
        videoId: lower.split(" ")[1],
      });
    }

    // ----- LIKE BY ID OR LINK -----
    if (lower.startsWith("like ")) {
      const part = query.split(" ")[1];

      // If it's a full YouTube URL
      if (part.includes("youtube.com") || part.includes("youtu.be")) {
        const vid = extractVideoId(part);

        setLikedIds((p) => [...p, vid]);

        return await mcp("youtube.likeVideo", { videoId: vid });
      }

      // If it's a plain ID
      setLikedIds((p) => [...p, part]);

      return await mcp("youtube.likeVideo", { videoId: part });
    }

    // ----- RECOMMENDATIONS -----
    if (lower.includes("recommend")) {
      return await fetchRecommendations();
    }

    // ----- DEFAULT → SEARCH -----
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
      }, 350);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "youi", text: "❌ Error fetching videos." },
      ]);
      setIsTyping(false);
    }
  };

  // ---------- GRID OUTPUT ----------
  const getLatestVideoGrid = () => {
    if (currentGrid) return renderVideos(currentGrid);

    return (
      <div style={{ padding: "20px", color: "#777", fontSize: "16px" }}>
        Try searching comedy, songs, or channel apna college…
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
      {/* ---------------- SIDEBAR (Desktop-only) ---------------- */}
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
          {/* WATCH HISTORY */}
          <button
            style={sideBtn}
            onClick={() => {
              setCurrentGrid(history);
              setMessages((prev) => [
                ...prev,
                { sender: "youi", text: { items: history } },
              ]);
            }}
          >
            Watch History
          </button>

          {/* LIKED VIDEOS */}
          <button
            style={sideBtn}
            onClick={async () => {
              const res = await mcp("youtube.getLikedVideos");

              if (res.items) {
                setLikedIds(res.items.map((v) => v.id));
                setCurrentGrid(res.items);
              }

              setMessages((prev) => [...prev, { sender: "youi", text: res }]);
            }}
          >
            Liked Videos
          </button>

          {/* ⭐ RECOMMENDATIONS (NEW FEATURE) */}
          <button
            style={sideBtn}
            onClick={async () => {
              const res = await fetchRecommendations();
              setMessages((prev) => [...prev, { sender: "youi", text: res }]);
            }}
          >
            Recommendations
          </button>
        </div>
      )}

      {/* ---------------- VIDEO GRID ---------------- */}
      <div style={{ overflowY: "auto", maxHeight: isMobile ? "50vh" : "100%" }}>
        <div style={{ padding: "20px", fontSize: "26px", fontWeight: "700" }}>
          YOUI – YouTube Dashboard
        </div>
        {getLatestVideoGrid()}
      </div>

      {/* ---------------- CHAT PANEL (Right Side) ---------------- */}
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
        {/* CHAT MESSAGES */}
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

        {/* ---------------- INPUT AREA ---------------- */}
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
            placeholder="Search videos, like URL, recommendations…"
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

// ---------------- SIDEBAR BUTTON STYLE ----------------
const sideBtn = {
  padding: "12px",
  borderRadius: "10px",
  background: "#fafafa",
  border: "1px solid #ddd",
  width: "120px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "600",
};

export default App;
