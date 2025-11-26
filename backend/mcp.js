import OpenAI from "openai";
import { youtubeAPI } from "./youtube.js";

export async function handleMcpRequest(body) {
  const { tool, input } = body;

  // Allow chatbot even if not logged in
  if (
    !global.ACCESS_TOKEN &&
    tool !== "youi.chat" &&
    tool !== "youi.chatSmart"
  ) {
    return { error: "Please login with YouTube first." };
  }

  try {
    switch (tool) {
      // ⭐ YOUTUBE SEARCH (supports dynamic maxResults)
      case "youtube.search":
        return await youtubeAPI.search(
          input.query,
          global.ACCESS_TOKEN,
          input.maxResults || 10
        );

      // ⭐ LIKED VIDEOS
      case "youtube.getLikedVideos":
        return await youtubeAPI.likedVideos(global.ACCESS_TOKEN);

      // ⭐ WATCH HISTORY (placeholder)
      case "youtube.getHistory":
        return await youtubeAPI.likedVideos(global.ACCESS_TOKEN);

      // ⭐ LIKE VIDEO
      case "youtube.likeVideo":
        return await youtubeAPI.likeVideo(
          input.videoId,
          global.ACCESS_TOKEN
        );

      // ⭐ VIDEO INFO
      case "youtube.videoInfo":
        return await youtubeAPI.videoInfo(
          input.videoId,
          global.ACCESS_TOKEN
        );

      // ⭐ SUMMARIZE VIDEO
      case "youtube.describeVideo": {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const videoId = extractVideoId(input.url);
        if (!videoId) return { error: "Invalid YouTube URL." };

        const info = await youtubeAPI.videoInfo(
          videoId,
          global.ACCESS_TOKEN
        );
        const snippet = info.items?.[0]?.snippet || {};

        const text = `Summarize this YouTube video:\n\nTitle: ${snippet.title}\nDescription:\n${snippet.description}`;

        const ai = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: text }],
        });

        return {
          title: snippet.title,
          summary: ai.choices[0].message.content,
        };
      }

      // ⭐ AI-BASED RECOMMENDATIONS
      case "youtube.recommend": {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const liked = await youtubeAPI.likedVideos(global.ACCESS_TOKEN);
        const titles =
          liked.items?.map((v) => v.snippet.title).join("\n") ||
          "No liked videos found.";

        const ai = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `Based on these liked videos:\n${titles}\nRecommend 5 similar videos.`,
            },
          ],
        });

        return ai.choices[0].message.content;
      }

      // ⭐ FETCH CHANNEL VIDEOS
      case "youtube.channelVideos":
        return await youtubeAPI.channelVideos(
          input.channel,
          global.ACCESS_TOKEN
        );

      // ⭐ NORMAL CHATBOT
      case "youi.chat": {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const ai = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: input.text }],
        });

        return ai.choices[0].message.content;
      }

      // ⭐ SMART GREETING CHATBOT
      case "youi.chatSmart": {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const ai = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: input.text,
            },
          ],
        });

        return ai.choices[0].message.content;
      }

      default:
        return { error: `Unknown MCP tool: ${tool}` };
    }
  } catch (err) {
    console.error("❌ MCP ERROR:", err);
    return { error: err.toString() };
  }
}

// ⭐ FIXED CLEAN REGEX (no errors)
function extractVideoId(url) {
  const m = url.match(/(?:v=|youtu\.be\/)([^&?\n]+)/);
  return m ? m[1] : null;
}
