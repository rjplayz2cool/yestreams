from pathlib import Path
from lxml import html,etree
import re,json,urllib.parse
from html import escape
sections=[('Unreleased','34972268'),('Released','762588265'),('Recent','77894385'),('Best Of','787540803'),('Special','812818104'),('Worst Of','1371492190'),('Grails/Wanted','1948929917'),('Stems','495336364'),('Art','1219860820'),('Tracklists','1372270223'),('Album Copies','1297512832'),('Groupbuys','1022200924')]
allowed={'background-color','color','font-weight','font-style','text-decoration'}
def style(raw):
 return ';'.join(k.strip()+':'+v.strip() for pair in raw.split(';') if ':' in pair for k,v in [pair.split(':',1)] if k.strip() in allowed and re.fullmatch(r'[a-zA-Z0-9#(),.%\s-]+',v.strip()))
def url(u):
 if u.startswith('https://www.google.com/url?'):u=urllib.parse.parse_qs(urllib.parse.urlsplit(u).query).get('q',[''])[0]
 return u if urllib.parse.urlsplit(u).scheme in ['http','https'] else ''
def clean(cell):
 x=html.fromstring(html.tostring(cell));x.tag='div';x.attrib.clear()
 for el in list(x.iterdescendants()):
  tag=el.tag
  if tag not in ['a','span','br','div','img','b','strong','i','em','u']:
   el.drop_tree();continue
  old=dict(el.attrib);el.attrib.clear()
  st=style(old.get('style',''))
  if st:el.set('style',st)
  if tag=='a':
   u=url(old.get('href',''))
   if u:el.set('href',u);el.set('target','_blank');el.set('rel','noopener noreferrer')
  if tag=='img':
   u=url(old.get('src',''))
   if u:el.set('src',u);el.set('loading','lazy');el.set('alt','Tracker reference image')
 return escape(x.text or '')+''.join(html.tostring(el,encoding='unicode') for el in x)
def parse_section(name,gid,source):
 if '</table>' not in source.lower() or '</html>' not in source.lower():raise ValueError(name+': incomplete source document; keeping last good archive')
 d=html.fromstring(source);css='\n'.join(d.xpath('//style/text()'))
 styles={k:style(v) for k,v in re.findall(r'\.ritz\s+\.waffle\s+\.(s\d+)\s*\{([^}]+)\}',css)}
 raw=d.xpath('//table[contains(@class,"waffle")]/tbody/tr')
 if not raw:raise ValueError(name+': missing public table')
 header=raw[0].xpath('./td');keep=list(range(len(header)))
 expected=10 if name=='Stems' else 8 if name in ['Released','Tracklists','Album Copies'] else 9
 if len(header)!=expected:raise ValueError(name+': source columns changed; keeping last good archive')
 if name=='Art':keep.remove(5)
 labels={ 'Unreleased':['Era','Name','Notes','Length','File Date','Leak Date','Quality Length','Quality','Links'], 'Released':['Era','Name','Notes','Length','Release Date','Type','Streaming','Links'], 'Stems':['Era','Name','Notes','File Date','Leak Date','Full Length','BPM','Available Length','Quality','Links'], 'Art':['Era','Name','Notes','Designer','Art Type','Project Type','Use','Links'], 'Tracklists':['Era','Name','Tracklist','Image','Date Made','Quality','Source','Links'], 'Album Copies':['Era','Name','Notes','Copy Length','File Date','Available Length','Quality','Links'], 'Groupbuys':['Main Era','Main Content','All Content','Price','Start Date','End Date','Type','Finished?','Snippets']}.get(name,['Era','Name','Notes','Track Length' if name=='Recent' else 'Length','File Date','Leak Date','Available Length','Quality','Links'])
 rows=[];legend='';era=''
 for row in raw[1:]:
  cells=row.xpath('./td')
  if not cells or all(not c.text_content().strip() and not c.xpath('.//img') for c in cells):continue
  if name=='Tracklists' and len(cells)==1 and 'Completely Unheard' in cells[0].text_content():legend=clean(cells[0]);continue
  # A complete era divider combines cells and includes the album name in column B.
  if any(int(c.get('colspan','1'))>1 for c in cells):
   if len(cells)>1 and cells[1].text_content().strip():era=cells[1].text_content().split('\n')[0].strip()
   continue
  if len(cells)!=len(header):continue
  if cells[0].text_content().strip():era=cells[0].text_content().strip()
  selected=[cells[i] for i in keep];vals=[]
  for c in selected:
   st=';'.join(styles.get(k,'') for k in c.get('class','').split());st+=';'+style(c.get('style',''))
   vals.append([clean(c),st.strip(';')])
  text=' '.join(c.text_content() for c in selected)
  rows.append({'era':era,'cells':vals,'search':text.lower()})
 return {'name':name,'gid':gid,'headers':labels,'rows':rows,'legend':legend}

import argparse,concurrent.futures,datetime,gzip,base64,time,urllib.request,os,tempfile,hashlib
ROOT=Path(__file__).resolve().parents[1]
ARCHIVE_PATTERN=r'(<script id="yeTrackerArchive"[^>]*>)([^<]*)(</script>)'

def fetch(url):
 for attempt in range(3):
  try:
   request=urllib.request.Request(url,headers={'User-Agent':'YeStreamTrackerSync/1.0'})
   with urllib.request.urlopen(request,timeout=60) as response:
    return response.read().decode('utf-8')
  except Exception:
   if attempt==2:raise
   time.sleep(2**attempt)

def collect(source_dir=None):
 if source_dir:
  return [parse_section(name,gid,(source_dir/(gid+'.html')).read_text()) for name,gid in sections]
 home=fetch('https://yetracker.net/')
 found={name.replace('\\/','/'):gid for name,gid in re.findall(r'items.push\(\{name: "([^"]+)",.*?gid: "(\d+)"',home)}
 missing=[name for name,_ in sections if name not in found]
 if missing:raise ValueError('Missing public sections: '+', '.join(missing))
 def download(item):
  name,_=item;gid=found[name]
  return parse_section(name,gid,fetch('https://yetracker.net/htmlview/sheet?headers=true&gid='+gid))
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:return list(pool.map(download,sections))

def update(index_path,source_dir=None):
 original=index_path.read_text();match=re.search(ARCHIVE_PATTERN,original)
 if not match or not original.rstrip().endswith('</body></html>'):
  raise ValueError('Index is incomplete or tracker archive is missing; no changes written')
 external=re.search(r'data-src="([^"]+)"',match.group(1))
 archive_path=index_path.parent/'data'/'ye-tracker-archive.txt' if external else None
 previous_payload=(archive_path.read_text() if archive_path.exists() else '') if archive_path else match.group(2)
 previous=json.loads(gzip.decompress(base64.b64decode(previous_payload))) if previous_payload.strip() else None
 current=collect(source_dir)
 if len(current)!=12:raise ValueError('Incomplete import')
 for i,new in enumerate(current):
  old=previous[i] if previous else new
  if new['name']!=old['name'] or new['headers']!=old['headers']:raise ValueError('Section schema changed: '+new['name'])
  if not new['rows']:raise ValueError('Empty section '+new['name']+'; keeping last good archive')
  curated={'Recent','Best Of','Special','Worst Of','Grails/Wanted'}
  if len(new['rows'])<len(old['rows'])*0.8 and new['name'] not in curated:
   raise ValueError('Unexpectedly missing entries in '+new['name']+'; keeping last good archive')
  if len(new['rows'])<len(old['rows']) and new['name'] in curated:
   print('Curated list '+new['name']+' changed from '+str(len(old['rows']))+' to '+str(len(new['rows']))+' entries; accepting the complete source list.')
  if any(len(r['cells'])!=len(new['headers']) for r in new['rows']):raise ValueError('Misaligned cells: '+new['name'])
  print(new['name']+': '+str(len(new['rows']))+' entries')
 if current==previous:
  print('No source changes. Index unchanged.');return False
 archive=base64.b64encode(gzip.compress(json.dumps(current,ensure_ascii=False,separators=(',',':')).encode(),compresslevel=9,mtime=0)).decode()
 if archive_path:
  digest=hashlib.sha256(archive.encode()).hexdigest()[:12]
  opening=re.sub(r'data-src="[^"]+"','data-src="data/ye-tracker-archive.txt?v='+digest+'"',match.group(1))
  updated=original[:match.start()]+opening+match.group(3)+original[match.end():]
 else:
  updated=original[:match.start(2)]+archive+original[match.end(2):]
 stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
 updated=re.sub(r'(<span id="yeTrackerSyncStatus">).*?(</span>)',lambda m:m[1]+'Syncs hourly · Data updated '+stamp+m[2],updated,count=1)
 # Verify only the archive payload and timestamp changed. Calendar, games, and accounts stay byte-identical.
 def outside_archive(text):
  text=re.sub(ARCHIVE_PATTERN,lambda m:re.sub(r'data-src="[^"]+"','data-src="ARCHIVE_VERSION"',m[1])+'ARCHIVE'+m[3],text)
  return re.sub(r'(<span id="yeTrackerSyncStatus">).*?(</span>)',lambda m:m[1]+'TIMESTAMP'+m[2],text)
 if outside_archive(original)!=outside_archive(updated):raise ValueError('Unexpected change outside tracker data')
 if json.loads(gzip.decompress(base64.b64decode(archive if archive_path else re.search(ARCHIVE_PATTERN,updated)[2])))!=current:raise ValueError('Archive verification failed')
 if archive_path:
  archive_path.parent.mkdir(parents=True,exist_ok=True)
  with tempfile.NamedTemporaryFile(mode='w',encoding='utf-8',dir=archive_path.parent,delete=False) as payload_file:
   payload_file.write('\n'.join(archive[i:i+4096] for i in range(0,len(archive),4096))+'\n');payload_temp=payload_file.name
  os.replace(payload_temp,archive_path)
 with tempfile.NamedTemporaryFile(mode='w',encoding='utf-8',dir=index_path.parent,delete=False) as f:
  f.write(updated);temp_path=f.name
 os.replace(temp_path,index_path)
 print('Tracker refreshed; all other site content preserved.');return True

if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--index',type=Path,default=ROOT/'index.html');parser.add_argument('--source-dir',type=Path)
 args=parser.parse_args();update(args.index,args.source_dir)
