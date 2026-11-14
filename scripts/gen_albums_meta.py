"""Builds data/albums-meta.js: one entry per Ye Tracker era, with curated details layered over values computed from the tracker archive."""
import os,base64,gzip,json,re,html,statistics,sys
from collections import Counter,defaultdict
ROOT=__file__.rsplit('/scripts',1)[0]
t=open(ROOT+'/data/ye-tracker-archive.txt').read().strip()
D=json.loads(gzip.decompress(base64.b64decode(t)))
S={s['name']:s for s in D}
def strip(h):return html.unescape(re.sub(r'<[^>]+>','',h or '')).strip()
def clean(v):return re.sub(r'\s+',' ',re.sub(r'\([^)]*\)',lambda m:m.group(0) if re.fullmatch(r'\(\d{4}\)',m.group(0)) else '',v)).strip()
def key(v):
    k=clean(v).lower()
    return {'pusha t - daytona':'daytona','teyana taylor - k.t.s.e.':'k.t.s.e.'}.get(k,k)
# alternate names: the parenthesised part of era labels
alts=defaultdict(list)
for s in D:
    for r in s['rows']:
        raw=r['era'];k=key(raw)
        for m in re.findall(r'\(([^()]*(?:\([^()]*\)[^()]*)*)\)',raw):
            for a in re.split(r',\s*',m):
                a=a.strip()
                if not a or re.fullmatch(r'\d{4}',a) or re.match(r'(Collaboration with|exec\. prod)',a) or re.search(r'nigger',a,re.I):continue
                a=re.sub(r'^Collaboration with .*',lambda x:x.group(0),a)
                if a not in alts[k]:alts[k].append(a)
YR=re.compile(r'(19|20)\d{2}')
def years_for(k):
    ys=[]
    for sec in ('Unreleased','Recent','Special','Best Of','Worst Of','Grails/Wanted','Stems'):
        for r in S[sec]['rows']:
            if key(r['era'])!=k:continue
            h=S[sec]['headers']
            for hn in ('File Date',):
                if hn in h:
                    m=YR.search(strip(r['cells'][h.index(hn)][0]))
                    if m:ys.append(int(m.group(0)))
    return ys
def dates_for(k):
    out=[]
    for sec in ('Unreleased','Recent','Special','Best Of','Worst Of','Grails/Wanted'):
        for r in S[sec]['rows']:
            if key(r['era'])!=k:continue
            h=S[sec]['headers']
            if 'Leak Date' in h:
                m=YR.search(strip(r['cells'][h.index('Leak Date')][0]))
                if m:out.append(int(m.group(0)))
    return out
# curated: name, kind, cover, official (name of the album in the streaming catalog), released, announced, rumored, blurb
C={}
def a(k,**kw):C[k.lower()]=kw
a('Before The College Dropout',kind='pre',cover='assets/era-covers/before-the-college-dropout.webp',years='1993–2003',blurb='Demo tapes, State Of Mind, Rhyme Sayers and Roc-A-Fella-era beats before the debut album.')
a('The College Dropout',kind='released',announced='Slated for 2003; delayed several times before release',years='2001–2003',cover='covers/college-dropout.jpg',official='The College Dropout')
a('Late Registration',kind='released',years='2003–2005',cover='covers/late-registration.jpg',official='Late Registration')
a('Graduation',kind='released',announced='Set for Sep 11, 2007, the same day as 50 Cent\'s Curtis',years='2005–2007',cover='covers/graduation.jpg',official='Graduation')
a('808s & Heartbreak',kind='released',years='2008',cover='covers/808s.jpg',official='808s & Heartbreak')
a('First World Problematic',kind='unreleased',blurb='Working title tied to the sessions that led into Good Ass Job.')
a('Good Ass Job',kind='unreleased',blurb='The 2009-10 sessions for the follow-up to 808s. The album was retitled and reworked into My Beautiful Dark Twisted Fantasy.')
a('My Beautiful Dark Twisted Fantasy',kind='released',rumored='Planned as Good Ass Job',years='2009–2010',cover='covers/mbdtf.jpg',official='My Beautiful Dark Twisted Fantasy')
a('Watch The Throne',kind='collab',years='2010–2011',cover='covers/watch-the-throne.jpg',official='Watch The Throne',blurb='Collaboration album with JAY-Z (as The Throne).')
a('Cruel Summer',kind='collab',years='2011–2012',cover='covers/cruel-summer.jpg',official='Cruel Summer',blurb='G.O.O.D. Music compilation.')
a('Yeezus',kind='released',years='2012–2013',cover='covers/yeezus.jpg',official='Yeezus')
a('Cruel Winter [V1]',kind='unreleased',cover='assets/era-covers/cruel-winter-v1.webp',blurb='Planned G.O.O.D. Music compilation, first version.')
a('Yeezus 2',kind='unreleased',cover='covers/unreleased-yeezus-2.jpg',blurb='The follow-up to Yeezus (also New Yeezus / Lost Yeezus). Parts became So Help Me God and SWISH.')
a('So Help Me God',kind='unreleased',cover='covers/unreleased-so-help-me-god.webp',blurb='The 2014-15 album that continued into SWISH and became The Life Of Pablo.')
a('SWISH',kind='unreleased',cover='assets/era-covers/swish.webp',blurb='The 2015 version that was reworked into The Life Of Pablo.')
a('The Life Of Pablo',kind='released',years='2013–2016',cover='covers/tlop.jpg',official='The Life Of Pablo')
a('Turbo Grafx 16',kind='unreleased',years='2016–2017',blurb='The album that followed The Life Of Pablo, worked on 2016-17.')
a('Cruel Winter [V2]',kind='unreleased',cover='assets/era-covers/cruel-winter-v2.webp',blurb='Second version of the planned G.O.O.D. Music compilation.')
a('Hitler',kind='unreleased',cover='assets/era-covers/hitler.webp',blurb='Unreleased 2017-18 project, later known as LOVE EVERYONE.')
a('DAYTONA',kind='produced',years='2017–2018',official='',blurb='Pusha T album, executive produced by Kanye West.',released='2018-05-25',cover='')
a('ye',kind='released',years='2018',cover='covers/ye.jpg',official='ye')
a('KIDS SEE GHOSTS',kind='collab',cover='covers/kids-see-ghosts.jpg',official='KIDS SEE GHOSTS',blurb='Collaboration with Kid Cudi (as KIDS SEE GHOSTS).')
a('NASIR',kind='produced',years='2018',released='2018-06-15',blurb='Nas album, executive produced by Kanye West.')
a('K.T.S.E.',kind='produced',years='2017–2018',released='2018-06-22',blurb='Teyana Taylor album, executive produced by Kanye West.')
a('Good Ass Job (2018)',kind='unreleased',blurb='Planned 2018 collaboration with Chance The Rapper.')
a('Yandhi [V1]',kind='unreleased',announced='Sep 29, 2018 (missed), then Nov 23, 2018 (missed)',cover='covers/unreleased-yandhi.webp',blurb='The album that followed ye. First version.')
a('Yandhi [V2]',kind='unreleased',cover='covers/unreleased-yandhi.webp',blurb='Reworked version of Yandhi (also Soul Children).')
a('JESUS IS KING',kind='released',announced='Sep 27, 2019 (missed)',years='2018–2019',cover='covers/jesus-is-king.jpg',official='JESUS IS KING')
a('JESUS IS KING: The Dr. Dre Version',kind='unreleased',cover='assets/era-covers/jesus-is-king-dr-dre.webp',blurb='Planned Dr. Dre-produced version, also called JESUS IS KING II.')
a("God's Country",kind='unreleased',cover='assets/era-covers/gods-country.webp',blurb='The 2020 sessions that grew into DONDA.')
a('DONDA [V1]',kind='unreleased',rumored='Jul 24, 2020 (announced, missed)',years='2020',cover='covers/donda.jpg',blurb='First version of the DONDA sessions.')
a('Donda [V2]',kind='unreleased',cover='covers/donda.jpg',blurb='Second version of DONDA, including the Atlanta listening-party tracklists.')
a('Donda [V3]',kind='released',years='2021',cover='covers/donda.jpg',official='Donda',blurb='Third and final version of DONDA, the retail album.')
a('DONDA 2 [V1]',kind='released',announced='Feb 22, 2022 (Miami listening event, Stem Player)',years='2021–2022',cover='covers/donda-2.jpg',official='DONDA 2',blurb='Released on the Stem Player in February 2022.',released='2022-02-22')
a('WAR',kind='unreleased',blurb='Unreleased 2022 project. Also appears as a Donda 2 title.')
a('YEBU',kind='unreleased',blurb='Unreleased 2022-23 project (also Ye 3 / Y3).')
a('¥$',kind='collab',years='2023',cover='assets/era-covers/yen-dollar.webp',blurb='Collaboration with Ty Dolla $ign, before the VULTURES albums (also Bad Bitch Playbook).')
a('VULTURES 1',kind='collab',announced='Dec 15, 2023 (missed)',years='2023–2024',cover='covers/vultures-1.png',official='VULTURES 1',blurb='Collaboration with Ty Dolla $ign as ¥$.')
a('VULTURES 2',kind='collab',announced='Mar 8, 2024 (missed)',cover='covers/vultures-2.jpg',official='VULTURES 2',blurb='Collaboration with Ty Dolla $ign as ¥$.')
a('VULTURES 3',kind='unreleased',blurb='Planned third volume of the VULTURES series.')
a('BULLY [V1]',kind='unreleased',cover='covers/bully.jpg',official='BULLY',blurb='First version of BULLY.')
a('CARTI YE',kind='unreleased',blurb='Planned collaboration with Playboi Carti.')
a('CUCK',kind='unreleased',blurb='Unreleased project from the 2024-25 sessions.')
a('DONDA 2 [V2]',kind='unreleased',cover='covers/donda-2.jpg',blurb='Later version of DONDA 2.')
a('DONDA 2 (2025)',kind='unreleased',years='2025',cover='covers/donda-2.jpg',blurb='2025 revival of DONDA 2.')
a('IN A PERFECT WORLD',kind='unreleased',blurb='Unreleased 2025 project.')
a('NEVER STOP',kind='unreleased',blurb='Unreleased project from the 2025 sessions.')
a('BULLY [V2]',kind='released',cover='covers/bully-deluxe.jpg',official='BULLY - DELUXE',blurb='Second version of BULLY.')
a('Ongoing',kind='unreleased',blurb='Current work in progress.')
order=[]
for r in S['Unreleased']['rows']:
    k=key(r['era'])
    if k and k not in order:order.append(k)
for s in D:
    for r in s['rows']:
        k=key(r['era'])
        if k and k not in order and k!='multi-era':order.append(k)
albums=[]
for k in order:
    c=C.get(k,{})
    name=next((clean(r['era']) for s in D for r in s['rows'] if key(r['era'])==k),k)
    ys=years_for(k)
    if c.get('years'):yrs=c['years']
    elif ys:
        ys.sort();lo=ys[int(len(ys)*.04)];hi=ys[int(len(ys)*.96)-1 if len(ys)>1 else 0];yrs=str(lo) if lo==hi else f'{lo}–{hi}'
    else:yrs=''
    ls=dates_for(k)
    entry=dict(id=({'¥$':'yen-dollar'}.get(k) or re.sub(r'[^a-z0-9]+','-',k).strip('-') or 'x'),name=name,era=name,kind=c.get('kind','unreleased'),alt=[x for x in alts.get(k,[]) if x.lower()!=name.lower()],years=yrs,
      cover=c.get('cover',''),official=c.get('official',''),released=c.get('released',''),announced=c.get('announced',''),rumored=c.get('rumored',''),blurb=c.get('blurb',''))
    if not entry['cover'] and os.path.exists(ROOT+'/assets/album-covers/'+entry['id']+'.jpg'):entry['cover']='assets/album-covers/'+entry['id']+'.jpg'
    albums.append(entry)
open(ROOT+'/data/albums-meta.js','w').write('window.ALBUMS_META='+json.dumps(albums,ensure_ascii=False,separators=(',',':'))+';\n')
print(len(albums));[print(x['id'],x['years'],x['kind'],x['alt'][:3]) for x in albums]
