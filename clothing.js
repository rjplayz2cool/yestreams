/* Clothing page: Yeezy Archive | Tour Merch | Yeezy.com, plus a Change Theme (yeezy.com-style) view */
(()=>{
const pg=document.getElementById('pg-clothing'),root=document.getElementById('clScreen');if(!pg||!root)return;
const KEY='clTheme',get=()=>{try{return localStorage.getItem(KEY)==='1'}catch{return false}},put=v=>{try{localStorage.setItem(KEY,v?'1':'0')}catch{}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let on=get(),tab='arch';
const st=document.createElement('style');st.textContent=`
.clScreen{max-width:1380px;margin:0 auto;padding:84px 22px 90px;color:#fff}
.clScreen .eyebrow{color:var(--accent2);font-weight:800;letter-spacing:.18em;font-size:12px}
.clScreen .title{font-size:clamp(40px,6vw,76px);font-weight:900;letter-spacing:-.055em;margin:4px 0}
.clScreen .muted{color:#bbb}
.clBar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:18px 0 22px}
.clBar .tNav{margin:0}
.clTh{border:1px solid #ffffff40;background:#ffffff0d;color:#fff;border-radius:999px;padding:8px 16px;font:600 12px/1 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}
.clTh:hover{background:#ffffff24}
.clPane[hidden]{display:none}
.clS01 .mcI img{object-fit:cover;width:100%;height:100%}
.clYz a{color:inherit}
.clNote{margin:0 0 14px;color:#fff9;font-size:13px}
.clNote a{color:#fff}
.clX{display:grid;place-items:center;aspect-ratio:1;background:#ffffff0d;font:700 15px/1 ui-monospace,Menlo,monospace;letter-spacing:.12em;color:#fff9}
/* yeezy.com style */
body.clyOn header .mark,body.clyOn header .live,body.clyOn header #upd{color:#000!important;text-shadow:none!important}
.clScreen.clY{position:fixed;inset:0;z-index:50;background:#fff;color:#000;overflow:auto;max-width:none;margin:0;padding:64px 16px 60px;font-family:Helvetica,Arial,sans-serif;text-transform:uppercase;letter-spacing:.06em}
.clScreen.clY .eyebrow,.clScreen.clY .muted,.clScreen.clY .title{display:none}
.clY .clWm{display:block!important}
.clWm{display:none;text-align:center;font:700 22px/1 Helvetica,Arial,sans-serif;letter-spacing:.5em;padding-left:.5em;margin:14px 0 22px}
.clY .clBar{justify-content:center;margin:0 0 18px;gap:18px}
.clY .tNav{gap:22px}
.clY .tNav button{border:0;border-radius:0;background:none;color:#9a9a9a;padding:6px 0;font:400 11px/1 Helvetica,Arial,sans-serif;letter-spacing:.14em;border-bottom:1px solid transparent}
.clY .tNav button:hover{color:#000;background:none}
.clY .tNav button[aria-current=true]{background:none;color:#000;border-bottom-color:#000}
.clY .clTh{border-radius:0;border:1px solid #000;background:#fff;color:#000;font:400 10px/1 Helvetica,Arial,sans-serif}
.clY .clTh:hover{background:#000;color:#fff}
.clY .tHead{justify-content:center;text-align:center;margin:8px 0 14px}
.clY .tHead h2{font:400 12px/1 Helvetica,Arial,sans-serif;letter-spacing:.2em;color:#000}
.clY .tHead p{color:#8a8a8a;font-size:10px;letter-spacing:.14em}
.clY .tChips{justify-content:center}
.clY .tChips button{border:0;border-radius:0;background:none;color:#9a9a9a;padding:4px 6px;font:400 10px/1 Helvetica,Arial,sans-serif;letter-spacing:.14em}
.clY .tChips button.on{background:none;color:#000;text-decoration:underline;text-underline-offset:4px}
.clY .yaQ{display:block;margin:0 auto 20px;border-radius:0;border:0;border-bottom:1px solid #000;background:none;color:#000;text-align:center;font:400 11px Helvetica,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase}
.clY .yaQ::placeholder{color:#9a9a9a}
.clY .mGrid{gap:26px 14px;grid-template-columns:repeat(auto-fill,minmax(170px,1fr))}
.clY .mc,.clY .yaT{background:none;border-radius:0;color:#000}
.clY .mcI{background:#fff}.clY .mcI img{mix-blend-mode:multiply}
.clY .mcN{padding:8px 0 0;font:400 10px/1.5 Helvetica,Arial,sans-serif;letter-spacing:.12em;text-align:center;color:#000}
.clY .yaT small{color:#555}
.clY .mSec h3{font:400 11px/1 Helvetica,Arial,sans-serif;letter-spacing:.2em;color:#000;text-align:center;margin:26px 0 14px}
.clY .mcI.x,.clY .clX{background:#f2f2f2;color:#888}
.clY .tEmpty,.clY .yaCr,.clY .clNote{color:#8a8a8a;text-align:center;font-size:10px}
.clY .yaCr a,.clY .clNote a{color:#000}
.clY .yaMore{border-radius:0;border:1px solid #000;background:#fff;color:#000;font:400 10px/1 Helvetica,Arial,sans-serif}
.clY .yaMore:hover{background:#000;color:#fff}
.clY .tYBtn{background:#fff;color:#000;border:1px solid #000;border-radius:0;box-shadow:none;font:400 11px/1 Helvetica,Arial,sans-serif;letter-spacing:.14em;padding:8px 12px}
.clY .tYBtn i{border-color:#000}
.clY .tYMenu{background:#fff;border:1px solid #000;border-radius:0;box-shadow:none}
.clY .tYMenu li{color:#000;border-radius:0;font:400 11px/1 Helvetica,Arial,sans-serif}
.clY .tYMenu li:hover,.clY .tYMenu li:focus-visible{background:#f2f2f2;color:#000}
.clY .tYMenu li[aria-selected=true]{background:#000;color:#fff}
.clY .tYMenu li[aria-selected=true]::after{border-color:#fff}
.clScreen.clY.in{animation:clIn .7s cubic-bezier(.2,.8,.2,1) both}
.clScreen.clY.in>*{animation:clUp .7s cubic-bezier(.2,.8,.2,1) both}
.clScreen.clY.in>*:nth-child(2){animation-delay:.1s}.clScreen.clY.in>*:nth-child(3){animation-delay:.18s}.clScreen.clY.in>*:nth-child(4){animation-delay:.26s}
.clScreen.clY.out{animation:clOut .35s ease both;pointer-events:none}
@keyframes clIn{from{clip-path:circle(0% at 50% 20%);opacity:.4}to{clip-path:circle(150% at 50% 20%);opacity:1}}
@keyframes clUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
@keyframes clOut{to{opacity:0}}
@media(prefers-reduced-motion:reduce){.clScreen.clY.in,.clScreen.clY.in>*,.clScreen.clY.out{animation:none}}
@media(max-width:700px){.clScreen{padding:84px 16px 90px}.clY .mGrid{grid-template-columns:repeat(2,1fr)}}
`;document.head.appendChild(st);
root.innerHTML=`<div class="eyebrow">STYLE</div><h1 class="title">CLOTHING</h1><div class="muted">Every piece in the Yeezy archive, the tour merch, and what's on yeezy.com now.</div>
<div class="clWm">YEEZY</div>
<div class="clBar"><div class="tNav" role="tablist"><button type="button" data-t="arch">Yeezy Archive</button><button type="button" data-t="tour">Tour Merch</button><button type="button" data-t="yz">Yeezy.com</button><button type="button" data-t="s01">SEASON 01</button><button type="button" data-t="dal">Dallas Merch</button></div><button type="button" class="clTh" data-th>Change Theme</button></div>
<section class="clPane" data-p="arch"></section><section class="clPane" data-p="tour" hidden></section><section class="clPane clYz" data-p="yz" hidden></section><section class="clPane clS01" data-p="s01" hidden></section><section class="clPane clS01" data-p="dal" hidden></section>`;
const P=k=>root.querySelector('[data-p="'+k+'"]'),done={};
let yzG='All',storeP=null;
const SW='https://cdn.swell.store/yzy-prod/';
const loadStore=()=>window.YEEZY_STORE?Promise.resolve(window.YEEZY_STORE):storeP||(storeP=new Promise((res,rej)=>{const sc=document.createElement('script');sc.src='data/yeezy-store.js?v=3';sc.onload=()=>res(window.YEEZY_STORE);sc.onerror=()=>{storeP=null;rej()};document.head.appendChild(sc)}));
function renderYz(){const el=P('yz'),U=window.__tourUI;
 el.innerHTML='<div class="tHead"><div><h2>Yeezy.com</h2><p>Loading…</p></div></div>';
 loadStore().then(L=>{
  const fl=L.filter(x=>yzG==='All'||(yzG==='Men'?x[2]==='M'||x[2]==='U':yzG==='Women'?x[2]==='W'||x[2]==='U':true));
  el.innerHTML=`<div class="tHead"><div><h2>Yeezy.com</h2><p>${fl.length} products on the store now</p></div></div>
  <div class="tChips">${['All','Men','Women'].map(g=>`<button type="button" data-g="${g}" class="${g===yzG?'on':''}">${g}</button>`).join('')}</div>
  <p class="clNote">Current lineup from <a href="https://yeezy.com/" target="_blank" rel="noopener noreferrer">yeezy.com</a>, as of 31 Oct 2026. Buy at yeezy.com.</p>
  <div class="mGrid">${fl.map(x=>`<button type="button" class="yaT mc" data-k="${L.indexOf(x)}" aria-label="${esc(x[0]+' '+x[1])}"><div class="mcI"><img loading="lazy" referrerpolicy="no-referrer" alt="" src="${esc(SW+x[6][0])}"></div><div class="mcN">${esc(x[0])} · ${esc(x[1])}<small>${x[4]===2?'COMING SOON':'$'+x[3]+(x[4]?' · Sold out':'')}</small></div></button>`).join('')}</div>`;
  el.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{yzG=b.dataset.g;renderYz()});
  el.querySelectorAll('.yaT').forEach(b=>b.onclick=()=>{const x=L[+b.dataset.k];U.openViewer({n:x[0],p:x[4]===2?'COMING SOON':'$'+x[3]},x[6].map(u=>SW+u))})
 }).catch(()=>{el.innerHTML='<div class="tEmpty">Could not load. Refresh and try again.</div>'})}
const S01=Array.from({length:36},(_,i)=>'assets/season-01/look-'+String(i+1).padStart(2,'0')+'.jpg');
function renderS01(){const el=P('s01'),U=window.__tourUI;
 el.innerHTML=`<div class="tHead"><div><h2>SEASON 01</h2><p>${S01.length} looks · Runway show, Nov 4, 2026</p></div></div>
 <p class="clNote">Images from <a href="https://www.instagram.com/yzy/" target="_blank" rel="noopener noreferrer">@yzy</a> on Instagram.</p>
 <div class="mGrid">${S01.map((u,i)=>`<button type="button" class="yaT mc" data-k="${i}" aria-label="SEASON 01 look ${i+1}"><div class="mcI"><img loading="lazy" alt="" src="${esc(u)}"></div><div class="mcN">SEASON 01 · LOOK ${String(i+1).padStart(2,'0')}<small>COMING SOON</small></div></button>`).join('')}</div>`;
 el.querySelectorAll('.yaT').forEach(b=>b.onclick=()=>{const i=+b.dataset.k;U&&U.openViewer({n:'SEASON 01',p:'COMING SOON'},S01.slice(i).concat(S01.slice(0,i)))})}
const DAL=[{"c": "HT-04", "n": "Star Beanie", "i": ["assets/dallas-merch/ht-04-front.jpg", "assets/dallas-merch/ht-04-back.jpg"]}, {"c": "BP-03", "n": "Ye World Tour Backpack", "i": ["assets/dallas-merch/bp-03.jpg"]}, {"c": "LS-03", "n": "Live At AT&T Stadium Long Sleeve \u00b7 Black", "i": ["assets/dallas-merch/ls-03-black-front.jpg", "assets/dallas-merch/ls-03-black-back.jpg"]}, {"c": "LS-03", "n": "Live At AT&T Stadium Long Sleeve \u00b7 White", "i": ["assets/dallas-merch/ls-03-white-front.jpg", "assets/dallas-merch/ls-03-white-back.jpg"]}, {"c": "TS-07", "n": "Live At AT&T Stadium Tee \u00b7 Black / Red", "i": ["assets/dallas-merch/ts-07-black-red-front.jpg", "assets/dallas-merch/ts-07-black-red-back.jpg"]}, {"c": "TS-07", "n": "Live At AT&T Stadium Tee \u00b7 Black / Silver", "i": ["assets/dallas-merch/ts-07-black-silver-front.jpg", "assets/dallas-merch/ts-07-black-silver-back.jpg"]}, {"c": "TS-07", "n": "Live At AT&T Stadium Tee \u00b7 White", "i": ["assets/dallas-merch/ts-07-white-front.jpg", "assets/dallas-merch/ts-07-white-back.jpg"]}];
function renderDal(){const el=P('dal'),U=window.__tourUI;
 el.innerHTML=`<div class="tHead"><div><h2>DALLAS MERCH</h2><p>${DAL.length} items · Ye Live At AT&amp;T Stadium · 11.07.26</p></div></div>
 <p class="clNote">Official store: <a href="https://merch.yeezy.com/" target="_blank" rel="noopener noreferrer">merch.yeezy.com</a></p>
 <div class="mGrid">${DAL.map((d,i)=>`<button type="button" class="yaT mc" data-k="${i}" aria-label="${esc(d.c+' '+d.n)}"><div class="mcI"><img loading="lazy" alt="" src="${esc(d.i[0])}"></div><div class="mcN">${esc(d.c)} · ${esc(d.n)}<small>${d.i.length} photo${d.i.length>1?"s":""}</small></div></button>`).join('')}</div>`;
 el.querySelectorAll('.yaT').forEach(b=>b.onclick=()=>{const d=DAL[+b.dataset.k];U&&U.openViewer({n:d.c+' · '+d.n,p:'Dallas · 11.07.26'},d.i)})}
function setTab(t){tab=t;root.querySelectorAll('.tNav button').forEach(b=>b.setAttribute('aria-current',b.dataset.t===t?'true':'false'));root.querySelectorAll('.clPane').forEach(p=>p.hidden=p.dataset.p!==t);
 const U=window.__tourUI;if(!U||done[t])return;done[t]=1;if(t==='arch')U.renderArch(P('arch'));else if(t==='tour')U.ready().then(()=>U.renderMerch(P('tour')));else if(t==='s01')renderS01();else if(t==='dal')renderDal();else renderYz()}
root.querySelectorAll('.tNav button').forEach(b=>b.onclick=()=>{setTab(b.dataset.t);scrollTo({top:0});root.scrollTo&&root.scrollTo({top:0})});
function sync(){const show=on&&!pg.hidden;document.body.classList.toggle('clyOn',show);
 if(show&&(!root.classList.contains('clY')||root.classList.contains('out'))){clearTimeout(root._t);root.classList.remove('out');root.classList.add('clY');root.classList.remove('in');void root.offsetWidth;root.classList.add('in')}
 else if(!show&&root.classList.contains('clY')){if(pg.hidden){root.classList.remove('clY','in','out')}else{root.classList.remove('in');root.classList.add('out');root._t=setTimeout(()=>root.classList.remove('clY','out'),350)}}}
root.querySelector('[data-th]').onclick=()=>{on=!on;put(on);sync();if(!on)scrollTo({top:0})};
new MutationObserver(sync).observe(pg,{attributes:true,attributeFilter:['hidden']});
window.PH=window.PH||{};PH.clothing={show(){root.classList.add('activeScreen');setTab(tab);sync()},hide(){root.classList.remove('activeScreen');sync()}};
root.querySelector('.tNav button').setAttribute('aria-current','true');sync();
})();
