/* Ye AI: chat tab. Retrieval runs in the browser over the Ye Tracker archive, Ye's tweets and site data;
   the best matches are sent to the ye-ai edge function (Gemini). Chats are saved to the user's account. */
(()=>{
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CFG=window.YE_SUPABASE||{};
const LIVE=!!(window.supabase&&CFG.url&&CFG.anonKey&&!String(CFG.url).includes('YOUR_'));
let sb=null;try{if(LIVE)sb=window.supabase.createClient(CFG.url,CFG.anonKey)}catch(e){}
let docs=null,loading=null,hosted=null,sending=false,built=false,live='';
let chats=[],cur=null,uid=null,useLocal=false,editing=null;
const STOP=new Set('a an the is are was were be been of to in on at for from by with and or but not do does did what whats which who whom when where why how tell me about any all that this these those it its i you your my can could would should have has had get got give list some more most song songs ye kanye west send share show play listen download link links file files please can u'.split(' '));
const strip=h=>String(h??'').replace(/<br\s*\/?>/gi,' | ').replace(/<[^>]+>/g,'').replace(/&#x27;|&#39;/g,"'").replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
const LSK='yeai:chats:v2';
const now=()=>new Date().toISOString();
const fold=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

/* ---------- data ---------- */
async function load(){
  if(docs)return docs;
  if(loading)return loading;
  loading=(async()=>{
    const out=[];
    try{
      const r=await fetch('data/ye-tracker-archive.txt');if(!r.ok)throw 0;
      const bin=atob((await r.text()).trim()),b=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)b[i]=bin.charCodeAt(i);
      const data=JSON.parse(await new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
      for(const cat of data){
        const H=cat.headers||[];const li=H.map((h,i)=>/link/i.test(h)?i:-1).filter(i=>i>=0);
        for(const row of cat.rows){
          const c=row.cells.map(x=>strip(x[0]));
          const name=c[1]||'',era=row.era?strip(row.era):c[0];
          if(!name)continue;
          const notes=c[2]||'';
          const extra=[];for(let i=3;i<c.length;i++)if(c[i]&&!/^https?:/.test(c[i])&&!li.includes(i))extra.push((H[i]?H[i]+': ':'')+c[i].slice(0,60));
          let links=[];for(const i of li){const raw=row.cells[i]&&row.cells[i][0]||'';for(const m of raw.matchAll(/https?:\/\/[^\s"'<>]+/g)){const u=m[0].replace(/[.,;)]+$/,'');if(!links.includes(u))links.push(u)}}
          out.push({k:'t',cat:cat.name,era,name,notes,extra:extra.join('; '),ln:fold(name),le:fold(era),lo:fold(notes),links:links.slice(0,6)});
        }
      }
    }catch(e){}
    try{const r=await fetch('data/ye-tweets.json');if(r.ok){for(const [d,t,l,id] of await r.json()){out.push({k:'x',cat:'Tweet',era:d,name:t,notes:'',extra:'',ln:fold(t),le:d,lo:'',id,likes:l})}}}catch(e){}
    try{for(const ev of(window.CALENDAR_ANNUAL_EVENTS||[])){const t=`${ev.title} (${ev.releaseYear||''}, ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][ev.month-1]} ${ev.day})`;out.push({k:'c',cat:'Calendar',era:'',name:t,notes:'',extra:'',ln:fold(t),le:'',lo:''})}}catch(e){}
    try{for(const s of(window.TOUR_SHOWS||[])){const t=`${s.date} ${s.venue||''} ${s.city||''}`.trim();out.push({k:'s',cat:'Tour show',era:s.tour||'',name:t,notes:'',extra:'',ln:fold(t),le:fold(s.tour||''),lo:''})}}catch(e){}
    docs=out;return out;
  })();
  return loading;
}
async function loadHosted(){
  if(hosted)return hosted;
  hosted={};
  try{const r=await fetch('data/hosted-audio.json');if(r.ok){const j=await r.json();for(const [k,v] of Object.entries(j.files||{}))hosted[k.replace(/[?#].*$/,'').replace(/\/$/,'')]=v}}catch(e){}
  return hosted;
}
function tokens(q){return[...new Set(fold(q).replace(/[^a-z0-9$&' ]/g,' ').split(/\s+/).filter(t=>t.length>1&&!STOP.has(t)))]}
function search(q,n,tw){
  const toks=tokens(q);
  const phrase=toks.join(' ');
  if(!toks.length||!docs)return[];
  const sc=[];
  for(const d of docs){
    if((d.k==='x')!==!!tw)continue;
    let s=0;
    for(const t of toks){if(d.ln.includes(t))s+=6;if(d.le.includes(t))s+=3;if(d.lo.includes(t))s+=2}
    if(!s)continue;
    if(phrase.length>3&&d.ln.includes(phrase))s+=14;
    if(d.k==='x'){if(s<6)continue;s+=Math.log10((d.likes||0)+1)*.35}
    if(d.cat==='Released'||d.cat==='Best Of'||d.cat==='Unreleased')s+=1.5;else if(/^(Art|Tracklists|Album Copies|Groupbuys|Stems)$/.test(d.cat))s-=1.5;
    if(s<=0)continue;
    sc.push([s,d]);
  }
  sc.sort((a,b)=>b[0]-a[0]);
  return sc.slice(0,n).map(x=>x[1]);
}
const FILE_RE=/\b(send|share|give|get|show|play|listen|download|hear|link|links|file|files|mp3|stream|upload|attach)\b/i;
function pickFiles(q,hits){
  const toks=tokens(q);if(!toks.length)return[];
  const need=toks.length<=2?toks.length:Math.ceil(toks.length*.6);
  const out=[],seen=new Set();
  for(const d of hits){
    if(d.k!=='t'||!d.links.length)continue;
    if(/^(Art|Album Copies|Groupbuys|Tracklists)$/.test(d.cat))continue;
    if(toks.filter(t=>d.ln.includes(t)).length<need)continue;
    const key=d.ln+'|'+d.links[0];if(seen.has(key))continue;seen.add(key);
    out.push(d);if(out.length>=4)break;
  }
  return out;
}
const fmtDoc=d=>d.k==='x'?`[Tweet by Ye, ${d.era}${d.likes?', '+(d.likes>=1e3?Math.round(d.likes/1e3)+'K':d.likes)+' likes':''}] ${d.name.replace(/\s+/g,' ').slice(0,420)}`:d.k==='t'?`[${d.cat}] ${d.era} | ${d.name}${d.notes?' | '+d.notes.slice(0,320):''}${d.extra?' | '+d.extra:''}${d.links.length?' | has file/link':''}`:`[${d.cat}] ${d.name}${d.era?' | '+d.era:''}`;

/* ---------- rendering ---------- */
function md(t){
  let h=esc(t);
  h=h.replace(/\*\*([^*\n]+)\*\*/g,'<b>$1</b>').replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,!?]|$)/g,'$1<i>$2</i>');
  const lines=h.split('\n'),out=[];let list=null;
  for(const L of lines){
    const m=L.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)$/);
    if(m){if(!list){list=/^\s*\d+\./.test(L)?'ol':'ul';out.push('<'+list+'>')}out.push('<li>'+m[1]+'</li>')}
    else{if(list){out.push('</'+list+'>');list=null}out.push(L.trim()?'<p>'+L+'</p>':'')}
  }
  if(list)out.push('</'+list+'>');
  return out.join('');
}
const SUGG=['What are the biggest unreleased Ye projects fans still want?','Who produced Runaway and how was it made?','Tell me about the Yandhi era','What has Ye tweeted about his albums?','Send me the file for Déjà Vu','Explain the difference between a snippet and a full leak'];
const welcome=()=>`<div class="aiHero"><div class="aiOrb" aria-hidden="true"></div><h2>Ask anything about Ye.</h2><p>Leaks, snippets, eras, producers, features, tours and more. Ask for a song and I'll pull its file from the Ye Tracker when there is one.</p><div class="aiSugg">${SUGG.map(s=>`<button type="button" class="aiChipBtn" data-q="${esc(s)}">${esc(s)}</button>`).join('')}</div></div>`;
const hostLabel=u=>{try{const h=new URL(u).hostname.replace(/^www\./,'');if(/spotify/.test(h))return'Open in Spotify';if(/youtu/.test(h))return'Watch on YouTube';if(/ibb\.co|imgur\.com/.test(h))return'View image';if(/drive\.google/.test(h))return'Open in Drive';if(/archive\.org/.test(h))return'Open archive';return'Open on '+h}catch(e){return'Open link'}};
function fileCard(f){
  const aud=[],links=[];
  for(const u of f.l||[]){const k=String(u).replace(/[?#].*$/,'').replace(/\/$/,'');const h=hosted&&hosted[k];if(h&&(h.playbackSrc||h.src))aud.push(h);else links.push(u)}
  const a=aud.map(h=>{const src=encodeURI(h.playbackSrc||h.src),dl=encodeURI(h.src||h.playbackSrc);return `<audio controls preload="none" src="${esc(src)}"></audio><div class="aiFileB"><a class="aiBtn" href="${esc(dl)}" download>Download</a></div>`}).join('');
  const l=links.length?`<div class="aiFileB">${links.slice(0,4).map(u=>`<a class="aiBtn alt" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(hostLabel(u))}</a>`).join('')}</div>`:'';
  return `<div class="aiFile"><div class="aiFileT">${esc(f.n)}</div>${f.m?`<div class="aiFileM">${esc(f.m)}</div>`:''}${a}${l}</div>`;
}
function msgHtml(m){
  if(m.role==='user')return `<div class="aiMsg u"><div class="aiB">${esc(m.content)}</div></div>`;
  return `<div class="aiMsg a"><div class="aiAv">AI</div><div class="aiB">${m.html||md(m.content)}${(m.files||[]).map(fileCard).join('')}${m.src&&m.src.length?`<details class="aiSrc"><summary>${m.src.length} sources used</summary><ul>${m.src.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></details>`:''}</div></div>`;
}
function paintLog(){
  const box=$('aiLog');const msgs=cur?cur.messages:[];
  if(!msgs.length&&!sending){box.innerHTML=welcome();return}
  box.innerHTML=msgs.map(msgHtml).join('')+(sending?(live?'<div class="aiMsg a" id="aiLive"><div class="aiAv">AI</div><div class="aiB">'+md(live)+'</div></div>':'<div class="aiMsg a"><div class="aiAv">AI</div><div class="aiB aiTyping"><i></i><i></i><i></i></div></div>'):'');
  box.scrollTop=box.scrollHeight;
}
function group(c){
  const d=new Date(c.updated_at),t=new Date();t.setHours(0,0,0,0);
  const days=Math.floor((t-new Date(d.getFullYear(),d.getMonth(),d.getDate()))/864e5);
  return days<=0?'Today':days===1?'Yesterday':days<8?'Previous 7 days':'Older';
}
function paintList(){
  const box=$('aiList');if(!box)return;
  if(!chats.length){box.innerHTML='<p class="aiEmpty">Your chats will show up here.</p>';return}
  let last='',h='';
  for(const c of chats){
    const g=group(c);if(g!==last){h+=`<div class="aiGrp">${g}</div>`;last=g}
    const act=cur&&c.id===cur.id;
    h+=editing===c.id
      ?`<div class="aiCh on"><input class="aiRen" data-id="${c.id}" value="${esc(c.title)}" maxlength="80" aria-label="Rename chat"></div>`
      :`<div class="aiCh${act?' on':''}" data-id="${c.id}" role="button" tabindex="0"><span class="aiChT">${esc(c.title)}</span><span class="aiChA"><button type="button" data-ren="${c.id}" aria-label="Rename chat" title="Rename">✎</button><button type="button" data-del="${c.id}" aria-label="Delete chat" title="Delete">✕</button></span></div>`;
  }
  box.innerHTML=h;
  const inp=box.querySelector('.aiRen');if(inp){inp.focus();inp.select()}
}
function paintAll(){paintList();paintLog();$('aiTitleNow').textContent=cur&&cur.messages.length?cur.title:'New chat'}

/* ---------- storage (Supabase table, localStorage fallback) ---------- */
const lsRead=()=>{try{return JSON.parse(localStorage.getItem(LSK+':'+(uid||'x'))||'[]')}catch(e){return[]}};
const lsWrite=()=>{try{localStorage.setItem(LSK+':'+(uid||'x'),JSON.stringify(chats.slice(0,60)))}catch(e){}};
async function loadChats(){
  chats=[];
  if(sb&&!useLocal){
    const {data,error}=await sb.from('ye_ai_chats').select('id,title,messages,updated_at').order('updated_at',{ascending:false}).limit(100);
    if(!error&&Array.isArray(data)){chats=data.map(c=>({...c,messages:Array.isArray(c.messages)?c.messages:[]}));return}
    useLocal=true;
  }
  chats=lsRead();
}
async function saveChat(c){
  c.updated_at=now();
  chats.sort((a,b)=>new Date(b.updated_at)-new Date(a.updated_at));
  if(sb&&!useLocal&&!c.local){
    const row={title:c.title,messages:c.messages,updated_at:c.updated_at};
    if(c.persisted){const {error}=await sb.from('ye_ai_chats').update(row).eq('id',c.id);if(error)fail()}
    else{const {data,error}=await sb.from('ye_ai_chats').insert(row).select('id').single();if(!error&&data){const old=c.id;c.id=data.id;c.persisted=true;if(cur&&cur.id===old)cur=c}else fail()}
  }
  if(useLocal||!sb)lsWrite();
}
function fail(){useLocal=true;lsWrite()}
async function removeChat(id){
  chats=chats.filter(c=>c.id!==id);
  if(sb&&!useLocal){await sb.from('ye_ai_chats').delete().eq('id',id)}else lsWrite();
}
function newChat(){
  cur={id:'tmp'+Math.random().toString(36).slice(2),title:'New chat',messages:[],updated_at:now(),persisted:false};
  return cur;
}
function openChat(id){const c=chats.find(x=>x.id===id);if(!c)return;cur=c;closeDrawer();paintAll()}
const openDrawer=()=>$('aiSide').classList.add('open'),closeDrawer=()=>$('aiSide').classList.remove('open');

/* ---------- chat ---------- */
async function authed(){if(!sb)return false;try{const {data}=await sb.auth.getSession();uid=data.session?data.session.user.id:null;return !!data.session}catch(e){return false}}
let started=false;
async function gate(){
  const ok=await authed();
  $('aiGate').hidden=ok;$('aiApp').hidden=!ok;
  if(ok&&!started){started=true;await loadChats();cur=chats.find(c=>c.messages.length)||newChat();if(!chats.includes(cur)&&cur.messages.length)chats.unshift(cur);paintAll()}
  else if(ok)paintAll();
  if(!ok){started=false;chats=[];cur=null}
  return ok;
}
function fallback(q,why){
  const hits=search(q,6);
  const body=hits.length?`<p>${esc(why)} Here's what the tracker has on that:</p><ul>${hits.map(d=>`<li><b>${esc(d.name)}</b> <span class="aiDim">${esc(d.cat+(d.era?' · '+d.era:''))}</span>${d.notes?'<br>'+esc(d.notes.slice(0,160)):''}</li>`).join('')}</ul>`:`<p>${esc(why)} I couldn't find matching entries in the tracker either. Try a song or era name.</p>`;
  return {role:'assistant',content:why,html:body};
}
async function send(text){
  text=String(text||'').trim();if(!text||sending)return;
  if(!(await authed())){gate();return}
  if(!cur)newChat();
  $('aiIn').value='';$('aiIn').style.height='';
  const first=!cur.messages.length;
  cur.messages.push({role:'user',content:text});
  if(first){cur.title=text.replace(/\s+/g,' ').slice(0,48)+(text.length>48?'…':'');if(!chats.includes(cur))chats.unshift(cur)}
  sending=true;paintAll();
  await load();
  const msgs=cur.messages;
  const prev=[...msgs].reverse().find((m,i)=>m.role==='user'&&i>0);
  const q=text.split(/\s+/).length<5&&prev?prev.content+' '+text:text;
  const hits=search(q,24),tws=search(q,8,true);
  const wantFile=FILE_RE.test(text);
  let files=[];
  if(wantFile){await loadHosted();files=pickFiles(q,search(q,60)).map(d=>({n:d.name.replace(/\s*\|\s*/g,' ').slice(0,120),m:d.era+' · '+d.cat,l:d.links}))}
  let ctx=hits.map(fmtDoc).join('\n')+(tws.length?'\n'+tws.map(fmtDoc).join('\n'):'');
  if(wantFile)ctx+=files.length?`\n\nAPP NOTE: the app is attaching these file cards under your reply: ${files.map(f=>f.n).join('; ')}. Say you've attached them, add a one-line note on each (version, quality, length if known). Never write URLs yourself.`:`\n\nAPP NOTE: the user asked for a file but no matching file or link is on the Ye Tracker for this. Say so plainly, mention close matches by name if any, and never invent a link.`;
  let reply;
  try{
    const {data:{session}}=await sb.auth.getSession();
    const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),50000);
    live='';
    const r=await fetch(CFG.url+'/functions/v1/ye-ai',{method:'POST',signal:ctl.signal,headers:{'Content-Type':'application/json',apikey:CFG.anonKey,Authorization:'Bearer '+session.access_token},body:JSON.stringify({stream:true,messages:msgs.slice(-9).map(m=>({role:m.role,content:m.content})),context:ctx})});
    let j={};
    if(r.ok&&(r.headers.get('content-type')||'').includes('text/event-stream')&&r.body){
      const rd=r.body.getReader(),dec=new TextDecoder();let buf='',raf=0;
      const flush=()=>{raf=0;const el=document.querySelector('#aiLive .aiB');if(el){el.innerHTML=md(live);const b=$('aiLog');b.scrollTop=b.scrollHeight}else paintLog()};
      for(;;){
        const {done,value}=await rd.read();if(done)break;
        buf+=dec.decode(value,{stream:true});let i;
        while((i=buf.indexOf('\n\n'))>=0){
          const ev=buf.slice(0,i).trim();buf=buf.slice(i+2);
          if(!ev.startsWith('data:'))continue;
          let d;try{d=JSON.parse(ev.slice(5))}catch(e){continue}
          if(d.t){live+=d.t;clearTimeout(to);if(!raf)raf=requestAnimationFrame(flush)}
          else if(d.done)j={reply:live.trim(),remaining:d.remaining};
          else if(d.error)j=live.trim()?{reply:live.trim(),remaining:undefined}:{error:d.error};
        }
      }
      if(!j.reply&&!j.error&&live.trim())j={reply:live.trim()};
    }else j=await r.json().catch(()=>({}));
    clearTimeout(to);
    if(r.ok&&typeof j.remaining==='number'){const f=document.querySelector('.aiFine');if(f){f.dataset.left=j.remaining;f.firstElementChild.textContent=(j.remaining<=15?j.remaining+' questions left today. ':'')+'Ye AI can make mistakes. Check the Ye Tracker tab for anything important. Tweets via '}}
    if(r.ok&&j.reply)reply={role:'assistant',content:j.reply,files:files.length?files:undefined,src:hits.slice(0,6).map(d=>d.name.slice(0,90)).concat(tws.slice(0,4).map(d=>'Tweet ('+d.era+'): '+d.name.replace(/\s+/g,' ').slice(0,70)))};
    else if(j.error==='slow')reply={role:'assistant',content:'Easy there. Give it a few seconds between questions and send that again.'};
    else if(j.error==='limit')reply={role:'assistant',content:`You've hit today's limit of ${j.limit||40} questions. It resets tomorrow (UTC). The Ye Tracker tab is always open in the meantime.`};
    else{reply=fallback(q,j.error==='no_key'?'Ye AI isn\'t switched on yet.':j.error==='busy'?'Ye AI is busy right now.':'Ye AI couldn\'t answer just now.');if(files.length)reply.files=files}
  }catch(e){reply=fallback(q,e&&e.name==='AbortError'?'Ye AI took too long to answer.':'Couldn\'t reach Ye AI.');if(files.length)reply.files=files}
  live='';cur.messages.push(reply);sending=false;paintAll();
  await saveChat(cur);paintList();
}
function build(){
  if(built)return;built=true;
  $('aiForm').onsubmit=e=>{e.preventDefault();send($('aiIn').value)};
  $('aiIn').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();send($('aiIn').value)}});
  $('aiIn').addEventListener('input',e=>{const t=e.target;t.style.height='auto';t.style.height=Math.min(140,t.scrollHeight)+'px'});
  $('aiLog').addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(b)send(b.dataset.q)});
  const nc=()=>{if(sending)return;if(cur&&!cur.messages.length){closeDrawer();return}newChat();closeDrawer();paintAll();$('aiIn').focus()};
  $('aiNew').onclick=nc;$('aiNew2').onclick=nc;
  $('aiMenu').onclick=openDrawer;$('aiScrim').onclick=closeDrawer;
  $('aiList').addEventListener('click',async e=>{
    const ren=e.target.closest('[data-ren]'),del=e.target.closest('[data-del]');
    if(ren){e.stopPropagation();editing=ren.dataset.ren;paintList();return}
    if(del){e.stopPropagation();const id=del.dataset.del,c=chats.find(x=>x.id===id);
      if(del.dataset.arm!=='1'){del.dataset.arm='1';del.textContent='Delete?';del.classList.add('arm');setTimeout(()=>{if(del.isConnected){del.dataset.arm='';del.textContent='✕';del.classList.remove('arm')}},2500);return}
      await removeChat(id);if(cur&&cur.id===id){cur=chats.find(x=>x.messages.length)||newChat()}paintAll();return}
    if(e.target.closest('.aiRen'))return;
    const ch=e.target.closest('.aiCh[data-id]');if(ch&&!sending)openChat(ch.dataset.id);
  });
  $('aiList').addEventListener('keydown',e=>{
    const inp=e.target.closest&&e.target.closest('.aiRen');
    if(inp){if(e.key==='Enter'){e.preventDefault();inp.blur()}else if(e.key==='Escape'){editing=null;paintList()}return}
    if(e.key==='Enter'&&e.target.classList.contains('aiCh')&&!sending)openChat(e.target.dataset.id);
  });
  $('aiList').addEventListener('focusout',async e=>{
    const inp=e.target.closest&&e.target.closest('.aiRen');if(!inp||editing!==inp.dataset.id)return;
    const c=chats.find(x=>x.id===inp.dataset.id);editing=null;
    const v=inp.value.trim().replace(/\s+/g,' ').slice(0,80);
    if(c&&v&&v!==c.title){c.title=v;if(sb&&!useLocal&&c.persisted){await sb.from('ye_ai_chats').update({title:v}).eq('id',c.id)}else lsWrite()}
    paintAll();
  });
  $('aiSignIn').onclick=()=>{const b=$('acctBtn');if(b)b.click()};
  if(sb)sb.auth.onAuthStateChange(()=>{if(!$('pg-ai').hidden)gate()});
}
window.PH=window.PH||{};
PH.ai={show(){build();$('aiScreen').classList.add('activeScreen');gate();load()},hide(){$('aiScreen').classList.remove('activeScreen');closeDrawer()}};
})();
