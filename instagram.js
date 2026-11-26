/* Instagram tab: Ye's archived Instagram (993 posts, 2016-2026) as a profile grid with a post viewer.
   Data: data/instagram.txt = base64(gzip(manifest JSON)). */
(()=>{
const pg=document.getElementById('pg-instagram'),root=document.getElementById('igScreen');if(!pg||!root)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PFP='assets/ye-white-pfp.jpg';
const FB="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 40 40%27%3E%3Crect width=%2740%27 height=%2740%27 fill=%27%23222%27/%3E%3Ctext x=%2720%27 y=%2726%27 font-size=%2716%27 font-weight=%27800%27 fill=%27%23fff%27 text-anchor=%27middle%27 font-family=%27Arial%27%3Eye%3C/text%3E%3C/svg%3E";
const FILTERS=[['all','All'],['image','Photos'],['video','Videos'],['carousel','Carousels']];
const PAGE=60,VID=/\.(mp4|webm|mov)$/i,COV=/_cover\.(jpg|jpeg|png)$/i;
let MAN=null,POSTS=[],view=[],shown=0,st={sort:'new',filter:'all',year:'all',q:''},loading=null,cur=null,ci=0;
const mu=p=>MAN.media_root.replace(/\/$/,'')+'/'+String(p).replace(/^yzynsta\//,'');
const fmt=d=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(d||'');return m?new Date(+m[1],+m[2]-1,+m[3]).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}):''};
const st0=document.createElement('style');st0.textContent=`
.igScreen{max-width:935px;margin:0 auto;padding:84px 18px 100px;color:#f5f5f5}
.igScreen .eyebrow{color:var(--accent2);font-weight:800;letter-spacing:.18em;font-size:12px}
.igScreen h1.title{font-size:clamp(34px,6vw,56px);font-weight:900;letter-spacing:-.05em;margin:4px 0 18px}
.igProf{display:flex;gap:clamp(18px,5vw,64px);align-items:center;margin-bottom:22px}
.igProf img{width:clamp(78px,18vw,150px);aspect-ratio:1;border-radius:50%;object-fit:cover;background:#fff;flex:none;box-shadow:0 0 0 3px #000,0 0 0 4px #363636}
.igProf h2{margin:0;font-size:20px;font-weight:500;display:flex;gap:8px;align-items:center}
.igStats{display:flex;gap:clamp(14px,4vw,36px);margin:14px 0;font-size:15px;flex-wrap:wrap}
.igStats b{font-weight:700}
.igBio{font-size:14px;line-height:1.4;color:#d8d8d8}
.igTools{padding:6px 0 10px;display:flex;flex-direction:column;gap:10px}
.igRow{display:flex;gap:8px;flex-wrap:wrap}
.igTools input,.igTools select{background:#1a1a1a;border:1px solid transparent;color:#f5f5f5;border-radius:10px;padding:9px 13px;font:500 14px system-ui,sans-serif;min-width:0;outline:0}
.igTools input{flex:1 1 180px}.igTools input:focus,.igTools select:focus{border-color:#8e8e8e}
.igChips{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none}.igChips::-webkit-scrollbar{display:none}
.igChips button{flex:none;border:0;background:#1a1a1a;color:#f5f5f5;border-radius:999px;padding:6px 13px;font:600 13px system-ui,sans-serif;cursor:pointer}
.igChips button.on{background:#f5f5f5;color:#000;border-color:#f5f5f5}
.igCount{color:#a8a8a8;font-size:13px;padding:10px 0;scroll-margin-top:90px}
.igGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:3px}
.igCell{position:relative;aspect-ratio:1;background:#161616;border:0;padding:0;cursor:pointer;overflow:hidden;display:block;animation:igIn .35s both}
@keyframes igIn{from{opacity:0}}
.igCell img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s}
.igCell:hover img{transform:scale(1.04)}
.igCell::after{content:"";position:absolute;inset:0;background:#0000;transition:background .2s}
.igCell:hover::after{background:#0005}
.igCell .cap{position:absolute;left:8px;right:8px;bottom:8px;font-size:12px;font-weight:600;color:#fff;opacity:0;transition:opacity .2s;z-index:2;text-shadow:0 1px 4px #000;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.igCell:hover .cap{opacity:1}
.igBadge{position:absolute;top:8px;right:8px;z-index:2;color:#fff;filter:drop-shadow(0 1px 3px #000);font-size:18px;line-height:1}
.igMore{display:block;margin:20px auto;border:0;background:#1a1a1a;color:#f5f5f5;border-radius:999px;padding:11px 26px;font:700 14px system-ui,sans-serif;cursor:pointer}
.igEmpty{padding:60px 0;text-align:center;color:#a8a8a8;grid-column:1/-1}
.igLb{position:fixed;inset:0;z-index:300;background:#000e;display:flex;align-items:center;justify-content:center;padding:18px;animation:igIn .2s both}
.igLb[hidden]{display:none}
.igBox{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(260px,1fr);width:min(1100px,100%);max-height:calc(100dvh - 36px);background:#121212;border-radius:12px;overflow:hidden}
.igMed{position:relative;background:#000;display:flex;align-items:center;justify-content:center;min-height:300px;max-height:calc(100dvh - 38px)}
.igMed img,.igMed video{max-width:100%;max-height:calc(100dvh - 38px);display:block;object-fit:contain}
.igNav{position:absolute;top:50%;transform:translateY(-50%);width:34px;height:34px;border-radius:50%;border:0;background:#fffc;color:#000;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center}
.igNav.p{left:10px}.igNav.n{right:10px}.igNav[hidden]{display:none}
.igDots{position:absolute;bottom:10px;left:0;right:0;display:flex;gap:5px;justify-content:center}
.igDots i{width:6px;height:6px;border-radius:50%;background:#fff6}.igDots i.on{background:#fff}
.igSide{padding:16px;overflow-y:auto;display:flex;flex-direction:column;gap:12px}
.igSide .who{display:flex;gap:10px;align-items:center;font-weight:700}
.igSide .who img{width:32px;height:32px;border-radius:50%;object-fit:cover}
.igSide .capt{font-size:15px;line-height:1.4;white-space:pre-wrap;overflow-wrap:anywhere}
.igSide small{color:#a8a8a8}
.igSide a.ol{color:#6bd0ff;text-decoration:none;font-size:14px}
.igSide .alt{font-size:13px;color:#a8a8a8;border-left:2px solid #363636;padding-left:10px}
.igX{position:absolute;top:12px;right:16px;z-index:2;border:0;background:none;color:#fff;font-size:30px;cursor:pointer}
.igPN{display:flex;gap:8px;margin-top:auto}
.igPN button{flex:1;border:0;background:#1a1a1a;color:#f5f5f5;border-radius:8px;padding:9px;cursor:pointer;font:600 13px system-ui,sans-serif}
@media(max-width:760px){.igBox{grid-template-columns:1fr;overflow-y:auto}.igMed{max-height:60dvh;min-height:200px}.igMed img,.igMed video{max-height:60dvh}.igScreen{padding-top:76px}}
@media(prefers-reduced-motion:reduce){.igCell,.igLb{animation:none}}
`;document.head.appendChild(st0);
const mk=r=>{
  const hasVid=r.files.some(p=>VID.test(p));
  const src=r.files.filter(p=>!COV.test(p)&&!(hasVid&&p===r.grid_thumbnail));
  const files=src.length?src:r.files.filter(p=>COV.test(p));
  const media=files.map(p=>({v:VID.test(p),u:mu(p)}));
  const cover=r.grid_thumbnail?mu(r.grid_thumbnail):(r.files.find(p=>COV.test(p))?mu(r.files.find(p=>COV.test(p))):(media.find(m=>!m.v)||{}).u);
  return{...r,media,cover,cap:(r.mediacaption||'').trim()};
};
function cell(p,i){
  const badge=p.type==='video'?'▶':p.media.length>1?'❐':'';
  return`<button class="igCell" type="button" data-i="${i}" style="animation-delay:${(i%12)*15}ms">${p.cover?`<img src="${esc(p.cover)}" loading="lazy" alt="${esc(p.alt||p.cap)}" onerror="this.style.display='none'">`:''}${badge?`<span class="igBadge">${badge}</span>`:''}${p.cap?`<span class="cap">${esc(p.cap)}</span>`:''}</button>`;
}
const FIL={all:()=>true,image:p=>p.type==='image',video:p=>p.type==='video',carousel:p=>p.type==='carousel'};
function compute(){
  const q=st.q.trim().toLowerCase();
  view=POSTS.filter(p=>FIL[st.filter](p)&&(st.year==='all'||p.caption_date.slice(0,4)===st.year)&&(!q||p.cap.toLowerCase().includes(q)||(p.alt||'').toLowerCase().includes(q)));
  view=view.slice().sort((a,b)=>st.sort==='old'?(a.caption_date<b.caption_date?-1:a.caption_date>b.caption_date?1:a.ord-b.ord):(a.caption_date<b.caption_date?1:a.caption_date>b.caption_date?-1:b.ord-a.ord));
  shown=0;
}
function more(){
  const g=document.getElementById('igGrid'),b=document.getElementById('igMore'),c=document.getElementById('igCount');if(!g)return;
  const next=view.slice(shown,shown+PAGE);g.insertAdjacentHTML('beforeend',next.map((p,i)=>cell(p,shown+i)).join(''));shown+=next.length;
  if(b)b.hidden=shown>=view.length;
  if(c)c.textContent=`${view.length.toLocaleString()} post${view.length===1?'':'s'}`;
  if(!view.length)g.innerHTML='<div class="igEmpty">No posts match.</div>';
}
function refresh(){const g=document.getElementById('igGrid');if(!g)return;compute();g.innerHTML='';more()}
function lb(){return document.getElementById('igLb')}
function openPost(i){cur=view[i];ci=0;paint();lb().hidden=false;document.body.style.overflow='hidden'}
function closeLb(){const l=lb();if(!l)return;l.hidden=true;document.body.style.overflow='';l.querySelectorAll('video').forEach(v=>v.pause());cur=null}
function paint(){
  const p=cur,m=p.media[ci],box=document.getElementById('igMed'),n=p.media.length;
  box.innerHTML=(m?(m.v?`<video controls autoplay playsinline src="${esc(m.u)}" poster="${esc(p.cover||'')}"></video>`:`<img src="${esc(m.u)}" alt="${esc(p.alt||p.cap)}">`):'')
   +`<button class="igNav p" type="button" ${ci?'':'hidden'} aria-label="Previous">‹</button><button class="igNav n" type="button" ${ci<n-1?'':'hidden'} aria-label="Next">›</button>`
   +(n>1?`<div class="igDots">${p.media.map((_,k)=>`<i class="${k===ci?'on':''}"></i>`).join('')}</div>`:'');
  const idx=view.indexOf(p);
  document.getElementById('igSide').innerHTML=`<div class="who"><img src="${PFP}" alt="" onerror="this.onerror=null;this.src='${FB}'">ye</div>
   <div class="capt">${p.cap?esc(p.cap):'<small>No caption</small>'}</div>
   ${p.alt?`<div class="alt">${esc(p.alt)}</div>`:''}
   <small>${fmt(p.caption_date)}${n>1?` · ${ci+1}/${n}`:''}</small>
   ${p.authors&&p.authors.length?`<small>With ${p.authors.map(a=>'@'+esc(a.handle)).join(', ')}</small>`:''}
   ${/^https?:/.test(p.url||'')?`<a class="ol" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">View original ↗</a>`:''}
   <div class="igPN"><button type="button" data-d="-1" ${idx>0?'':'disabled'}>← Previous</button><button type="button" data-d="1" ${idx<view.length-1?'':'disabled'}>Next →</button></div>`;
}
function step(d){const idx=view.indexOf(cur)+d;if(idx<0||idx>=view.length)return;cur=view[idx];ci=0;if(idx>=shown-3&&shown<view.length)more();paint()}
function shell(){
  const years=[...new Set(POSTS.map(p=>p.caption_date.slice(0,4)))].sort().reverse();
  root.innerHTML=`<div class="eyebrow">ARCHIVE</div><h1 class="title">Instagram</h1>
  <div class="igProf"><img src="${PFP}" alt="" onerror="this.onerror=null;this.src='${FB}'"><div><h2>ye</h2><div class="igStats"><span><b>${POSTS.length.toLocaleString()}</b> posts</span><span><b>20.4M</b> followers</span><span><b>1</b> following</span></div><div class="igBio">Archived feed · ${years[years.length-1]}–${years[0]}</div></div></div>
  <div class="igTools"><div class="igRow"><input id="igQ" type="search" placeholder="Search captions" aria-label="Search captions"><select id="igSort" aria-label="Sort"><option value="new">Newest</option><option value="old">Oldest</option></select><select id="igYear" aria-label="Year"><option value="all">All years</option>${years.map(y=>`<option>${y}</option>`).join('')}</select></div>
  <div class="igChips" id="igChips">${FILTERS.map(([v,l])=>`<button type="button" data-f="${v}"${v==='all'?' class="on"':''}>${l}</button>`).join('')}</div></div>
  <div class="igCount" id="igCount"></div><div class="igGrid" id="igGrid"></div><button class="igMore" id="igMore" type="button">Show more</button>
  <div class="igLb" id="igLb" hidden role="dialog" aria-modal="true"><button class="igX" id="igX" type="button" aria-label="Close">×</button><div class="igBox"><div class="igMed" id="igMed"></div><div class="igSide" id="igSide"></div></div></div>`;
  let tm;document.getElementById('igQ').oninput=e=>{clearTimeout(tm);tm=setTimeout(()=>{st.q=e.target.value;refresh()},180)};
  document.getElementById('igSort').onchange=e=>{st.sort=e.target.value;refresh()};
  document.getElementById('igYear').onchange=e=>{st.year=e.target.value;refresh()};
  document.getElementById('igChips').onclick=e=>{const b=e.target.closest('button[data-f]');if(!b)return;st.filter=b.dataset.f;document.querySelectorAll('#igChips button').forEach(x=>x.classList.toggle('on',x===b));refresh()};
  document.getElementById('igMore').onclick=more;
  document.getElementById('igGrid').onclick=e=>{const c=e.target.closest('.igCell');if(c)openPost(+c.dataset.i)};
  document.getElementById('igX').onclick=closeLb;
  lb().onclick=e=>{if(e.target===lb())closeLb()};
  document.getElementById('igMed').onclick=e=>{const b=e.target.closest('.igNav');if(!b)return;ci+=b.classList.contains('n')?1:-1;paint()};
  document.getElementById('igSide').onclick=e=>{const b=e.target.closest('button[data-d]');if(b&&!b.disabled)step(+b.dataset.d)};
  const io=new IntersectionObserver(es=>{if(es[0].isIntersecting&&shown>0&&shown<view.length)more()},{rootMargin:'600px'});io.observe(document.getElementById('igMore'));
  refresh();
}
document.addEventListener('keydown',e=>{
  if(!cur||!lb()||lb().hidden)return;
  if(e.key==='Escape')closeLb();
  else if(e.key==='ArrowRight'){if(ci<cur.media.length-1){ci++;paint()}else step(1)}
  else if(e.key==='ArrowLeft'){if(ci>0){ci--;paint()}else step(-1)}
});
async function load(){
  if(MAN)return;
  if(!loading)loading=(async()=>{
    const b64=await fetch('data/instagram.txt').then(r=>{if(!r.ok)throw new Error(r.status);return r.text()});
    const bin=Uint8Array.from(atob(b64.trim()),c=>c.charCodeAt(0));
    MAN=JSON.parse(await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
    POSTS=MAN.posts.map((r,i)=>({...mk(r),ord:i}));
  })();
  await loading;
}
async function show(){
  root.classList.add('activeScreen');
  if(MAN){if(!document.getElementById('igGrid'))shell();return}
  root.innerHTML='<div class="eyebrow">ARCHIVE</div><h1 class="title">Instagram</h1><p style="color:#a8a8a8">Loading the archive…</p>';
  try{await load();shell()}catch(e){loading=null;root.innerHTML='<div class="eyebrow">ARCHIVE</div><h1 class="title">Instagram</h1><p style="color:#ff6a70">Couldn’t load the archive. Reload and try again.</p>'}
}
window.Instagram={get data(){return POSTS}};
window.PH=window.PH||{};
PH.instagram={show,hide(){closeLb();root.classList.remove('activeScreen')}};
})();
