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
  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentGrid, setCurrentGrid] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/auth/status`)
      .catch(() => {});

    const savedHistory = localStorage.getItem("watchHistory");
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedSubs = localStorage.getItem("subscriptions");
    if (savedSubs) setSubscribedChannels(JSON.parse(savedSubs));
  }, []);

  useEffect(() => {
    localStorage.setItem("watchHistory", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("subscriptions", JSON.stringify(subscribedChannels));
  }, [subscribedChannels]);

  const extractVideoId = (url) => {
    const match = url.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

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

  // ⭐ RENDER VIDEOS (Added Subscribe Button)
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

        const channelId =
          snippet.channelId ||
          item.snippet?.channelId ||
          item.snippet?.resourceId?.channelId;

        const isLiked = likedIds.includes(id);
        const isSubscribed = subscribedChannels.includes(channelId);

        return (
          <div
            key={index}
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "12px",
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

            <p style={{ color: "#666", fontSize: "14px" }}>
              {snippet?.channelTitle}
            </p>

            {/* LIKE BUTTON */}
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

            {/* ⭐ SUBSCRIBE BUTTON (NEW) */}
            <button
              onClick={async () => {
                if (!isSubscribed) {
                  await mcp("youtube.subscribe", {
                    channelId,
                  });
                  setSubscribedChannels((prev) => [...prev, channelId]);
                }
              }}
              style={{
                marginTop: "10px",
                background: isSubscribed ? "#2E7D32" : "#d90429",
                color: "white",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "none",
                fontSize: "14px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              {isSubscribed ? "✔ Subscribed" : "🔔 Subscribe"}
            </button>
          </div>
        );
      })}
    </div>
  );

  // ⭐ RENDER SIDEBAR RECOMMENDATIONS
  const renderRecommendations = (items) => (
    <div
      style={{
        marginTop: "20px",
        width: "100%",
        overflowY: "auto",
      }}
    >
      {items.map((item, index) => {
        const id = item.id?.videoId || item.id;
        const snippet = item.snippet;

        const channelId =
          snippet.channelId ||
          item.snippet?.resourceId?.channelId ||
          item.snippet?.channelId;

        const isLiked = likedIds.includes(id);
        const isSubscribed = subscribedChannels.includes(channelId);

        return (
          <div
            key={index}
            style={{
              background: "#fff",
              borderRadius: "10px",
              padding: "10px",
              marginBottom: "12px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              width: "100%",
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
                src={snippet?.thumbnails?.default?.url}
                style={{
                  width: "100%",
                  borderRadius: "8px",
                }}
              />
            </a>

            <div
              style={{
                fontSize: "13px",
                fontWeight: "600",
                marginTop: "6px",
                color: "#333",
              }}
            >
              {snippet?.title.slice(0, 40)}...
            </div>

            {/* LIKE BUTTON SMALL */}
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
                marginTop: "6px",
                background: isLiked ? "#2E7D32" : "#888",
                color: "white",
                padding: "6px 10px",
                borderRadius: "8px",
                border: "none",
                fontSize: "12px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              {isLiked ? "👍 Liked" : "👍 Like"}
            </button>

            {/* SUBSCRIBE SMALL */}
            <button
              onClick={async () => {
                if (!isSubscribed) {
                  await mcp("youtube.subscribe", { channelId });
                  setSubscribedChannels((prev) => [...prev, channelId]);
                }
              }}
              style={{
                marginTop: "6px",
                background: isSubscribed ? "#2E7D32" : "#d90429",
                color: "white",
                padding: "6px 10px",
                borderRadius: "8px",
                border: "none",
                fontSize: "12px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              {isSubscribed ? "✔ Subscribed" : "🔔 Subscribe"}
            </button>
          </div>
        );
      })}
    </div>
  );
  // ⭐ INTENT DETECTOR — MAIN LOGIC
  const detectIntent = async (query) => {
    const lower = query.toLowerCase().trim();
    const numberMatch = lower.match(/\b\d+\b/);
    const limit = numberMatch ? parseInt(numberMatch[0]) : 10;

    // ⭐ CHANNEL VIDEOS
    if (lower.startsWith("channel ")) {
      const res = await mcp("youtube.channelVideos", {
        channel: lower.replace("channel", "").trim(),
      });
      if (res.items) setCurrentGrid(res.items);
      return res;
    }

    // ⭐ LIKED VIDEOS
    if (lower.includes("liked")) {
      const res = await mcp("youtube.getLikedVideos");
      if (res.items) {
        setLikedIds(res.items.map((v) => v.id));
        setCurrentGrid(res.items);
      }
      return res;
    }

    // ⭐ SHOW WATCH HISTORY
    if (lower.includes("history")) {
      setCurrentGrid(history);
      return { items: history };
    }

    // ⭐ VIDEO INFO
    if (lower.startsWith("info ")) {
      return await mcp("youtube.videoInfo", {
        videoId: lower.split(" ")[1],
      });
    }

    // ⭐ LIKE VIDEO
    if (lower.startsWith("like ")) {
      const part = query.split(" ")[1];

      if (part.includes("youtube.com") || part.includes("youtu.be")) {
        const vid = extractVideoId(part);
        if (vid) setLikedIds((p) => [...p, vid]);
        return await mcp("youtube.likeVideo", { videoId: vid });
      }

      setLikedIds((p) => [...p, part]);
      return await mcp("youtube.likeVideo", { videoId: part });
    }

    // ⭐ SUBSCRIBE COMMAND
    if (
      lower.startsWith("subscribe") ||
      lower.includes("subscribe to") ||
      lower.includes("subscribe channel")
    ) {
      const parts = query.split(" ");
      if (parts.length > 1) {
        const channelId = parts[1];
        await mcp("youtube.subscribe", { channelId });
        setSubscribedChannels((prev) => [...prev, channelId]);
        return { text: `Subscribed to channel ${channelId}` };
      }
      return { text: "Please provide a channel ID to subscribe." };
    }

    // ⭐ SHOW SUBSCRIBED CHANNELS
    if (
      lower.includes("subscriptions") ||
      lower.includes("subscribed channels") ||
      lower.includes("my subscriptions")
    ) {
      const res = await mcp("youtube.getSubscriptions");

      if (res.items) {
        const channels = res.items.map((c) => ({
          id: c.snippet.resourceId.channelId,
          snippet: {
            title: c.snippet.title,
            channelTitle: c.snippet.title,
            thumbnails: {
              high: { url: c.snippet.thumbnails.high.url },
            },
          },
        }));

        setCurrentGrid(channels);
      }

      return { text: "Showing your subscribed channels." };
    }

    // ⭐ DEFAULT SEARCH
    const res = await mcp("youtube.search", {
      query,
      maxResults: limit,
    });

    if (res.items) {
      setCurrentGrid(res.items);

      const sample = res.items.slice(0, 6);
      setRecommendations(sample);
    }

    return res;
  };

  // ⭐ SEND MESSAGE
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
          { sender: "youi", text: response.text || "(see results below)" },
        ]);
        setIsTyping(false);
      }, 350);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "youi", text: "❌ Error fetching data." },
      ]);
      setIsTyping(false);
    }
  };

  const getLatestVideoGrid = () => {
    if (currentGrid) return renderVideos(currentGrid);

    return (
      <div style={{ padding: "20px", color: "#777", fontSize: "16px" }}>
        Try searching comedy, songs, or "channel apna college"…
      </div>
    );
  };

  const isMobile = window.innerWidth < 768;

  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "230px 1fr 480px",
        background: "#f4f5f7",
      }}
    >
      {/* LEFT SIDEBAR */}
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
            width: "230px",
            paddingLeft: "10px",
            paddingRight: "10px",
            overflowY: "auto",
          }}
        >
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

          <button
            style={sideBtn}
            onClick={async () => {
              const res = await mcp("youtube.getSubscriptions");
              if (res.items) {
                const channels = res.items.map((c) => ({
                  id: c.snippet.resourceId.channelId,
                  snippet: {
                    title: c.snippet.title,
                    channelTitle: c.snippet.title,
                    thumbnails: {
                      high: { url: c.snippet.thumbnails.high.url },
                    },
                  },
                }));
                setCurrentGrid(channels);
              }
            }}
          >
            Subscribed Channels
          </button>

          <div style={{ marginTop: "15px", fontWeight: "700" }}>
            Recommendations
          </div>

          {recommendations.length > 0 &&
            renderRecommendations(recommendations)}
        </div>
      )}

      {/* MIDDLE — VIDEO GRID */}
      <div style={{ overflowY: "auto", maxHeight: isMobile ? "50vh" : "100%" }}>
        <div style={{ padding: "20px", fontSize: "26px", fontWeight: "700" }}>
          YOUI – YouTube Dashboard
        </div>
        {getLatestVideoGrid()}
      </div>

      {/* RIGHT SIDE — CHAT PANEL */}
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

        {/* INPUT BAR */}
        <div
          style={{
            padding: "12px",
            borderTop: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            position: "sticky",
            bottom: 0,
            background: "#fff",
            zIndex: 20,
          }}
        >
          <input
            value={input}
            placeholder="Search videos, subscribe channel, show subscriptions…"
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

// Sidebar button style
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
