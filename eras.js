/* Eras tab: a map of every year, click a year to zoom in, drag across it, and keep dragging into the next year. */
(()=>{
const pg=document.getElementById('pg-eras'),root=document.getElementById('erScreen');if(!pg||!root)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MON=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const KIND={release:['RELEASE','#b6ff39'],music:['MUSIC','#b6ff39'],live:['LIVE','#ff5a5a'],leak:['LEAK','#a78bfa'],family:['FAMILY','#ffb86b'],news:['NEWS','#6bd0ff'],fashion:['FASHION','#ff7ad9'],business:['BUSINESS','#ffd84d'],life:['LIFE','#d4d4d4']};
const kindOf=t=>/\b(Leak|Leaked|Snippet|Snippets|Demo|OG File|Files?)\b/i.test(t)?'leak':/\b(Tour|Live|Performs?|Performance|Headlines?|Festival|Concert|Listening|Sunday Service|Show|Opens?)\b/i.test(t)?'live':/\b(Release|Releases|Released|Drops?|Album|Single|Peaks|Certified|Debuts?)\b/i.test(t)?'release':/\b(Yeezy|Adidas|Gap|Collection|Season|Sneaker|Balenciaga)\b/i.test(t)?'fashion':'news';
const KID={North:'North West',Saint:'Saint West',Chicago:'Chicago West',Psalm:'Psalm West'};
const ft=s=>s.toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(w=>w.length>3);
const similar=(a,b)=>{const A=new Set(ft(a)),B=ft(b);if(!A.size||!B.length)return false;const n=B.filter(w=>A.has(w)).length;return n/Math.min(A.size,B.length)>=.6};

/* ---------- data ---------- */
let YEARS=[],BY={},META={};
function build(){
  const C=window.CAL_DATA||{annual:[],dated:[]},X=window.ERAS_EXTRA||{};META=window.ERAS_META||{};BY={};
  const add=(y,e)=>{(BY[y]||(BY[y]=[])).push(e)},seen=new Set(),now=new Date();
  for(const e of C.annual||[]){
    if(e.birthday){
      const n=(e.title||'').split(/['’]s Birthday/)[0];
      if(e.deceased||!e.birthYear)continue;
      if(n==='Ye')add(e.birthYear,{m:e.month,d:e.day,t:'Ye is born in Atlanta, Georgia',k:'family'});
      else if(KID[n])add(e.birthYear,{m:e.month,d:e.day,t:KID[n]+' is born',k:'family'});
      continue;
    }
    if(!e.releaseYear)continue;
    const key=[e.releaseYear,e.month,e.day,e.title].join('|');if(seen.has(key))continue;seen.add(key);
    add(e.releaseYear,{m:e.month,d:e.day,t:e.title,k:kindOf(e.title),c:e.cover||''});
  }
  for(const e of C.dated||[]){const up=new Date(e.year,e.month-1,e.day,23,59)>now;add(e.year,{m:e.month,d:e.day,t:e.title,k:/live/i.test(e.title)?'live':kindOf(e.title),up})}
  for(const y in X)for(const [m,d,t,k] of X[y]){
    if(m>0&&(BY[y]||[]).some(e=>e.m===m&&similar(e.t,t)))continue;
    add(+y,{m,d,t,k});
  }
  for(const [y,k,src] of window.ERAS_IMG||[])for(const e of BY[y]||[])if(!e.c&&e.t.toLowerCase().includes(k)&&!src.startsWith('__'))e.c=src;
  YEARS=Object.keys(BY).map(Number).filter(y=>y>=1977).sort((a,b)=>a-b);
  for(const y of YEARS)BY[y].sort((a,b)=>(a.m||0)-(b.m||0)||(a.d||0)-(b.d||0));
}
const dateLabel=e=>e.m?(e.d?MON[e.m-1]+' '+e.d:MON[e.m-1]):'ALL YEAR';

/* ---------- styles ---------- */
const st=document.createElement('style');st.textContent=`
body.erOn{overflow:hidden}body.erOn header{position:relative;z-index:59;pointer-events:none}body.erOn header button,body.erOn header a,body.erOn header input{pointer-events:auto}
#pg-eras .erScreen{position:fixed;inset:0;z-index:3;background:#060607;color:#fff;overflow:clip;touch-action:none;user-select:none;-webkit-user-select:none;
 background-image:radial-gradient(1200px 700px at 20% 10%,rgba(182,255,57,.07),transparent 60%),radial-gradient(900px 600px at 90% 90%,rgba(139,92,246,.10),transparent 60%),linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);
 background-size:auto,auto,64px 64px,64px 64px;background-position:0 0,0 0,var(--bgx,0px) 0,var(--bgx,0px) 0}
.erScreen::before{content:'';position:absolute;left:0;right:0;top:0;height:92px;z-index:4;pointer-events:none;background:linear-gradient(#060607 35%,rgba(6,6,7,0))}.erScreen.grab{cursor:grabbing}.erScreen.yr{cursor:grab}
.erWorld{position:absolute;left:0;top:0;transform-origin:0 0;will-change:transform;color:#fff}
.erWorld svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible}
.erWorld path{fill:none;stroke:#b6ff39;stroke-width:3;stroke-dasharray:2 11;stroke-linecap:round;opacity:.55}
.erDeco{position:absolute;inset:0;pointer-events:none}
.erDc{position:absolute;translate:-50% -50%;text-align:center;white-space:nowrap}
.erTitle b{display:block;font-size:clamp(26px,3.6vw,48px);letter-spacing:.14em;font-weight:800;color:#fff}
.erTile{position:absolute;display:block;width:var(--tw);height:var(--th);padding:0;border:1px solid rgba(255,255,255,.14);border-radius:10px;background:#121214;color:#fff;overflow:visible;cursor:pointer;text-align:left;font:inherit;rotate:var(--rot,0deg);box-shadow:0 10px 24px rgba(0,0,0,.6);transition:transform .25s var(--ease),rotate .25s var(--ease),box-shadow .25s,border-color .25s}
.erTile::before{content:'';position:absolute;top:-6px;left:50%;width:12px;height:12px;margin-left:-6px;border-radius:50%;background:#b6ff39;box-shadow:0 0 12px rgba(182,255,57,.7);z-index:5}
.erTile:hover,.erTile:focus-visible{transform:translateY(-6px) scale(1.08);rotate:0deg;box-shadow:0 20px 40px rgba(0,0,0,.75);z-index:6;outline:0;border-color:#b6ff39}
.erTC{position:absolute;left:7px;top:7px;width:calc(var(--tw) - 14px);height:calc(var(--tw) - 14px);background:linear-gradient(140deg,hsl(var(--hu) 30% 24%),hsl(calc(var(--hu) + 40) 35% 12%));overflow:hidden;border-radius:6px}
.erTC img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s var(--ease)}
.erTile:hover .erTC img{transform:scale(1.06)}
.erTY{position:absolute;left:-7px;top:calc(var(--tw) - 34px);padding:2px 12px 1px 12px;background:#b6ff39;color:#060607;font-weight:800;font-size:22px;line-height:1.15;letter-spacing:.04em;z-index:2;border-radius:4px;box-shadow:0 3px 8px rgba(0,0,0,.5)}
.erTN{position:absolute;left:9px;right:9px;top:calc(var(--tw) + 6px);font-weight:700;font-size:12px;line-height:1.2;letter-spacing:.06em;text-transform:uppercase;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;color:#fff}
.erTK{position:absolute;left:9px;bottom:6px;font-weight:600;font-size:11px;color:#b6ff39;letter-spacing:.1em}
.erHint{position:absolute;left:50%;bottom:16px;translate:-50% 0;padding:8px 14px;border-radius:999px;background:rgba(6,6,7,.82);border:1px solid rgba(255,255,255,.12);z-index:5;font-size:12px;letter-spacing:.2em;font-weight:800;color:#9a9a9a;pointer-events:none;transition:opacity .3s;text-align:center;white-space:nowrap}
.erHint b{color:var(--accent2)}
.erBack{position:absolute;left:max(16px,env(safe-area-inset-left,0px));top:calc(max(10px,env(safe-area-inset-top,0px)) + 70px);z-index:8;display:flex;align-items:center;gap:8px;padding:11px 18px;border-radius:999px;border:1px solid rgba(255,255,255,.28);background:rgba(10,10,12,.78);backdrop-filter:blur(10px);color:#fff;font-weight:800;font-size:12px;letter-spacing:.14em;cursor:pointer;opacity:0;pointer-events:none;transform:translateX(-14px);transition:opacity .35s .2s,transform .35s .2s,background .2s,border-color .2s}
.erBack:hover{background:var(--accent2);color:#000;border-color:var(--accent2)}
.erScreen.yr .erBack{opacity:1;pointer-events:auto;transform:none}
.erYW{position:absolute;inset:0;opacity:0;pointer-events:none;transition:opacity .5s .4s,transform .6s .35s var(--ease);transform:scale(.94)}
.erScreen.yr .erYW{opacity:1;pointer-events:auto;transform:none}
.erScreen.zin .erYW{opacity:1;transform:none}
.erLayer{position:absolute;inset:0;overflow:clip}
.erTrack{position:absolute;left:0;top:0;height:100%;display:flex;align-items:stretch;width:max-content;padding:92px 0 76px;box-sizing:border-box;will-change:transform}
.erTrack::before{content:'';position:absolute;left:0;right:0;top:calc(50% + 8px);height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.4) 3%,rgba(255,255,255,.4) 97%,transparent)}
.erIntro,.erOutro{flex:none;display:flex;flex-direction:column;justify-content:center;position:relative;z-index:1}
.erIntro{width:min(560px,86vw);padding:0 40px 0 max(24px,5vw)}
.erIntro small,.erOutro small{font-weight:800;letter-spacing:.22em;font-size:12px;color:var(--accent2)}
.erIntro h2{margin:6px 0 4px;font-size:clamp(88px,17vw,210px);line-height:.82;font-weight:900;letter-spacing:-.07em}
.erIntro h4{margin:14px 0 6px;font-size:clamp(16px,2vw,24px);letter-spacing:.06em;text-transform:uppercase;font-weight:900}
.erIntro p{margin:0;color:#b9b9b9;max-width:34ch;line-height:1.5;font-size:15px}
.erLg{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}
.erLg span{font-size:10.5px;font-weight:800;letter-spacing:.12em;padding:5px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.18);color:#ddd;display:flex;align-items:center;gap:6px}
.erLg i,.erCard small i{width:7px;height:7px;border-radius:50%;background:var(--kc);display:inline-block}
.erDrag{margin-top:22px;font-size:11px;letter-spacing:.2em;font-weight:800;color:#8a8a8a}
.erMo{flex:none;display:grid;grid-template-rows:minmax(0,1fr) 34px minmax(0,1fr);grid-auto-columns:max-content;column-gap:18px;padding:0 9px;position:relative;z-index:1;min-width:var(--mw,140px)}
.erMo h3{grid-row:2;grid-column:1/-1;align-self:center;margin:0;font-size:12px;letter-spacing:.24em;font-weight:900;color:#fff;display:flex;align-items:center;gap:10px;white-space:nowrap}
.erMo h3::before{content:'';width:9px;height:9px;border-radius:50%;background:var(--accent2);box-shadow:0 0 0 4px rgba(182,255,57,.18)}
.erMo.emp h3{color:#5d5d5d}.erMo.emp h3::before{background:#444;box-shadow:none}
.erMo.all h3{color:var(--accent2)}
.erCard{position:relative;width:236px;background:#121214;border:1px solid rgba(255,255,255,.13);border-radius:14px;overflow:hidden;transition:transform .25s var(--ease),border-color .25s}
.erCard:hover{transform:translateY(-4px);border-color:var(--kc)}
.erCard.u{align-self:end;margin-bottom:0}.erCard.d{align-self:start}
.erCard .erImg{position:relative;height:150px;background:#0b0b0c;overflow:hidden;display:flex;align-items:center;justify-content:center}.erImg img{position:absolute;display:block;pointer-events:none;-webkit-user-drag:none}.erImg .bg{inset:-20px;width:calc(100% + 40px);height:calc(100% + 40px);object-fit:cover;filter:blur(18px) brightness(.55) saturate(1.2)}.erImg .fg{position:relative;max-width:100%;max-height:100%;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 6px 14px rgba(0,0,0,.5))}.erImg.ph{background:linear-gradient(135deg,color-mix(in srgb,var(--kc) 22%,#0b0b0c),#0b0b0c 70%)}.erImg.ph b{font-size:34px;font-weight:900;letter-spacing:-.04em;color:var(--kc);opacity:.9}
.erTxt{padding:11px 13px 13px}
.erCard small{display:flex;align-items:center;gap:7px;font-size:10.5px;font-weight:800;letter-spacing:.14em;color:#a8a8a8}
.erCard small b{color:var(--kc)}
.erCard strong{display:block;margin-top:6px;font-size:14.5px;line-height:1.28;font-weight:800;letter-spacing:-.01em}
.erCard.up{border-style:dashed}
.erCard::after{content:'';position:absolute;left:22px;width:1px;height:26px;background:var(--kc);opacity:.7}
.erCard.u::after{top:100%}.erCard.d::after{bottom:100%}
.erOutro{width:min(380px,80vw);padding:0 48px 0 36px;align-items:flex-start;gap:8px}
.erOutro h2{margin:0;font-size:clamp(56px,9vw,110px);font-weight:900;letter-spacing:-.06em;line-height:.9;color:#fff}
.erOutro p{margin:0;color:#8a8a8a;font-size:12px;letter-spacing:.16em;font-weight:800}
.erOutro.go h2{color:var(--accent2)}
.erEdge{position:absolute;top:50%;translate:0 -50%;z-index:6;font-size:11px;letter-spacing:.2em;font-weight:900;color:var(--accent2);padding:10px 14px;border-radius:999px;border:1px solid var(--accent2);background:rgba(6,6,7,.8);opacity:0;pointer-events:none;transition:opacity .2s}
.erEdge.L{left:14px}.erEdge.R{right:14px}.erEdge.on{opacity:1}
.erBar{position:absolute;left:50%;bottom:18px;translate:-50% 0;z-index:6;display:flex;align-items:center;gap:6px;padding:6px;border-radius:999px;border:1px solid rgba(255,255,255,.2);background:rgba(10,10,12,.8);backdrop-filter:blur(10px);opacity:0;pointer-events:none;transition:opacity .4s .3s}
.erScreen.yr .erBar{opacity:1;pointer-events:auto}
.erBar button{white-space:nowrap;border:0;background:transparent;color:#aaa;font:800 12px/1 inherit;letter-spacing:.1em;padding:9px 13px;border-radius:999px;cursor:pointer}
.erBar button:hover:not(:disabled){color:#000;background:var(--accent2)}.erBar button:disabled{opacity:.25;cursor:default}
.erBar b{font-size:15px;letter-spacing:.04em;padding:0 10px;min-width:56px;text-align:center}
.erProg{position:absolute;left:0;bottom:0;height:3px;background:var(--accent2);z-index:7;width:0;transition:width .12s}
@media (max-width:700px){.erBack{top:calc(max(10px,env(safe-area-inset-top,0px)) + 112px)}.erTrack{padding-top:150px}.erBar button{white-space:nowrap;padding:9px 10px}.erTY{font-size:21px}.erTN{font-size:11px}.erHint{font-size:9.5px;letter-spacing:.12em}.erCard{width:200px}.erCard .erImg{height:128px}.erBar{bottom:12px}.erBack{padding:9px 14px}.erHint{font-size:10px;bottom:14px}}
@media (prefers-reduced-motion:reduce){.erWorld,.erYW,.erTile{transition:none!important}}
`;document.head.appendChild(st);

/* tiny covers (80px thumbnails) are shown at their real size over a blurred copy instead of being stretched */
document.addEventListener('load',e=>{const i=e.target;if(!(i instanceof HTMLImageElement)||!i.classList.contains('fg'))return;const w=i.naturalWidth,h=i.naturalHeight,box=i.parentNode.clientHeight||150;
  if(w&&h&&Math.max(w,h)<box){i.style.width=w+'px';i.style.height=h+'px';i.style.objectFit='fill'}},true);
/* ---------- state + dom ---------- */
let mode='map',curY=null,tk=null,px=0,minX=0,busy=false,vw=0,vh=0,built=false;
let world,deco,svgp,layer,yw,backBtn,bar,eL,eR,prog,hint,TW=168,TH=214,tilePos={},cam={s:1,tx:0,ty:0},pan={};
function shell(){
  root.innerHTML=`<div class="erWorld" id="erWorld"><svg><path id="erPath"/></svg><div class="erDeco" id="erDeco"></div></div>
  <div class="erHint" id="erHint">ERAS · <b id="erN"></b> YEARS · CLICK A YEAR TO ZOOM IN</div>
  <div class="erYW" id="erYW"><div class="erLayer" id="erLayer"></div>
   <div class="erEdge L" id="erEL"></div><div class="erEdge R" id="erER"></div>
   <div class="erBar" id="erBar"><button type="button" id="erPrev" aria-label="Previous year">‹</button><b id="erCur"></b><button type="button" id="erNext" aria-label="Next year">›</button></div>
   <div class="erProg" id="erProg"></div></div>
  <button type="button" class="erBack" id="erBack" aria-label="Back to all years">← ALL YEARS</button>`;
  root.classList.add('erScreen');
  world=root.querySelector('#erWorld');deco=root.querySelector('#erDeco');svgp=root.querySelector('#erPath');layer=root.querySelector('#erLayer');yw=root.querySelector('#erYW');
  backBtn=root.querySelector('#erBack');bar=root.querySelector('#erBar');eL=root.querySelector('#erEL');eR=root.querySelector('#erER');prog=root.querySelector('#erProg');hint=root.querySelector('#erHint');
  backBtn.onclick=zoomOut;
  root.querySelector('#erPrev').onclick=()=>step(-1);root.querySelector('#erNext').onclick=()=>step(1);
  root.querySelector('#erN').textContent=YEARS.length;
}

/* ---------- overview map ---------- */
function layoutMap(){
  vw=innerWidth;vh=innerHeight;
  const small=vw<560;
  TW=small?124:168;TH=Math.round(TW*(small?1.55:1.36));const gx=small?26:40,gy=small?64:74,pad=small?30:54,top=small?96:136;
  const dimsFor=c=>{const n=YEARS.length,r=Math.ceil(n/c),e=c-(n-c*(r-1));return {W:pad*2+c*TW+(c-1)*gx,H:top+pad+r*TH+(r-1)*gy+(e>=2?30:small?170:160)}};
  let cols=3;
  if(!small){let bs=0;for(let c=4;c<=14;c++){const d=dimsFor(c),s=Math.min((vw-20)/d.W,(vh-136)/d.H);if(s>bs){bs=s;cols=c}}}
  root.style.setProperty('--tw',TW+'px');root.style.setProperty('--th',TH+'px');
  const N=YEARS.length,rows=Math.ceil(N/cols),k=N-cols*(rows-1),lastRTL=(rows-1)%2===1,emptyCols=cols-k;
  const bottomExtra=emptyCols>=2?30:small?150:130;
  const W=pad*2+cols*TW+(cols-1)*gx,H=top+pad+rows*TH+(rows-1)*gy+bottomExtra;
  world.style.width=W+'px';world.style.height=H+'px';
  const rnd=y=>{const s=Math.sin(y*12.9898)*43758.5453;return s-Math.floor(s)};
  tilePos={};const pts=[];
  YEARS.forEach((y,i)=>{const r=Math.floor(i/cols),ci=i%cols,c=r%2?cols-1-ci:ci,jx=(rnd(y)-.5)*(small?10:22),jy=(rnd(y+9)-.5)*(small?14:26),x=pad+c*(TW+gx)+jx,yy=top+r*(TH+gy)+jy;
    tilePos[y]={x,y:yy,cx:x+TW/2,cy:yy+TH/2,rot:(rnd(y+3)-.5)*5};pts.push([x+TW/2,yy+TW/2])});
  /* the X that marks the spot sits just past the last tile */
  const last=tilePos[YEARS[N-1]];let xp;
  if(emptyCols>=2)xp=[lastRTL?last.cx-TW*1.15:last.cx+TW*1.15,last.cy-TH*.18];
  else xp=[last.cx,last.y+TH+(small?84:76)];
  pts.push(xp);
  let d=`M${pts[0][0]} ${pts[0][1]}`;
  for(let q=0;q<pts.length-1;q++){const a=pts[q-1]||pts[q],b=pts[q],c=pts[q+1],e=pts[q+2]||c;
    d+=` C${b[0]+(c[0]-a[0])/6} ${b[1]+(c[1]-a[1])/6} ${c[0]-(e[0]-b[0])/6} ${c[1]-(e[1]-b[1])/6} ${c[0]} ${c[1]}`}
  svgp.setAttribute('d',d);
  world.querySelectorAll('.erTile').forEach(el=>{const q=tilePos[el.dataset.y];el.style.left=q.x+'px';el.style.top=q.y+'px';el.style.setProperty('--rot',q.rot.toFixed(2)+'deg')});
  /* decorations: title, compass, jokes, start flag, X */
  deco.innerHTML='';
  const put=(h,x,y,cls,css)=>{const e=document.createElement('div');e.className='erDc '+(cls||'');e.innerHTML=h;e.style.left=x+'px';e.style.top=y+'px';if(css)e.style.cssText+=css;deco.appendChild(e)};
  put(`<b>THE ERAS OF YE</b>`,W/2,small?42:56,'erTitle');
  pan.W=W;pan.H=H;fitCam();applyCam();
}
function fitCam(){
  const top=84,bot=52,aw=vw-20,ah=vh-top-bot;let s=Math.min(aw/pan.W,ah/pan.H,1.25);
  if(vw<560)s=Math.min(aw/pan.W,1.1);
  pan.s=s;pan.fit=s;const sw=pan.W*s,sh=pan.H*s;
  cam={s,tx:(vw-sw)/2,ty:sh<=ah?top+(ah-sh)/2:top};clampCam();
}
function clampCam(){
  const top=84,bot=52,ah=vh-top-bot,sh=pan.H*cam.s;
  if(sh<=ah)cam.ty=top+(ah-sh)/2;else cam.ty=Math.min(top,Math.max(vh-bot-sh,cam.ty));
  const sw=pan.W*cam.s;if(sw<=vw)cam.tx=(vw-sw)/2;else cam.tx=Math.min(10,Math.max(vw-sw-10,cam.tx));
}
function applyCam(){world.style.transform=`translate(${cam.tx}px,${cam.ty}px) scale(${cam.s})`}
function tileCam(y){const p=tilePos[y],s=Math.min(vw*.7/TW,vh*.78/TH,4.2);return{s,tx:vw/2-p.cx*s,ty:vh/2-p.cy*s}}
function makeTiles(){
  world.querySelectorAll('.erTile').forEach(n=>n.remove());
  YEARS.forEach(y=>{
    const m=META[y]||[String(y),'',''],ev=BY[y],cv=m[2]||(window.ERAS_TILE||{})[y]||(ev.find(e=>e.c&&!/^data:/.test(e.c))||{}).c||'',b=document.createElement('button');
    b.type='button';b.className='erTile';b.dataset.y=y;b.style.setProperty('--hu',(y*37)%360);b.setAttribute('aria-label',`${y} ${m[0]}`);
    b.innerHTML=`<span class="erTC">${cv?`<img loading="lazy" alt="" src="${esc(cv)}" onerror="this.remove()">`:''}</span><span class="erTY">${y}</span><span class="erTN">${esc(m[0]||'')}</span><span class="erTK">${ev.length} MOMENT${ev.length===1?'':'S'}</span>`;
    world.appendChild(b);
  });
}

/* ---------- year track ---------- */
function buildTrack(y){
  const m=META[y]||[String(y),'',''],ev=BY[y],T=document.createElement('div');T.className='erTrack';T.dataset.y=y;
  const kinds=[...new Set(ev.map(e=>e.k))];
  let h=`<section class="erIntro"><small>YEAR</small><h2>${y}</h2><h4>${esc(m[0]||'')}</h4><p>${esc(m[1]||'')}</p>
   <div class="erLg">${kinds.map(k=>`<span style="--kc:${(KIND[k]||KIND.news)[1]}"><i></i>${(KIND[k]||KIND.news)[0]}</span>`).join('')}</div>
   <div class="erDrag">${ev.length} MOMENT${ev.length===1?'':'S'} &nbsp;·&nbsp; DRAG →</div></section>`;
  const groups={};ev.forEach(e=>(groups[e.m||0]||(groups[e.m||0]=[])).push(e));
  const secs=[0,1,2,3,4,5,6,7,8,9,10,11,12].filter(k=>k>0||groups[0]);
  for(const k of secs){
    const g=groups[k]||[],cols=Math.max(1,Math.ceil(g.length/2));
    h+=`<section class="erMo${g.length?'':' emp'}${k?'':' all'}" style="--mw:${g.length?cols*254:120}px"><h3>${k?MON[k-1]:'ALL YEAR'}</h3>`;
    g.forEach((e,i)=>{
      const up=i%2===0,col=Math.floor(i/2)+1,kc=(KIND[e.k]||KIND.news)[1],kl=(KIND[e.k]||KIND.news)[0];
      h+=`<article class="erCard ${up?'u':'d'}${e.up?' up':''}" style="grid-column:${col};grid-row:${up?1:3};--kc:${kc}"><div class="erImg${e.c?'':' ph'}">${e.c?`<img class="bg" aria-hidden="true" loading="lazy" draggable="false" alt="" src="${esc(e.c)}"><img class="fg" loading="lazy" draggable="false" alt="" src="${esc(e.c)}">`:`<b>${dateLabel(e)}</b>`}</div><div class="erTxt"><small><i></i>${dateLabel(e)} · <b>${e.up?'UPCOMING':kl}</b></small><strong>${esc(e.t)}</strong></div></article>`;
    });
    h+='</section>';
  }
  const ni=YEARS.indexOf(y)+1;
  h+=`<section class="erOutro"><small>${ni<YEARS.length?'KEEP DRAGGING':'THE END, FOR NOW'}</small><h2>${ni<YEARS.length?YEARS[ni]:'→'}</h2><p>${ni<YEARS.length?esc((META[YEARS[ni]]||[''])[0]):'MORE IS ON THE WAY'}</p></section>`;
  T.innerHTML=h;return T;
}
function measure(T){const w=T.offsetWidth;return Math.min(0,vw-w)}
function setX(v){px=v;tk.style.transform=`translateX(${v}px)`;root.style.setProperty('--bgx',(v*.25)+'px');prog.style.width=minX<0?Math.max(0,Math.min(100,v/minX*100))+'%':'0'}
const rub=p=>p>0?p*.45:p<minX?minX+(p-minX)*.45:p;
const EDGE=110;
function edgeUI(p){
  const i=YEARS.indexOf(curY),hasP=i>0,hasN=i<YEARS.length-1;
  const L=p>20&&hasP,R=p<minX-20&&hasN;
  eL.textContent=p>EDGE?`RELEASE FOR ${YEARS[i-1]}`:`← ${hasP?YEARS[i-1]:''}`;eR.textContent=p<minX-EDGE?`RELEASE FOR ${YEARS[i+1]}`:`${hasN?YEARS[i+1]:''} →`;
  eL.classList.toggle('on',L);eR.classList.toggle('on',R);
}

/* ---------- zoom in / out ---------- */
function openYear(y){
  if(busy||mode!=='map')return;busy=true;curY=y;
  tk=buildTrack(y);layer.innerHTML='';layer.appendChild(tk);minX=measure(tk);setX(0);syncBar();
  world.style.transition='transform .9s cubic-bezier(.65,0,.2,1),opacity .55s .4s';
  const c=tileCam(y);cam=c;applyCam();world.style.opacity='0';
  root.classList.add('zin');hint.style.opacity=0;
  setTimeout(()=>{root.classList.remove('zin');root.classList.add('yr');mode='year';world.style.visibility='hidden';world.style.transition='none';busy=false},950);
}
function zoomOut(){
  if(busy||mode!=='year')return;busy=true;
  const y=curY;world.style.visibility='visible';world.style.transition='none';world.style.opacity='0';cam=tileCam(y);applyCam();
  void world.offsetWidth;
  root.classList.remove('yr');root.classList.add('zin');
  requestAnimationFrame(()=>{root.classList.remove('zin');world.style.transition='transform .9s cubic-bezier(.65,0,.2,1),opacity .5s';world.style.opacity='1';fitCam();applyCam()});
  hint.style.opacity=1;
  setTimeout(()=>{mode='map';world.style.transition='none';busy=false;tk=null;layer.innerHTML=''},950);
}
function syncBar(){
  const i=YEARS.indexOf(curY);root.querySelector('#erCur').textContent=curY;
  root.querySelector('#erPrev').disabled=i<=0;root.querySelector('#erNext').disabled=i>=YEARS.length-1;
  root.querySelector('#erPrev').textContent=i>0?'‹ '+YEARS[i-1]:'‹';root.querySelector('#erNext').textContent=i<YEARS.length-1?YEARS[i+1]+' ›':'›';
}
function step(dir){
  const i=YEARS.indexOf(curY)+dir;if(busy||mode!=='year'||i<0||i>=YEARS.length)return;
  busy=true;cancelAnimationFrame(raf);
  const y=YEARS[i],old=tk,nw=buildTrack(y);nw.style.visibility='hidden';layer.appendChild(nw);
  const nmin=measure(nw),sx=dir>0?vw:nmin-vw,ex=dir>0?0:nmin,ox=px+(dir>0?-vw:vw);
  nw.style.visibility='';nw.style.transform=`translateX(${sx}px)`;
  const opt={duration:720,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'};
  old.animate([{transform:`translateX(${px}px)`,opacity:1},{transform:`translateX(${ox}px)`,opacity:0}],opt);
  const a=nw.animate([{transform:`translateX(${sx}px)`,opacity:0},{transform:`translateX(${ex}px)`,opacity:1}],opt);
  eL.classList.remove('on');eR.classList.remove('on');
  a.onfinish=()=>{old.remove();a.cancel();tk=nw;curY=y;minX=nmin;setX(ex);syncBar();busy=false};
}

/* ---------- input ---------- */
let raf=0,drag=null,moved=false,wheelAcc=0,wheelT=0;
root.addEventListener('pointerdown',e=>{
  if(busy||e.button>0||e.target.closest('.erBack,.erBar'))return;
  drag={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now(),lx:e.clientX,ly:e.clientY,vx:0,vy:0,p0:px,c0x:cam.tx,c0y:cam.ty};moved=false;
  cancelAnimationFrame(raf);
});
root.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y,now=performance.now(),dt=Math.max(1,now-drag.t);
  if(!moved&&Math.hypot(dx,dy)>6){moved=true;root.classList.add('grab');try{root.setPointerCapture(e.pointerId)}catch{}}
  if(!moved)return;
  drag.vx=.8*drag.vx+.2*((e.clientX-drag.lx)/dt*16);drag.vy=.8*drag.vy+.2*((e.clientY-drag.ly)/dt*16);drag.lx=e.clientX;drag.ly=e.clientY;drag.t=now;
  if(mode==='year'){const p=drag.p0+dx;setX(rub(p));drag.raw=p;edgeUI(p)}
  else if(mode==='map'){cam.tx=drag.c0x+dx;cam.ty=drag.c0y+dy;clampCam();world.style.transition='none';applyCam()}
});
const end=e=>{
  if(!drag||(e&&e.pointerId!==drag.id))return;const d=drag;drag=null;root.classList.remove('grab');
  if(mode==='year'&&moved){
    const raw=d.raw??px,i=YEARS.indexOf(curY);
    if(raw>EDGE&&i>0){step(-1);return}
    if(raw<minX-EDGE&&i<YEARS.length-1){step(1);return}
    eL.classList.remove('on');eR.classList.remove('on');glide(d.vx);
  }
};
root.addEventListener('pointerup',end);root.addEventListener('pointercancel',end);
function glide(v){
  cancelAnimationFrame(raf);let x=px;
  const f=()=>{
    v*=.94;x+=v;
    if(x>0){x*=.8;v*=.5}else if(x<minX){x=minX+(x-minX)*.8;v*=.5}
    setX(x);
    if(Math.abs(v)>.3||x>.5||x<minX-.5)raf=requestAnimationFrame(f);else setX(Math.max(minX,Math.min(0,x)));
  };raf=requestAnimationFrame(f);
}
root.addEventListener('click',e=>{
  if(moved){moved=false;e.stopPropagation();return}
  const t=e.target.closest('.erTile');if(t&&mode==='map')openYear(+t.dataset.y);
},true);
root.addEventListener('wheel',e=>{
  if(busy)return;e.preventDefault();
  if(mode==='map'){cam.ty-=e.deltaY;cam.tx-=e.deltaX;clampCam();world.style.transition='none';applyCam();return}
  if(mode!=='year')return;
  const d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY,i=YEARS.indexOf(curY);
  cancelAnimationFrame(raf);
  let p=px-d;
  if(p>0&&i>0||p<minX&&i<YEARS.length-1){
    wheelAcc+=d;clearTimeout(wheelT);wheelT=setTimeout(()=>{wheelAcc=0;setX(Math.max(minX,Math.min(0,px)))},220);
    if(p>0&&wheelAcc<-260){wheelAcc=0;step(-1);return}
    if(p<minX&&wheelAcc>260){wheelAcc=0;step(1);return}
    setX(rub(p));edgeUI(p);return;
  }
  wheelAcc=0;setX(Math.max(minX,Math.min(0,p)));eL.classList.remove('on');eR.classList.remove('on');
},{passive:false});
addEventListener('keydown',e=>{
  if(pg.hidden||!root.classList.contains('activeScreen'))return;
  if(e.key==='Escape'&&mode==='year'){zoomOut()}
  else if(mode==='year'&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){
    const d=e.key==='ArrowRight'?-1:1,i=YEARS.indexOf(curY),np=px+d*340;
    if(np>0&&px>=-1&&i>0)step(-1);else if(np<minX&&px<=minX+1&&i<YEARS.length-1)step(1);else{cancelAnimationFrame(raf);const from=px,to=Math.max(minX,Math.min(0,np)),t0=performance.now();const f=t=>{const k=Math.min(1,(t-t0)/280),q=1-Math.pow(1-k,3);setX(from+(to-from)*q);if(k<1)raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f)}
  }
});
addEventListener('resize',()=>{
  if(!root.classList.contains('activeScreen'))return;
  if(mode==='map'){layoutMap()}else if(mode==='year'&&tk){vw=innerWidth;vh=innerHeight;minX=measure(tk);setX(Math.max(minX,Math.min(0,px)))}
});

/* ---------- page hooks ---------- */
function init(){
  if(built)return;build();if(!YEARS.length)return;shell();makeTiles();built=true;
}
window.PH=window.PH||{};
PH.eras={
  show(){init();root.classList.add('activeScreen');document.body.classList.add('erOn');
    if(mode==='map'){requestAnimationFrame(()=>{world.style.transition='none';world.style.opacity='1';world.style.visibility='visible';layoutMap()})}
    else{vw=innerWidth;vh=innerHeight;if(tk){minX=measure(tk);setX(Math.max(minX,Math.min(0,px)))}}},
  hide(){root.classList.remove('activeScreen');document.body.classList.remove('erOn');cancelAnimationFrame(raf)}
};
window.Eras={get data(){return BY},get meta(){return META},get years(){return YEARS},get mode(){return mode},open:openYear,back:zoomOut,step};
})();
