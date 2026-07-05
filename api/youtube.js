const https = require("https");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") return res.status(405).json({ error: "Method Not Allowed" });

  const q = (req.query.q || "").toString().trim();
  if (!q) return res.status(400).json({ error: "q required" });

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return res.status(500).json({ error: "API key not configured" });

  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    maxResults: "12",
    q: q + " read aloud",
    safeSearch: "strict",
    videoEmbeddable: "true",
    relevanceLanguage: "en",
    key,
  });
  const url = "https://www.googleapis.com/youtube/v3/search?" + params.toString();

  return new Promise((resolve) => {
    https.get(url, (r) => {
      let data = "";
      r.on("data", (c) => (data += c));
      r.on("end", () => {
        try {
          const j = JSON.parse(data);
          if (j.error) {
            res.status(500).json({ error: j.error.message || "YouTube API error" });
            return resolve();
          }
          const items = (j.items || [])
            .filter((it) => it.id && it.id.videoId)
            .map((it) => ({
              id: it.id.videoId,
              title: it.snippet.title,
              channel: it.snippet.channelTitle,
              thumb: it.snippet.thumbnails
                ? (it.snippet.thumbnails.medium || it.snippet.thumbnails.default).url
                : "",
            }));
          res.status(200).json({ items });
        } catch (e) {
          res.status(500).json({ error: "응답 처리 실패" });
        }
        resolve();
      });
    }).on("error", (e) => {
      res.status(500).json({ error: e.message });
      resolve();
    });
  });
};
