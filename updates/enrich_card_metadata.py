"""Cache public music-catalog release dates, retaining an exact source URL per match."""
import concurrent.futures,json,re,subprocess,time,unicodedata,urllib.parse,urllib.request
from pathlib import Path
subprocess.run(['node','updates/extract_card_metadata.cjs','index.html','data/card-seed.json'],check=True)
rows=json.loads(Path('data/card-seed.json').read_text());cache_path=Path('data/card-public-cache.json');cache=json.loads(cache_path.read_text()) if cache_path.exists() else {}
def norm(s):
 s=unicodedata.normalize('NFKD',s).lower().replace('’',"'")
 s=re.sub(r'[\(\[]\s*(?:feat\.?|with|starring)[^\)\]]*[\)\]]','',s)
 s=re.sub(r'\s+-\s+(?:main|explicit album version|album version \(edited\)|explicit main verson)$','',s)
 return re.sub(r'[^a-z0-9]+','',s)
def fetch(term):
 url='https://itunes.apple.com/search?'+urllib.parse.urlencode({'term':term,'entity':'song','limit':200,'country':'US'})
 req=urllib.request.Request(url,headers={'User-Agent':'YeStreamTracker/1.0 (public release-date metadata)'})
 try:
  with urllib.request.urlopen(req,timeout=20) as response:return json.load(response).get('results',[])
 except Exception as e:print('Public catalog lookup unavailable:',term,str(e)[:100],flush=True);return []
def choose(row,results):
 matches=[]
 for x in results:
  if x.get('kind')!='song' or not x.get('releaseDate'):continue
  if not re.search(r'kanye|\bye\b|kids see ghosts',x.get('artistName','')+' '+x.get('trackName',''),re.I):continue
  if norm(x.get('trackName',''))!=norm(row['title']):continue
  # Never substitute studio recordings for live tracks, or unrelated remix versions.
  matches.append(x)
 if not matches:return None
 x=min(matches,key=lambda x:x['releaseDate'])
 return {'releaseDate':x['releaseDate'][:10],'album':x.get('collectionName',''),'source':x.get('trackViewUrl',''),'artist':x.get('artistName','')}
verified=json.loads(Path('cards/verified-metadata.json').read_text()) if Path('cards/verified-metadata.json').exists() else {}
cache.update(verified)
needed=[r for r in rows if not r['releaseDate'] and r['id'] not in cache]
if needed:
 bulk=fetch('Kanye West')
 for r in needed:
  match=choose(r,bulk)
  if match:cache[r['id']]=match
 remaining=[r for r in needed if r['id'] not in cache]
 def lookup(r):
  title=re.sub(r'\([^)]*feat\.[^)]*\)','',r['title'],flags=re.I)
  return r,choose(r,fetch(title+' Kanye West'))
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
  for r,result in pool.map(lookup,remaining):
   cache[r['id']]=result or {'checkedAt':time.strftime('%Y-%m-%d'),'releaseDate':''}
cache_path.write_text(json.dumps(cache,ensure_ascii=False,indent=2)+'\n')
for r in rows:
 if not r['releaseDate'] and r['id'] in cache:r.update(cache[r['id']])
 if r.get('source','').startswith('https://music.apple.com') and r['releaseDate'].endswith('-01-01'):r['releaseDate']=r['releaseDate'][:4]
extras=json.loads(Path('cards/catalog-extra.json').read_text()) if Path('cards/catalog-extra.json').exists() else {}
rows.extend(extras.values())
Path('data/card-metadata.js').write_text('window.CARD_METADATA='+json.dumps({r['id']:r for r in rows},ensure_ascii=False,separators=(',',':'))+';\n')
missing=[r for r in rows if not r['releaseDate']]
Path('data/card-metadata-unresolved.json').write_text(json.dumps(missing,ensure_ascii=False,indent=2)+'\n')
assert not missing, 'Release-date metadata must cover every song before publication'
print('Release dates:',len(rows)-len(missing),'of',len(rows),'unresolved:',len(missing),flush=True)
