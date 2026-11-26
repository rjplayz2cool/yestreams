"""Wire account-based rewards into the existing games without replacing other site updates."""
from pathlib import Path
import re
p=Path('index.html');s=p.read_text()
marker='<!-- arcade-rewards-v1 -->'
if marker not in s:
 def replace(old,new,count=1):
  global s
  assert s.count(old)==count, f'Unexpected game source match: {old[:100]} ({s.count(old)})'
  s=s.replace(old,new,count)
 # Load after game markup and before the engines execute.
 replace('</section></main><script>(() => {\nconst games=', '</section></main>'+marker+'<script src="arcade/rewards.js?v=1"></script><script>(() => {\nconst games=')
 # Show the shared wallet while playing; keep the Daily Reward button on Daily Roll.
 replace("let visible=document.getElementById('rollScreen').classList.contains('activeScreen')&&!!currentUser", "let visible=(document.getElementById('rollScreen').classList.contains('activeScreen')||document.getElementById('gamesScreen')?.classList.contains('activeScreen'))&&!!currentUser")
 replace("reward?.classList.toggle('show',visible)","reward?.classList.toggle('show',visible&&document.getElementById('rollScreen').classList.contains('activeScreen'))")
 # Snake: 18x18 minus the initial 3 segments = 321 collected characters.
 replace('let runUser=null,best=0;', 'let runUser=null,best=0,rewardRun=null;')
 replace("function finish(message){if(score>best)","function finish(message){window.yeArcadeRewards?.progress(rewardRun,score,0,body.length===N*N,true);if(score>best)")
 replace("if(eat){score++;scoreEl.textContent=score;", "if(eat){score++;window.yeArcadeRewards?.progress(rewardRun,score);scoreEl.textContent=score;")
 replace("start.onclick=()=>{runUser=currentUser?.id||null;reset();running=true;", "start.onclick=()=>{window.yeArcadeRewards?.progress(rewardRun,score,0,false,true);runUser=currentUser?.id||null;reset();rewardRun=window.yeArcadeRewards?.begin('snake');running=true;")
 # Runner: count each bottle only after its collision box has passed the player.
 replace('this.distance=0;this.speed=300;', 'this.distance=0;this.cleared=0;this.speed=300;')
 replace('this.alive=false;break}}}', "this.alive=false;break}}if(this.alive)for(const o of this.obstacles){o.passed=o.passed||0;while(o.passed<o.count&&o.x+o.passed*44+36-4<=player.left){o.passed++;this.cleared++}}}")
 replace("best=0,recordKey='',shownScore=-1;", "best=0,recordKey='',shownScore=-1,rewardRun=null;")
 replace("function stop(){running=false;", "function stop(){window.yeArcadeRewards?.progress(rewardRun,model.score,model.cleared,false,true);running=false;")
 replace("if(!model.alive){stop();return}draw();", "window.yeArcadeRewards?.progress(rewardRun,model.score,model.cleared);if(!model.alive){stop();return}draw();")
 replace("function start(){cancelAnimationFrame(frameId);readBest();model.reset();running=true;", "function start(){window.yeArcadeRewards?.progress(rewardRun,model.score,model.cleared,false,true);cancelAnimationFrame(frameId);readBest();model.reset();rewardRun=window.yeArcadeRewards?.begin('runner');running=true;")
 # Pac-Man: the score persists across levels/lives; only a new run resets rewards.
 replace("best=0,recordKey='';\nfunction active(){return window.yeArcadeSync.ready()&&!$('pacmanGame')", "best=0,recordKey='',rewardRun=null;\nfunction active(){return window.yeArcadeSync.ready()&&!$('pacmanGame')")
 replace("function finish(){running=false;cancelAnimationFrame(raf)","function finish(){window.yeArcadeRewards?.progress(rewardRun,model.score,0,false,true);running=false;cancelAnimationFrame(raf)")
 replace("if(model.over){finish();return}draw();", "window.yeArcadeRewards?.progress(rewardRun,model.score);if(model.over){finish();return}draw();")
 replace("function start(){cancelAnimationFrame(raf);readBest();model.reset();running=true;", "function start(){window.yeArcadeRewards?.progress(rewardRun,model.score,0,false,true);cancelAnimationFrame(raf);readBest();model.reset();rewardRun=window.yeArcadeRewards?.begin('pacman');running=true;")
 # Replace obsolete messages, preserving controls and all non-reward behavior.
 s=s.replace('Practice mode · YZYMNY rewards are not enabled yet.','Sign in to earn YZYMNY while you play.')
 s=s.replace('Personal best is saved on this browser. YZYMNY rewards are not enabled yet.','Personal best and YZYMNY rewards sync to your account.')
 s=s.replace('Bonuses award game score; YZYMNY rewards are not enabled.','Bonuses award game score and count toward YZYMNY milestones.')
 s=s.replace("Beats are the clicker game's currency. YZYMNY rewards are not enabled.","Beats are the clicker game's currency. Ye Clicker is just for fun; no YZYMNY rewards.")
 p.write_text(s)
 print('Enabled Snake, Jumper, and Pac-Man rewards; Clicker stays reward-free')
else:print('Arcade reward hooks already installed')
