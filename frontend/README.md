README.md — YouTube MCP Agent
🎥 YOUI — YouTube MCP Agent

A fully interactive YouTube Search & Control Agent built using Model Context Protocol (MCP), React, Node.js, and YouTube Data API v3.
The agent lets users:

Search YouTube videos

View liked videos

View watch history (via fallback)

Like videos

Get video details

Interact through a chat-style UI

Use persistent YouTube authentication (no repeated login required)

GPT is removed — this project works 100% with the YouTube API only, making it free, stable, and quota-safe.

🚀 Features
🔍 YouTube Search

Search for any topic directly from the chat window
Examples:

devops
travel vlogs

❤️ Liked Videos

Command:

liked videos


Displays the user’s YouTube liked videos.

🎞 Watch History (fallback)

Google does not allow History API access, so:

history
watched videos


Returns liked videos as fallback.

👍 Like a Video
like <videoId>

ℹ Video Info
info <videoId>

🔐 Persistent YouTube Authentication

✔ Login ONCE
✔ Refresh token saved
✔ App auto-generates new access tokens
✔ No login required again even after restart

🧱 Architecture
mcp-youtube-agent/
│
├── backend/
│   ├── index.js            → Main server
│   ├── auth.js             → Google OAuth + token persistence
│   ├── mcp.js              → MCP tool handlers
│   ├── youtube.js          → YouTube API functions
│   ├── token.json          → Saved refresh token (auto-loaded)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx          → Chat UI + detectIntent logic
│   │   ├── api.js           → MCP request helper
│   │   └── index.js
│
├── package.json
├── README.md
└── .env

🛠 Technologies
Backend:

Node.js

Express.js

Google APIs SDK

YouTube Data API v3

Model Context Protocol (custom tool handler)

Frontend:

React.js

Axios

Custom chat UI

Authentication:

OAuth2 (Google)

Long-term Refresh Token (auto loaded)

No repeated login

⚙️ Setup Instructions
1️⃣ Clone the repository:
git clone https://github.com/<your-username>/mcp-youtube-agent.git
cd mcp-youtube-agent

2️⃣ Backend Setup

Create a .env file inside backend:

CLIENT_ID=your-google-client-id
CLIENT_SECRET=your-google-client-secret
REDIRECT_URI=http://localhost:3000/auth/callback
OPENAI_API_KEY=dummy   # NOT USED (safe to ignore)


Install backend dependencies:

cd backend
npm install


Run backend:

npm start

3️⃣ Frontend Setup
cd frontend
npm install
npm start

🔐 One-Time Google Login (Important)

Open:

http://localhost:3000/auth/login


After logging in:

token.json is automatically created

Contains refresh_token

Backend loads it forever

No more logins required

Next backend restarts automatically show:

🔄 Loading saved tokens...
✔ Auto-generated ACCESS TOKEN from refresh token

💬 How to Use the Agent

Just type queries like:

devops
makeup tutorials
travel vlogs
food recipes


Special commands:

liked videos
history
info <videoId>
like <videoId>
search sf movies

📡 MCP Tools Implemented

Backend exposes these custom MCP tools:

Tool Name	Purpose
youtube.search	Search YouTube videos
youtube.getLikedVideos	View liked videos
youtube.getHistory	View history (fallback)
youtube.likeVideo	Like a video
youtube.videoInfo	Get video details

These are called by the frontend using mcp("tool", params).

🎯 Why No GPT?

This version does not use OpenAI / GPT due to:

Quota issues

Unnecessary for core features

Free operation

Simpler setup

More stable for demo and submission

All GPT calls were removed and replaced with direct YouTube API usage.

🧪 Testing

Try these:

devops
biryani recipe
kalki movie
search cricket highlights
liked videos
info XXXXXXXXX
like XXXXXXXXX


Everything will return real YouTube results.

📦 Deployment Guide

You can deploy:

Backend → Render / Railway
Frontend → Vercel / Netlify

Backend must expose:

/auth/login
/auth/callback
/auth/status
/mcp


Frontend must point to deployed backend API base URL.