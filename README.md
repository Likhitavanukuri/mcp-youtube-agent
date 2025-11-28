YOUI – YouTube MCP Agent

A fully deployed MCP-based YouTube Assistant that performs real-time actions such as searching videos, fetching channel uploads, liking/unliking videos, showing liked videos, maintaining watch history, and generating personalized recommendations.

This project was designed and implemented end-to-end within 48 hours as part of the MCP Agent Development Assignment.

🔗 Live Application Links

Frontend (Vercel): https://mcp-youtube-agent-iota.vercel.app

Backend (Render): https://mcp-youtube-backend.onrender.com

📌 Project Summary

This project implements an AI-powered YouTube Agent using the Model Context Protocol (MCP).
The aim was to expose YouTube's functionality as MCP tools and build a responsive web application that can interact with these tools.
The system consists of:
Backend (Node.js MCP Server): Exposes services like search, like/unlike, history, and channel data.
Frontend (React): Provides a dashboard-like UI and a chat interface to interact with the agent.
Despite being built by a fresher, the architecture follows clean separation of concerns, secure token handling, and performance-aware design choices.

🎯 How the Project Meets the MCP Assignment Requirements
1. Integrate with an External Platform
Integrated with YouTube Data API v3.Authentication done using Google OAuth2 + long-lasting Refresh Token.No user password is used anywhere.

2. Expose Developer APIs as MCP Tools
The backend exposes the following MCP tools:MCP Tool	Description
youtube.search	Search videos on YouTube
youtube.channelVideos	Fetch channel uploads
youtube.getLikedVideos	Retrieve user's liked videos
youtube.getHistory	Get watch history (local simulated)
youtube.videoInfo	Retrieve metadata for a video
youtube.likeVideo	Like or unlike any video

These tools fully satisfy the MCP action/intent requirement.

✔ 3. Use MCP for Actions + Retrieval

The agent can:
Search YouTube
Fetch videos
Like/unlike any video
Add watched videos to history
Display liked videos
Provide recommendations

✔ 4. Fully Deployed, Publicly Accessible App

Frontend: Vercel
Backend: Render
Both services communicate securely using environment variables.

✔ 5. GitHub Repository with Documentation
Clean folder structure
Clear READMEs
Well-commented code
Architecture explanation
Setup instructions

🧠 Technical Approach

1. Backend (MCP Server)
Tech Stack: Node.js,Express.js,googleapis (YouTube Data API),Custom MCP tool router

Roles of Backend
Handle OAuth authentication
Generate access token using refresh token
Define all MCP tools
Serve data to frontend via REST /mcp endpoint

Why Refresh Token Approach?
Avoids login prompt,Enables long-term access,Safer than storing access tokens,Common method in production workloads

Security
Secrets stored in Render environment variables
No token is ever sent to frontend
HTTPS enforced by Render & Vercel

2. Frontend (React)
Tech Stack:React + Vite,Axios

Responsive CSS layout
LocalStorage
Conditional rendering
Chat-based input system

Key UI Features
YouTube-style card grid
Watch history
Liked videos
Sidebar recommendations
Sticky input bar
Fully mobile-friendly layout
Recommendation Logic (Lightweight ML-inspired design)
Recommendations are generated using:
Last search results
Recent watch history

Liked videos
This keeps it simple while providing meaningful suggestions.

🏗 Folder Structure
mcp-youtube-agent/
│
├── backend/
│   ├── index.js            # Express server + MCP routing
│   ├── auth.js             # Handles OAuth refresh token flow
│   ├── youtube.js          # YouTube API wrapper functions
│   ├── mcp.js              # Defines all MCP tools (search, like, etc.)
│   └── youtubeRouter.js    # Additional REST endpoints
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main UI with chat + video grid
│   │   └── api.js          # Connector to backend /mcp endpoint
│   └── public/
│
└── README.md


This separation makes the system clean, testable, and easy to update.

📱 Features Overview
✔ Search YouTube
Fetches high-quality results with thumbnails.
✔ Watch History
Tracks videos from clicks on thumbnails.
✔ Liked Videos
Shows all liked videos from actual YouTube account.
✔ Like/Unlike Videos
Works from:
Fetched results
Recommendations
Watch history
Full YouTube link (e.g., like https://youtu.be/...)

✔ Recommendations Sidebar
Personalized suggestions based on:
Previous search
Watch history
Liked videos
✔ Fully Responsive
Adjusts the layout perfectly across laptop and mobile.

🔐 Security Notes
API keys kept in backend environment variables
No credential in frontend
OAuth2 refresh token only used on backend
HTTPS enforced by hosting platforms
No user passwords collected

⚡ Performance & Latency Considerations
Cached history using localStorage
Minimal API calls during browsing
Videos limited per request to reduce latency
Render backend handles refresh token instantly
Vercel frontend serves pages via CDN
The result is a fast, smooth, and low-latency user experience.

🚀 Running The Project
Backend
cd backend
npm install
npm start

Frontend
cd frontend
npm install
npm run dev

💬 Example Commands
devops videos
10 comedy videos
channel apna college
liked videos
history
like dQw4w9WgXcQ
like https://youtu.be/dQw4w9WgXcQ
