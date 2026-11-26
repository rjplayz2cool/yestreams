from pathlib import Path
import re
p=Path('index.html')
s=p.read_text(encoding='utf-8')
marker='/* World Tour full-screen background coverage fix */'
if marker in s:
    print('World Tour background fix already present')
else:
    css='''\n<style>
/* World Tour full-screen background coverage fix */
#worldTourScreen {
  background: #080d19 !important;
  min-height: 100vh !important;
  min-height: 100dvh !important;
  height: 100vh !important;
  height: 100dvh !important;
  width: 100% !important;
  max-width: none !important;
  overflow: hidden !important;
  position: relative !important;
  isolation: isolate;
}
#worldTourScreen iframe,
#worldTourScreen .worldTourFrame,
#worldTourScreen .tourFrame {
  display: block;
  width: 100% !important;
  height: 100% !important;
  min-height: 100vh !important;
  min-height: 100dvh !important;
  border: 0 !important;
  background: #080d19 !important;
}
body:has(#worldTourScreen.activeScreen) {
  background: #080d19 !important;
}
</style>\n'''
    assert '<head>' in s,'No HTML head found'
    s=s.replace('<head>','<head>'+css,1)
    p.write_text(s,encoding='utf-8')
    print('Patched main site World Tour background')
