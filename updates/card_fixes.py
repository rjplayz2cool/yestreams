"""Shared metadata/covers for account cards and separated account controls."""
from pathlib import Path
import re
p=Path('index.html');s=p.read_text();marker='<!-- account-card-layout-v1 -->'
if marker not in s:
 assert '<body><div id="moneyPill"' in s
 s=s.replace('<body><div id="moneyPill"','<body><div class="siteControls">'+marker+'<div class="walletControls"><div id="moneyPill"',1)
 s=s.replace('</button><button id="accountBtn"','</button></div><button id="accountBtn"',1)
 s=s.replace('<main id="yeTrackerScreen"','</div><main id="yeTrackerScreen"',1)
 s=s.replace('</head>','<link rel="stylesheet" href="cards/layout.css?v=1"></head>',1)
 s=s.replace('<script src="data/metadata.js"></script>','')
 s=s.replace('<script src="data/history.js"></script>','<script src="data/history.js"></script><script src="data/card-metadata.js"></script>',1)
 # These declarations are single-line functions in the original site.
 helpers=Path('cards/helpers.js').read_text()
 for name in ['specialRollByRecord','serverCoverSrc','serverItemInfo','canonicalServerRecord']:
  assert re.search(r'^function '+name+r'\(.*$',s,re.M),name
  s=re.sub(r'^function '+name+r'\(.*$',lambda _: '// '+name+' is supplied by the shared card resolver',s,count=1,flags=re.M)
 s=s.replace('function fallbackCoverForRecord(r)',helpers+'\nfunction fallbackCoverForRecord(r)',1)
 s=s.replace('function slotCandidateRecord(x){',"function slotCandidateRecord(x){if(x?.title&&x?.rarity&&!x.name)return canonicalServerRecord(x);",1)
 s=s.replace('function rollCardHTML(r,history=false){let coverHtml=', 'function rollCardHTML(r,history=false){r=canonicalServerRecord(r);let coverHtml=',1)
 s=s.replace("let md=META[x.spotify]||{}", "let md={...(META[x.spotify]||{}),...(window.CARD_METADATA?.[(x.spotify||'').split('/').pop()]||{})}")
 p.write_text(s)
 print('Installed shared card metadata and account layout')
else:print('Shared card metadata and layout already installed')
# Metadata must be available during the first render, including cached guest pulls.
s=p.read_text();tag='<script src="data/card-metadata.js"></script>'
s=s.replace(tag,'').replace('<script src="data/current.js"></script>','<script src="data/current.js"></script>'+tag,1)
p.write_text(s)
assert s.index(tag)<s.index('function rollCardHTML(')

# Use the same whole-day estimate and Eastern calendar date in both views.
s=p.read_text()
helper="""function milestoneProjection(x,target=nextM(x.streams),now=new Date()){if(x.streams==null||!x.daily||x.daily<=0)return null;let days=Math.ceil((target-x.streams)/x.daily);if(!Number.isFinite(days)||days<0)return null;let parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now),o={};parts.forEach(p=>o[p.type]=p.value);let date=new Date(Date.UTC(Number(o.year),Number(o.month)-1,Number(o.day)+days,12));return{days,date,key:date.toISOString().slice(0,10)}}"""
if 'function milestoneProjection(' not in s:s=s.replace('function estimate(x){',helper+'\nfunction estimate(x){',1)
estimate="""function estimate(x){let m=nextM(x.streams),p=milestoneProjection(x,m);if(!p)return 'Projection unavailable';return `Estimated ${short(m)}: <b>${p.date.toLocaleDateString(undefined,{timeZone:'America/New_York',month:'short',day:'numeric',year:'numeric'})}</b> · ~${fmt(p.days)} days`}"""
s=re.sub(r'^function estimate\(x\).*$',lambda _:estimate,s,count=1,flags=re.M)
old="let target=nextM(x.streams),days=(target-x.streams)/x.daily;if(!Number.isFinite(days)||days<0||days>730)continue;let d=new Date(now+days*86400000),parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d),o={};parts.forEach(p=>o[p.type]=p.value);let key=`${o.year}-${o.month}-${o.day}`;"
new="let target=nextM(x.streams),projection=milestoneProjection(x,target,new Date(now));if(!projection||projection.days>730)continue;let key=projection.key;"
assert old in s or new in s,'Calendar projection function changed; inspect before patching'
s=s.replace(old,new,1)
s=s.replace("(e.achieved?' · Achieved':'')","(e.achieved?' · Achieved':' · Projected')")
p.write_text(s)
