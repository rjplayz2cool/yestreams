#!/usr/bin/env python3
"""Copy actual Imgur audio files and map them to tracker entry/version names."""
import argparse,base64,gzip,hashlib,html,json,math,os,re,subprocess,tempfile,time,unicodedata,urllib.parse,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
AUDIO_EXT={'.mp3','.wav','.flac','.m4a','.ogg','.opus','.aac','.aiff','.aif'}
CURATED_SECTIONS={'Worst Of','Best Of','Special','Grails/Wanted'}

def request(url):
 parsed=urllib.parse.urlsplit(url)
 if parsed.scheme!='https' or not (parsed.hostname=='imgur.gg' or parsed.hostname.endswith('.imgur.gg')):raise ValueError('Unexpected media host')
 return urllib.request.Request(url,headers={'User-Agent':'YeTrackerAudioImporter/1.0'})
def fetch_page(url):
 for attempt in range(3):
  try:
   with urllib.request.urlopen(request(url),timeout=35) as r:return r.read(2_000_000).decode('utf-8')
  except Exception:
   if attempt==2:raise
   time.sleep(1+attempt)
def title_from_html(markup):
 title=re.split(r'<br\s*/?>',markup,maxsplit=1,flags=re.I)[0]
 title=html.unescape(re.sub(r'<[^>]+>','',title));title=re.sub(r'\[\s*(V\d+(?:\.\d+)?)\s*\]',r'\1',title,flags=re.I)
 return ''.join(c for c in title if unicodedata.category(c)[0]!='S').strip()
def safe_filename(title):
 name=re.sub(r'[<>:"/\\|?*\x00-\x1f]','-',title).strip(' .')[:160]
 return name or 'Untitled'
def map_entries(archive):
 data=json.loads(gzip.decompress(base64.b64decode(archive.read_bytes())));files={}
 for tab in data:
  for row in tab['rows']:
   title=title_from_html(row['cells'][1][0])
   for markup,_ in row['cells']:
    for url in re.findall(r'href="(https://(?:www\.)?imgur\.gg/f/[^"?#]+)',markup):
     url=html.unescape(url);item=files.setdefault(url,{'source':url,'id':url.rsplit('/',1)[-1],'title':title,'era':row['era'],'entries':[]})
     entry={'section':tab['name'],'title':title,'era':row['era']}
     if entry not in item['entries']:item['entries'].append(entry)
 return list(files.values())
def inspect_audio(page):
 sources=[html.unescape(u) for u in re.findall(r'<audio\b[^>]*\bsrc=["\']([^"\']+)',page,re.I)]
 for u in sources:
  ext=Path(urllib.parse.unquote(urllib.parse.urlsplit(u).path)).suffix.lower()
  if ext in AUDIO_EXT:return u,ext
 raise ValueError('No supported audio file on this page (may be artwork, video, ZIP, or removed)')
def probe(path):
 raw=subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration:stream=codec_type','-of','json',str(path)],text=True)
 info=json.loads(raw)
 if not any(s.get('codec_type')=='audio' for s in info.get('streams',[])):raise ValueError('Downloaded file is not audio')
 duration=float(info.get('format',{}).get('duration',0))
 if not math.isfinite(duration) or duration<=0:raise ValueError('Invalid audio duration')
 return duration
def peaks(path):
 raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-vn','-ac','1','-ar','200','-f','f32le','pipe:1'])
 import array
 samples=array.array('f');samples.frombytes(raw);step=max(1,len(samples)//60);values=[]
 for i in range(60):
  part=samples[i*step:(i+1)*step] if i<59 else samples[i*step:]
  values.append(math.sqrt(sum(x*x for x in part)/max(1,len(part))))
 highest=max(values) or 1
 return [round(max(.1,min(1,x/highest)),3) for x in values]
def save_json(path,data):
 path.parent.mkdir(parents=True,exist_ok=True)
 with tempfile.NamedTemporaryFile(mode='w',encoding='utf-8',dir=path.parent,delete=False) as f:json.dump(data,f,ensure_ascii=False,indent=2);temp=f.name
 os.replace(temp,path)
def playback_copy(record,max_total_mb):
 original=ROOT/record['src']
 if not original.is_file():raise ValueError('Original copied audio is missing')
 dest=original.with_name(original.stem+' - playback.mp3')
 if not dest.exists():
  temp=dest.with_name(dest.name+'.part')
  try:
   subprocess.run(['ffmpeg','-v','error','-y','-i',str(original),'-vn','-ac','2','-ar','44100','-codec:a','libmp3lame','-b:a','256k','-f','mp3',str(temp)],check=True)
   probe(temp)
   site_bytes=sum(p.stat().st_size for p in ROOT.rglob('*') if p.is_file() and '.git' not in p.relative_to(ROOT).parts)
   media_bytes=sum(p.stat().st_size for p in (ROOT/'media').rglob('*') if p.is_file())
   if site_bytes>900_000_000 or media_bytes>max_total_mb*1_000_000:raise ValueError('Playback copy storage budget reached')
   os.replace(temp,dest)
  finally:
   if temp.exists():temp.unlink()
 record['playbackSrc']=dest.relative_to(ROOT).as_posix()
 record['playbackBytes']=dest.stat().st_size
 print('PLAYBACK READY',record['title'],flush=True)
def run(args):
 archive=args.archive or ROOT/'data'/'ye-tracker-archive.txt';manifest_path=ROOT/'data'/'hosted-audio.json'
 manifest=json.loads(manifest_path.read_text()) if manifest_path.exists() else {'version':1,'files':{}}
 choices=map_entries(archive)
 if args.sections:
  selected={x.strip() for x in args.sections.split(',') if x.strip()}
  invalid=selected-CURATED_SECTIONS
  if invalid:raise ValueError('Unknown section(s): '+', '.join(sorted(invalid)))
  choices=[x for x in choices if any(e['section'] in selected for e in x['entries'])]
 if args.names:
  patterns=[x.strip().casefold() for x in args.names.split(',') if x.strip()]
  choices=[x for x in choices if any(x['title'].casefold()==p for p in patterns)]
 if args.limit<0 or args.limit>1000:raise ValueError('Batch count must be between 0 and 1000; 0 means all selected files')
 if args.url:choices=[x for x in choices if x['source']==args.url]
 total=sum(p.stat().st_size for p in (ROOT/'media').rglob('*') if p.is_file()) if (ROOT/'media').exists() else 0
 site_bytes=sum(p.stat().st_size for p in ROOT.rglob('*') if p.is_file() and '.git' not in p.relative_to(ROOT).parts)
 imported=0;failures=[];blocked=None;started=time.monotonic()
 print('Selected',len(choices),'unique Imgur links',flush=True)
 (ROOT/'media'/'imgur').mkdir(parents=True,exist_ok=True)
 save_json(manifest_path,manifest)
 for item in choices:
  if time.monotonic()-started>150*60:
   blocked='Run time limit reached; run the workflow again to continue';break
  if item['source'] in manifest['files']:
   if args.repair_existing and not manifest['files'][item['source']].get('playbackSrc'):
    playback_copy(manifest['files'][item['source']],args.max_total_mb);save_json(manifest_path,manifest)
   continue
  if args.limit and imported>=args.limit:break
  try:
   audio_url,ext=inspect_audio(fetch_page(item['source']));folder=ROOT/'media'/'imgur'/item['id'];folder.mkdir(parents=True,exist_ok=True)
   dest=folder/(safe_filename(item['title'])+ext);temp=folder/(dest.name+'.part');written=0
   with urllib.request.urlopen(request(audio_url),timeout=60) as response,temp.open('wb') as output:
    while True:
     chunk=response.read(262144)
     if not chunk:break
     written+=len(chunk)
     if written>args.max_file_mb*1_000_000:raise ValueError('File exceeds configured single-file budget')
     if site_bytes+written>900_000_000:raise ValueError('Site storage budget reached; use dedicated storage for more copies')
     if total+written>args.max_total_mb*1_000_000:raise ValueError('Media storage budget reached; use larger dedicated storage for the full archive')
     output.write(chunk)
   duration=probe(temp);waveform=peaks(temp);os.replace(temp,dest);total+=written;site_bytes+=written
   manifest['files'][item['source']]={**item,'src':dest.relative_to(ROOT).as_posix(),'duration':duration,'waveform':waveform,'bytes':written,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()}
   save_json(manifest_path,manifest);imported+=1;print('COPIED',item['title'],written,'bytes',flush=True)
   playback_copy(manifest['files'][item['source']],args.max_total_mb);save_json(manifest_path,manifest)
   total=sum(p.stat().st_size for p in (ROOT/'media').rglob('*') if p.is_file())
   site_bytes=sum(p.stat().st_size for p in ROOT.rglob('*') if p.is_file() and '.git' not in p.relative_to(ROOT).parts)
  except Exception as e:
   if 'temp' in locals() and temp.exists():temp.unlink()
   failures.append({'source':item['source'],'title':item['title'],'error':str(e)});print('SKIPPED',item['title'],str(e),flush=True)
   if 'storage budget reached' in str(e):blocked=str(e);break
 total=sum(p.stat().st_size for p in (ROOT/'media').rglob('*') if p.is_file()) if (ROOT/'media').exists() else 0
 remaining=[{'source':x['source'],'title':x['title'],'sections':sorted({e['section'] for e in x['entries'] if e['section'] in CURATED_SECTIONS})} for x in choices if x['source'] not in manifest['files']]
 save_json(ROOT/'data'/'audio-import-report.json',{'imported':imported,'availableCopies':len(manifest['files']),'totalBytes':total,'selectedSections':args.sections,'selectedUniqueLinks':len(choices),'remainingCount':len(remaining),'remaining':remaining,'blocked':blocked,'uniqueImgurLinks':len(map_entries(archive)),'failed':failures})
 print('Finished:',imported,'new files;',len(manifest['files']),'available copied files')
 if blocked:print('IMPORT PAUSED:',blocked,flush=True)
 if not imported and failures and not blocked:raise SystemExit('No new copies could be imported; see audio-import-report.json')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--archive',type=Path);p.add_argument('--names');p.add_argument('--sections');p.add_argument('--url');p.add_argument('--repair-existing',action='store_true');p.add_argument('--limit',type=int,default=3);p.add_argument('--max-file-mb',type=float,default=24);p.add_argument('--max-total-mb',type=float,default=700);run(p.parse_args())
