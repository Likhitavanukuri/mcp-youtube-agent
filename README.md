🚀 YOUI – YouTube MCP Agent

A fully deployed MCP-based YouTube Assistant that performs real-time actions such as searching videos, fetching channel uploads, liking/unliking videos, showing liked videos, maintaining watch history, subscribing to channels, listing subscribed channels, and generating personalized recommendations.

This project was designed and implemented end-to-end within 48 hours as part of the MCP Agent Development Assignment.
🔗 Live Application Links
Frontend (Vercel): https://mcp-youtube-agent-iota.vercel.app
Backend (Render): https://mcp-youtube-backend.onrender.com

📌 Project Summary
This project implements an AI-powered YouTube Agent using the Model Context Protocol (MCP).
The goal is to expose YouTube actions as structured MCP tools and build an intelligent, interactive frontend assistant.

The system consists of: 
Backend (MCP Server + YouTube API Gateway)
Node.js (Express)
googleapis (OAuth2 + YouTube Data API)
Custom MCP tool router
Secure token handling
Frontend (React Dashboard + Chat UI)
React + Vite
Axios
Responsive dashboard
Chat-style command execution
LocalStorage caching
Despite being built within tight constraints by a fresher, the architecture is clean, modular, and scalable.

🎯 How the Project Meets MCP Assignment Requirements
✔ 1. Integration with an External Platform

Integrated with YouTube Data API v3.
Authentication is handled securely using:
OAuth2 Authorization Code Flow
Long-lasting Refresh Token
No user password stored anywhere

✔ 2. Expose Developer APIs as MCP Tools
MCP Tool	Description
youtube.search	Search videos on YouTube
youtube.channelVideos	Fetch channel uploads
youtube.getLikedVideos	Retrieve user’s liked videos
youtube.getHistory	Get watch history (local simulation)
youtube.videoInfo	Fetch metadata for any video
youtube.likeVideo	Like or unlike a video
youtube.subscribe	🔔 Subscribe to a YouTube channel
youtube.getSubscriptions	📺 List all subscribed channels

Tools follow a consistent input/output structure defined by MCP.

✔ 3. MCP for Real-Time Actions + Retrieval
The agent can:
Search YouTube
Fetch channel uploads
Like/unlike videos
Maintain watch history
Display liked videos
Generate contextual recommendations
Subscribe to channels
List subscribed channels

✔ 4. Fully Deployed, Publicly Accessible
Frontend → Vercel CDN
Backend → Render HTTPS service
Communication done via REST /mcp endpoint
All secrets handled through environment variables

✔ 5. GitHub Repository with Documentation
The repository includes:
Clean folder structure
Clear setup instructions
Code documentation
Architecture explanation
Screenshots (optional)

🧠 Technical Approach
🟦 1. Backend (Node + MCP Server)
Responsibilities:Handle OAuth2,Refresh expired tokens automatically,Expose MCP tool handlers,Call YouTube Data APIs,Enforce token security
Serve responses to frontend,Why Refresh Token Approach?,No repeated login prompts,Long-term YouTube API access,Avoids exposing access tokens,Industry-standard method

Security:
All secrets stored in Render env vars,OAuth handled server-side,No credentials sent to the frontend,HTTPS enforced

🟥 2. Frontend (React + Vite)
Features:
Search bar + chat interface
Left-side navigation (history, liked, subscriptions)
Right-side chatbot
Main grid for video results
Fully mobile responsive
LocalStorage caching:
Watch history
Subscribed channels list
UI states

🏗 Folder Structure
mcp-youtube-agent/
│
├── backend/
│   ├── index.js              # Express server entry
│   ├── auth.js               # OAuth refresh logic
│   ├── youtube.js            # YouTube API wrappers
│   ├── mcp.js                # MCP tool router
│   └── youtubeRouter.js      # Additional REST endpoints
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main UI + chat + video grid
│   │   └── api.js            # Communicates with backend /mcp
│   └── public/
│
└── README.md

📱 Features Overview
✔ Search YouTube:High-quality thumbnails, titles, and metadata.
✔ Watch History:Automatically adds clicked videos to history.
✔ Liked Videos:Fetches user's liked videos from YouTube.
✔ Like/Unlike Videos:Works on result grid, recommendations, and chat.
✔ Subscribe to Channels 🔔: Subscribe button added under every video: Changes state (Subscribe → Subscribed),Uses YouTube Subscriptions API
✔ View Subscribed Channels 📺:Sidebar button: “Subscribed Channels”,Chat command: subscriptions,Displays channel thumbnails & titles
✔ Recommendations

Based on:
Last search
Liked videos
Watch history

✔ Chat-Based Interaction
Examples:
10 bollywood videos
channel apna college
like dQw4w9WgXcQ
subscriptions

✔ Fully Responsive
Mobile-ready layout.
🔐 Security Notes
OAuth refresh tokens stored ONLY in backend
No access tokens sent to frontend
Environment variables protected
HTTPS end-to-end
No user passwords or sensitive data handled

⚡ Performance & Latency
Cached states (history, subs)
Optimized YouTube API queries
Limited maxResults for speed
Vercel CDN hosting for frontend
Render handles token refresh instantly
Smooth and low-latency UX achieved.

🚀 Running The Project
Backend:
cd backend
npm install
npm start

Frontend:
cd frontend
npm install
npm run dev

💬 Example Commands Supported
devops videos
10 comedy videos
channel apna college
liked videos
history
like https://youtu.be/dQw4w9WgXcQ
subscriptions
subscribe UC1234abcdXYZ
