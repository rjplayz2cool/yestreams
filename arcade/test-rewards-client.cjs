const fs=require('fs'),vm=require('vm'),assert=require('assert'),{randomUUID}=require('crypto');
const source=fs.readFileSync('arcade/rewards.js','utf8');const disk=new Map(),server=new Map();let wallet=0,rpcCalls=0;
const settle=()=>new Promise(r=>setImmediate(r));
function client(uid='test-user'){
 const nodes=new Map();for(const game of ['snake','runner','pacman'])nodes.set(game+'Game',{append(el){if(el.id)nodes.set(el.id,el)}});
 const c={currentUser:uid?{id:uid}:null,window:{addEventListener(){}},crypto:{randomUUID},localStorage:{getItem:k=>disk.get(k)||null,setItem:(k,v)=>disk.set(k,v)},document:{hidden:false,getElementById:id=>nodes.get(id),createElement:()=>({setAttribute(){}}),addEventListener(){}},setInterval:fn=>{c.retry=fn},loadProfile:async()=>{},console};
 c.supa={rpc:async(name,p)=>{rpcCalls++;if(name==='arcade_reward_begin'){if(!server.has(p.p_run))server.set(p.p_run,{game:p.p_game,paid:0,closed:false});return{data:{closed:server.get(p.p_run).closed}}}const r=server.get(p.p_run);if(r.closed)return{data:{awarded:0,paid:r.paid,closed:true}};const earned=r.game==='snake'?p.p_score+(p.p_completed?100:0):r.game==='runner'?3*p.p_bottles+50*Math.floor(p.p_score/100):50*Math.floor(p.p_score/1000);const awarded=Math.max(0,earned-r.paid);wallet+=awarded;r.paid=earned;r.closed=p.p_end;return{data:{paid:earned,awarded,closed:r.closed}}}};
 vm.createContext(c);vm.runInContext(source,c);return c;
}
(async()=>{const c=client();await settle();const id=c.window.yeArcadeRewards.begin('snake');c.window.yeArcadeRewards.progress(id,2);await settle();await c.retry();await settle();assert.equal(wallet,2);
 // Simulate the final response being lost, then reload the saved queue.
 c.window.yeArcadeRewards.progress(id,2,0,false,true);const pending=disk.get('yeArcadeRewards:v1:test-user');await settle();assert.equal(wallet,2);disk.set('yeArcadeRewards:v1:test-user',pending);const reload=client();await settle();await reload.retry();await settle();assert.equal(wallet,2);
 const calls=rpcCalls,guest=client(null);assert.equal(guest.window.yeArcadeRewards.begin('runner'),null);await guest.retry();assert.equal(rpcCalls,calls);
 const run=reload.window.yeArcadeRewards.begin('runner');reload.window.yeArcadeRewards.progress(run,300,8,false,true);await settle();await reload.retry();await settle();assert.equal(wallet,176);
 console.log('PASS: batched rewards, replay after reload, guest exclusion, runner milestones');
})().catch(e=>{console.error(e);process.exit(1)});
