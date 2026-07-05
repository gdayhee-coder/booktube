import { useState, useEffect } from "react";

const C = {
  bg:"#F4F8FC", surface:"#FFFFFF", border:"#DCE6F0", borderStrong:"#B8CCE0",
  primary:"#5B9BD5", primaryDark:"#3D7CB8", primaryLight:"#EAF3FB",
  accent:"#F5A623", accentLight:"#FEF5E5",
  text:"#26364A", textMid:"#5A6B80", textMuted:"#93A3B5",
  warn:"#D9534F",
};
const FF = "'Noto Sans KR',sans-serif";
const POPULAR = [
  "The Very Hungry Caterpillar","Brown Bear Brown Bear","Pete the Cat",
  "No David","Goodnight Moon","Elephant and Piggie","Dear Zoo",
  "Where the Wild Things Are","Chicka Chicka Boom Boom","The Giving Tree",
  "Llama Llama Red Pajama","Press Here",
];

export default function App() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(null);
  const [favs, setFavs] = useState([]);
  const [recent, setRecent] = useState([]);
  const [view, setView] = useState("search"); // search | favs

  useEffect(() => {
    try {
      const f = localStorage.getItem("bt-favs");
      const r = localStorage.getItem("bt-recent");
      if (f) setFavs(JSON.parse(f));
      if (r) setRecent(JSON.parse(r));
    } catch (e) {}
  }, []);
  useEffect(() => { try { localStorage.setItem("bt-favs", JSON.stringify(favs)); } catch (e) {} }, [favs]);
  useEffect(() => { try { localStorage.setItem("bt-recent", JSON.stringify(recent)); } catch (e) {} }, [recent]);

  const search = async (query) => {
    const term = (query ?? q).trim();
    if (!term) return;
    setQ(term); setView("search"); setLoading(true); setError(""); setResults([]);
    setRecent((p) => [term, ...p.filter((x) => x !== term)].slice(0, 8));
    try {
      const r = await fetch("/api/youtube?q=" + encodeURIComponent(term));
      const j = await r.json();
      if (j.error) throw new Error(j.error);
      setResults(j.items || []);
      if (!(j.items || []).length) setError("검색 결과가 없어요. 다른 제목으로 검색해보세요.");
    } catch (e) {
      setError("검색에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally { setLoading(false); }
  };

  const isFav = (v) => favs.some((f) => f.id === v.id);
  const toggleFav = (v) => setFavs((p) => isFav(v) ? p.filter((f) => f.id !== v.id) : [{ ...v }, ...p]);

  const Card = ({ v }) => (
    <div style={{ background:C.surface, borderRadius:16, overflow:"hidden", border:`1.5px solid ${C.border}`, boxShadow:"0 2px 10px rgba(60,100,150,0.07)", display:"flex", flexDirection:"column" }}>
      <div style={{ position:"relative", cursor:"pointer", aspectRatio:"16/9", background:C.primaryLight }} onClick={() => setPlaying(v)}>
        {v.thumb && <img src={v.thumb} alt={v.title} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />}
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:46, height:46, borderRadius:"50%", background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, color:"#fff", paddingLeft:4 }}>▶</div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); toggleFav(v); }}
          style={{ position:"absolute", top:8, right:8, width:32, height:32, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.92)", fontSize:16, cursor:"pointer", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}>
          {isFav(v) ? "⭐" : "☆"}
        </button>
      </div>
      <div style={{ padding:"10px 12px", flex:1 }}>
        <div style={{ fontSize:13, fontWeight:700, color:C.text, lineHeight:1.45, marginBottom:3, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}
          dangerouslySetInnerHTML={{ __html: v.title }} />
        <div style={{ fontSize:11, color:C.textMuted }}>{v.channel}</div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily:FF, background:C.bg, minHeight:"100vh" }}>
      {/* 재생 화면 */}
      {playing && (
        <div style={{ position:"fixed", inset:0, background:"#0B1520", zIndex:100, display:"flex", flexDirection:"column" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px" }}>
            <button onClick={() => setPlaying(null)}
              style={{ padding:"9px 16px", background:"rgba(255,255,255,0.12)", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:FF }}>
              ← 목록으로
            </button>
            <div style={{ flex:1, color:"#fff", fontSize:13, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}
              dangerouslySetInnerHTML={{ __html: playing.title }} />
            <button onClick={() => toggleFav(playing)}
              style={{ padding:"9px 14px", background:"rgba(255,255,255,0.12)", color:"#fff", border:"none", borderRadius:10, fontSize:15, cursor:"pointer" }}>
              {isFav(playing) ? "⭐" : "☆"}
            </button>
          </div>
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 12px 20px" }}>
            <div style={{ width:"100%", maxWidth:1100, aspectRatio:"16/9" }}>
              <iframe
                src={`https://www.youtube.com/embed/${playing.id}?autoplay=1&rel=0`}
                title={playing.title}
                style={{ width:"100%", height:"100%", border:"none", borderRadius:14 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div style={{ background:`linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, padding:"18px 20px 16px" }}>
        <div style={{ maxWidth:860, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <span style={{ fontSize:30 }}>📚</span>
            <div>
              <div style={{ fontSize:18, fontWeight:900, color:"#fff", letterSpacing:"-0.3px" }}>북튜브</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.75)" }}>원서 제목을 검색하면 낭독 영상을 찾아줘요</div>
            </div>
            <button onClick={() => setView(view === "favs" ? "search" : "favs")}
              style={{ marginLeft:"auto", padding:"8px 14px", background:view==="favs" ? "#fff" : "rgba(255,255,255,0.15)", color:view==="favs" ? C.primary : "#fff", border:"none", borderRadius:20, fontSize:12.5, fontWeight:700, cursor:"pointer", fontFamily:FF }}>
              ⭐ 즐겨찾기 {favs.length > 0 && `(${favs.length})`}
            </button>
          </div>
          {/* 검색창 */}
          <div style={{ display:"flex", gap:8 }}>
            <input value={q} onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="영어 원서 제목 입력 (예: Pete the Cat)"
              style={{ flex:1, padding:"13px 16px", border:"none", borderRadius:12, fontSize:15, outline:"none", fontFamily:FF, boxShadow:"0 2px 8px rgba(0,0,0,0.12)" }} />
            <button onClick={() => search()} disabled={loading || !q.trim()}
              style={{ padding:"13px 22px", background:C.accent, color:"#fff", border:"none", borderRadius:12, fontSize:15, fontWeight:800, cursor:q.trim() ? "pointer" : "default", fontFamily:FF, boxShadow:"0 2px 8px rgba(0,0,0,0.12)", opacity:q.trim() ? 1 : 0.6 }}>
              {loading ? "…" : "검색"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:860, margin:"0 auto", padding:"16px 20px 40px" }}>
        {view === "favs" ? (
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:12 }}>⭐ 즐겨찾기한 영상</div>
            {favs.length === 0 ? (
              <div style={{ textAlign:"center", padding:"50px 20px", color:C.textMuted, fontSize:14 }}>
                아직 즐겨찾기가 없어요.<br />영상 카드의 ☆를 눌러 저장해보세요!
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:14 }}>
                {favs.map((v) => <Card key={v.id} v={v} />)}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* 최근 검색 */}
            {recent.length > 0 && !results.length && !loading && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:12, fontWeight:700, color:C.textMuted, marginBottom:8 }}>최근 검색</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {recent.map((r) => (
                    <button key={r} onClick={() => search(r)}
                      style={{ padding:"6px 13px", borderRadius:20, border:`1.5px solid ${C.border}`, background:C.surface, color:C.textMid, fontSize:12.5, cursor:"pointer", fontFamily:FF }}>
                      🕐 {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* 인기 원서 */}
            {!results.length && !loading && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:12, fontWeight:700, color:C.textMuted, marginBottom:8 }}>인기 원서 바로 검색</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {POPULAR.map((b) => (
                    <button key={b} onClick={() => search(b)}
                      style={{ padding:"7px 14px", borderRadius:20, border:`1.5px solid ${C.primaryLight}`, background:C.primaryLight, color:C.primaryDark, fontSize:12.5, fontWeight:600, cursor:"pointer", fontFamily:FF }}>
                      📖 {b}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* 로딩 */}
            {loading && (
              <div style={{ textAlign:"center", padding:"60px 20px", color:C.textMuted, fontSize:14 }}>
                <div style={{ fontSize:36, marginBottom:10 }}>📚</div>
                낭독 영상을 찾고 있어요…
              </div>
            )}
            {/* 에러 */}
            {error && !loading && (
              <div style={{ background:"#FDF0EF", border:"1px solid #F0B8B6", borderRadius:12, padding:"14px 16px", fontSize:13, color:C.warn, marginBottom:16 }}>
                {error}
              </div>
            )}
            {/* 결과 */}
            {results.length > 0 && (
              <div>
                <div style={{ fontSize:13, color:C.textMid, marginBottom:12 }}>
                  <b style={{ color:C.primaryDark }}>"{q}"</b> 낭독 영상 {results.length}개
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:14 }}>
                  {results.map((v) => <Card key={v.id} v={v} />)}
                </div>
              </div>
            )}
            {/* 첫 화면 안내 */}
            {!results.length && !loading && !error && (
              <div style={{ background:C.surface, borderRadius:16, padding:"22px 20px", border:`1.5px solid ${C.border}`, textAlign:"center" }}>
                <div style={{ fontSize:40, marginBottom:10 }}>👩‍🏫</div>
                <div style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:6 }}>수업 시간, 원서 낭독 영상이 필요할 때</div>
                <div style={{ fontSize:13, color:C.textMid, lineHeight:1.8 }}>
                  책 제목만 검색하면 유튜브 낭독(read aloud) 영상을 모아서 보여드려요.<br />
                  영상을 누르면 큰 화면으로 재생돼서 프로젝터 수업에 딱 좋아요.<br />
                  자주 쓰는 영상은 ⭐ 즐겨찾기에 저장하세요!
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
