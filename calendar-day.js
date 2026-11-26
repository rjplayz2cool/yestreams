/* Calendar on computers: click a day to open a full page for it, then click an event to read more about it. Phones keep the simple day list. */
(()=>{
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MQ=matchMedia('(max-width:700px)');
const MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
const KINDS={release:['Release','#b6ff39'],live:['Live','#ff5a5a'],leak:['Leak / file','#a78bfa'],fashion:['Fashion','#ff7ad9'],family:['Family','#ffb86b'],milestone:['Stream milestone','#6bd0ff'],news:['News','#d4d4d4']};
const kindOf=e=>e.target?'milestone':e.bd?'family':/\b(Leak|Leaked|Snippet|Snippets|Demo|OG File|Files?)\b/i.test(e.title)?'leak':/\b(Tour|Live|Performs?|Performance|Headlines?|Festival|Concert|Listening|Sunday Service|Show|Opens?)\b/i.test(e.title)?'live':/\b(Release|Releases|Released|Drops?|Album|Single|Peaks|Certified|Debuts?)\b/i.test(e.title)?'release':/\b(Yeezy|Adidas|Gap|Collection|Season|Sneaker|Balenciaga)\b/i.test(e.title)?'fashion':'news';
const st=document.createElement('style');st.textContent=`
#calendarGrid .calendarDay.hasEv{cursor:pointer}
@media(min-width:701px){#calDayPC{position:fixed;inset:0;z-index:10001;background:#0b0b0e;display:none;flex-direction:column;color:#fff}#calDayPC.on{display:flex}}
@media(max-width:700px){#calDayPC{display:none!important}}
body.cdpOpen{overflow:hidden}
@keyframes cdpIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}
@keyframes cdpUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes cdpSl{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:none}}
#calDayPC.on{animation:cdpIn .3s var(--ease,ease)}
.cdpItem{animation:cdpSl .4s var(--ease,ease) backwards;animation-delay:calc(var(--i,0)*40ms + .1s);transition:border-color .2s,background .2s,transform .2s}.cdpItem:hover{transform:translateX(3px)}
.cdpHero>*,.cdpFacts div{animation:cdpUp .45s var(--ease,ease) backwards}.cdpFacts div{animation-delay:calc(var(--i,0)*60ms + .15s)}
.cdpImg{animation:cdpIn .5s var(--ease,ease) backwards}
@media(prefers-reduced-motion:reduce){#calDayPC,#calDayPC *{animation:none!important}}
.cdpTop{display:flex;align-items:center;gap:14px;padding:16px 28px;border-bottom:1px solid #ffffff1a;background:#101014}
.cdpTop h2{margin:0;font-size:24px;font-weight:900;letter-spacing:-.02em;flex:1;min-width:0}
.cdpTop h2 small{display:block;font-size:12px;color:#ffffff88;letter-spacing:.14em;text-transform:uppercase;font-weight:700;margin-top:4px}
.cdpBtn{border:1px solid #ffffff30;background:#1a1a20;color:#fff;border-radius:12px;padding:10px 16px;font:800 13px system-ui,sans-serif;cursor:pointer}
.cdpBtn:hover{background:#26262e}.cdpBtn:disabled{opacity:.35;cursor:default}
.cdpBody{flex:1;min-height:0;display:grid;grid-template-columns:minmax(300px,420px) minmax(0,1fr)}
.cdpList{overflow-y:auto;padding:18px 18px 40px;display:grid;gap:10px;align-content:start;border-right:1px solid #ffffff14}
.cdpItem{display:flex;gap:12px;align-items:center;text-align:left;width:100%;background:#15151a;border:1px solid #ffffff18;border-radius:14px;padding:10px;color:#fff;font:inherit;cursor:pointer}
.cdpItem:hover{border-color:#ffffff4d}.cdpItem.on{border-color:#fff;background:#1e1e26}.cdpItem.achieved{border-color:rgba(var(--accent2rgb),.6)}
.cdpItem img,.cdpNo{width:64px;height:64px;flex:0 0 64px;border-radius:10px;object-fit:cover;background:#222}
.cdpItem b{display:block;font-size:14px;line-height:1.3;overflow-wrap:anywhere}.cdpItem span:not(.cdpNo){display:block;color:#aaa;font-size:12px;margin-top:3px}
.cdpDetail{overflow-y:auto;padding:30px 40px 60px}
.cdpHero{display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:32px;align-items:start;max-width:1000px}
.cdpImg{aspect-ratio:1;border-radius:14px;overflow:hidden;background:#17171c;border:1px solid #ffffff1c;display:grid;place-items:center}
.cdpImg img{width:100%;height:100%;object-fit:cover;display:block}
.cdpImg i{font:900 70px/1 system-ui,sans-serif;color:#ffffff30;font-style:normal}
.cdpTag{display:inline-block;font:800 11px/1 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;padding:6px 10px;border-radius:6px;background:#ffffff14;color:var(--c)}
.cdpDetail h3{font-size:clamp(26px,3.2vw,44px);font-weight:900;letter-spacing:-.035em;line-height:1.05;margin:12px 0}
.cdpFacts{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:16px 0}
.cdpFacts div{background:#ffffff0c;border:1px solid #ffffff1a;border-radius:10px;padding:11px 13px;min-width:0}
.cdpFacts small{display:block;color:#ffffff88;font:700 10px/1 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;margin-bottom:6px}
.cdpFacts span{font-size:14px;line-height:1.3;overflow-wrap:anywhere}
.cdpActs{display:flex;gap:10px;flex-wrap:wrap;margin-top:8px}
.cdpActs button{border:0;border-radius:999px;background:var(--accent2);color:#000;padding:11px 18px;font:800 12px/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
.cdpActs button.ghost{background:#ffffff14;color:#fff;border:1px solid #ffffff40}
.cdpRel{margin-top:26px;max-width:1000px}.cdpRel h4{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#ffffffa0;margin:0 0 10px}
.cdpEmpty{color:#ffffff99;padding:40px}
`;document.head.appendChild(st);
let o,key,list=[],sel=0;
const fmtKey=k=>{const[y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d)};
const shiftKey=(k,n)=>{const d=fmtKey(k);d.setDate(d.getDate()+n);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
function build(){
  o=document.createElement('div');o.id='calDayPC';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','Day');
  o.innerHTML='<div class="cdpTop"><button type="button" class="cdpBtn" id="cdpBack">‹ Calendar</button><h2 id="cdpTitle"></h2><button type="button" class="cdpBtn" id="cdpPrev" aria-label="Previous day">‹</button><button type="button" class="cdpBtn" id="cdpNext" aria-label="Next day">›</button></div><div class="cdpBody"><div class="cdpList" id="cdpList"></div><div class="cdpDetail" id="cdpDetail"></div></div>';
  document.body.appendChild(o);
  o.querySelector('#cdpBack').onclick=close;o.querySelector('#cdpPrev').onclick=()=>step(-1);o.querySelector('#cdpNext').onclick=()=>step(1);
  addEventListener('keydown',e=>{if(!o.classList.contains('on'))return;if(e.key==='Escape')close();else if(e.key==='ArrowLeft')step(-1);else if(e.key==='ArrowRight')step(1);else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();pick(Math.max(0,Math.min(list.length-1,sel+(e.key==='ArrowDown'?1:-1))))}});
}
function eventsFor(k){
  let out=null;try{out=window.__calEventsFor?__calEventsFor(k):(window.__calEv||{})[k]}catch{out=(window.__calEv||{})[k]}
  return out||[];
}
function openDay(k){
  if(!o)build();key=k;list=eventsFor(k);sel=0;
  const d=fmtKey(k);
  o.querySelector('#cdpTitle').innerHTML=`${esc(new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).format(d))}<small>${list.length} event${list.length===1?'':'s'}</small>`;
  const L=o.querySelector('#cdpList');
  L.innerHTML=list.map((e,i)=>`<button type="button" style="--i:${Math.min(i,14)}" class="cdpItem${e.achieved?' achieved':''}${i===0?' on':''}" data-i="${i}">${e.cover?`<img src="${esc(e.cover)}" alt="" onerror="this.outerHTML='<span class=cdpNo></span>'">`:'<span class="cdpNo"></span>'}<div><b>${esc(e.title)}</b><span>${esc(sub(e))}</span></div></button>`).join('')||'<p class="cdpEmpty">Nothing scheduled for this day.</p>';
  L.querySelectorAll('.cdpItem').forEach(b=>b.onclick=()=>pick(+b.dataset.i));
  o.classList.add('on');document.body.classList.add('cdpOpen');L.scrollTop=0;detail();
}
const shortN=n=>n>=1e9?(n/1e9)+'B':n>=1e6?(n/1e6)+'M':Number(n).toLocaleString();
const sub=e=>e.fixed?(e.subtitle||'Calendar event'):shortN(e.target)+' milestone'+(e.achieved?' · Achieved':' · Projected');
function pick(i){sel=i;o.querySelectorAll('.cdpItem').forEach((b,j)=>b.classList.toggle('on',j===i));o.querySelectorAll('.cdpItem')[i]?.scrollIntoView({block:'nearest'});detail()}
function step(n){const k=shiftKey(key,n);openDay(k)}
function findAlbum(title){
  if(!window.ALBUMS_META)return null;const t=title.toLowerCase();
  return ALBUMS_META.filter(a=>a.name.length>3).sort((x,y)=>y.name.length-x.name.length).find(a=>{const n=a.name.toLowerCase().replace(/\s*\[v\d\]/,'');return t.includes(n)})||null;
}
function detail(){
  const D=o.querySelector('#cdpDetail'),e=list[sel];if(!e){D.innerHTML='';return}
  const k=kindOf(e),[kl,kc]=KINDS[k]||KINDS.news,d=fmtKey(key),yr=e.ry||e.by||null;
  const facts=[['Date',new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:yr?undefined:'numeric'}).format(d)+(yr?', '+yr:'')]];
  if(yr&&e.yr!=null){const n=e.yr-yr;facts.push([e.bd?'Age':'Years ago',n<0?`In ${-n} year${n===-1?'':'s'}`:n===0?'This year':`${n} year${n===1?'':'s'} (as of ${e.yr})`])}
  facts.push(['Type',kl]);
  if(e.target){facts.push(['Milestone',shortN(e.target)+' streams']);facts.push(['Status',e.achieved?'Achieved':'Projected from current daily streams'])}
  const al=findAlbum(e.title);
  D.innerHTML=`<div class="cdpHero"><div class="cdpImg">${e.cover?`<img src="${esc(e.cover)}" alt="" onerror="this.replaceWith(document.createElement('i'))">`:'<i>♪</i>'}</div>
  <div><span class="cdpTag" style="--c:${kc}">${esc(kl)}</span><h3>${esc(e.title)}</h3><p class="muted" style="color:#ffffffb0;margin:0">${esc(sub(e))}</p>
  <div class="cdpFacts">${facts.map(([a,b],i)=>`<div style="--i:${i}"><small>${esc(a)}</small><span>${esc(b)}</span></div>`).join('')}</div>
  <div class="cdpActs">${yr&&window.Eras?`<button type="button" data-a="era">See ${yr} in Eras</button>`:''}${al?`<button type="button" class="ghost" data-a="album">View ${esc(al.name)} album</button>`:''}${e.target?`<button type="button" class="ghost" data-a="streams">Go to Streams</button>`:''}</div></div></div>
`;
  D.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;close();
    if(a==='era'){go('eras');setTimeout(()=>{try{Eras.open(yr)}catch{}},700)}
    else if(a==='album'){go('albums');setTimeout(()=>{try{Albums.open(al.id)}catch{}},500)}
    else go('streams')});
}
function close(){if(!o)return;o.classList.remove('on');document.body.classList.remove('cdpOpen')}
document.addEventListener('click',e=>{const d=e.target.closest&&e.target.closest('#calendarGrid .calendarDay');if(!d||MQ.matches)return;const k=d.dataset.k;if(!k)return;const ev=(window.__calEv||{})[k]||[];if(ev.length)openDay(k)});
window.CalendarDay={open:openDay,close};
})();
