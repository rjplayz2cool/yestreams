const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(process.argv[2]||'index.html','utf8');
const source=html.slice(html.indexOf('class RunnerModel'),html.indexOf('window.YeRunnerEngine=RunnerModel;'));
const context={};vm.createContext(context);vm.runInContext(source+';this.Runner=RunnerModel',context);
const m=new context.Runner(()=>0.5);m.wait=100;m.y=150;m.vy=0;m.obstacles=[{x:90,w:80,h:72,count:2}];m.step(.001);assert.equal(m.cleared,0);
m.obstacles[0].x=70;m.step(.001);assert.equal(m.cleared,1);m.step(.001);assert.equal(m.cleared,1);
m.obstacles[0].x=25;m.step(.001);assert.equal(m.cleared,2);m.step(.001);assert.equal(m.cleared,2);
m.reset();assert.equal(m.cleared,0);m.wait=100;m.obstacles=[{x:115,w:36,h:80,count:1}];m.step(.001);assert.equal(m.alive,false);assert.equal(m.cleared,0);
// All inline game JavaScript must still parse after source patches.
for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(/src=|application\/octet-stream/.test(match[1]))continue;new vm.Script(match[2]);}
console.log('PASS: single/double bottle clearing, no repeated count, collision rejection, reset, all inline scripts parse');
