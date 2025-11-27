# 🎥 YOUI – YouTube MCP Agent  
A complete MCP-based YouTube Agent that integrates with the YouTube Data API through a custom backend server using **OAuth2 + Refresh Token**, and provides a clean, responsive frontend interface built with React.

This project allows the user to:

- 🔍 Search YouTube videos  
- 📺 Fetch channel videos  
- ❤️ View liked videos  
- 🕒 View watch history  
- 👍 Like a YouTube video using **video ID or full YouTube link**  
- 📱 Works on **Laptop + Mobile** (fully responsive)  
- ⚡ Powered by **Model Context Protocol (MCP)**  
- 🚀 Fully deployed (Backend + Frontend)

---

# 🚀 Live Demo

### Frontend (Vercel)  
🔗 https://mcp-youtube-agent-iota.vercel.app

### Backend (Render)  
🔗 https://mcp-youtube-backend.onrender.com

---

# 🏗 Project Architecture
mcp-youtube-agent/
│
├── backend/ # MCP Server
│ ├── index.js # Express server + MCP router
│ ├── auth.js # OAuth2 + Refresh Token
│ ├── youtubeRouter.js # YouTube search endpoint
│ ├── mcp.js # MCP tools implementation
│ └── youtube.js # YouTube API wrapper
│
├── frontend/ # React/Vercel UI
│ ├── src/
│ │ ├── App.jsx # Main UI + MCP calls
│ │ └── api.js # Connects frontend → backend
│
└── README.md


---

# 🔐 OAuth2 Setup (Already Done)

The backend uses:

✔ `CLIENT_ID`  
✔ `CLIENT_SECRET`  
✔ `REDIRECT_URI`  
✔ **REFRESH_TOKEN** (long-term token)  

The backend **automatically generates new access tokens** using the refresh token.  
No login is needed for users.

---

# ⚙️ Backend Environment Variables (Render)

Set these in **Render → Environment Variables**:



CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
CLIENT_SECRET=xxxxxxxxxxxxxxxx
REDIRECT_URI=http://localhost:3000/auth/callback

REFRESH_TOKEN=1//xxxxxxxxxxxxxxxx
PORT=3001


No OpenAI key is required.

---

# ⚙️ Frontend Environment Variables (Vercel)

Set this in **Vercel → Project Settings → Environment Variables**:



VITE_API_BASE_URL=https://mcp-youtube-backend.onrender.com


Frontend automatically picks the backend URL in production.

---

# 🧠 MCP Tools Supported

| MCP Tool | Description |
|----------|-------------|
| `youtube.search` | Search YouTube videos |
| `youtube.getLikedVideos` | Fetch liked videos |
| `youtube.getHistory` | Fetch watch history |
| `youtube.channelVideos` | Fetch channel uploads |
| `youtube.videoInfo` | Get full video info |
| `youtube.likeVideo` | Like a video (ID or URL) |

These tools are consumed by the frontend using `/mcp` route.

---

# 📱 Features Implemented

### ✔ YouTube video search  
### ✔ Clickable cards with thumbnails  
### ✔ View liked videos  
### ✔ View watch history  
### ✔ Like video using ID or full YouTube link  
### ✔ Channel videos  
### ✔ Fully responsive mobile layout  
### ✔ Sidebar for quick actions  
### ✔ Auto-scroll chat/messages  
### ✔ Smooth UI with YouTube-style theme  

---

# 🧩 Flow Diagram



User → React Frontend → MCP API (/mcp) → Backend Server
↓
YouTube Data API
↓
Response → Frontend UI


---

# 🛠 Local Development Guide

## Backend Setup


cd backend
npm install
npm start


Backend runs at:


http://localhost:3001


---

## Frontend Setup


cd frontend
npm install
npm run dev


Frontend runs at:


http://localhost:5173


---

# 🧪 Example Commands (Inside the App)

### 🔍 Search videos


travel videos
funny videos
songs 5


### 🎬 Channel videos


channel apna college


### ❤️ Liked videos


liked videos


### 🕒 History


history


### ℹ Get video info


info VIDEO_ID


### 👍 Like a video (by ID)


like dQw4w9WgXcQ


### 👍 Like a video (by YouTube link)


like https://www.youtube.com/watch?v=dQw4w9WgXcQ

like https://youtu.be/dQw4w9WgXcQ


---

# 🎯 Assignment Requirements – Completed

| Requirement | Status |
|------------|--------|
| Build MCP Agent | ✅ Completed |
| Connect External Platform | ✅ YouTube API |
| Expose MCP Tools | ✅ Multiple tools |
| End-to-end actions | ✔ Search, like, history |
| Fully deployed | ✔ Vercel + Render |
| Public GitHub repo | ✔ Complete |
| Frontend UI | ✔ Modern + responsive |

---

# 🧑‍💻 Author
Vanukuri Likhita
