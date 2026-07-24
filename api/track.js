// 북튜브 학생 계정·기록 API (Vercel KV REST)
const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;

async function kv(command) {
  const r = await fetch(KV_URL + "/" + command.map(encodeURIComponent).join("/"), {
    headers: { Authorization: "Bearer " + KV_TOKEN },
  });
  const j = await r.json();
  return j.result;
}

function isAdmin(u) {
  const code = (u.searchParams.get("code") || "").trim();
  return process.env.ADMIN_CODE && code === process.env.ADMIN_CODE;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (!KV_URL || !KV_TOKEN) { res.status(500).json({ error: "storage not configured" }); return; }

  const u = new URL(req.url, "http://localhost");
  const action = u.searchParams.get("action") || "";

  try {
    // [교사] 학생 계정 발급
    if (action === "create") {
      if (!isAdmin(u)) { res.status(401).json({ error: "unauthorized" }); return; }
      const name = (u.searchParams.get("name") || "").trim().slice(0, 20);
      const pin = (u.searchParams.get("pin") || "").trim().slice(0, 4);
      if (!name || !/^\d{4}$/.test(pin)) { res.status(400).json({ error: "name/pin invalid" }); return; }
      // 아이디 자동 생성: bt + 4자리 랜덤 숫자 (중복 회피)
      let id = "";
      for (let t = 0; t < 20; t++) {
        const cand = "bt" + Math.floor(1000 + Math.random() * 9000);
        const exists = await kv(["exists", "bt:u:" + cand]);
        if (!exists) { id = cand; break; }
      }
      if (!id) { res.status(500).json({ error: "id gen failed" }); return; }
      const rec = { id, name, pin, streak: 0, month: 0, total: 0, created: new Date().toISOString(), updated: null };
      await kv(["set", "bt:u:" + id, JSON.stringify(rec)]);
      await kv(["sadd", "bt:users", id]);
      res.status(200).json({ id, name, pin });
      return;
    }

    // [학생] 로그인
    if (action === "login") {
      const id = (u.searchParams.get("id") || "").trim();
      const pin = (u.searchParams.get("pin") || "").trim();
      const raw = await kv(["get", "bt:u:" + id]);
      if (!raw) { res.status(404).json({ error: "no_user" }); return; }
      const rec = JSON.parse(raw);
      if (rec.pin !== pin) { res.status(401).json({ error: "wrong_pin" }); return; }
      res.status(200).json({ id: rec.id, name: rec.name, streak: rec.streak, month: rec.month, total: rec.total });
      return;
    }

    // [학생] 기록 저장
    if (action === "save") {
      const id = (u.searchParams.get("id") || "").trim();
      const pin = (u.searchParams.get("pin") || "").trim();
      const raw = await kv(["get", "bt:u:" + id]);
      if (!raw) { res.status(404).json({ error: "no_user" }); return; }
      const rec = JSON.parse(raw);
      if (rec.pin !== pin) { res.status(401).json({ error: "wrong_pin" }); return; }
      rec.streak = parseInt(u.searchParams.get("streak") || "0", 10) || 0;
      rec.month = parseInt(u.searchParams.get("month") || "0", 10) || 0;
      rec.total = parseInt(u.searchParams.get("total") || "0", 10) || 0;
      rec.updated = new Date().toISOString();
      await kv(["set", "bt:u:" + id, JSON.stringify(rec)]);
      res.status(200).json({ ok: true });
      return;
    }

    // [교사] 전체 목록
    if (action === "list") {
      if (!isAdmin(u)) { res.status(401).json({ error: "unauthorized" }); return; }
      const ids = (await kv(["smembers", "bt:users"])) || [];
      const out = [];
      for (const id of ids) {
        const raw = await kv(["get", "bt:u:" + id]);
        if (raw) { try { const r2 = JSON.parse(raw); out.push(r2); } catch (e) {} }
      }
      out.sort((a, b) => (b.streak || 0) - (a.streak || 0));
      res.status(200).json({ students: out });
      return;
    }

    // [교사] 학생 삭제
    if (action === "delete") {
      if (!isAdmin(u)) { res.status(401).json({ error: "unauthorized" }); return; }
      const id = (u.searchParams.get("id") || "").trim();
      await kv(["del", "bt:u:" + id]);
      await kv(["srem", "bt:users", id]);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(400).json({ error: "unknown action" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
