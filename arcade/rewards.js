(() => {
'use strict';
const rules={snake:'1 YZYMNY per character · +100 for filling the board',runner:'3 YZYMNY per bottle cleared · +50 per 100 score points',pacman:'50 YZYMNY per 1,000 points'};
const sessions=new Map(),storageKey=id=>'yeArcadeRewards:v1:'+id;
let loadedUser=null,busy=false;const lastPersist=new Map();
const user=()=>typeof currentUser!=='undefined'?currentUser?.id||null:null;
function element(game){return document.getElementById('rewardStatus-'+game)}
function info(game,message){const el=element(game);if(el)el.textContent=message}
function persist(id,force=false){if(!force&&Date.now()-(lastPersist.get(id)||0)<1000)return;lastPersist.set(id,Date.now());try{localStorage.setItem(storageKey(id),JSON.stringify([...sessions.values()].filter(r=>r.uid===id)))}catch{}}
function restore(){const uid=user();if(uid===loadedUser)return;loadedUser=uid;if(!uid)return;
 try{const saved=JSON.parse(localStorage.getItem(storageKey(uid))||'[]');for(const r of saved){if(r.uid===uid&&rules[r.game]&&typeof r.id==='string'&&!sessions.has(r.id)){r.end=true;r.version=(r.version||0)+1;sessions.set(r.id,r)}}}catch{}
}
function estimate(game,score,bottles,completed){return game==='snake'?score+(completed?100:0):game==='runner'?bottles*3+Math.floor(score/100)*50:Math.floor(score/1000)*50}
function begin(game){restore();const uid=user();if(!uid){info(game,'Sign in to earn YZYMNY.');return null}
 for(const r of sessions.values())if(r.uid===uid&&r.game===game&&!r.end){r.end=true;r.version++}
 const r={id:crypto.randomUUID(),uid,game,score:0,bottles:0,completed:false,end:false,started:false,paid:0,version:1,acked:0};sessions.set(r.id,r);persist(uid,true);info(game,'This run: 0 YZYMNY');flush();return r.id;
}
function progress(id,score,bottles=0,completed=false,end=false){const r=sessions.get(id);if(!r||r.uid!==user()||r.end)return;
 score=Math.max(r.score,Math.floor(Number(score)||0));bottles=Math.max(r.bottles,Math.floor(Number(bottles)||0));completed=r.completed||completed;
 if(score===r.score&&bottles===r.bottles&&completed===r.completed&&!end)return;
 Object.assign(r,{score,bottles,completed,end:!!end,version:r.version+1});persist(r.uid,!!end);
 info(r.game,'This run: '+estimate(r.game,score,bottles,completed)+' YZYMNY · saving…');
 if(end)flush();
}
async function flush(){restore();const uid=user();if(busy||!uid||typeof supa==='undefined'||!supa)return;busy=true;let credited=false;
 try{for(const r of [...sessions.values()]){if(r.uid!==uid||r.uid!==user())continue;
  if(!r.started){let result;try{result=await supa.rpc('arcade_reward_begin',{p_run:r.id,p_game:r.game})}catch{info(r.game,'Rewards pending · retrying when connected.');break}
   if(result.error){info(r.game,'Rewards pending · retrying when connected.');break}
   if(result.data?.closed){sessions.delete(r.id);persist(uid,true);continue}r.started=true;persist(uid);
  }
  if(r.acked===r.version)continue;const version=r.version;let result;
  try{result=await supa.rpc('arcade_reward_claim',{p_run:r.id,p_score:r.score,p_bottles:r.bottles,p_completed:r.completed,p_end:r.end})}catch{info(r.game,'Rewards pending · retrying when connected.');break}
  if(result.error){if(/expired|not found/i.test(result.error.message||'')){sessions.delete(r.id);persist(uid,true);info(r.game,'Reward session ended. Start a new game to earn YZYMNY.');continue}info(r.game,'Rewards pending · retrying automatically.');break}
  r.acked=version;r.paid=Number(result.data?.paid)||0;credited=credited||Number(result.data?.awarded)>0;
  if(user()===uid){const suffix=r.end?' earned this run.':' earned this run';info(r.game,r.paid+' YZYMNY'+suffix)}
  if(result.data?.closed&&r.version===version)sessions.delete(r.id);persist(uid,true);
 }}finally{busy=false;if(credited&&user()===uid&&typeof loadProfile==='function')await loadProfile()}
}
for(const game of Object.keys(rules)){const host=document.getElementById(game+'Game');if(!host)continue;const text=document.createElement('p');text.className='snakeNote';text.textContent=rules[game];host.append(text);const status=document.createElement('p');status.id='rewardStatus-'+game;status.className='snakeNote';status.setAttribute('role','status');status.textContent=user()?'Play to earn YZYMNY.':'Sign in to earn YZYMNY.';host.append(status)}
window.yeArcadeRewards={begin,progress};window.addEventListener('pagehide',()=>{if(user())persist(user(),true)});
window.addEventListener('online',flush);document.addEventListener('visibilitychange',()=>{if(document.hidden){if(user())persist(user(),true);flush()}});setInterval(flush,5000);restore();flush();
})();
