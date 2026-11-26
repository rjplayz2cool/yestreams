from pathlib import Path

path = Path("index.html")
html = path.read_text(encoding="utf-8")
nav = '<button data-mode="yeTracker" class="modeChoice">Ye Tracker</button>'
button = '<button data-mode="worldTour" class="modeChoice">World Tour</button>'
toggle = "document.getElementById('worldTourScreen').classList.toggle('activeScreen',mode==='worldTour');"
anchor = "document.getElementById('gamesScreen').classList.toggle('activeScreen',mode==='games');"
marker = '<main id="gamesScreen" class="wrap screen gamesScreen">'
screen = '''<main id="worldTourScreen" class="screen" aria-label="Ye World Tour" style="padding:0;max-width:none;width:100%;min-height:calc(100vh - 80px)">
<iframe src="ye-world-tour.html" title="Ye World Tour globe and concert dates" loading="lazy" style="display:block;width:100%;height:calc(100vh - 80px);min-height:650px;border:0;background:#070b12"></iframe>
</main>
'''
new_screen = '''<main id="worldTourScreen" class="screen" aria-label="Ye World Tour" style="padding:0;max-width:none;width:100%;height:calc(100dvh - 92px);min-height:0;overflow:hidden">
<iframe src="ye-world-tour.html" title="Ye World Tour globe and concert dates" loading="lazy" style="display:block;width:100%;height:100%;min-height:0;border:0;background:#070b12"></iframe>
</main>'''
if button in html and toggle in html and 'id="worldTourScreen"' in html:
    import re
    html2 = re.sub(r'<main id="worldTourScreen"(?s:.*?)</main>', new_screen, html, count=1)
    if html2 == html:
        raise RuntimeError('Could not update World Tour iframe sizing')
    path.write_text(html2, encoding='utf-8')
    print('Updated World Tour iframe sizing.')
else:
    for needle in (nav, anchor, marker):
        if html.count(needle) != 1:
            raise RuntimeError(f"Expected exactly one insertion point: {needle!r}; found {html.count(needle)}")
    html = html.replace(nav, nav + button, 1)
    html = html.replace(anchor, anchor + toggle, 1)
    html = html.replace(marker, screen + marker, 1)
    if 'id="yeTrackerArchive"' not in html and 'yeTrackerArchive' not in html:
        raise RuntimeError("Refusing to replace index: Ye Tracker archive missing")
    path.write_text(html, encoding="utf-8")
    print("World Tour tab integrated into index.html.")
