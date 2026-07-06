import { useState, useEffect } from "react";

const C = {
  bg:"#FBFCF7", paper:"#FFFFFF", border:"#E6EBDC", borderStrong:"#D2DBC4",
  wood:"#9DB088", woodDark:"#7E9469", woodLight:"#B9CBA4",
  text:"#4A5544", textMid:"#7A8770", textMuted:"#A7B29C",
  red:"#7E9469", redLight:"#FDF2F1",
  warn:"#C47B72",
};
const SPINE = ["#9DB088","#D9C286","#C99F86","#9DB8C4","#B9CBA4","#C99FA0"];
const FF = "'Noto Sans KR',sans-serif";
const POPULAR = [
  "The Very Hungry Caterpillar","Brown Bear Brown Bear","Pete the Cat",
  "No David","Goodnight Moon","Elephant and Piggie","Dear Zoo",
  "Where the Wild Things Are","Chicka Chicka Boom Boom","The Giving Tree",
  "Llama Llama Red Pajama","Press Here",
];

const LISTEN = [
  { level:"1단계 · 처음 시작해요", desc:"말이 짧고 쉬워서 그림만 봐도 이해돼요", color:"#8FA07E",
    shows:["Peppa Pig","Maisy Mouse","Bing","Max and Ruby","Trotro","Meg and Mog","Penelope"] },
  { level:"2단계 · 귀가 익숙해지면", desc:"이야기가 있는 에피소드로 넘어가요", color:"#C9A96B",
    shows:["Caillou","Curious George","Ben and Holly","Charlie and Lola","Octonauts","Dora the Explorer"] },
  { level:"3단계 · 술술 들리기 시작하면", desc:"말이 빠르고 내용이 풍부한 시리즈예요", color:"#B48A76",
    shows:["Arthur","The Magic School Bus","Wild Kratts","Horrid Henry","Geronimo Stilton"] },
];

const KNOWLEDGE = [
  { cat:"📰 뉴스·시사", color:"#8CA3B0",
    items:["CNN 10","BBC Newsround","DOGO News"] },
  { cat:"🔬 과학·자연", color:"#8FA07E",
    items:["National Geographic Kids","SciShow Kids","Dr Binocs Show","Crash Course Kids","Mark Rober"] },
  { cat:"🏛 역사·교양", color:"#C9A96B",
    items:["Simple History","Horrible Histories","Crash Course World History","TED-Ed","Free School"] },
];

const TEXTBOOK = [
  { cat:"📕 리딩 교재", color:"#B48A76",
    items:["Reading for Vocabulary","Bricks Reading","Reading Explorer","American Textbook Reading","Subject Link"] },
  { cat:"📗 어휘 교재", color:"#8FA07E",
    items:["Vocabulary Workshop","Wordly Wise 3000","4000 Essential English Words","240 Vocabulary Words"] },
  { cat:"📘 문법·코스북", color:"#8CA3B0",
    items:["Grammar in Use","Let's Go Oxford","Side by Side","Oxford Phonics World"] },
];

const Logo = ({ size = 38 }) => (
  <svg viewBox="0 0 64 64" width={size} height={size} style={{ borderRadius: size * 0.22, boxShadow:"0 2px 6px rgba(60,68,58,0.25)" }}>
    <rect width="64" height="64" rx="14" fill="#7E9469" />
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
  const [locked, setLocked] = useState(false);
  const [codeIn, setCodeIn] = useState("");
  const [pendingQ, setPendingQ] = useState("");
  const [searchMode, setSearchMode] = useState("read");
  const [days, setDays] = useState({});
  const [user, setUser] = useState(null);
  const [idIn, setIdIn] = useState("");
  const [pinIn, setPinIn] = useState("");
  const [loginErr, setLoginErr] = useState("");

  useEffect(() => {
    try {
      const f = localStorage.getItem("bt-favs");
      const r = localStorage.getItem("bt-recent");
      if (f) setFavs(JSON.parse(f));
      if (r) setRecent(JSON.parse(r));
      const d = localStorage.getItem("bt-days");
      if (d) setDays(JSON.parse(d));
      const uid = localStorage.getItem("bt-uid");
      const upin = localStorage.getItem("bt-upin");
      const unm = localStorage.getItem("bt-uname");
      if (uid && upin && unm) setUser({ id: uid, pin: upin, name: unm });
    } catch (e) {}
  }, []);
  useEffect(() => { try { localStorage.setItem("bt-favs", JSON.stringify(favs)); } catch (e) {} }, [favs]);
  useEffect(() => { try { localStorage.setItem("bt-recent", JSON.stringify(recent)); } catch (e) {} }, [recent]);
  useEffect(() => { try { localStorage.setItem("bt-days", JSON.stringify(days)); } catch (e) {} }, [days]);

  const todayKey = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); };
  const doneToday = !!days[todayKey()];
  const toggleToday = () => {
    setDays((p) => {
      const k = todayKey(); const n = { ...p }; if (n[k]) delete n[k]; else n[k] = 1;
      const total = Object.keys(n).length;
      const now = new Date(); const pre = now.getFullYear() + "-" + String(now.getMonth()+1).padStart(2,"0");
      const mo = Object.keys(n).filter((x) => x.startsWith(pre)).length;
      let c = 0; const d = new Date();
      while (true) { const kk = d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); if (n[kk]) { c++; d.setDate(d.getDate()-1); } else break; }
      syncServer(c, mo, total);
      return n;
    });
  };
  const streak = (() => {
    let c = 0; const d = new Date();
    while (true) {
      const k = d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
      if (days[k]) { c++; d.setDate(d.getDate()-1); } else break;
    }
    return c;
  })();
  const monthCount = (() => {
    const now = new Date(); const pre = now.getFullYear() + "-" + String(now.getMonth()+1).padStart(2,"0");
    return Object.keys(days).filter((k) => k.startsWith(pre)).length;
  })();
  const syncServer = async (st, mo, tot) => {
    const id = localStorage.getItem("bt-uid"); const pin = localStorage.getItem("bt-upin");
    if (!id || !pin) return;
    try {
      await fetch(`/api/track?action=save&id=${encodeURIComponent(id)}&pin=${encodeURIComponent(pin)}&streak=${st}&month=${mo}&total=${tot}`);
    } catch (e) {}
  };
  const doLogin = async () => {
    const id = idIn.trim(); const pin = pinIn.trim();
    if (!id || !pin) return;
    setLoginErr("");
    try {
      const r = await fetch(`/api/track?action=login&id=${encodeURIComponent(id)}&pin=${encodeURIComponent(pin)}`);
      if (r.status === 404) { setLoginErr("아이디를 찾을 수 없어요."); return; }
      if (r.status === 401) { setLoginErr("비밀번호가 올바르지 않아요."); return; }
      const j = await r.json();
      if (j.error) throw new Error(j.error);
      localStorage.setItem("bt-uid", j.id); localStorage.setItem("bt-upin", pin); localStorage.setItem("bt-uname", j.name);
      setUser({ id: j.id, pin, name: j.name });
      setIdIn(""); setPinIn("");
    } catch (e) { setLoginErr("로그인 실패. 잠시 후 다시 시도해주세요."); }
  };
  const doLogout = () => {
    localStorage.removeItem("bt-uid"); localStorage.removeItem("bt-upin"); localStorage.removeItem("bt-uname");
    setUser(null);
  };

  const search = async (query, codeOverride, mode) => {
    const term = (query ?? q).trim();
    if (!term) return;
    const m = mode || "read";
    setSearchMode(m);
    setQ(term); setView("search"); setLoading(true); setError(""); setResults([]);
    if (m === "read") setRecent((p) => [term, ...p.filter((x) => x !== term)].slice(0, 8));
    try {
      const ac = codeOverride ?? (localStorage.getItem("bt-code") || "");
      const r = await fetch("/api/youtube?q=" + encodeURIComponent(term) + (ac ? "&code=" + encodeURIComponent(ac) : "") + (m === "listen" ? "&mode=listen" : ""));
      if (r.status === 401) {
        setPendingQ(term); setLocked(true); setLoading(false);
        return;
      }
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
    <div style={{ fontFamily:FF, background:C.bg, minHeight:"100vh", position:"relative" }}>
      {/* 수채화 나뭇잎 모서리 배경 */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }} aria-hidden="true">
        {/* 왼쪽 위 나뭇잎 무리 */}
        <svg viewBox="0 0 240 240" style={{ position:"absolute", left:-40, top:-40, width:280, height:280, opacity:0.22 }}>
          <g stroke="#8FA678" strokeWidth="2" fill="none" opacity="0.5">
            <path d="M40 40 Q90 70 150 90 M40 40 Q70 90 90 150 M40 40 Q100 100 130 130"/>
          </g>
          <g fill="#A9BE92">
            <ellipse cx="150" cy="88" rx="26" ry="13" transform="rotate(25 150 88)"/>
            <ellipse cx="120" cy="70" rx="24" ry="12" transform="rotate(15 120 70)"/>
            <ellipse cx="90" cy="150" rx="26" ry="13" transform="rotate(65 90 150)"/>
            <ellipse cx="70" cy="120" rx="24" ry="12" transform="rotate(55 70 120)"/>
          </g>
          <g fill="#BCD0A6">
            <ellipse cx="175" cy="105" rx="22" ry="11" transform="rotate(30 175 105)"/>
            <ellipse cx="105" cy="175" rx="22" ry="11" transform="rotate(70 105 175)"/>
            <ellipse cx="135" cy="128" rx="24" ry="12" transform="rotate(45 135 128)"/>
          </g>
          <g fill="#8FA678" opacity="0.8">
            <ellipse cx="100" cy="50" rx="18" ry="9" transform="rotate(10 100 50)"/>
            <ellipse cx="50" cy="100" rx="18" ry="9" transform="rotate(75 50 100)"/>
          </g>
        </svg>
        {/* 오른쪽 위 작은 잎 */}
        <svg viewBox="0 0 160 140" style={{ position:"absolute", right:-30, top:-20, width:190, height:170, opacity:0.16 }}>
          <g stroke="#8FA678" strokeWidth="2" fill="none" opacity="0.5"><path d="M150 20 Q100 40 60 80 M150 20 Q120 70 100 110"/></g>
          <g fill="#A9BE92">
            <ellipse cx="120" cy="45" rx="22" ry="11" transform="rotate(-30 120 45)"/>
            <ellipse cx="95" cy="70" rx="22" ry="11" transform="rotate(-35 95 70)"/>
            <ellipse cx="110" cy="95" rx="20" ry="10" transform="rotate(-20 110 95)"/>
          </g>
          <g fill="#BCD0A6">
            <ellipse cx="140" cy="60" rx="18" ry="9" transform="rotate(25 140 60)"/>
            <ellipse cx="118" cy="82" rx="18" ry="9" transform="rotate(20 118 82)"/>
          </g>
        </svg>
        {/* 왼쪽 아래 잎 */}
        <svg viewBox="0 0 180 200" style={{ position:"absolute", left:-40, bottom:-40, width:210, height:230, opacity:0.15 }}>
          <g stroke="#8FA678" strokeWidth="2" fill="none" opacity="0.5"><path d="M30 180 Q70 120 120 80 M30 180 Q90 150 140 140"/></g>
          <g fill="#A9BE92">
            <ellipse cx="115" cy="82" rx="24" ry="12" transform="rotate(-40 115 82)"/>
            <ellipse cx="90" cy="115" rx="24" ry="12" transform="rotate(-50 90 115)"/>
            <ellipse cx="135" cy="135" rx="22" ry="11" transform="rotate(15 135 135)"/>
          </g>
          <g fill="#BCD0A6">
            <ellipse cx="70" cy="145" rx="22" ry="11" transform="rotate(-55 70 145)"/>
            <ellipse cx="110" cy="105" rx="20" ry="10" transform="rotate(-35 110 105)"/>
          </g>
        </svg>
        {/* 오른쪽 아래 화분 식물 */}
        <svg viewBox="0 0 160 200" style={{ position:"absolute", right:-20, bottom:-20, width:190, height:230, opacity:0.16 }}>
          <path d="M62 130 Q50 90 40 65 M80 130 L80 60 M98 130 Q110 90 120 68" stroke="#8FA678" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <g fill="#A9BE92">
            <ellipse cx="40" cy="62" rx="20" ry="10" transform="rotate(-55 40 62)"/>
            <ellipse cx="80" cy="55" rx="20" ry="10" transform="rotate(0 80 55)"/>
            <ellipse cx="120" cy="65" rx="20" ry="10" transform="rotate(55 120 65)"/>
          </g>
          <g fill="#BCD0A6">
            <ellipse cx="58" cy="80" rx="18" ry="9" transform="rotate(-35 58 80)"/>
            <ellipse cx="102" cy="82" rx="18" ry="9" transform="rotate(35 102 82)"/>
          </g>
          <path d="M52 130 L108 130 L100 175 Q80 182 60 175 Z" fill="#C9B18E" opacity="0.9"/>
          <rect x="48" y="124" width="64" height="12" rx="3" fill="#BBA079"/>
        </svg>
      </div>
      <div style={{ position:"relative", zIndex:1 }}>
      {/* 접속 코드 잠금 화면 */}
      {locked && (
        <div style={{ position:"fixed", inset:0, background:"rgba(37,43,35,0.85)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:C.paper, borderRadius:18, padding:"28px 24px", maxWidth:340, width:"100%", textAlign:"center", boxShadow:"0 10px 40px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize:36, marginBottom:10 }}>🔒</div>
            <div style={{ fontSize:16, fontWeight:800, color:C.text, marginBottom:6 }}>접속 코드를 입력하세요</div>
            <div style={{ fontSize:12, color:C.textMid, marginBottom:16, lineHeight:1.6 }}>이 앱은 코드를 아는 사람만 사용할 수 있어요.<br/>선생님께 코드를 확인해주세요.</div>
            <input value={codeIn} onChange={(e) => setCodeIn(e.target.value)} type="password"
              onKeyDown={(e) => { if (e.key === "Enter" && codeIn.trim()) { const c = codeIn.trim(); localStorage.setItem("bt-code", c); setLocked(false); setCodeIn(""); if (pendingQ) search(pendingQ, c, searchMode); } }}
              placeholder="접속 코드"
              style={{ width:"100%", padding:"12px 14px", border:`2px solid ${C.woodDark}`, borderRadius:10, fontSize:15, outline:"none", fontFamily:FF, textAlign:"center", marginBottom:10, background:"#FDFCF8", boxSizing:"border-box" }} />
            <button onClick={() => { if (!codeIn.trim()) return; const c = codeIn.trim(); localStorage.setItem("bt-code", c); setLocked(false); setCodeIn(""); if (pendingQ) search(pendingQ, c, searchMode); }}
              style={{ width:"100%", padding:"12px", background:C.woodDark, color:"#FDFCF4", border:"none", borderRadius:10, fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:FF }}>
              확인
            </button>
          </div>
        </div>
      )}

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
      <div style={{ background:`linear-gradient(160deg, #C7D8B4, #A9BE92)`, padding:"18px 20px 0" }}>
        <div style={{ maxWidth:860, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:12 }}>
            <Logo size={40} />
            <div>
              <div style={{ fontSize:19, fontWeight:900, color:"#455239", letterSpacing:"-0.3px" }}>북튜브</div>
              <div style={{ fontSize:11, color:"rgba(69,82,57,0.7)" }}>원서 제목을 검색하면 낭독 영상을 찾아줘요</div>
            </div>
            <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
              <button onClick={() => setView(view === "listen" ? "search" : "listen")}
                style={{ padding:"8px 13px", background:view==="listen" ? "#FFFFFF" : "rgba(255,255,255,0.5)", color:view==="listen" ? "#5E7049" : "#455239", border:"none", borderRadius:20, fontSize:12.5, fontWeight:700, cursor:"pointer", fontFamily:FF }}>
                🎧 흘려듣기
              </button>
              <button onClick={() => setView(view === "favs" ? "search" : "favs")}
                style={{ padding:"8px 13px", background:view==="favs" ? "#FFFFFF" : "rgba(255,255,255,0.5)", color:view==="favs" ? "#5E7049" : "#455239", border:"none", borderRadius:20, fontSize:12.5, fontWeight:700, cursor:"pointer", fontFamily:FF }}>
                📚 내 책꽂이 {favs.length > 0 && `(${favs.length})`}
              </button>
            </div>
          </div>
          {/* 검색창 */}
          <div style={{ display:"flex", gap:8, marginBottom:14 }}>
            <input value={q} onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="영어 원서 제목 입력 (예: Pete the Cat)"
              style={{ flex:1, padding:"13px 16px", border:`2px solid ${C.woodDark}`, borderRadius:12, fontSize:15, outline:"none", fontFamily:FF, background:"#FFFDF7", color:C.text, boxShadow:"inset 0 1px 3px rgba(60,68,58,0.12)" }} />
            <button onClick={() => search()} disabled={loading || !q.trim()}
              style={{ padding:"13px 22px", background:C.red, color:"#FDFCF4", border:`2px solid #6E8659`, borderRadius:12, fontSize:15, fontWeight:800, cursor:q.trim() ? "pointer" : "default", fontFamily:FF, boxShadow:"0 2px 0 #6E8659", opacity:q.trim() ? 1 : 0.65 }}>
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
      <div style={{ height:8, background:"#8AA073", boxShadow:"0 3px 6px rgba(60,68,58,0.3)" }} />

      <div style={{ maxWidth:860, margin:"0 auto", padding:"18px 20px 40px" }}>
        {view === "listen" ? (
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:4 }}>🎧 흘려듣기 코너</div>
            <div style={{ fontSize:12, color:C.textMid, marginBottom:14, lineHeight:1.7 }}>영어 소리에 자연스럽게 귀가 트이도록, 부담 없이 틀어두는 영상이에요.</div>

            {/* 매일 30분 기록 위젯 */}
            <div style={{ background:C.paper, border:`1.5px solid ${C.border}`, borderRadius:14, padding:"14px 16px", marginBottom:18, boxShadow:"3px 4px 0 rgba(107,124,96,0.1)" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <div>
                  <div style={{ fontSize:13.5, fontWeight:800, color:C.text }}>🌱 오늘의 흘려듣기 30분</div>
                  <div style={{ fontSize:11, color:C.textMuted, marginTop:2 }}>
                    {streak > 0 ? `🔥 ${streak}일 연속 듣는 중!` : "오늘부터 시작해볼까요?"} · 이번 달 {monthCount}일
                  </div>
                </div>
                {user ? (
                  <button onClick={toggleToday}
                    style={{ padding:"9px 15px", background:doneToday ? C.woodDark : C.paper, color:doneToday ? "#FDFCF4" : C.wood, border:`1.5px solid ${C.woodDark}`, borderRadius:20, fontSize:12.5, fontWeight:800, cursor:"pointer", fontFamily:FF, whiteSpace:"nowrap" }}>
                    {doneToday ? "✅ 완료!" : "듣기 완료"}
                  </button>
                ) : null}
              </div>
              {!user && (
                <div style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", gap:6, marginBottom:6 }}>
                    <input value={idIn} onChange={(e) => setIdIn(e.target.value)} placeholder="아이디 (예: bt1234)"
                      style={{ flex:1, padding:"9px 12px", border:`1.5px solid ${C.border}`, borderRadius:9, fontSize:12.5, outline:"none", fontFamily:FF, background:C.bg }} />
                    <input value={pinIn} onChange={(e) => setPinIn(e.target.value.replace(/\D/g,"").slice(0,4))} type="password" inputMode="numeric" placeholder="비번4자리"
                      onKeyDown={(e) => { if (e.key === "Enter") doLogin(); }}
                      style={{ width:90, padding:"9px 12px", border:`1.5px solid ${C.border}`, borderRadius:9, fontSize:12.5, outline:"none", fontFamily:FF, background:C.bg, textAlign:"center" }} />
                    <button onClick={doLogin}
                      style={{ padding:"9px 14px", background:C.woodDark, color:"#FDFCF4", border:"none", borderRadius:9, fontSize:12.5, fontWeight:700, cursor:"pointer", fontFamily:FF }}>로그인</button>
                  </div>
                  {loginErr && <div style={{ fontSize:11, color:C.warn }}>{loginErr}</div>}
                  {!loginErr && <div style={{ fontSize:10.5, color:C.textMuted }}>선생님께 받은 아이디와 비밀번호로 로그인하세요.</div>}
                </div>
              )}
              {user && (
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <span style={{ fontSize:11, color:C.textMuted }}>👤 {user.name} · 기록이 저장돼요</span>
                  <button onClick={doLogout} style={{ fontSize:10.5, color:C.textMuted, background:"none", border:"none", cursor:"pointer", textDecoration:"underline", fontFamily:FF }}>로그아웃</button>
                </div>
              )}
              {/* 최근 14일 도장 */}
              <div style={{ display:"flex", gap:4, justifyContent:"space-between" }}>
                {Array.from({ length: 14 }).map((_, i) => {
                  const d = new Date(); d.setDate(d.getDate() - (13 - i));
                  const k = d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
                  const on = !!days[k]; const isToday = i === 13;
                  return (
                    <div key={i} style={{ flex:1, textAlign:"center" }}>
                      <div style={{ aspectRatio:"1", borderRadius:8, background:on ? "#EDF0E6" : C.bg, border:`1.5px solid ${isToday ? C.woodDark : on ? "#A8B5A0" : C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>
                        {on ? "🌱" : ""}
                      </div>
                      <div style={{ fontSize:8.5, color:C.textMuted, marginTop:3 }}>{d.getDate()}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ fontSize:12, color:C.textMid, marginBottom:16, lineHeight:1.7 }}>제목을 누르면 에피소드 영상을 찾아드려요.</div>
            {LISTEN.map((lv) => (
              <div key={lv.level} style={{ marginBottom:18 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <span style={{ width:10, height:10, borderRadius:3, background:lv.color, display:"inline-block" }} />
                  <span style={{ fontSize:13.5, fontWeight:800, color:C.text }}>{lv.level}</span>
                </div>
                <div style={{ fontSize:11.5, color:C.textMuted, marginBottom:8, paddingLeft:18 }}>{lv.desc}</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:7, paddingLeft:18 }}>
                  {lv.shows.map((sh) => (
                    <button key={sh} onClick={() => search(sh, undefined, "listen")}
                      style={{ padding:"8px 14px 8px 11px", borderRadius:"3px 9px 9px 3px", border:`1px solid ${C.border}`, borderLeft:`5px solid ${lv.color}`, background:C.paper, color:C.text, fontSize:12.5, fontWeight:600, cursor:"pointer", fontFamily:FF, boxShadow:"2px 2px 0 rgba(107,124,96,0.12)" }}>
                      📺 {sh}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ marginTop:24, paddingTop:18, borderTop:`1.5px dashed ${C.borderStrong}` }}>
              <div style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:4 }}>🌍 지식·교양 채널</div>
              <div style={{ fontSize:12, color:C.textMid, marginBottom:14, lineHeight:1.7 }}>귀가 트인 고학년·중학생에게 추천해요. 영어로 지식까지 넓히는 채널들이에요.</div>
              {KNOWLEDGE.map((kg) => (
                <div key={kg.cat} style={{ marginBottom:14 }}>
                  <div style={{ fontSize:13, fontWeight:800, color:C.text, marginBottom:7 }}>{kg.cat}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                    {kg.items.map((it) => (
                      <button key={it} onClick={() => search(it, undefined, "ch")}
                        style={{ padding:"8px 14px 8px 11px", borderRadius:"3px 9px 9px 3px", border:`1px solid ${C.border}`, borderLeft:`5px solid ${kg.color}`, background:C.paper, color:C.text, fontSize:12.5, fontWeight:600, cursor:"pointer", fontFamily:FF, boxShadow:"2px 2px 0 rgba(107,124,96,0.12)" }}>
                        {it}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:24, paddingTop:18, borderTop:`1.5px dashed ${C.borderStrong}` }}>
              <div style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:4 }}>📕 교재 학습 영상</div>
              <div style={{ fontSize:12, color:C.textMid, marginBottom:14, lineHeight:1.7 }}>집에서 교재로 공부할 때 함께 보면 좋은 음원·강의 영상이에요. 교재 이름을 누르면 찾아드려요.</div>
              {TEXTBOOK.map((tb) => (
                <div key={tb.cat} style={{ marginBottom:14 }}>
                  <div style={{ fontSize:13, fontWeight:800, color:C.text, marginBottom:7 }}>{tb.cat}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                    {tb.items.map((it) => (
                      <button key={it} onClick={() => search(it, undefined, "ch")}
                        style={{ padding:"8px 14px 8px 11px", borderRadius:"3px 9px 9px 3px", border:`1px solid ${C.border}`, borderLeft:`5px solid ${tb.color}`, background:C.paper, color:C.text, fontSize:12.5, fontWeight:600, cursor:"pointer", fontFamily:FF, boxShadow:"2px 2px 0 rgba(107,124,96,0.12)" }}>
                        {it}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background:C.paper, border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 14px", fontSize:11.5, color:C.textMid, lineHeight:1.7 }}>
              💡 <b>흘려듣기 팁</b> — 해석해주지 않아도 괜찮아요. 하루 20~30분, 아이가 놀거나 쉬는 동안 배경처럼 틀어두면 충분해요. 재미있어하는 시리즈를 반복하는 게 가장 효과적이에요.
            </div>
          </div>
        ) : view === "favs" ? (
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
                  <b style={{ color:C.wood }}>"{q}"</b> {searchMode === "listen" ? `📺 흘려듣기 영상 ${results.length}편` : searchMode === "ch" ? `📺 추천 영상 ${results.length}편` : `🎧 낭독 영상 ${results.length}권`}
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
    </div>
  );
}
