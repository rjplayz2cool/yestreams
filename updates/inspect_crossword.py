from pathlib import Path
import re
s=Path('index.html').read_text()
lines=[]
for m in list(re.finditer(r'crossword',s,re.I))[:350]:
 a=max(0,m.start()-280);b=min(len(s),m.end()+500)
 lines.append(f'OFFSET {m.start()}\n'+s[a:b].replace('\\n',' ')[:800]+'\n---')
Path('recovery-index/crossword-inspection.txt').write_text('\n'.join(lines)[:115000])
print('Crossword references:',len(lines))
