/* Tours 2026 "Change Theme": official-tour-site look (text rows + recording buttons, Tour | Store tabs) */
(()=>{
const pg=document.getElementById('pg-tours'),yrs=document.getElementById('tYears');if(!pg||!yrs)return;
const KEY='yzTourTheme',REC={'2026-01-30':1,'2026-01-31':2,'2026-04-01':3,'2026-04-03':4,'2026-05-30':5,'2026-06-06':6,'2026-06-08':7,'2026-06-12':8,'2026-06-26':9,'2026-06-28':10,'2026-07-04':11,'2026-07-11':24,'2026-07-30':25,'2026-08-07':26,'2026-08-15':27,'2026-08-28':28,'2026-09-03':29,'2026-09-04':30,'2026-10-24':31};
const MON=['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const get=()=>{try{return localStorage.getItem(KEY)==='1'}catch{return false}},put=v=>{try{localStorage.setItem(KEY,v?'1':'0')}catch{}};
let on=get(),tab='tour',shows=null,ov=null;
const f=document.createElement('link');f.rel='stylesheet';f.href='https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap';document.head.appendChild(f);
const st=document.createElement('style');st.textContent=`
.yzBtn{margin:0 0 16px;border:1px solid #ffffff40;background:#ffffff0d;color:#fff;border-radius:999px;padding:8px 16px;font:600 12px/1 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}
.yzBtn:hover{background:#ffffff1f}.yzBtn[hidden]{display:none}
.yz{position:fixed;inset:0;z-index:50;background:#fff;color:#000;overflow:auto;font:400 14px/1.5 'IBM Plex Mono',ui-monospace,Menlo,Consolas,monospace;text-transform:uppercase;letter-spacing:.04em;-webkit-overflow-scrolling:touch}
.yz[hidden]{display:none}
.yz.in{animation:yzIn .7s cubic-bezier(.2,.8,.2,1) both}
.yz.in .yzIn>*{animation:yzUp .7s cubic-bezier(.2,.8,.2,1) both}
.yz.in .yzIn>*:nth-child(2){animation-delay:.1s}.yz.in .yzIn>*:nth-child(3){animation-delay:.18s}.yz.in .yzIn>*:nth-child(4){animation-delay:.26s}.yz.in .yzIn>*:nth-child(5){animation-delay:.34s}
.yz.out{animation:yzOut .35s ease both;pointer-events:none}
@keyframes yzIn{from{clip-path:circle(0% at 50% 30%);opacity:.4}to{clip-path:circle(150% at 50% 30%);opacity:1}}
@keyframes yzUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
@keyframes yzOut{to{opacity:0}}
@media(prefers-reduced-motion:reduce){.yz.in,.yz.in .yzIn>*,.yz.out{animation:none}}
body.yzOn header .mark,body.yzOn header .live,body.yzOn header #upd{color:#000!important;text-shadow:none!important}
.yzIn{max-width:480px;margin:0 auto;padding:68px 0 40px}
.yzHero{display:block;width:min(460px,100% - 20px);margin:0 auto;height:auto;aspect-ratio:460/305;object-fit:cover}
.yzH{text-align:center;margin:20px 0 24px;font-size:15px;line-height:1.9}
.yzTabs{display:grid;grid-template-columns:1fr 1fr;border-bottom:2px solid #c8c8c8}
.yzTabs button{background:none;border:0;border-bottom:2px solid transparent;margin-bottom:-2px;padding:12px 0;font:inherit;color:#b5b5b5;letter-spacing:.08em;cursor:pointer;text-transform:uppercase}
.yzTabs button[aria-selected=true]{color:#000;border-bottom-color:#000}
.yzRow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px 16px}
.yzRow>div{min-width:0}.yzRow p{margin:0;overflow-wrap:anywhere}
.yzRow.past p{color:#000}
.yzB{flex:none;border:1px solid #000;background:#fff;color:#000;padding:8px 14px;font:inherit;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;white-space:nowrap}
.yzB:hover{background:#000;color:#fff}
.yzB.off{border-color:#c8c8c8;color:#b5b5b5;cursor:default;background:#fff}
.yzSub{padding:6px 16px 0;color:#8a8a8a;font-size:11px}
.yzGrid{display:grid;grid-template-columns:1fr 1fr;gap:18px 12px;padding:20px 16px}
.yzP{border:0;background:none;padding:0;color:#000;font:inherit;text-transform:uppercase;text-align:left;cursor:pointer}
.yzP .i{aspect-ratio:1;background:#f4f4f4;display:grid;place-items:center;overflow:hidden}
.yzP img{width:100%;height:100%;object-fit:contain;mix-blend-mode:multiply}
.yzP img[hidden]{display:none}
.yzP .n{margin-top:8px;font-size:11px;line-height:1.35}.yzP .v{color:#8a8a8a;font-size:10px}
.yzSec{padding:14px 16px 0;font-size:11px;color:#8a8a8a;letter-spacing:.14em}
.yzFoot{text-align:center;color:#999;font-size:9px;line-height:2.2;padding:40px 16px 0}
.yzSw{position:absolute;top:66px;right:14px}
@media(max-width:520px){.yzIn{padding-top:64px}.yzRow{padding:18px 14px}.yzB{padding:8px 10px;font-size:12px}}
`;document.head.appendChild(st);
ov=document.createElement('div');ov.className='yz';ov.hidden=true;ov.setAttribute('aria-label','Tour 2026');document.body.appendChild(ov);
const btn=document.createElement('button');btn.type='button';btn.className='yzBtn';btn.textContent='Change Theme';btn.hidden=true;yrs.after(btn);
const sel2026=()=>{const a=yrs.querySelector('[aria-selected=true]');return !!a&&a.dataset.y==='2026'};
function loadShows(){if(shows)return Promise.resolve(shows);return new Promise(res=>{const go=()=>{shows=(window.TOUR_SHOWS||[]).filter(s=>String(s.date).startsWith('2026')).sort((a,b)=>a.date<b.date?-1:1);res(shows)};if(window.TOUR_SHOWS)return go();const s=document.createElement('script');s.src='tour-data.js';s.onload=go;s.onerror=()=>{shows=[];res(shows)};document.head.appendChild(s)})}
const city=c=>String(c||'').split(',')[0].trim();
const dstr=d=>{const [y,m,dd]=d.split('-').map(Number);return dd+' '+MON[m-1]+' '+y};
function rowHTML(s){const id=REC[s.date],past=s.date<(d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'))(new Date()),cityN=city(s.city);
 const b=id?`<button type="button" class="yzB" data-rec="${id}">Recording</button>`:`<button type="button" class="yzB off" disabled>${past?'No recording':'Upcoming'}</button>`;
 return `<div class="yzRow${past?' past':''}"><div><p>${esc(cityN)}</p><p>${esc(s.venue)}</p><p>${esc(dstr(s.date))}</p></div>${b}</div>`}
function paint(){if(!ov)return;
 const body=tab==='tour'?`<div id="yzList">${shows?shows.map(rowHTML).join(''):'<div class="yzSub">Loading…</div>'}</div>`:`<div id="yzStore"><div class="yzSub">Loading…</div></div>`;
 ov.innerHTML=`<div class="yzIn"><img class="yzHero" src="assets/yeezy-tour-hero.png" alt="Ye standing on the Earth"><div class="yzH">YE LIVE CONCERT<br>TOUR 2026</div><div style="text-align:center;margin:-8px 0 22px"><button type="button" class="yzB" data-sw style="padding:6px 12px;font-size:11px">Change Theme</button></div><div class="yzTabs" role="tablist"><button type="button" role="tab" data-t="tour" aria-selected="${tab==='tour'}">Tour</button><button type="button" role="tab" data-t="store" aria-selected="${tab==='store'}">Store</button></div>${body}<div class="yzFoot">Fan archive styled after tour.yeezy.com · not the official site<br>Recordings and merch images from yetour.xyz</div></div>`;
 if(tab==='tour'&&!shows)loadShows().then(()=>{if(tab==='tour')paint()});
 if(tab==='store')store()}
function store(){const U=window.__tourUI;if(!U)return;
 U.ready().then(()=>{const box=ov.querySelector('#yzStore');if(!box||tab!=='store')return;const M=U.merch();
  if(!M.length){box.innerHTML='<div class="yzSub">No merch listed.</div>';return}
  const vs=[...new Set(M.map(m=>m.v))];
  box.innerHTML=`<div class="yzSub">${M.length} items</div>`+vs.map(v=>`<div class="yzSec">${U.esc(U.vlabel(v))}</div><div class="yzGrid">${M.filter(m=>m.v===v).map(m=>`<button type="button" class="yzP" data-m="${M.indexOf(m)}"><div class="i"><img alt="${U.esc(m.n)}" data-u="${U.esc(JSON.stringify(U.mUrls('2026',m.v,m.f)))}"></div><div class="n">${U.esc(m.n)}</div></button>`).join('')}</div>`).join('');
  U.watchImgs(box);
  box.querySelectorAll('.yzP').forEach(b=>b.onclick=()=>{const m=M[+b.dataset.m];if(!m)return;const srcs=[U.mUrls('2026',m.v,m.f)[0]];if(m.b)srcs.push(U.mUrls('2026',m.v,m.b)[0]);const im=b.querySelector('img'),first=im.currentSrc||im.src;if(first&&!/^$/.test(first))srcs[0]=first;U.openViewer(m,srcs)})})}
function sync(){const ok=sel2026();btn.hidden=!ok||pg.hidden||on;const show=on&&ok&&!pg.hidden;
 document.body.classList.toggle('yzOn',show);
 if(show&&(ov.hidden||ov.classList.contains('out'))){clearTimeout(ov._t);ov.classList.remove('out');ov.hidden=false;paint();ov.classList.remove('in');void ov.offsetWidth;ov.classList.add('in')}else if(!show&&!ov.hidden&&!ov.classList.contains('out')){if(pg.hidden||!sel2026()){ov.hidden=true;ov.classList.remove('in')}else{ov.classList.remove('in');ov.classList.add('out');ov._t=setTimeout(()=>{ov.hidden=true;ov.classList.remove('out')},350)}}}
btn.onclick=()=>{on=true;put(true);tab='tour';sync()};
ov.addEventListener('click',e=>{if(e.target.closest('[data-sw]')){on=false;put(false);sync();scrollTo({top:0});return}
 const t=e.target.closest('[data-t]');if(t){tab=t.dataset.t;paint();return}
 const r=e.target.closest('[data-rec]');if(r&&window.__tourUI)window.__tourUI.ready().then(()=>window.__tourUI.openRec(r.dataset.rec))});
new MutationObserver(sync).observe(yrs,{childList:true,subtree:true,attributes:true,attributeFilter:['aria-selected']});
new MutationObserver(sync).observe(pg,{attributes:true,attributeFilter:['hidden']});
sync();
})();
