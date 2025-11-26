import axios from "axios";

export const youtubeAPI = {
  search: async (query, token, maxResults = 10) => {
    const res = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: query,
          maxResults: maxResults,
          type: "video",
        },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  },

  likedVideos: async (token) => {
    const res = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          part: "snippet,contentDetails,statistics",
          myRating: "like",
          maxResults: 10,
        },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  },

  likeVideo: async (videoId, token) => {
    await axios.post(
      "https://www.googleapis.com/youtube/v3/videos/rate",
      {},
      {
        params: { id: videoId, rating: "like" },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return { success: true };
  },

  videoInfo: async (videoId, token) => {
    const res = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          id: videoId,
          part: "snippet,statistics,contentDetails",
        },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  },

  channelVideos: async (channelName, token) => {
    try {
      const searchRes = await axios.get(
        "https://www.googleapis.com/youtube/v3/search",
        {
          params: {
            part: "snippet",
            q: channelName,
            type: "channel",
            maxResults: 1,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!searchRes.data.items.length) {
        return { error: "Channel not found." };
      }

      const channelId = searchRes.data.items[0].id.channelId;

      const videoRes = await axios.get(
        "https://www.googleapis.com/youtube/v3/search",
        {
          params: {
            part: "snippet",
            channelId: channelId,
            order: "date",
            maxResults: 10,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return videoRes.data;
    } catch (e) {
      console.error("Channel fetch error:", e);
      return { error: "Unable to fetch channel videos." };
    }
  },
};
