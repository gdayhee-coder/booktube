import { useState, useEffect } from "react";

const C = {
  bg:"#FAF9F3", paper:"#FDFCF8", border:"#E2E4D8", borderStrong:"#C9CDBB",
  wood:"#8FA07E", woodDark:"#6B7C60", woodLight:"#A3B394",
  text:"#3C443A", textMid:"#6F7A68", textMuted:"#9AA391",
  red:"#6B7C60", redLight:"#FDF0EF",
  warn:"#B85450",
};
const SPINE = ["#8FA07E","#C9A96B","#B48A76","#8CA3B0","#A8B5A0","#B58E8E"];
const FF = "'Noto Sans KR',sans-serif";
const POPULAR = [
  "The Very Hungry Caterpillar","Brown Bear Brown Bear","Pete the Cat",
  "No David","Goodnight Moon","Elephant and Piggie","Dear Zoo",
  "Where the Wild Things Are","Chicka Chicka Boom Boom","The Giving Tree",
  "Llama Llama Red Pajama","Press Here",
];

const Logo = ({ size = 38 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} style={{ borderRadius: size * 0.22, boxShadow:"0 2px 6px rgba(60,68,58,0.25)" }}>
    <rect width="64" height="64" rx="14" fill="#5A6B50" />
    <path d="M14 16 Q14 13 17 13 L30 13 Q32 13 32 15 L32 51 Q32 53 30 52 Q24 49 17 50 Q14 50.5 14 47 Z" fill="#FDFCF4" />
    <path d="M50 16 Q50 13 47 13 L34 13 Q32 13 32 15 L32 51 Q32 53 34 52 Q40 49 47 50 Q50 50.5 50 47 Z" fill="#EDF0E6" />
    <circle cx="32" cy="31" r="11" fill="#C9A96B" />
    <path d="M29 25.5 L38.5 31 L29 36.5 Z" fill="#FDFCF4" />
  </svg>
);

export default function App() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState(null);
  const [favs, setFavs] = useState([]);
  const [recent, setRecent] = useState([]);
  const [view, setView] = useState("search");

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

  const Card = ({ v, i }) => (
    <div style={{ background:C.paper, borderRadius:"4px 12px 12px 4px", overflow:"hidden", border:`1px solid ${C.border}`, borderLeft:`6px solid ${SPINE[i % SPINE.length]}`, boxShadow:"3px 4px 0 rgba(107,124,96,0.12)", display:"flex", flexDirection:"column", transition:"transform 0.15s" }}
      onMouseEnter={(e)=>e.currentTarget.style.transform="translateY(-3px)"}
      onMouseLeave={(e)=>e.currentTarget.style.transform="translateY(0)"}>
      <div style={{ position:"relative", cursor:"pointer", aspectRatio:"16/9", background:C.bg }} onClick={() => setPlaying(v)}>
        {v.thumb && <img src={v.thumb} alt={v.title} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />}
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:46, height:46, borderRadius:"50%", background:"rgba(60,68,58,0.62)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:19, color:"#FDFCF4", paddingLeft:4 }}>▶</div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); toggleFav(v); }}
          style={{ position:"absolute", top:8, right:8, width:32, height:32, borderRadius:"50%", border:"none", background:"rgba(253,252,248,0.95)", fontSize:15, cursor:"pointer", boxShadow:"0 1px 4px rgba(60,68,58,0.3)" }}>
          {isFav(v) ? "📚" : "＋"}
        </button>
      </div>
      <div style={{ padding:"10px 12px", flex:1 }}>
        <div style={{ fontSize:13, fontWeight:700, color:C.text, lineHeight:1.45, marginBottom:3, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}
          dangerouslySetInnerHTML={{ __html: v.title }} />
        <div style={{ fontSize:11, color:C.textMuted }}>🎙 {v.channel}</div>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily:FF, background:C.bg, minHeight:"100vh" }}>
      {/* 재생 화면 */}
      {playing && (
        <div style={{ position:"fixed", inset:0, background:"#252B23", zIndex:100, display:"flex", flexDirection:"column" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", background:C.woodDark }}>
            <button onClick={() => setPlaying(null)}
              style={{ padding:"9px 16px", background:"rgba(253,252,244,0.14)", color:"#FDFCF4", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:FF }}>
              ← 서가로
            </button>
            <div style={{ flex:1, color:"#FDFCF4", fontSize:13, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}
              dangerouslySetInnerHTML={{ __html: playing.title }} />
            <button onClick={() => toggleFav(playing)}
              style={{ padding:"9px 14px", background:"rgba(253,252,244,0.14)", color:"#FDFCF4", border:"none", borderRadius:10, fontSize:14, cursor:"pointer", fontFamily:FF }}>
              {isFav(playing) ? "📚 꽂아둠" : "＋ 책꽂이"}
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

      {/* 헤더 — 책장 느낌 */}
      <div style={{ background:`linear-gradient(180deg, ${C.woodLight}, ${C.wood})`, padding:"18px 20px 0" }}>
        <div style={{ maxWidth:860, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:12 }}>
            <Logo size={40} />
            <div>
              <div style={{ fontSize:19, fontWeight:900, color:"#FDFCF4", letterSpacing:"-0.3px" }}>북튜브</div>
              <div style={{ fontSize:11, color:"rgba(253,252,244,0.75)" }}>원서 제목을 검색하면 낭독 영상을 찾아줘요</div>
            </div>
            <button onClick={() => setView(view === "favs" ? "search" : "favs")}
              style={{ marginLeft:"auto", padding:"8px 15px", background:view==="favs" ? "#FDFCF4" : "rgba(253,252,244,0.16)", color:view==="favs" ? C.wood : "#FDFCF4", border:"none", borderRadius:20, fontSize:12.5, fontWeight:700, cursor:"pointer", fontFamily:FF }}>
              📚 내 책꽂이 {favs.length > 0 && `(${favs.length})`}
            </button>
          </div>
          {/* 검색창 */}
          <div style={{ display:"flex", gap:8, marginBottom:14 }}>
            <input value={q} onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="영어 원서 제목 입력 (예: Pete the Cat)"
              style={{ flex:1, padding:"13px 16px", border:`2px solid ${C.woodDark}`, borderRadius:12, fontSize:15, outline:"none", fontFamily:FF, background:"#FFFDF7", color:C.text, boxShadow:"inset 0 1px 3px rgba(60,68,58,0.12)" }} />
            <button onClick={() => search()} disabled={loading || !q.trim()}
              style={{ padding:"13px 22px", background:C.red, color:"#FDFCF4", border:`2px solid #5A6B50`, borderRadius:12, fontSize:15, fontWeight:800, cursor:q.trim() ? "pointer" : "default", fontFamily:FF, boxShadow:"0 2px 0 #4A5941", opacity:q.trim() ? 1 : 0.65 }}>
              {loading ? "…" : "🔍 검색"}
            </button>
          </div>
          {/* 책등 장식 — 선반 위 미니 책들 */}
          <div style={{ display:"flex", alignItems:"flex-end", gap:3, height:34, overflow:"hidden", paddingLeft:6 }}>
            {[26,32,22,30,25,33,28,21,31,24,29,27,23,32,26,30,22,28,25,31].map((h, i) => (
              <div key={i} style={{ width:i%5===3?16:11, height:h, background:SPINE[i % SPINE.length], borderRadius:"2px 2px 0 0", opacity:0.92, transform:i%7===5?"rotate(-6deg) translateY(2px)":"none", boxShadow:"inset -2px 0 0 rgba(0,0,0,0.15)" }} />
            ))}
          </div>
        </div>
      </div>
      {/* 선반 */}
      <div style={{ height:10, background:C.woodDark, boxShadow:"0 3px 6px rgba(60,68,58,0.3)" }} />

      <div style={{ maxWidth:860, margin:"0 auto", padding:"18px 20px 40px" }}>
        {view === "favs" ? (
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:12 }}>📚 내 책꽂이</div>
            {favs.length === 0 ? (
              <div style={{ textAlign:"center", padding:"50px 20px", color:C.textMuted, fontSize:14, background:C.paper, borderRadius:14, border:`1.5px dashed ${C.borderStrong}` }}>
                책꽂이가 아직 비어 있어요. 배고픈 애벌레만 지나갔네요 🐛<br />영상 카드의 ＋ 를 눌러 꽂아두세요!
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:16 }}>
                {favs.map((v, i) => <Card key={v.id} v={v} i={i} />)}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* 최근 검색 */}
            {recent.length > 0 && !results.length && !loading && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:12, fontWeight:700, color:C.textMuted, marginBottom:8 }}>🕐 최근 검색</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {recent.map((r) => (
                    <button key={r} onClick={() => search(r)}
                      style={{ padding:"6px 13px", borderRadius:8, border:`1px solid ${C.border}`, background:C.paper, color:C.textMid, fontSize:12.5, cursor:"pointer", fontFamily:FF, boxShadow:"1px 2px 0 rgba(107,124,96,0.1)" }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* 인기 원서 — 작은 책 모양 */}
            {!results.length && !loading && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:12, fontWeight:700, color:C.textMuted, marginBottom:8 }}>📖 인기 원서 바로 검색</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                  {POPULAR.map((b, i) => (
                    <button key={b} onClick={() => search(b)}
                      style={{ padding:"8px 14px 8px 11px", borderRadius:"3px 9px 9px 3px", border:`1px solid ${C.border}`, borderLeft:`5px solid ${SPINE[i % SPINE.length]}`, background:C.paper, color:C.text, fontSize:12.5, fontWeight:600, cursor:"pointer", fontFamily:FF, boxShadow:"2px 2px 0 rgba(107,124,96,0.12)" }}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* 로딩 */}
            {loading && (
              <div style={{ textAlign:"center", padding:"60px 20px", color:C.textMid, fontSize:14 }}>
                <div style={{ fontSize:38, marginBottom:10 }}>🦉</div>
                부엉이가 책장을 넘기는 중…
              </div>
            )}
            {/* 에러 */}
            {error && !loading && (
              <div style={{ background:C.redLight, border:`1px solid #F0B8B6`, borderRadius:12, padding:"14px 16px", fontSize:13, color:C.warn, marginBottom:16 }}>
                {error}
              </div>
            )}
            {/* 결과 */}
            {results.length > 0 && (
              <div>
                <div style={{ fontSize:13, color:C.textMid, marginBottom:12 }}>
                  <b style={{ color:C.wood }}>"{q}"</b> 🎧 낭독 영상 {results.length}권
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:16 }}>
                  {results.map((v, i) => <Card key={v.id} v={v} i={i} />)}
                </div>
              </div>
            )}
            {/* 첫 화면 안내 */}
            {!results.length && !loading && !error && (
              <div style={{ background:C.paper, borderRadius:14, padding:"24px 20px", border:`1.5px solid ${C.border}`, textAlign:"center", boxShadow:"3px 4px 0 rgba(107,124,96,0.1)" }}>
                <div style={{ fontSize:34, marginBottom:10, letterSpacing:6 }}>📖🦉🎧</div>
                <div style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:6 }}>수업 시간, 원서 낭독 영상이 필요할 때</div>
                <div style={{ fontSize:13, color:C.textMid, lineHeight:1.8 }}>
                  책 제목만 검색하면 유튜브 낭독(read aloud) 영상을 서가에 꺼내드려요.<br />
                  영상을 누르면 큰 화면으로 재생돼서 프로젝터 수업에 딱 좋아요.<br />
                  자주 읽는 책은 ＋ 를 눌러 <b>📚 내 책꽂이</b>에 꽂아두세요!
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
