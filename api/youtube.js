import https from "https";

// 메모리 캐시 (같은 검색어는 서버 재호출 없이 반환)
// 서버리스 함수가 살아있는 동안 유지됨 — 인기 검색어는 대부분 여기서 해결
const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24시간

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  let q = "", given = "";
  try {
    const u = new URL(req.url, "http://localhost");
    q = (u.searchParams.get("q") || "").trim();
    given = (u.searchParams.get("code") || "").trim();
    var mode = (u.searchParams.get("mode") || "").trim();
  } catch (e) {}

  const appCode = process.env.APP_CODE;
  if (appCode && given !== appCode) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  if (!q) {
    res.status(400).json({ error: "q required" });
    return;
  }

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    res.status(500).json({ error: "API key not configured" });
    return;
  }

  // 캐시 키: 검색어 + 모드
  const cacheKey = mode + "|" + q.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("X-Cache", "HIT");
    res.status(200).json({ items: cached.items });
    return;
  }

  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    maxResults: "12",
    q: q + (mode === "listen" ? " full episodes english" : mode === "ch" ? "" : " read aloud"),
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
          cache.set(cacheKey, { items, time: Date.now() });
          res.setHeader("Cache-Control", "public, max-age=86400");
          res.setHeader("X-Cache", "MISS");
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
}
