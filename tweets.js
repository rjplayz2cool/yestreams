/* Tweets tab: Ye's full Twitter/X archive (5,900+ posts, 2010-2026) styled like X, with sorting, filters and search.
   Data: data/tweets.txt = base64(gzip(JSON array)), loaded lazily on first visit. Archive source: yzy-twts.com. */
(()=>{
const pg=document.getElementById('pg-tweets'),root=document.getElementById('twScreen');if(!pg||!root)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const AV='https://pbs.twimg.com/profile_images/2070188288367902720/bGVHntzg_400x400.png';
const SORTS=[['new','Newest'],['old','Oldest'],['likes','Most liked'],['rts','Most retweeted'],['replies','Most replies'],['views','Most views']];
const FILTERS=[['all','All'],['posts','Posts'],['replies','Replies'],['media','Media'],['quotes','Quotes'],['polls','Polls'],['bangers','Bangers']];
const PAGE=40;
let ALL=null,view=[],shown=0,st={sort:'new',filter:'all',year:'all',q:''},loading=null;
const nf=n=>{n=+n||0;if(n>=1e6)return(n/1e6).toFixed(n>=1e7?0:1).replace(/\.0$/,'')+'M';if(n>=1e4)return Math.round(n/1e3)+'K';if(n>=1e3)return(n/1e3).toFixed(1).replace(/\.0$/,'')+'K';return String(n)};
const fmt=iso=>new Date(iso).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
const fmtT=iso=>new Date(iso).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',timeZone:'UTC'});
const https=u=>String(u||'').replace(/^http:\/\//,'https://');
const st0=document.createElement('style');st0.textContent=`
.twScreen{max-width:640px;margin:0 auto;padding:84px 0 100px;color:#e7e9ea}
.twHead{padding:0 16px}
.twScreen .eyebrow{color:var(--accent2);font-weight:800;letter-spacing:.18em;font-size:12px}
.twScreen h1.title{font-size:clamp(34px,6vw,56px);font-weight:900;letter-spacing:-.05em;margin:4px 0}
.twProf{display:flex;gap:14px;align-items:center;padding:14px 16px;border:1px solid #2f3336;border-radius:16px;margin:14px 16px;background:#000a}
.twProf img{width:64px;height:64px;border-radius:50%;object-fit:cover;background:#222}
.twProf b{display:flex;align-items:center;gap:4px;font-size:19px}
.twProf small{color:#71767b;display:block;font-size:14px}
.twTools{position:sticky;top:64px;z-index:5;background:#000d;backdrop-filter:blur(10px);padding:10px 16px;border-block:1px solid #2f3336;display:flex;flex-direction:column;gap:10px}
.twRow{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.twTools input,.twTools select{background:#16181c;border:1px solid #2f3336;color:#e7e9ea;border-radius:999px;padding:9px 14px;font:500 14px system-ui,sans-serif;min-width:0;outline:0}
.twTools input{flex:1 1 180px}.twTools input:focus,.twTools select:focus{border-color:#1d9bf0}
.twTools select{cursor:pointer}
.twChips{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none}
.twChips::-webkit-scrollbar{display:none}
.twChips button{flex:none;border:1px solid #2f3336;background:none;color:#e7e9ea;border-radius:999px;padding:6px 13px;font:600 13px system-ui,sans-serif;cursor:pointer}
.twChips button.on{background:#e7e9ea;color:#000;border-color:#e7e9ea}
.twCount{color:#71767b;font-size:13px;padding:10px 16px}
.tw{display:flex;gap:12px;padding:12px 16px;border-bottom:1px solid #2f3336;animation:twIn .35s both}
.tw:hover{background:#ffffff08}
@keyframes twIn{from{opacity:0;transform:translateY(8px)}}
.tw>img.av{width:40px;height:40px;border-radius:50%;flex:none;background:#222;object-fit:cover}
.twB{min-width:0;flex:1}
.twTop{display:flex;gap:4px;align-items:center;font-size:15px;flex-wrap:wrap}
.twTop b{color:#e7e9ea}.twTop span,.twTop a{color:#71767b;text-decoration:none}
.twTop a:hover{text-decoration:underline}
.twV{width:18px;height:18px;flex:none}
.twRep{color:#71767b;font-size:14px;margin:2px 0}
.twRep em{color:#1d9bf0;font-style:normal}
.twTx{font-size:15px;line-height:1.35;white-space:pre-wrap;overflow-wrap:anywhere;margin:2px 0 8px}
.twTx a,.twTx i{color:#1d9bf0;text-decoration:none;font-style:normal}
.twTx a:hover{text-decoration:underline}
.twMedia{display:grid;gap:2px;border-radius:16px;overflow:hidden;border:1px solid #2f3336;margin:4px 0 8px;max-height:520px}
.twMedia.n1{grid-template-columns:1fr}.twMedia.n2,.twMedia.n4{grid-template-columns:1fr 1fr}.twMedia.n3{grid-template-columns:1fr 1fr}
.twMedia.n3>*:first-child{grid-row:span 2}
.twMedia img,.twMedia video{width:100%;height:100%;object-fit:cover;display:block;background:#111;max-height:520px}
.twMedia.n1 img,.twMedia.n1 video{object-fit:contain}
.twMedia a{display:block;position:relative;min-height:0}
.twPlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:38px;color:#fff;text-shadow:0 2px 10px #000;pointer-events:none}
.twEmbT{position:absolute;left:0;right:0;bottom:0;padding:18px 10px 8px;background:linear-gradient(transparent,#000c);font-size:13px;color:#fff}
.twQ{border:1px solid #2f3336;border-radius:16px;padding:10px 12px;margin:4px 0 8px}
.twQ .twTop{font-size:14px}.twQ .twTx{font-size:14px;margin-bottom:4px}
.twPoll{display:flex;flex-direction:column;gap:6px;margin:4px 0 8px}
.twPoll div{position:relative;border-radius:6px;background:#16181c;overflow:hidden;padding:8px 10px;display:flex;justify-content:space-between;font-size:14px}
.twPoll div::before{content:"";position:absolute;inset:0;width:var(--w);background:#1d9bf033}
.twPoll div>*{position:relative}
.twPoll small{color:#71767b}
.twAct{display:flex;gap:6px 22px;flex-wrap:wrap;color:#71767b;font-size:13px;margin-top:2px}
.twAct span{display:flex;align-items:center;gap:5px}
.twAct svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.8}
.twAct .rt{color:#00ba7c}.twAct .lk{color:#f91880}
.twBang{color:#ffd400;font-size:12px;font-weight:700;letter-spacing:.04em}
.twMore{display:block;margin:18px auto;border:1px solid #2f3336;background:#16181c;color:#e7e9ea;border-radius:999px;padding:11px 26px;font:700 14px system-ui,sans-serif;cursor:pointer}
.twMore:hover{background:#22262b}
.twEmpty{padding:60px 16px;text-align:center;color:#71767b}
@media(max-width:700px){.twScreen{padding-top:76px}.twTools{top:56px}}
@media(prefers-reduced-motion:reduce){.tw{animation:none}}
`;document.head.appendChild(st0);
const VER='<svg class="twV" viewBox="0 0 22 22"><path fill="#f1c40f" d="M20.4 11l-1.6-1.9.2-2.5-2.5-.6-1.3-2.2-2.3 1-2.3-1-1.3 2.2-2.5.6.2 2.5L3.4 11l1.7 1.9-.2 2.5 2.5.6 1.3 2.2 2.3-1 2.3 1 1.3-2.2 2.5-.6-.2-2.5z"/><path fill="#000" d="M9.7 14.7l-2.6-2.6 1-1 1.6 1.6 4.2-4.2 1 1z"/></svg>';
const IC={rep:'<svg viewBox="0 0 24 24"><path d="M1.75 10.5c0-4.7 3.8-8.5 8.5-8.5h3.5c4.7 0 8.5 3.8 8.5 8.5 0 3.9-2.7 7.2-6.3 8.2L12 22.5v-3.8h-1.75c-4.7 0-8.5-3.8-8.5-8.2z"/></svg>',rt:'<svg viewBox="0 0 24 24"><path d="M4.5 3.9l4 4m-4-4l-4 4m4-4v11.6c0 2.2 1.8 4 4 4h5m6-.9l-4-4m4 4l4-4m-4 4V8.6c0-2.2-1.8-4-4-4h-5"/></svg>',lk:'<svg viewBox="0 0 24 24"><path d="M12 21c-5.5-4.2-9-7.4-9-11.2C3 6.6 5.2 4.5 7.8 4.5c1.6 0 3.2.9 4.2 2.4 1-1.5 2.6-2.4 4.2-2.4 2.6 0 4.8 2.1 4.8 5.3 0 3.8-3.5 7-9 11.2z"/></svg>',vw:'<svg viewBox="0 0 24 24"><path d="M3 20V10m6 10V4m6 16v-8m6 8V8"/></svg>'};
function body(t,media){
  let s=String(t||'');
  if(media&&media.length)s=s.replace(/\s*https?:\/\/pic\.(?:x|twitter)\.com\/\S+/g,'');
  s=s.replace(/\s+$/,'');
  return esc(s).replace(/(https?:\/\/[^\s<]+)/g,(u)=>{const clean=u.replace(/[.,;:!?)]+$/,''),tail=u.slice(clean.length);const lab=clean.replace(/^https?:\/\/(www\.)?/,'');return`<a href="${clean}" target="_blank" rel="noopener noreferrer">${lab.length>38?lab.slice(0,37)+'…':lab}</a>${tail}`})
   .replace(/(^|[\s(])(@\w{1,15}|#\w+)/g,(m,a,b)=>a+'<i>'+b+'</i>');
}
function mediaHTML(ms){
  if(!ms||!ms.length)return'';
  const items=ms.slice(0,4).map(m=>{
    const img=https(m.image_url),bk=m.image_url_backup?` onerror="if(!this.dataset.b){this.dataset.b=1;this.src='${esc(m.image_url_backup)}'}else{this.style.display='none'}"`:` onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 40 40%27%3E%3Crect width=%2740%27 height=%2740%27 fill=%27%23222%27/%3E%3Ctext x=%2720%27 y=%2726%27 font-size=%2716%27 font-weight=%27800%27 fill=%27%23fff%27 text-anchor=%27middle%27 font-family=%27Arial%27%3Eye%3C/text%3E%3C/svg%3E'"`;
    if(m.type==='embed')return`<a href="${esc(m.video_url)}" target="_blank" rel="noopener noreferrer"><img src="${esc(img)}" loading="lazy" alt=""${bk}><span class="twPlay">▶</span>${m.title?`<span class="twEmbT">${esc(m.title)}</span>`:''}</a>`;
    if(m.video_url)return`<video controls preload="none" playsinline poster="${esc(img)}" src="${esc(https(m.video_url))}"></video>`;
    return`<a href="${esc(https(m.image_url))}" target="_blank" rel="noopener noreferrer"><img src="${esc(img)}" loading="lazy" alt=""${bk}></a>`;
  }).join('');
  return`<div class="twMedia n${Math.min(ms.length,4)}">${items}</div>`;
}
function pollHTML(p){
  if(!p)return'';
  return`<div class="twPoll">${p.choices.map(c=>`<div style="--w:${c.percentage||0}%"><span>${esc(c.label)}</span><span>${c.percentage||0}%</span></div>`).join('')}<small>${nf(p.total_votes)} votes</small></div>`;
}
function quoteHTML(q){
  if(!q)return'';
  return`<div class="twQ"><div class="twTop"><b>${esc(q.full_name||q.username)}</b><span>@${esc(q.username)}</span><span>· ${fmt(q.created_at)}</span></div><div class="twTx">${body(q.text,q.media)}</div>${mediaHTML(q.media)}</div>`;
}
function card(t,i){
  const rep=t.in_reply_to_username&&t.in_reply_to_username.length?`<div class="twRep">Replying to <em>${t.in_reply_to_username.map(u=>'@'+esc(u)).join(' ')}</em></div>`:'';
  const href=`https://${t.created_at>='2024'?'x.com':'twitter.com'}/kanyewest/status/${t.id}`;
  return`<article class="tw" style="animation-delay:${Math.min(i%PAGE,12)*18}ms"><img class="av" src="${AV}" alt="" loading="lazy" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 40 40%27%3E%3Crect width=%2740%27 height=%2740%27 fill=%27%23222%27/%3E%3Ctext x=%2720%27 y=%2726%27 font-size=%2716%27 font-weight=%27800%27 fill=%27%23fff%27 text-anchor=%27middle%27 font-family=%27Arial%27%3Eye%3C/text%3E%3C/svg%3E'">
  <div class="twB"><div class="twTop"><b>ye</b>${VER}<span>@kanyewest</span><span>·</span><a href="${href}" target="_blank" rel="noopener noreferrer" title="${fmt(t.created_at)} ${fmtT(t.created_at)} UTC">${fmt(t.created_at)}</a>${t.banger?'<span class="twBang">★ BANGER</span>':''}</div>
  ${rep}${t.text&&body(t.text,t.media)?`<div class="twTx">${body(t.text,t.media)}</div>`:''}${mediaHTML(t.media)}${pollHTML(t.poll)}${quoteHTML(t.quote)}
  <div class="twAct"><span title="Replies">${IC.rep}${nf(t.replies)}</span><span class="rt" title="Retweets">${IC.rt}${nf(t.retweets)}</span><span class="lk" title="Likes">${IC.lk}${nf(t.likes)}</span>${t.views?`<span title="Views">${IC.vw}${nf(t.views)}</span>`:''}</div></div></article>`;
}
const SORT={new:(a,b)=>b.created_at<a.created_at?-1:1,old:(a,b)=>a.created_at<b.created_at?-1:1,likes:(a,b)=>(b.likes||0)-(a.likes||0),rts:(a,b)=>(b.retweets||0)-(a.retweets||0),replies:(a,b)=>(b.replies||0)-(a.replies||0),views:(a,b)=>(b.views||0)-(a.views||0)};
const FIL={all:()=>true,posts:t=>!t.in_reply_to_id,replies:t=>!!t.in_reply_to_id,media:t=>!!(t.media&&t.media.length),quotes:t=>!!t.quote,polls:t=>!!t.poll,bangers:t=>!!t.banger};
function compute(){
  const q=st.q.trim().toLowerCase();
  view=ALL.filter(t=>FIL[st.filter](t)&&(st.year==='all'||t.created_at.slice(0,4)===st.year)&&(!q||(t.text||'').toLowerCase().includes(q)||(t.quote&&(t.quote.text||'').toLowerCase().includes(q)))).sort(SORT[st.sort]);
  shown=0;
}
function more(){
  const list=document.getElementById('twList'),btn=document.getElementById('twMore'),cnt=document.getElementById('twCount');if(!list)return;
  const next=view.slice(shown,shown+PAGE);list.insertAdjacentHTML('beforeend',next.map((t,i)=>card(t,i)).join(''));shown+=next.length;
  if(btn)btn.hidden=shown>=view.length;
  if(cnt)cnt.textContent=view.length?`${view.length.toLocaleString()} post${view.length===1?'':'s'}`:'';
  if(!view.length)list.innerHTML='<div class="twEmpty">No posts match.</div>';
}
function refresh(){const list=document.getElementById('twList');if(!list)return;compute();list.innerHTML='';more()}
function shell(){
  const years=[...new Set(ALL.map(t=>t.created_at.slice(0,4)))].sort().reverse();
  root.innerHTML=`<div class="twHead"><div class="eyebrow">ARCHIVE</div><h1 class="title">Tweets</h1></div>
  <div class="twProf"><img src="${AV}" alt="" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 40 40%27%3E%3Crect width=%2740%27 height=%2740%27 fill=%27%23222%27/%3E%3Ctext x=%2720%27 y=%2726%27 font-size=%2716%27 font-weight=%27800%27 fill=%27%23fff%27 text-anchor=%27middle%27 font-family=%27Arial%27%3Eye%3C/text%3E%3C/svg%3E'"><div><b>ye ${VER}</b><small>@kanyewest · ${ALL.length.toLocaleString()} archived posts · ${years[years.length-1]}–${years[0]}</small></div></div>
  <div class="twTools"><div class="twRow"><input id="twQ" type="search" placeholder="Search tweets" aria-label="Search tweets"><select id="twSort" aria-label="Sort">${SORTS.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select><select id="twYear" aria-label="Year"><option value="all">All years</option>${years.map(y=>`<option>${y}</option>`).join('')}</select></div>
  <div class="twChips" id="twChips">${FILTERS.map(([v,l])=>`<button type="button" data-f="${v}"${v==='all'?' class="on"':''}>${l}</button>`).join('')}</div></div>
  <div class="twCount" id="twCount"></div><div id="twList"></div><button class="twMore" id="twMore" type="button">Show more</button>`;
  let tm;document.getElementById('twQ').oninput=e=>{clearTimeout(tm);tm=setTimeout(()=>{st.q=e.target.value;refresh()},180)};
  document.getElementById('twSort').onchange=e=>{st.sort=e.target.value;refresh()};
  document.getElementById('twYear').onchange=e=>{st.year=e.target.value;refresh()};
  document.getElementById('twChips').onclick=e=>{const b=e.target.closest('button[data-f]');if(!b)return;st.filter=b.dataset.f;document.querySelectorAll('#twChips button').forEach(x=>x.classList.toggle('on',x===b));refresh()};
  document.getElementById('twMore').onclick=more;
  const io=new IntersectionObserver(es=>{if(es[0].isIntersecting&&shown<view.length&&shown>0)more()},{rootMargin:'600px'});io.observe(document.getElementById('twMore'));
  refresh();
}
async function load(){
  if(ALL)return;
  if(!loading)loading=(async()=>{
    const b64=await fetch('data/tweets.txt').then(r=>{if(!r.ok)throw new Error(r.status);return r.text()});
    const bin=Uint8Array.from(atob(b64.trim()),c=>c.charCodeAt(0));
    const txt=await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
    ALL=JSON.parse(txt);
  })();
  await loading;
}
async function show(){
  root.classList.add('activeScreen');
  if(ALL){if(!document.getElementById('twList'))shell();return}
  root.innerHTML='<div class="twHead"><div class="eyebrow">ARCHIVE</div><h1 class="title">Tweets</h1><p style="color:#71767b">Loading the archive…</p></div>';
  try{await load();shell()}catch(e){loading=null;root.innerHTML='<div class="twHead"><div class="eyebrow">ARCHIVE</div><h1 class="title">Tweets</h1><p style="color:#ff6a70">Couldn’t load the archive. Reload and try again.</p></div>'}
}
window.Tweets={get data(){return ALL}};
window.PH=window.PH||{};
PH.tweets={show,hide(){root.classList.remove('activeScreen')}};
})();
