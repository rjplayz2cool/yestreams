/* Tours: Map / Recordings / Merch screens */
(()=>{
const root=document.getElementById('toursScreen'),pg=document.getElementById('pg-tours');if(!root||!pg)return;
const css=`
.yaSw{margin:0 0 16px}.yaBtn{border:1px solid #ffffff40;background:#ffffff0d;color:#fff;border-radius:999px;padding:8px 16px;font:600 12px/1 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:background .2s}.yaBtn:hover{background:#ffffff24}
.yaQ{width:100%;max-width:340px;margin:0 0 16px;padding:10px 14px;border-radius:999px;border:1px solid #ffffff2e;background:#ffffff0d;color:#fff;font:500 14px system-ui,sans-serif;outline:0}.yaQ:focus{border-color:#fff9}
.yaT{display:block;border:0;padding:0;background:#ffffff0a;border-radius:12px;overflow:hidden;color:#fff;text-align:left;cursor:pointer;transition:transform .2s}.yaT:hover{transform:translateY(-3px)}.yaT[disabled]{cursor:default;opacity:.7}.yaT:hover[disabled]{transform:none}
.yaT .mcI img{mix-blend-mode:multiply}.yaT .mcN{display:block}.yaT small{display:block;margin-top:3px;font-weight:500;letter-spacing:.04em;text-transform:none;color:#fff9}
.yaMore{display:block;margin:22px auto 0;border:1px solid #ffffff40;background:#ffffff0d;color:#fff;border-radius:999px;padding:11px 22px;font:700 12px/1 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}
.yaCr{margin:26px 0 0;color:#fff8;font-size:12px}.yaCr a{color:#fff}

.tNav{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0 0}
.tNav button{border:1px solid #ffffff26;background:#ffffff0d;color:#fffc;border-radius:999px;padding:8px 16px;font:600 12px/1 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:background .2s,color .2s,border-color .2s}
.tNav button:hover{background:#ffffff1c;color:#fff}
.tNav button[aria-current=true]{background:#fff;color:#000;border-color:#fff}
.tScr{display:none}.tScr.on{display:block;animation:tScrIn .38s cubic-bezier(.2,.8,.2,1)}
.tScr.fromL.on{animation-name:tScrInL}
@keyframes tScrIn{from{opacity:0;transform:translateX(36px)}to{opacity:1;transform:none}}
@keyframes tScrInL{from{opacity:0;transform:translateX(-36px)}to{opacity:1;transform:none}}
.tEdge{position:fixed;top:50%;right:8px;translate:0 -50%;z-index:40;display:grid;place-items:center;gap:6px;width:56px;height:96px;padding:0;border:0;background:none;color:#fff;cursor:pointer;-webkit-tap-highlight-color:transparent}
.tEdge.left{right:auto;left:8px}
.tEdge[hidden]{display:none}
.tEdge b{display:block;width:26px;height:26px;border-top:6px solid #fff;border-right:6px solid #fff;border-radius:3px;rotate:45deg;font-size:0;filter:drop-shadow(0 2px 12px #000b);animation:nudge 2s ease-in-out infinite;transition:scale .3s cubic-bezier(.34,1.45,.5,1)}
.tEdge.left b{rotate:-135deg;animation-name:nudgeL}
.tEdge:hover b,.tEdge:focus-visible b{scale:1.25}
.tEdge:focus-visible{outline:3px solid #fff;outline-offset:2px;border-radius:14px}
@media(min-width:701px){.tScr[data-s=rec],.tScr[data-s=merch]{padding:0 50px}}
@media(max-width:700px){.tEdge{width:36px;left:2px}.tEdge:not(.left){right:2px;left:auto}.tScr[data-s=rec],.tScr[data-s=merch]{padding:0 26px}.tEdge b{width:20px;height:20px;border-width:5px}}
.tHead{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;flex-wrap:wrap;margin:22px 0 14px}
.tHead h2{margin:0;font:800 clamp(22px,3.4vw,34px)/1 system-ui,sans-serif;letter-spacing:.04em;text-transform:uppercase}
.tHead p{margin:6px 0 0;color:#fff9;font-size:13px}
.tYSel{position:relative}
.tYBtn{display:inline-flex;align-items:center;gap:14px;background:#3a1a1e8c;color:#fff;border:2px solid #ffffffd9;border-radius:15px;padding:9px 16px 9px 20px;font:800 17px/1 system-ui,sans-serif;letter-spacing:.06em;cursor:pointer;backdrop-filter:blur(6px);transition:background .2s,border-color .2s,transform .2s}
.tYBtn:hover{background:#4d2227a6;border-color:#fff}
.tYBtn:focus-visible{outline:3px solid #fff6;outline-offset:3px}
.tYBtn i{width:9px;height:9px;border-right:2px solid #fff;border-bottom:2px solid #fff;rotate:45deg;translate:0 -3px;transition:rotate .25s cubic-bezier(.34,1.45,.5,1),translate .25s}
.tYSel[data-open=true] .tYBtn i{rotate:225deg;translate:0 2px}
.tYMenu{position:absolute;right:0;top:calc(100% + 10px);z-index:60;min-width:100%;margin:0;padding:6px;list-style:none;background:#150a0cf0;border:1px solid #ffffff2e;border-radius:16px;box-shadow:0 18px 40px #000a,0 0 0 1px #0006;backdrop-filter:blur(14px);transform-origin:top right;animation:tYIn .18s cubic-bezier(.2,.9,.3,1.1)}
.tYMenu[hidden]{display:none}

@keyframes tYIn{from{opacity:0;transform:translateY(-6px) scale(.96)}to{opacity:1;transform:none}}
.tYMenu li{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:10px 14px;border-radius:11px;color:#ffffffd9;font:700 15px/1 system-ui,sans-serif;letter-spacing:.06em;cursor:pointer;outline:0;transition:background .12s,color .12s}
.tYMenu li:hover,.tYMenu li:focus-visible{background:#ffffff1f;color:#fff}
.tYMenu li[aria-selected=true]{background:#fff;color:#000}
.tYMenu li[aria-selected=true]::after{content:"";width:5px;height:10px;border-right:2.5px solid #000;border-bottom:2.5px solid #000;rotate:45deg;translate:0 -1px}
.tYBtn{border:1px solid #ffffff2e;border-radius:14px;background:linear-gradient(180deg,#ffffff12,#ffffff00),#14141ad9;font:800 15px/1 system-ui,sans-serif;letter-spacing:.05em;padding:11px 16px 11px 18px;box-shadow:0 6px 18px #0004,inset 0 1px 0 #ffffff14}.tYBtn:hover{background:linear-gradient(180deg,#ffffff1a,#ffffff00),#1c1c24e6;border-color:#ffffff66}
.tYSel[data-open=true] .tYBtn{border-color:#fff;box-shadow:0 0 0 4px #ffffff22,0 6px 18px #0004}
.tYMenu{border-radius:18px;padding:8px;background:#101015f5;border:1px solid #ffffff26;box-shadow:0 24px 60px #000c,0 0 0 1px #0007;backdrop-filter:blur(20px)}
.tYMenu li{border-radius:11px;padding:11px 14px;font-size:14px}.tYMenu li:hover,.tYMenu li:focus-visible{background:#ffffff14}
.tYMenu li[aria-selected=true]{background:#ffffff22;color:#fff}.tYMenu li[aria-selected=true]::after{border-color:#fff}

.tChips{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 16px}
.tChips button{border:1px solid #ffffff26;background:#ffffff0d;color:#fffc;border-radius:999px;padding:7px 14px;font:600 12px/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
.tChips button.on{background:#fff;color:#000;border-color:#fff}
.rGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px}
.rc{background:#ffffff0b;border:1px solid #ffffff1c;border-radius:16px;overflow:hidden;cursor:pointer;transition:transform .25s cubic-bezier(.2,.8,.2,1),border-color .2s,background .2s;outline:0}
.rc:hover,.rc:focus-visible{transform:translateY(-3px);border-color:#ffffff55;background:#ffffff12}
.rc.na{cursor:default;opacity:.55}.rc.na:hover{transform:none}
.rcImg{position:relative;aspect-ratio:16/9;background:#111 center/cover;overflow:hidden}
.rcImg img{width:100%;height:100%;object-fit:cover;display:block;transition:scale .5s}
.rc:hover .rcImg img,.rc:hover .rcImg video{scale:1.05}.rcImg video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;opacity:0;transition:opacity .5s,scale .5s;pointer-events:none}.rcImg video.rdy{opacity:1}.rcImg img.rcPo{opacity:0;transition:opacity .4s,scale .5s}.rcImg img.rcPo.on{opacity:1}
.rcTag,.rcSpec{position:absolute;top:10px;padding:4px 8px;border-radius:7px;background:#000a;color:#fff;font:700 10px/1 system-ui,sans-serif;letter-spacing:.1em;backdrop-filter:blur(6px)}
.rcTag{left:10px}.rcSpec{right:10px}
.rcPlay{position:absolute;inset:0;margin:auto;width:52px;height:52px;border-radius:50%;background:#000a;display:grid;place-items:center;opacity:0;transition:opacity .2s;backdrop-filter:blur(6px)}
.rcPlay::after{content:"";border-left:16px solid #fff;border-top:10px solid transparent;border-bottom:10px solid transparent;margin-left:4px}
.rc:hover .rcPlay,.rc:focus-visible .rcPlay{opacity:1}
.rc.na .rcPlay{display:none}
.rcB{padding:12px 14px 14px}
.rcB h3{margin:0 0 7px;font:800 15px/1.2 system-ui,sans-serif;letter-spacing:.04em;text-transform:uppercase}
.rcCred{font-size:12px;color:#fffa;line-height:1.4}
.rcCred a{color:#fff;text-decoration:underline;text-underline-offset:2px}
.rcCred.off{color:#fff8}
.tEmpty{padding:60px 10px;text-align:center;color:#fff9}
.rcM{position:fixed;inset:0;z-index:200;background:#000d;backdrop-filter:blur(8px);display:grid;place-items:center;padding:18px;animation:tScrIn .25s}
.rcM[hidden]{display:none}
.rcMBox{width:min(1100px,100%);max-height:94vh;overflow:auto;background:#101014;border:1px solid #ffffff26;border-radius:18px;padding:16px}
.rcMTop{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px}
.rcMTop h3{margin:0;font:800 20px/1.1 system-ui,sans-serif;letter-spacing:.04em;text-transform:uppercase}
.rcMTop small{display:block;margin-top:5px;color:#fff9;font-size:12px}
.rcX{border:0;background:#ffffff1a;color:#fff;border-radius:50%;width:36px;height:36px;font-size:18px;cursor:pointer;flex:none}
.rcX:hover{background:#ffffff33}
.rcYt{position:relative;aspect-ratio:16/9;background:#000;border-radius:12px;overflow:hidden}.rcYt iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.rcMBox video{display:block;width:100%;max-height:60vh;background:#000;border-radius:12px}
.rcErr{margin:8px 0 0;color:#ffb4b4;font-size:13px}
.rcMCred{margin:14px 0 0;padding:12px 14px;border-radius:12px;background:#ffffff0d;font-size:13px;line-height:1.5}
.rcMCred b{display:block;font:700 11px/1 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#fff9;margin-bottom:6px}
.rcMCred a{color:#fff;text-underline-offset:2px}
.rcTs{margin-top:14px}.rcTs>b{display:block;font:700 11px/1 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#fff9;margin-bottom:8px}
.rcTsL{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:4px 14px}
.rcTsL button{display:flex;justify-content:space-between;gap:10px;text-align:left;border:0;background:none;color:#fff;padding:7px 8px;border-radius:8px;font:500 13px/1.2 system-ui,sans-serif;cursor:pointer}
.rcTsL button:hover{background:#ffffff1a}.rcTsL button i{font-style:normal;color:#fff9;font-variant-numeric:tabular-nums}
.mSec{margin:0 0 26px}.mSec h3{margin:0 0 10px;font:800 14px/1 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#fffc}
.mGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
.mc{position:relative;background:#ffffff0b;border:1px solid #ffffff1c;border-radius:14px;overflow:hidden;cursor:pointer;padding:0;color:#fff;text-align:left;transition:transform .25s cubic-bezier(.2,.8,.2,1),border-color .2s}
.mc:hover,.mc:focus-visible{transform:translateY(-3px);border-color:#ffffff55;outline:0}
.mcI{aspect-ratio:1;background:#fff;position:relative}
.mcI img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;transition:opacity .3s}
.mcI img.bk{opacity:0}.mc.flip .mcI img.bk,.mc:hover .mcI img.bk.h{opacity:1}.mc.flip .mcI img.fr,.mc:hover .mcI img.fr.h{opacity:0}
.mcI img.thr{filter:url(#tWhiteOut)}.mcI.x{display:grid;place-items:center;color:#fff6;font:700 10px/1 system-ui,sans-serif;letter-spacing:.12em}.mcI.x img{display:none}
.mcN{padding:9px 10px 11px;font:700 11px/1.25 system-ui,sans-serif;letter-spacing:.07em;text-transform:uppercase}
.mcF{position:absolute;right:7px;top:7px;font:700 9px/1 system-ui,sans-serif;letter-spacing:.1em;background:#000a;padding:4px 6px;border-radius:6px}
.mcF{display:none}.mc{cursor:pointer}
.yv{position:fixed;inset:0;z-index:2147483000;background:#fff;color:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:ui-monospace,'SFMono-Regular','Cascadia Mono',Menlo,Consolas,'Liberation Mono',monospace;animation:yvIn .22s ease;overscroll-behavior:contain;touch-action:pan-y}
.yv[hidden]{display:none}@keyframes yvIn{from{opacity:0}to{opacity:1}}@keyframes yvOut{from{opacity:1;transform:none}to{opacity:0;transform:scale(.97)}}.yv.out{animation:yvOut .26s ease forwards;pointer-events:none}
.yv :where(button){all:unset;cursor:pointer;display:grid;place-items:center;color:#000;-webkit-tap-highlight-color:transparent}
.yv :where(button):focus-visible{outline:1px solid #000;outline-offset:3px}
.yvB{position:absolute;left:10px;top:10px;width:40px;height:40px}
.yvStage{position:relative;width:min(100vw,760px);height:min(52vh,470px);display:flex;align-items:center;justify-content:center;margin-top:-6vh}
.yvStage img{max-width:min(62vw,400px);max-height:100%;object-fit:contain;transition:opacity .18s ease,transform .22s ease;user-select:none;-webkit-user-drag:none}
.yvStage img.o{opacity:0}.yvStage img.l{transform:translateX(-18px)}.yvStage img.r{transform:translateX(18px)}
.yvA{position:absolute;top:50%;width:44px;height:44px;margin-top:-22px}.yvA.l{left:0}.yvA.r{right:0}
.yv svg{width:15px;height:15px;stroke:#000;stroke-width:2.6;fill:none;stroke-linecap:square}
.yvDots{display:flex;gap:7px;height:8px;margin-top:30px;align-items:center}
.yvDots i{width:4px;height:4px;border-radius:50%;background:#d6d6d6;transition:background .2s}.yvDots i.on{background:#000}
.yvN{margin-top:14px;font-size:16px;line-height:1.2;letter-spacing:.02em;text-transform:uppercase;text-align:center;padding:0 16px}
.yvP{margin-top:30px;font:16px/1.2 -apple-system,'Helvetica Neue',Arial,sans-serif}
.yv .yvErr{font-size:12px;letter-spacing:.1em;color:#888}
@media(max-width:640px){.yvStage{height:46vh}.yvA.l{left:4px}.yvA.r{right:4px}.yvStage img{max-width:70vw}}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

/* ---- structure ---- */
const top=root.querySelector('.top');
const mapScr=document.createElement('div');mapScr.className='tScr on';mapScr.dataset.s='map';
[...root.children].forEach(ch=>{if(ch!==top)mapScr.appendChild(ch)});
const recScr=document.createElement('div');recScr.className='tScr';recScr.dataset.s='rec';
const merScr=document.createElement('div');merScr.className='tScr';merScr.dataset.s='merch';
root.append(mapScr,recScr,merScr);
const SC=[{k:'map',n:'Map',el:mapScr},{k:'rec',n:'Recordings',el:recScr},{k:'merch',n:'Merch',el:merScr}];
const nav=document.createElement('div');nav.className='tNav';nav.setAttribute('role','tablist');
SC.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.textContent=s.n;b.onclick=()=>show(i);nav.appendChild(b);s.btn=b});
top.after(nav);
const eL=document.createElement('button'),eR=document.createElement('button');
eL.className='tEdge left';eR.className='tEdge';eL.type=eR.type='button';
eL.innerHTML='<b aria-hidden="true">›</b>';eR.innerHTML='<b aria-hidden="true">›</b>';
eL.onclick=()=>show(cur-1);eR.onclick=()=>show(cur+1);pg.append(eL,eR);

let cur=0,A=null,year=null,recFilter='all',merchFilter='all',loading=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function show(i){if(i<0||i>=SC.length||i===cur)return;const dir=i<cur;cur=i;
 SC.forEach((s,j)=>{s.el.classList.toggle('on',j===i);s.el.classList.toggle('fromL',dir);s.btn.setAttribute('aria-current',j===i?'true':'false')});
 eL.hidden=i===0;eR.hidden=i===SC.length-1;
 eL.setAttribute('aria-label','Go to '+(SC[i-1]?.n||''));eR.setAttribute('aria-label','Go to '+(SC[i+1]?.n||''));
 scrollTo({top:0});if(i>0)ensure().then(()=>render())}
SC[0].btn.setAttribute('aria-current','true');eL.hidden=true;eR.setAttribute('aria-label','Go to Recordings');
function ensure(){if(A)return Promise.resolve();if(loading)return loading;
 loading=new Promise((res,rej)=>{const s=document.createElement('script');s.src='tours-archive.js?v=1794244058';s.onload=()=>{A=window.TOUR_ARCHIVE;year=Object.keys(A).sort().pop();res()};s.onerror=()=>{loading=null;rej()};document.head.appendChild(s)})
  .catch(()=>{[recScr,merScr].forEach(e=>e.innerHTML='<div class="tEmpty">Could not load the archive. Refresh and try again.</div>')});return loading}
document.addEventListener('keydown',e=>{if(pg.hidden||modal&&!modal.hidden||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(e.key==='ArrowRight')show(cur+1);if(e.key==='ArrowLeft')show(cur-1)});
new MutationObserver(()=>{[eL,eR].forEach(b=>b.style.display=pg.hidden?'none':'')}).observe(pg,{attributes:true,attributeFilter:['hidden']});[eL,eR].forEach(b=>b.style.display=pg.hidden?'none':'');

function yearSel(){const ys=Object.keys(A).sort().reverse();return `<div class="tYSel" data-open="false"><button type="button" class="tYBtn" aria-haspopup="listbox" aria-expanded="false" aria-label="Year"><span>${year}</span><i></i></button><ul class="tYMenu" role="listbox" aria-label="Year" hidden>${ys.map(y=>`<li role="option" tabindex="-1" data-y="${y}" aria-selected="${y===year}">${y}</li>`).join('')}</ul></div>`}
function bindYear(el){const box=el.querySelector('.tYSel'),btn=box.querySelector('.tYBtn'),menu=box.querySelector('.tYMenu'),items=[...menu.querySelectorAll('li')];
 const setOpen=o=>{box.dataset.open=o;btn.setAttribute('aria-expanded',o);menu.hidden=!o;if(o){(menu.querySelector('[aria-selected=true]')||items[0]).focus()}};
 const pick=li=>{year=li.dataset.y;recFilter='all';merchFilter='all';(el._re||render)()};
 btn.onclick=e=>{e.stopPropagation();setOpen(menu.hidden)};
 items.forEach((li,i)=>{li.onclick=e=>{e.stopPropagation();pick(li)};li.onkeydown=e=>{if(e.key==='ArrowDown'){e.preventDefault();items[Math.min(i+1,items.length-1)].focus()}else if(e.key==='ArrowUp'){e.preventDefault();items[Math.max(i-1,0)].focus()}else if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(li)}else if(e.key==='Escape'||e.key==='Tab'){e.stopPropagation();setOpen(false);btn.focus()}}});
 const away=e=>{if(!box.isConnected){document.removeEventListener('click',away);return}if(!box.contains(e.target))setOpen(false)};document.addEventListener('click',away)}
function render(){if(!A)return;if(cur===1)renderRec();if(cur===2)renderMerch()}

/* ---- Recordings ---- */
const CAT={live:'Live',visualizer:'Visualizer',event:'Event'};
const ytName={};
function ytTitle(url){if(ytName[url]!==undefined)return Promise.resolve(ytName[url]);
 try{const c=localStorage.getItem('ytn:'+url);if(c){ytName[url]=c;return Promise.resolve(c)}}catch{}
 return fetch('https://noembed.com/embed?url='+encodeURIComponent(url)).then(r=>r.json()).then(j=>{const n=j.author_name||'';ytName[url]=n;try{if(n)localStorage.setItem('ytn:'+url,n)}catch{}return n}).catch(()=>{ytName[url]='';return ''})}
function credHTML(s){return s.cr?`Credit · <a href="${esc(s.cr)}" target="_blank" rel="noopener noreferrer" ${s.cn?'':`data-yt="${esc(s.cr)}"`}>${s.cn?esc(s.cn)+' (YouTube)':'YouTube'}</a>`:(s.c==='visualizer'?'Official visualizer from Ye':'Official stream from Ye')}
/* 2026 live-show covers: a still frame taken from inside the recording itself (poster stays until the frame is ready) */
const fio='IntersectionObserver'in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){fio.unobserve(e.target);startFrame(e.target)}}),{rootMargin:'300px'}):null;
function startFrame(v){const u=v.dataset.src;if(!u)return;
 v.addEventListener('loadedmetadata',()=>{const d=v.duration;if(isFinite(d)&&d>0)try{v.currentTime=Math.max(5,Math.min(d*.14,d-5))}catch{}},{once:true});
 v.addEventListener('seeked',()=>{v.classList.add('rdy');v.pause();},{once:true});
 const po=()=>{const m=v.parentNode&&v.parentNode.querySelector('img.rcPo');if(m)m.classList.add('on')};v.addEventListener('error',()=>{po();v.remove()},{once:true});setTimeout(()=>{if(!v.classList.contains('rdy'))po()},12000);
 v.preload='metadata';v.src=u}
function frameCovers(scope){scope.querySelectorAll('video.rcFr').forEach(v=>{if(fio)fio.observe(v);else startFrame(v)})}
function renderRec(){const Y=A[year];if(!Y){recScr.innerHTML='';return}
 const cats=[...new Set(Y.shows.map(s=>s.c))];if(recFilter!=='all'&&!cats.includes(recFilter))recFilter='all';
 const list=Y.shows.filter(s=>recFilter==='all'||s.c===recFilter);
 recScr.innerHTML=`<div class="tHead"><div><h2>Show Recordings</h2><p>${Y.shows.filter(s=>s.v||s.yt||s.dr).length} recordings · ${year}</p></div>${yearSel()}</div>
 ${cats.length>1?`<div class="tChips">${['all',...cats].map(c=>`<button type="button" data-c="${c}" class="${c===recFilter?'on':''}">${c==='all'?'All':(CAT[c]||c)}</button>`).join('')}</div>`:''}
 ${list.length?`<div class="rGrid">${list.map(s=>{const i=Y.shows.indexOf(s);return `<article class="rc${s.v||s.yt||s.dr?'':' na'}" data-i="${i}" ${s.v||s.yt||s.dr?'tabindex="0" role="button"':''} aria-label="${esc(s.n)}"><div class="rcImg"><img loading="lazy" referrerpolicy="no-referrer" alt="" src="${esc(s.img)}"${year==='2026'&&s.c==='live'&&s.v&&!s.yt?' class="rcPo"':''}>${year==='2026'&&s.c==='live'&&s.v&&!s.yt?`<video class="rcFr" muted playsinline preload="none" tabindex="-1" aria-hidden="true" data-src="${esc(s.v)}"></video>`:''}<span class="rcTag">${esc(s.v||s.yt||s.dr?(CAT[s.c]||s.c):'Not yet available')}</span>${s.sp?`<span class="rcSpec">${esc(s.sp)}</span>`:''}<i class="rcPlay"></i></div><div class="rcB"><h3>${esc(s.n)}</h3><div class="rcCred${s.cr?'':' off'}">${s.v||s.yt||s.dr?credHTML(s):'Recording not released yet'}</div></div></article>`}).join('')}</div>`:'<div class="tEmpty">No recordings for this year yet.</div>'}`;
 bindYear(recScr);frameCovers(recScr);
 recScr.querySelectorAll('.tChips button').forEach(b=>b.onclick=()=>{recFilter=b.dataset.c;renderRec()});
 recScr.querySelectorAll('.rc:not(.na)').forEach(c=>{const open=()=>openModal(Y.shows[+c.dataset.i]);c.onclick=e=>{if(e.target.closest('a'))return;open()};c.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}}});
 recScr.querySelectorAll('a[data-yt]').forEach(a=>ytTitle(a.dataset.yt).then(n=>{if(n)a.textContent=n+' (YouTube)'}))}

/* ---- modal ---- */
let modal=null;
function secs(t){return String(t).split(':').reduce((a,x)=>a*60+(+x||0),0)}
function openModal(s){if(!modal){modal=document.createElement('div');modal.className='rcM';modal.hidden=true;modal.innerHTML='<div class="rcMBox" role="dialog" aria-modal="true"></div>';document.body.appendChild(modal);modal.onclick=e=>{if(e.target===modal)closeModal()};document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeModal()})}
 const box=modal.firstChild;
 box.innerHTML=`<div class="rcMTop"><div><h3>${esc(s.n)}</h3><small>${esc([CAT[s.c]||s.c,s.sp,year].filter(Boolean).join(' · '))}</small></div><button type="button" class="rcX" aria-label="Close">✕</button></div>
 ${s.dr?`<div class="rcYt"><iframe title="${esc(s.n)}" src="https://drive.google.com/file/d/${esc(s.dr)}/preview" allow="autoplay; fullscreen" allowfullscreen referrerpolicy="no-referrer"></iframe></div>`:s.yt?`<div class="rcYt"><iframe title="${esc(s.n)}" src="https://www.youtube-nocookie.com/embed/${esc(s.yt)}?rel=0" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`:`<video controls playsinline preload="metadata" poster="${esc(s.img)}" src="${esc(s.v)}"></video>`}<div class="rcErr" hidden>This video could not be played here. <a href="https://yetour.xyz/" target="_blank" rel="noopener noreferrer" style="color:#fff">Open it on yetour.xyz</a>.</div>
 <div class="rcMCred"><b>Credits</b>${s.cr?`Video by <a href="${esc(s.cr)}" target="_blank" rel="noopener noreferrer" ${s.cn?'':`data-yt="${esc(s.cr)}"`}>${s.cn?esc(s.cn)+' on YouTube':'the original uploader on YouTube'}</a>`:(s.c==='visualizer'?'Official visualizer from Ye.':s.c==='event'?'Full runway show video.':'Official stream from Ye.')}</div>
 ${(s.ts||[]).length?`<div class="rcTs"><b>Timestamps</b><div class="rcTsL">${s.ts.map(t=>`<button type="button" data-t="${secs(t[1])}"><span>${esc(t[0])}</span><i>${esc(t[1])}</i></button>`).join('')}</div></div>`:''}`;
 const v=box.querySelector('video'),fr=box.querySelector('iframe');if(v)v.onerror=()=>{box.querySelector('.rcErr').hidden=false};
 box.querySelector('.rcX').onclick=closeModal;
 box.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{if(fr&&s.yt){fr.src='https://www.youtube-nocookie.com/embed/'+s.yt+'?rel=0&autoplay=1&start='+(+b.dataset.t);fr.scrollIntoView({block:'nearest',behavior:'smooth'});return}v.currentTime=+b.dataset.t;v.play().catch(()=>{});v.scrollIntoView({block:'nearest',behavior:'smooth'})});
 box.querySelectorAll('a[data-yt]').forEach(a=>ytTitle(a.dataset.yt).then(n=>{if(n)a.textContent=n+' on YouTube'}));
 modal.hidden=false;document.body.style.overflow='hidden';box.querySelector('.rcX').focus()}
function closeModal(){if(!modal||modal.hidden)return;const v=modal.querySelector('video');if(v){v.pause();v.removeAttribute('src');v.load()}const fr=modal.querySelector('iframe');if(fr)fr.src='about:blank';modal.hidden=true;document.body.style.overflow=''}

/* ---- Merch ---- */
function vlabel(k){return (window.TOUR_ARCHIVE_VENUES||{})[k]||k.toUpperCase()}
/* white-background removal */
if(!document.getElementById('tWhiteOutSvg')){const d=document.createElement('div');d.id='tWhiteOutSvg';d.innerHTML='<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="tWhiteOut" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -66.67 -66.67 -66.67 0 198" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in" result="k"/></filter></svg>';document.body.appendChild(d)}
const cutCache=new Map(),Qm=[];let run=0;
function cut(bm){const s=Math.min(1,900/Math.max(bm.width,bm.height)),w=Math.max(1,Math.round(bm.width*s)),h=Math.max(1,Math.round(bm.height*s));
 const cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d',{willReadFrequently:true});x.drawImage(bm,0,0,w,h);
 const toUrl=()=>new Promise(r=>cv.toBlob(b=>r(URL.createObjectURL(b)),'image/png'));
 const id=x.getImageData(0,0,w,h),d=id.data,N=w*h;
 /* background colour = median of the opaque border pixels */
 const bx=[],by=[],bz=[];let bord=0,clear=0;
 const sample=i=>{const o=i*4;bord++;if(d[o+3]<200){clear++;return}bx.push(d[o]);by.push(d[o+1]);bz.push(d[o+2])};
 for(let i=0;i<w;i++){sample(i);sample((h-1)*w+i)}for(let j=1;j<h-1;j++){sample(j*w);sample(j*w+w-1)}
 const TR=clear>bord*.5;if(!TR&&bx.length<8)return toUrl();
 const med=a=>{a.sort((p,q)=>p-q);return a[a.length>>1]};const BR=TR?255:med(bx),BG=TR?255:med(by),BB=TR?255:med(bz);
 if(!TR&&Math.min(BR,BG,BB)<215)return toUrl();
 const seen=new Uint8Array(N),st=[],T=11;
 const push=i=>{if(seen[i])return;const o=i*4;if(d[o+3]>200&&Math.abs(d[o]-BR)<=T&&Math.abs(d[o+1]-BG)<=T&&Math.abs(d[o+2]-BB)<=T){seen[i]=1;st.push(i)}};
 for(let i=0;i<w;i++){push(i);push((h-1)*w+i)}for(let j=0;j<h;j++){push(j*w);push(j*w+w-1)}
 if(TR){for(let i=0;i<N;i++)if(d[i*4+3]<40)seen[i]=1}
 while(st.length){const i=st.pop(),xx=i%w;if(xx>0)push(i-1);if(xx<w-1)push(i+1);if(i>=w)push(i-w);if(i<N-w)push(i+w)}
 /* drop tiny detached specks (compression noise) */
 {const comp=new Int32Array(N);const sizes=[0];let cid=0;
  for(let s0=0;s0<N;s0++){if(seen[s0]||comp[s0])continue;cid++;let sz=0;const stk=[s0];comp[s0]=cid;
   while(stk.length){const i=stk.pop();sz++;const xx=i%w;
    if(xx>0&&!seen[i-1]&&!comp[i-1]){comp[i-1]=cid;stk.push(i-1)}
    if(xx<w-1&&!seen[i+1]&&!comp[i+1]){comp[i+1]=cid;stk.push(i+1)}
    if(i>=w&&!seen[i-w]&&!comp[i-w]){comp[i-w]=cid;stk.push(i-w)}
    if(i<N-w&&!seen[i+w]&&!comp[i+w]){comp[i+w]=cid;stk.push(i+w)}}
   sizes.push(sz)}
  const big=Math.max(...sizes);
  for(let i=0;i<N;i++)if(!seen[i]&&sizes[comp[i]]<big*.012)seen[i]=1}
 /* distance (1..L) of each kept pixel from the removed background; L grows with image size */
 const LMAX=Math.max(4,Math.min(10,Math.round(Math.max(w,h)/110))),R=LMAX+2;
 const lay=new Uint8Array(N);let front=[];
 const nb=i=>{const xx=i%w,r=[];if(xx>0)r.push(i-1);if(xx<w-1)r.push(i+1);if(i>=w)r.push(i-w);if(i<N-w)r.push(i+w);return r};
 for(let i=0;i<N;i++)if(!seen[i]&&nb(i).some(j=>seen[j])){lay[i]=1;front.push(i)}
 for(let L=2;L<=LMAX;L++){const nx=[];for(const i of front)for(const j of nb(i))if(!seen[j]&&!lay[j]){lay[j]=L;nx.push(j)}front=nx}
 const out=new Uint8ClampedArray(d);
 for(let i=0;i<N;i++){const o=i*4;
  if(seen[i]){out[o+3]=0;continue}
  if(!lay[i])continue;
  /* garment colour near this pixel: pixels beyond the soft edge, else the darkest nearby pixel */
  const px=i%w,py=(i-px)/w;let fr=0,fg=0,fb=0,n=0,dk=1e9,dr=0,dg=0,db=0;
  for(let dy=-R;dy<=R;dy++){const yy=py+dy;if(yy<0||yy>=h)continue;for(let dx=-R;dx<=R;dx++){const xx=px+dx;if(xx<0||xx>=w)continue;const j=yy*w+xx;if(seen[j])continue;const q=j*4;if(d[q+3]<200)continue;
    if(!lay[j]){fr+=d[q];fg+=d[q+1];fb+=d[q+2];n++}
    const lum=d[q]+d[q+1]+d[q+2];if(lum<dk){dk=lum;dr=d[q];dg=d[q+1];db=d[q+2]}}}
  if(n){fr/=n;fg/=n;fb/=n}else{fr=dr;fg=dg;fb=db}
  const vr=BR-fr,vg=BG-fg,vb=BB-fb,vv=vr*vr+vg*vg+vb*vb;
  if(vv<1800)continue; /* white garment on white: keep as is */
  let a=((BR-d[o])*vr+(BG-d[o+1])*vg+(BB-d[o+2])*vb)/vv;a=Math.max(0,Math.min(1,a));
  if(a>.97)continue;
  a=a<.18?0:Math.min(1,(a-.18)/.7);a=a*a*(3-2*a);
  out[o]=fr;out[o+1]=fg;out[o+2]=fb;out[o+3]=Math.round(Math.min(a*255,TR?d[o+3]:255))}
 id.data.set(out);x.putImageData(id,0,0);return toUrl()}
window.TOURS_CUT=bm=>cut(bm);
function clean(u){if(cutCache.has(u))return cutCache.get(u);const get=c=>fetch(u,{mode:'cors',referrerPolicy:'no-referrer',cache:c}).then(r=>{if(!r.ok)throw new Error('http '+r.status);return r.blob()});const px=()=>fetch('https://wsrv.nl/?n=-1&url='+encodeURIComponent(u.replace(/^https?:\/\//,'')),{mode:'cors',referrerPolicy:'no-referrer'}).then(r=>{if(!r.ok)throw new Error('http '+r.status);return r.blob()});const p=get('default').catch(()=>get('reload')).catch(px).then(b=>createImageBitmap(b)).then(cut);cutCache.set(u,p);return p}
function missing(img){const box=img.parentElement;img.hidden=true;if(img.classList.contains('fr')){box.classList.add('x');if(!box.querySelector('i'))box.insertAdjacentHTML('beforeend','<i style="font-style:normal">NO IMAGE</i>');const mc=box.closest('.mc');mc&&mc.classList.add('noflip')}}
function firstOk(list,i=0){return new Promise((res,rej)=>{const t=new Image();t.onload=()=>res(list[i]);t.onerror=()=>rej(new Error('img'));t.src=list[i]}).catch(err=>{if(i+1<list.length)return firstOk(list,i+1);throw err})}
function pump(){while(run<4&&Qm.length){const img=Qm.shift();run++;
 const done=()=>{run--;pump()};let list;try{list=JSON.parse(img.dataset.u)}catch{list=[img.dataset.u]}
 firstOk(list).then(u=>{img.src=u;done()},err=>{img.onerror=()=>{img.onerror=null;missing(img)};img.src=list[0];done()})}}
const mio='IntersectionObserver'in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){mio.unobserve(e.target);Qm.push(e.target);pump()}}),{rootMargin:'400px'}):null;
function watchImgs(scope){scope.querySelectorAll('img[data-u]').forEach(i=>{if(mio)mio.observe(i);else{Qm.push(i);pump()}})}

function mUrls(y,v,file){const e=encodeURIComponent,f=/^https?:/.test(file)?null:file.split('/').map(e).join('/'),H='https://media.yetour.xyz/';
 if(!f)return [file];
 if(y==='2021')return [H+'donda/merch/'+f];
 if(y==='2023')return [H+'vultures/2023/merch/'+f];
 if(y==='2024')return [H+'2024/merch/'+f,H+'merch/2024/'+f,H+'2024/merch/'+e(v)+'/'+f];
 return [H+'merch/'+e(v)+'/'+f]}
/* ---- merch product viewer ---- */
let yv=null,yvPrev=null;
function openViewer(m,srcs){
 if(!srcs.length)return;
 yvPrev=document.activeElement;
 const svg=d=>'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="'+d+'"/></svg>';
 const L=svg('M10.5 2 4.5 8l6 6'),R=svg('M5.5 2l6 6-6 6');
 yv=document.createElement('div');yv.className='yv';yv.setAttribute('role','dialog');yv.setAttribute('aria-modal','true');yv.setAttribute('aria-label',m.n);
 const multi=srcs.length>1;
 yv.innerHTML='<button type="button" class="yvB" aria-label="Back">'+L+'</button><div class="yvStage"><img alt="'+esc(m.n)+'" draggable="false">'+(multi?'<button type="button" class="yvA l" aria-label="Previous view">'+L+'</button><button type="button" class="yvA r" aria-label="Next view">'+R+'</button>':'')+'</div><div class="yvDots">'+(multi?srcs.map(()=>'<i></i>').join(''):'')+'</div><div class="yvN">'+esc(m.n)+'</div>'+(m.p?'<div class="yvP">'+esc(m.p)+'</div>':'');
 document.body.appendChild(yv);document.documentElement.style.overflow='hidden';
 const img=yv.querySelector('.yvStage img'),dots=[...yv.querySelectorAll('.yvDots i')];let k=0,busy=false;
 srcs.forEach(u=>{const t=new Image();t.src=u});
 const set=(n,dir)=>{if(busy)return;busy=true;const go=()=>{k=(n+srcs.length)%srcs.length;img.onload=()=>{img.className='';busy=false};img.onerror=()=>{img.className='';busy=false};img.src=srcs[k];dots.forEach((d,q)=>d.classList.toggle('on',q===k))};
  if(dir&&img.src){img.className='o '+(dir>0?'l':'r');setTimeout(()=>{go();img.classList.add(dir>0?'r':'l');requestAnimationFrame(()=>requestAnimationFrame(()=>{img.className=''}))},170)}else go()};
 set(0,0);
 let closing=false;const close=()=>{if(closing)return;closing=true;document.removeEventListener('keydown',key,true);const el=yv;yv=null;el.classList.add('out');document.documentElement.style.overflow='';try{yvPrev&&yvPrev.focus({preventScroll:true})}catch{}let gone=false;const rm=()=>{if(!gone){gone=true;el.remove()}};el.addEventListener('animationend',rm);setTimeout(rm,400)};
 const step=d=>{if(multi)set(k+d,d)};
 const key=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close()}else if(e.key==='ArrowRight'){e.preventDefault();step(1)}else if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}};
 document.addEventListener('keydown',key,true);
 yv.querySelector('.yvB').onclick=close;
 if(multi){yv.querySelector('.yvA.l').onclick=()=>step(-1);yv.querySelector('.yvA.r').onclick=()=>step(1)}
 let x0=null;yv.addEventListener('touchstart',e=>{x0=e.touches[0].clientX},{passive:true});
 yv.addEventListener('touchend',e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>50)step(dx<0?1:-1)},{passive:true});
 yv.querySelector('.yvB').focus({preventScroll:true})}
function renderMerch(el=merScr){el._re=()=>renderMerch(el);const Y=A[year];if(!Y){el.innerHTML='';return}
 const vs=[...new Set(Y.merch.map(m=>m.v))];if(merchFilter!=='all'&&!vs.includes(merchFilter))merchFilter='all';
 const groups=vs.filter(v=>merchFilter==='all'||v===merchFilter);
 el.innerHTML=`<div class="tHead"><div><h2>Tour Merch</h2><p>${Y.merch.length} items · ${year}</p></div>${yearSel()}</div>
 ${vs.length>1?`<div class="tChips">${['all',...vs].map(v=>`<button type="button" data-v="${esc(v)}" class="${v===merchFilter?'on':''}">${v==='all'?'All':esc(vlabel(v))}</button>`).join('')}</div>`:''}
 ${groups.length?groups.map(v=>`<section class="mSec"><h3>${esc(vlabel(v))}</h3><div class="mGrid">${Y.merch.filter(m=>m.v===v).map(m=>{const fu=mUrls(year,m.v,m.f),bu=m.b?mUrls(year,m.v,m.b):null;return `<button type="button" class="mc" aria-label="${esc(m.n)}"><div class="mcI"><img class="fr${m.b?' h':''}" alt="${esc(m.n)}" data-u="${esc(JSON.stringify(fu))}">${m.b?`<img class="bk h" alt="" data-u="${esc(JSON.stringify(bu))}"><span class="mcF">FLIP</span>`:''}</div><div class="mcN">${esc(m.n)}</div></button>`}).join('')}</div></section>`).join(''):'<div class="tEmpty">No merch listed for this year.</div>'}`;
 bindYear(el);watchImgs(el);
 el.querySelectorAll('.tChips button').forEach(b=>b.onclick=()=>{merchFilter=b.dataset.v;renderMerch()});
 el.querySelectorAll('.mc').forEach((c,ix)=>{const m=Y.merch.filter(q=>groups.includes(q.v)).sort((a,b)=>groups.indexOf(a.v)-groups.indexOf(b.v))[ix];c.onclick=()=>{if(c.querySelector('.mcI.x')||!m)return;const imgs=[...c.querySelectorAll('img')];const srcs=imgs.map(i=>i.hidden?'':(i.currentSrc||i.src||(()=>{try{return JSON.parse(i.dataset.u)[0]}catch{return ''}})())).filter(Boolean);openViewer(m,srcs)}})}

/* ---- Yeezy Archive (all products, via yeezyarchive.net; Unreleased + PornHub items left out) ---- */
let YA=null,YAp=null;
function loadYA(){return YA?Promise.resolve(YA):YAp||(YAp=fetch('data/yeezy-archive.json?v=4').then(r=>{if(!r.ok)throw 0;return r.json()}).then(d=>YA=d).catch(e=>{YAp=null;throw e}))}
const yaImg=u=>u?(u[0]==='~'?'https://cdn.shopify.com/s/files/1/0231/9148/6542/files/'+u.slice(1):u[0]==='/'?'https://yeezyarchive.net'+u:u):'';
const yaFold=t=>String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
function renderArch(el){const S=el._ya||(el._ya={q:'',g:'All',n:96});
 if(!el._yaOk)el.innerHTML='<div class="tHead"><div><h2>Yeezy Archive</h2><p>Loading…</p></div></div>';
 return loadYA().then(d=>{el._yaOk=1;
  const groups=['All',...new Set(d.secs.map(s=>s[1]))];if(!groups.includes(S.g))S.g='All';
  const q=yaFold(S.q).split(/\s+/).filter(Boolean);
  const list=d.items.filter(it=>(S.g==='All'||(S.g==='Footwear'?it[5]===1:d.secs[it[3]][1]===S.g))&&q.every(w=>yaFold(it[0]+' '+d.secs[it[3]][0]).includes(w)));
  const shown=list.slice(0,S.n);
  el.innerHTML=`<div class="tHead"><div><h2>Yeezy Archive</h2><p>${list.length.toLocaleString()} products${S.g==='All'?'':' · '+esc(S.g)}</p></div></div>
  <div class="tChips">${groups.map(g=>`<button type="button" data-g="${esc(g)}" class="${g===S.g?'on':''}">${esc(g)}</button>`).join('')}</div>
  <input class="yaQ" type="search" placeholder="Search products" aria-label="Search products" value="${esc(S.q)}">
  ${shown.length?`<div class="mGrid">${shown.map(it=>{const im=yaImg(it[2]);return `<button type="button" class="yaT mc" ${im?'':'disabled'} data-k="${d.items.indexOf(it)}" aria-label="${esc(it[0])}"><div class="mcI${im?'':' x'}">${im?`<img loading="lazy" referrerpolicy="no-referrer" alt="" src="${esc(im)}">`:'NO IMAGE'}</div><div class="mcN">${esc(it[0])}${/^\$/.test(it[4])?`<small>${esc(it[4])}</small>`:''}</div></button>`}).join('')}</div>${list.length>shown.length?`<button type="button" class="yaMore" data-more>Show more (${(list.length-shown.length).toLocaleString()} left)</button>`:''}`:'<div class="tEmpty">No products match.</div>'}
  <p class="yaCr">Product list from <a href="https://yeezyarchive.net/" target="_blank" rel="noopener noreferrer">yeezyarchive.net</a>. Unreleased items are not included.</p>`;
  el.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{S.g=b.dataset.g;S.n=96;renderArch(el)});
  const qi=el.querySelector('.yaQ');qi.oninput=()=>{S.q=qi.value;S.n=96;clearTimeout(qi._t);qi._t=setTimeout(()=>{renderArch(el).then(()=>{const n=el.querySelector('.yaQ');if(n){n.focus();n.setSelectionRange(n.value.length,n.value.length)}})},220)};
  const mo=el.querySelector('[data-more]');if(mo)mo.onclick=()=>{const y=scrollY;S.n+=96;renderArch(el).then(()=>scrollTo({top:y}))};
  el.querySelectorAll('.yaT:not([disabled])').forEach(b=>b.onclick=()=>{const it=d.items[+b.dataset.k];const imgs=(it[6]&&it[6].length?it[6]:[it[2]]).map(yaImg).filter(Boolean);openViewer({n:it[0],p:/^\$/.test(it[4])?it[4]:''},imgs)})
 }).catch(()=>{el.innerHTML='<div class="tEmpty">Could not load the Yeezy Archive. Refresh and try again.</div>'})}
window.__tourUI={loadYA,yaImg,renderMerch:el=>ensure().then(()=>renderMerch(el)),renderArch,ready:()=>ensure().then(()=>A),openRec(id){const Y=A&&A['2026'];const sh=Y&&Y.shows.find(x=>String(x.id)===String(id));if(!sh)return;year='2026';openModal(sh)},merch(){return (A&&A['2026']&&A['2026'].merch)||[]},mUrls,watchImgs,openViewer,vlabel,esc};
})();
