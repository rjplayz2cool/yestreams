/* Albums tab: every album Ye has worked on, with dates, alt names, tracklists, features, covers, tracker files and playable songs.
   Static details come from data/albums-meta.js (built by scripts/gen_albums_meta.py). Files, tracklists, art and audio are read
   live from data/ye-tracker-archive.txt and data/hosted-audio.json, so they stay in step with the hourly Ye Tracker sync. */
(()=>{
const pg=document.getElementById('pg-albums'),root=document.getElementById('alScreen');if(!pg||!root)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KIND={released:['Released','#b6ff39'],collab:['Collab','#6bd0ff'],unreleased:['Unreleased','#ff6a70'],produced:['Produced','#ffb86b'],pre:['Early work','#d4d4d4']};
const FILTERS=[['all','All'],['released','Released'],['unreleased','Unreleased'],['collab','Collabs'],['produced','Produced'],['pre','Early work']];
const SECS=['Unreleased','Recent','Best Of','Special','Worst Of','Grails/Wanted','Stems','Album Copies'];
const LISTEN=['Special','Best Of','Worst Of','Grails/Wanted','Unreleased','Recent'];
const keyOf=v=>String(v||'').replace(/\([^)]*\)/g,m=>/^\(\d{4}\)$/.test(m)?m:'').replace(/\s+/g,' ').trim().toLowerCase();
const tpl=document.createElement('template');
const txt=h=>{tpl.innerHTML=String(h||'').replace(/<br\s*\/?>/gi,'\n');return(tpl.content.textContent||'').replace(/[ \t]+\n/g,'\n').trim()};
const MONTHS={Jan:'Jan',Feb:'Feb',Mar:'Mar'};
const fmtDate=s=>{if(!s)return'';const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s);if(!m)return s;return new Date(+m[1],+m[2]-1,+m[3]).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})};
const num=n=>n==null?'':Number(n).toLocaleString('en-US');
const st=document.createElement('style');st.textContent=`
.alScreen{max-width:1280px;margin:0 auto;padding:84px 22px 100px;color:#fff}
.alScreen .eyebrow{color:var(--accent2);font-weight:800;letter-spacing:.18em;font-size:12px}
.alScreen h1.title{font-size:clamp(40px,6vw,76px);font-weight:900;letter-spacing:-.055em;margin:4px 0}
.alScreen .muted{color:#bbb}
.alTools{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:18px 0 8px}
.alTools input{flex:1 1 260px;min-width:0;background:#ffffff0f;border:1px solid #ffffff2e;border-radius:999px;padding:12px 18px;color:#fff;font:500 15px system-ui,sans-serif;outline:none}
.alTools input:focus{border-color:#ffffff80}
.alChips{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 18px}
.alChips button,.alTabs button,.alBtn{border:1px solid #ffffff40;background:#ffffff0d;color:#fff;border-radius:999px;padding:8px 16px;font:600 12px/1 system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;cursor:pointer}
.alChips button:hover,.alTabs button:hover,.alBtn:hover{background:#ffffff24}
.alChips button.on,.alTabs button.on{background:#fff;color:#000;border-color:#fff}
.alGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:18px}
.alCard{display:flex;flex-direction:column;gap:10px;text-align:left;background:none;border:0;color:#fff;cursor:pointer;padding:0;font:inherit}
.alCov{position:relative;aspect-ratio:1;border-radius:10px;overflow:hidden;background:#161616;border:1px solid #ffffff1c;transition:transform .2s,border-color .2s}
.alCard:hover .alCov,.alCard:focus-visible .alCov{transform:translateY(-3px);border-color:#ffffff66}
.alCov img{width:100%;height:100%;object-fit:cover;display:block}
.alFb{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:14px;text-align:center;font:900 clamp(18px,2.2vw,26px)/1.05 'Big Shoulders Display',Impact,Arial Narrow,sans-serif;letter-spacing:.01em;text-transform:uppercase;word-break:break-word}
.alBadge{position:absolute;left:8px;top:8px;font:800 9px/1 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;padding:5px 7px;border-radius:5px;background:#000c;color:var(--c)}
.alCard b{font-size:15px;line-height:1.2}
.alCard small{color:#ffffff99;font-size:12px;margin-top:-6px}
.alBack{margin-bottom:14px}
.alHero{display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr);gap:28px;align-items:start}
.alHero .alCov{cursor:default}
.alHero h2{font-size:clamp(32px,5vw,60px);font-weight:900;letter-spacing:-.045em;line-height:1;margin:6px 0 10px}
.alAlt{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 14px}
.alAlt span{background:#ffffff14;border:1px solid #ffffff26;border-radius:999px;padding:5px 11px;font-size:12px;color:#ffffffd0}
.alFacts{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:14px 0}
.alFacts div{background:#ffffff0c;border:1px solid #ffffff1a;border-radius:10px;padding:11px 13px;min-width:0}
.alFacts small{display:block;color:#ffffff88;font:700 10px/1 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;margin-bottom:6px}
.alFacts span{font-size:14px;line-height:1.3;overflow-wrap:anywhere}
.alTabs{display:flex;gap:8px;flex-wrap:wrap;margin:24px 0 16px;position:sticky;top:64px;z-index:5;padding:8px 0;background:#0a0a0aeb;backdrop-filter:blur(8px);border-radius:0 0 12px 12px}
.alPane h3{font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:#ffffffa0;margin:22px 0 10px}
.alPane h3:first-child{margin-top:4px}
.alChipsRow{display:flex;flex-wrap:wrap;gap:7px}
.alChipsRow span{background:#ffffff12;border:1px solid #ffffff22;border-radius:999px;padding:6px 12px;font-size:13px}
.alChipsRow span i{font-style:normal;color:#ffffff80;margin-left:6px;font-size:11px}
.alTL{counter-reset:t;list-style:none;margin:0;padding:0;display:grid;gap:2px}
.alTL li{display:flex;gap:12px;align-items:baseline;padding:9px 12px;border-radius:8px;background:#ffffff08}
.alTL li:nth-child(even){background:#ffffff0e}
.alTL li:before{counter-increment:t;content:counter(t);min-width:24px;color:#ffffff70;font-variant-numeric:tabular-nums;font-size:13px}
.alTL li span{flex:1;min-width:0;overflow-wrap:anywhere}
.alTL li em{font-style:normal;color:#ffffff80;font-size:12px;white-space:nowrap}
.alTLcard{background:#ffffff0a;border:1px solid #ffffff1c;border-radius:12px;padding:14px;margin:0 0 12px}
.alTLcard header{display:flex;flex-wrap:wrap;gap:6px 14px;align-items:baseline;margin-bottom:6px}
.alTLcard header b{font-size:16px}
.alTLcard header small{color:#ffffff88}
.alTLcard p{color:#ffffffb0;font-size:13px;line-height:1.45;margin:0 0 8px}
.alTLcard a{color:var(--accent2);font-size:12px}
.alList{display:grid;gap:6px}
.alRow{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center;background:#ffffff0a;border:1px solid #ffffff16;border-radius:10px;padding:10px 12px}
.alRow.open{border-color:#ffffff55}
.alPlay{width:34px;height:34px;border-radius:50%;border:0;background:#fff;color:#000;font-size:13px;cursor:pointer;display:grid;place-items:center}
.alRow b{display:block;font-size:14px;line-height:1.25;overflow-wrap:anywhere}
.alRow small{display:block;color:#ffffff88;font-size:12px;margin-top:3px;overflow-wrap:anywhere}
.alRow .alMeta{font-size:12px;color:#ffffffa0;text-align:right;white-space:nowrap}
.alEmbed{grid-column:1/-1}
.alEmbed iframe{display:block;width:100%;height:190px;border:0;border-radius:8px;background:#111}
.alEmbed audio{width:100%}
.alEmbed a{color:var(--accent2);font-size:12px;display:inline-block;margin-top:6px}
.alStats{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 14px}
.alStats div{background:#ffffff0c;border:1px solid #ffffff1a;border-radius:10px;padding:10px 14px;min-width:96px}
.alStats b{display:block;font-size:20px}
.alStats small{color:#ffffff88;font-size:11px;letter-spacing:.1em;text-transform:uppercase}
.alGo{display:inline-flex;align-items:center;gap:8px;background:var(--accent2);color:#000;border:0;border-radius:999px;padding:12px 20px;font:800 13px/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;margin:6px 8px 12px 0}
.alGo.ghost{background:#ffffff14;color:#fff;border:1px solid #ffffff40}
.alNote{color:#ffffff99;font-size:13px;margin:6px 0 14px;line-height:1.5}
.alLoad{padding:30px 0;color:#ffffffa0}
@media(max-width:720px){.alScreen{padding:76px 16px 90px}.alHero{grid-template-columns:1fr}.alHero .alCov{max-width:260px}.alGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.alRow{grid-template-columns:auto minmax(0,1fr)}.alRow .alMeta{grid-column:2;text-align:left;white-space:normal}.alTabs{top:56px}}
`;document.head.appendChild(st);

/* ---------- data ---------- */
const META=()=>window.ALBUMS_META||[];
let archive=null,archiveP=null,hosted=null,idx=null;
async function loadArchive(){
  if(archive)return archive;if(archiveP)return archiveP;
  archiveP=(async()=>{
    if(typeof DecompressionStream==='undefined')throw new Error('This browser is too old to open the archive.');
    const r=await fetch('data/ye-tracker-archive.txt',{cache:'no-cache'});if(!r.ok)throw new Error('Tracker data could not load.');
    const bin=atob((await r.text()).trim()),bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    const data=JSON.parse(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
    let h={};try{const hr=await fetch('data/hosted-audio.json');if(hr.ok)h=(await hr.json()).files||{}}catch{}
    hosted=h;archive=data;buildIndex();return archive;
  })().catch(e=>{archiveP=null;throw e});return archiveP;
}
function buildIndex(){
  idx={};
  archive.forEach((sec,si)=>{const hd=sec.headers,col=n=>hd.indexOf(n);
    sec.rows.forEach(r=>{
      const k=({'pusha t - daytona':'daytona','teyana taylor - k.t.s.e.':'k.t.s.e.'})[keyOf(r.era)]||keyOf(r.era);if(!k)return;
      const c=r.cells,get=n=>{const i=col(n);return i<0?'':txt(c[i]?.[0])};
      const nameRaw=txt((c[1]?.[0]||'').replace(/<span[^>]*>/g,'').replace(/<\/span>/g,''));
      const lines=nameRaw.split('\n').map(s=>s.trim()).filter(Boolean);
      const links=[...((c[c.length-1]?.[0]||'').matchAll(/href="([^"]+)"/g))].map(m=>m[1]);
      const rec={sec:sec.name,si,era:k,title:(lines[0]||'').replace(/^✨\s*/,''),sub:lines.slice(1).join(' '),notes:get('Notes'),len:get('Length')||get('Track Length')||get('Full Length')||get('Copy Length'),
        fileDate:get('File Date'),leak:get('Leak Date'),avail:get('Available Length')||get('Quality Length'),quality:get('Quality'),rel:get('Release Date'),type:get('Type'),links,
        star:/^✨/.test(lines[0]||''),raw:r,cells:c,hosted:links.map(l=>hosted[l]).find(Boolean)||null};
      (idx[k]||(idx[k]={}))[sec.name]=(idx[k][sec.name]||[]).concat(rec);
    })});
}
const rowsFor=(a,sec)=>(idx&&idx[keyOf(a.era)]&&idx[keyOf(a.era)][sec])||[];
const countOf=a=>{if(!idx)return null;const o=idx[keyOf(a.era)]||{};return(o['Unreleased']||[]).length+(o['Recent']||[]).length};
function official(a){
  if(!a.official||!window.KWORB_DB||!window.Catalog)return null;
  const al=(KWORB_DB.albums||[]).find(x=>x.name===a.official);return al||null;
}
const albumRelease=a=>{const al=official(a);const m=al&&window.ALBUM_META&&ALBUM_META[al.spotify];return m?.releaseDate||a.released||''};

/* ---------- state + list ---------- */
let filter='all',q='',cur=null,tab='overview';
const logo=(a)=>{const fb=`<div class="alFb">${esc(a.name)}</div>`;return a.cover?`<img src="${esc(a.cover)}" alt="" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'alFb',textContent:this.dataset.n}))" data-n="${esc(a.name)}">`:fb};
function list(){
  cur=null;
  const qq=q.trim().toLowerCase();
  const items=META().filter(a=>(filter==='all'||a.kind===filter)&&(!qq||(a.name+' '+a.alt.join(' ')+' '+a.years).toLowerCase().includes(qq)));
  root.innerHTML=`<div class="eyebrow">DISCOGRAPHY</div><h1 class="title">ALBUMS</h1><p class="muted">Every album Ye has worked on: released, scrapped, collabs and projects he produced. Pick one for dates, alt names, tracklists, files and songs you can play.</p>
  <div class="alTools"><input id="alQ" type="search" placeholder="Search albums or old titles…" value="${esc(q)}" aria-label="Search albums"></div>
  <div class="alChips">${FILTERS.map(([k,l])=>`<button type="button" data-f="${k}" class="${k===filter?'on':''}">${l}</button>`).join('')}</div>
  <div class="alGrid">${items.map(a=>{const [kl,kc]=KIND[a.kind]||KIND.unreleased,c=countOf(a);return `<button type="button" class="alCard" data-id="${esc(a.id)}"><div class="alCov">${logo(a)}<span class="alBadge" style="--c:${kc}">${kl}</span></div><b>${esc(a.name)}</b><small>${esc(a.years||'')}${c?` · ${num(c)} files`:''}</small></button>`}).join('')||'<p class="muted">No albums match.</p>'}</div>`;
  const qi=root.querySelector('#alQ');
  qi.oninput=()=>{q=qi.value;const pos=qi.selectionStart;list();const n=root.querySelector('#alQ');n.focus();n.setSelectionRange(pos,pos)};
  root.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{filter=b.dataset.f;list()});
  root.querySelectorAll('.alCard').forEach(b=>b.onclick=()=>open(b.dataset.id));
  if(!idx)loadArchive().then(()=>{if(!cur&&pg.hidden===false)list()}).catch(()=>{});
}

/* ---------- detail ---------- */
function open(id,t){
  const a=META().find(x=>x.id===id);if(!a)return;cur=a;tab=t||'overview';scrollTo({top:0});render();
  if(!idx)loadArchive().then(()=>{if(cur===a)render()}).catch(e=>{if(cur===a)root.querySelector('#alBody').innerHTML=`<p class="alLoad">${esc(e.message)}</p>`});
}
function firstLast(a){
  const ys=[];for(const sec of ['Unreleased','Recent','Special','Best Of','Worst Of','Grails/Wanted'])for(const r of rowsFor(a,sec)){const m=/(\d{4})/.exec(r.leak);if(m)ys.push(r.leak)}
  return ys;
}
function render(){
  const a=cur,[kl,kc]=KIND[a.kind]||KIND.unreleased,rel=albumRelease(a),al=official(a);
  const ready=!!idx,files=ready?SECS.reduce((n,s)=>n+rowsFor(a,s).length,0):null;
  const facts=[['Years worked on',a.years||'—'],['Rumored release',a.rumored||'—'],['Announced',a.announced||'—'],['Actual release',rel?fmtDate(rel):(a.kind==='released'||a.kind==='produced'||a.kind==='collab'?'—':'Never released')]];
  if(al&&al.streams)facts.push(['Spotify streams',num(al.streams)]);
  if(ready)facts.push(['Files in the Tracker',num(files)]);
  const tabs=[['overview','Overview'],['tracklist','Tracklist'],['listen','Listen'],['files','Files'],['art','Art']];
  root.innerHTML=`<button type="button" class="alBtn alBack" id="alBack">‹ All albums</button>
  <section class="alHero"><div class="alCov">${logo(a)}<span class="alBadge" style="--c:${kc}">${kl}</span></div>
  <div><div class="eyebrow">${esc(kl.toUpperCase())}</div><h2>${esc(a.name)}</h2>
  ${a.alt.length?`<div class="alAlt">${a.alt.map(x=>`<span>${esc(x)}</span>`).join('')}</div>`:''}
  ${a.blurb?`<p class="muted">${esc(a.blurb)}</p>`:''}
  <div class="alFacts">${facts.map(([k,v])=>`<div><small>${esc(k)}</small><span>${esc(v)}</span></div>`).join('')}</div>
  <button type="button" class="alGo" id="alTrk">Open all files in Ye Tracker ↗</button>${al?`<a class="alGo ghost" href="${esc(al.spotify)}" target="_blank" rel="noopener noreferrer">Open on Spotify ↗</a>`:''}</div></section>
  <nav class="alTabs" role="tablist">${tabs.map(([k,l])=>`<button type="button" role="tab" data-t="${k}" class="${k===tab?'on':''}">${l}</button>`).join('')}</nav>
  <div class="alPane" id="alBody"></div>`;
  root.querySelector('#alBack').onclick=list;
  root.querySelector('#alTrk').onclick=()=>toTracker(a);
  root.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{tab=b.dataset.t;root.querySelectorAll('[data-t]').forEach(x=>x.classList.toggle('on',x===b));pane()});
  pane();
}
function pane(){
  const el=root.querySelector('#alBody');if(!el||!cur)return;stopAudio();
  if(!idx){el.innerHTML='<p class="alLoad">Loading the Ye Tracker archive…</p>';return}
  ({overview,tracklist,listen,files,art}[tab]||overview)(el,cur);
}
function top(map,n){return Object.entries(map).sort((x,y)=>y[1]-x[1]).slice(0,n)}
function splitNames(s){return s.split(/\s*(?:,|&|\band\b|\+|;)\s*/i).map(x=>x.replace(/^(feat\.?|ft\.?|with)\s+/i,'').trim()).filter(x=>x&&x.length<40&&!/^\d/.test(x))}
function overview(el,a){
  const feats={},prods={};
  for(const sec of ['Unreleased','Recent','Special','Best Of','Released','Grails/Wanted'])for(const r of rowsFor(a,sec)){
    const t=r.title+' '+r.sub;
    for(const m of t.matchAll(/\((?:feat|ft)\.?\s+([^)]*)\)/gi))splitNames(m[1]).forEach(n=>{if(!/^(kanye west|ye|\?+)$/i.test(n))feats[n]=(feats[n]||0)+1});
    for(const m of t.matchAll(/\(prod\.?\s+([^)]*)\)/gi))splitNames(m[1]).forEach(n=>{prods[n]=(prods[n]||0)+1});
  }
  const counts=SECS.map(s=>[s,rowsFor(a,s).length]).filter(x=>x[1]);
  const ls=firstLast(a),listenN=LISTEN.reduce((n,s)=>n+rowsFor(a,s).filter(r=>r.hosted).length,0);
  el.innerHTML=`<div class="alStats">${counts.map(([s,n])=>`<div><b>${num(n)}</b><small>${esc(s)}</small></div>`).join('')}${listenN?`<div><b>${num(listenN)}</b><small>Playable here</small></div>`:''}</div>
  <h3>Top features</h3>${Object.keys(feats).length?`<div class="alChipsRow">${top(feats,30).map(([n,c])=>`<span>${esc(n)}<i>${c}</i></span>`).join('')}</div>`:'<p class="alNote">No features are listed for this era yet.</p>'}
  <h3>Producers</h3>${Object.keys(prods).length?`<div class="alChipsRow">${top(prods,30).map(([n,c])=>`<span>${esc(n)}<i>${c}</i></span>`).join('')}</div>`:'<p class="alNote">No producer credits are listed for this era yet.</p>'}
  <h3>Timeline</h3><p class="alNote">${a.years?`Worked on ${esc(a.years)}.`:''}${ls.length?` Leaks in the Tracker run from ${esc(ls[0])} to ${esc(ls[ls.length-1])}.`:''}</p>`;
}
function tlLines(cell){
  const t=txt(cell).replace(/#/g,'\n').split('\n').map(s=>s.trim()).filter(Boolean);return t;
}
function tracklist(el,a){
  let out='';const al=official(a);
  if(al&&window.Catalog){
    let songs=[];try{songs=Catalog.songsForAlbum(al)||[]}catch{}
    if(songs.length)out+=`<h3>Official tracklist</h3><ol class="alTL">${songs.map(s=>`<li><span>${esc(s._displayTitle||s.name)}</span><em>${s.streams?num(s.streams)+' streams':''}</em></li>`).join('')}</ol>`;
  }else if(a.kind==='produced'||a.kind==='collab'){
    const rs=rowsFor(a,'Released').filter(r=>r.type==='Album Track'||true).slice(0,60);
    if(rs.length)out+=`<h3>Released tracks</h3><ol class="alTL">${rs.map(r=>`<li><span>${esc(r.title)}</span><em>${esc(r.rel)}</em></li>`).join('')}</ol>`;
  }
  const tl=rowsFor(a,'Tracklists');
  if(tl.length){out+=`<h3>${al?'Alternate and leaked tracklists':'Tracklists'} (${tl.length})</h3>`+tl.map(r=>{
    const c=r.cells,desc=tlLines(c[2]?.[0]),head=desc.shift()||'';const nums=desc.filter(x=>/^\d+\??\.?/.test(x)||/^\?/.test(x)||true);
    const src=c[c.length-1]?.[0]||'',href=(/href="([^"]+)"/.exec(src)||[])[1];
    return `<div class="alTLcard"><header><b>${esc(r.title||'Tracklist')}</b><small>${esc(txt(c[4]?.[0]))}${txt(c[5]?.[0])?' · '+esc(txt(c[5][0])):''}${txt(c[6]?.[0])?' · '+esc(txt(c[6][0])):''}</small></header>${head?`<p>${esc(head)}</p>`:''}${desc.length?`<ol class="alTL">${desc.map(x=>`<li><span>${esc(x.replace(/^\d+\??\.\s*/,''))}</span></li>`).join('')}</ol>`:''}${href?`<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">Image source ↗</a>`:''}</div>`}).join('')}
  if(!out)out='<p class="alNote">No tracklist is recorded for this era yet. Open the Files tab to browse everything in the Tracker.</p>';
  el.innerHTML=out;
}

/* ---------- listen ---------- */
let audio=null,openRow=null;
function stopAudio(){if(audio){audio.pause();audio.removeAttribute('src');audio.load();audio=null}if(openRow){openRow.classList.remove('open');const e=openRow.querySelector('.alEmbed');if(e)e.remove();const b=openRow.querySelector('.alPlay');if(b)b.textContent='▶';openRow=null}}
function playRow(row,rec){
  if(openRow===row){stopAudio();return}
  stopAudio();const h=rec.hosted;row.classList.add('open');row.querySelector('.alPlay').textContent='■';openRow=row;
  const e=document.createElement('div');e.className='alEmbed';
  if(h.drivePreview){e.innerHTML=`<iframe src="${esc(h.drivePreview)}" title="Play ${esc(rec.title)}" allow="autoplay"></iframe><a href="${esc(String(h.drivePreview).replace(/\/preview.*$/,'/view'))}" target="_blank" rel="noopener noreferrer">Open in Google Drive ↗</a>`}
  else{const au=document.createElement('audio');au.controls=true;au.autoplay=true;au.src=new URL(h.playbackSrc||h.src,document.baseURI).href;e.append(au);audio=au;au.onended=()=>stopAudio()}
  row.append(e);
  if(typeof stopSpecialSnippet==='function')try{stopSpecialSnippet()}catch{}
}
function songRow(r,i,showEra){
  const meta=[r.len,r.quality,r.leak&&('Leaked '+r.leak)].filter(Boolean).join(' · ');
  return `<div class="alRow" data-r="${i}"><button class="alPlay" type="button" aria-label="Play ${esc(r.title)}">▶</button><div><b>${esc(r.title)}</b><small>${esc((r.sub||r.notes||'').slice(0,160))}</small></div><div class="alMeta">${esc(meta)}</div></div>`;
}
function listen(el,a){
  const groups=LISTEN.map(s=>[s,rowsFor(a,s).filter(r=>r.hosted)]).filter(g=>g[1].length);
  if(!groups.length){el.innerHTML='<p class="alNote">None of this album\'s files are hosted for playback yet. Open the Files tab to see every file and where to get it.</p>';return}
  const flat=[];
  el.innerHTML=`<p class="alNote">Songs hosted on YE Streams. Tap ▶ to play. The big sections (Special, Best Of, Worst Of and Grails) are listed first.</p>`+groups.map(([s,rs],gi)=>{
    const lim=gi<4?rs.length:Math.min(rs.length,40);
    return `<h3>${esc(s==='Special'?'Special':s)} (${rs.length})</h3><div class="alList">${rs.slice(0,lim).map(r=>{flat.push(r);return songRow(r,flat.length-1)}).join('')}</div>${lim<rs.length?`<p class="alNote">Showing ${lim} of ${rs.length}. The rest are in the Tracker.</p>`:''}`}).join('');
  el.querySelectorAll('.alRow').forEach(row=>{row.querySelector('.alPlay').onclick=()=>playRow(row,flat[+row.dataset.r])});
}

/* ---------- files ---------- */
let fsec='Unreleased',flim=60;
function files(el,a){
  const avail=SECS.filter(s=>rowsFor(a,s).length);if(!avail.length){el.innerHTML='<p class="alNote">No files are listed for this era yet.</p>';return}
  if(!avail.includes(fsec))fsec=avail[0];
  const rs=rowsFor(a,fsec);
  el.innerHTML=`<p class="alNote">A preview of every file under this album in the Ye Tracker. Open the Tracker to see links, notes and full details.</p>
  <button type="button" class="alGo" id="alTrk2">Open ${esc(a.name)} in Ye Tracker ↗</button>
  <div class="alChips">${avail.map(s=>`<button type="button" data-s="${esc(s)}" class="${s===fsec?'on':''}">${esc(s)} (${rowsFor(a,s).length})</button>`).join('')}</div>
  <div class="alList">${rs.slice(0,flim).map((r,i)=>`<div class="alRow" data-r="${i}">${r.hosted?'<button class="alPlay" type="button" aria-label="Play">▶</button>':'<span></span>'}<div><b>${esc(r.title)}</b><small>${esc((r.sub||r.notes||'').slice(0,200))}</small></div><div class="alMeta">${esc([r.len,r.quality,r.leak].filter(Boolean).join(' · '))}</div></div>`).join('')}</div>
  ${rs.length>flim?`<button type="button" class="alBtn" id="alMore" style="margin-top:12px">Show more (${rs.length-flim} left)</button>`:''}`;
  el.querySelector('#alTrk2').onclick=()=>toTracker(a,fsec);
  el.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{fsec=b.dataset.s;flim=60;files(el,a)});
  const m=el.querySelector('#alMore');if(m)m.onclick=()=>{flim+=120;files(el,a)};
  el.querySelectorAll('.alRow').forEach(row=>{const p=row.querySelector('.alPlay');if(p)p.onclick=()=>playRow(row,rs[+row.dataset.r])});
}
function art(el,a){
  const rs=rowsFor(a,'Art');if(!rs.length){el.innerHTML='<p class="alNote">No artwork is listed for this era yet.</p>';return}
  el.innerHTML=`<p class="alNote">Covers, alternate covers and other art listed in the Tracker for this era.</p><div class="alList">${rs.map(r=>{const href=r.links[0];const c=r.cells;const info=[txt(c[4]?.[0]),txt(c[5]?.[0]),txt(c[6]?.[0])].filter(Boolean).join(' · ');
    return `<div class="alRow"><span></span><div><b>${esc(r.title)}</b><small>${esc((r.notes||'').slice(0,220))}${info?' — '+esc(info):''}</small></div><div class="alMeta">${href?`<a href="${esc(href)}" target="_blank" rel="noopener noreferrer" style="color:var(--accent2)">View ↗</a>`:''}</div></div>`}).join('')}</div>`;
}

/* ---------- jump into the Ye Tracker ---------- */
function toTracker(a,sec){
  const si=Math.max(0,['Unreleased','Released','Recent','Best Of','Special','Worst Of','Grails/Wanted','Stems','Art','Tracklists','Album Copies','Groupbuys'].indexOf(sec||'Unreleased'));
  window.go('tracker');
  let n=0;const t=setInterval(()=>{
    n++;const tab=document.querySelector('[data-ye-section="'+si+'"]'),table=document.getElementById('yeTrackerTableWrap');
    if(tab&&table&&!table.hidden){clearInterval(t);tab.click();setTimeout(()=>{const btn=document.getElementById('yeTrackerEraBtn');if(!btn)return;btn.click();setTimeout(()=>{const item=[...document.querySelectorAll('[data-tracker-era]')].find(b=>keyOf(b.dataset.trackerEra)===keyOf(a.era));if(item)item.click();else btn.click()},120)},250)}
    else if(tab&&n===3&&table&&table.hidden)tab.click();
    if(n>80)clearInterval(t);
  },150);
}

window.Albums={open,list,get data(){return META()}};
window.PH=window.PH||{};
PH.albums={show(){root.classList.add('activeScreen');if(cur)render();else list()},hide(){stopAudio();root.classList.remove('activeScreen')}};
})();
