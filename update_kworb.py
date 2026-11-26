#!/usr/bin/env python3
from pathlib import Path
from urllib.request import Request, urlopen
from html import unescape
from datetime import datetime, timezone
import json, re, sys

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
HISTORY = DATA / "history"
HISTORY.mkdir(parents=True, exist_ok=True)

SONGS_URL = "https://kworb.net/spotify/artist/5K4W6rqBFWDnAN6FQUkS6x_songs.html"
ALBUMS_URL = "https://kworb.net/spotify/artist/5K4W6rqBFWDnAN6FQUkS6x_albums.html"
KSG_URL = "https://kworb.net/spotify/artist/2hPgGN4uhvXAxiXQBIXOmE_songs.html"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153 Safari/537.36"

ROW_RE = re.compile(
    r'<tr><td class="text"><div>(.*?)'
    r'<a href="(https://open\.spotify\.com/(?:track|album)/[^"]+)"[^>]*>(.*?)</a>'
    r'</div></td><td>([0-9,]+)</td><td>([0-9,]*)</td></tr>',
    re.I | re.S,
)

def fetch(url):
    req = Request(url, headers={"User-Agent": UA, "Accept": "text/html,application/xhtml+xml"})
    with urlopen(req, timeout=30) as r:
        body = r.read().decode("utf-8", "replace")
    if "open.spotify.com" not in body:
        raise RuntimeError("Kworb returned a verification/temporary-block page instead of the stats table.")
    return body

def parse(html, kind):
    m = re.search(r"Last updated:\s*(\d{4}/\d{2}/\d{2})", html, re.I)
    if not m:
        raise RuntimeError("Could not find Kworb update date.")
    items = []
    for row in ROW_RE.finditer(html):
        prefix, spotify, raw_name, streams, daily = row.groups()
        name = unescape(re.sub(r"<[^>]+>", "", raw_name)).strip()
        items.append({
            "name": name,
            "spotify": spotify,
            "streams": int(streams.replace(",", "")),
            "daily": int(daily.replace(",", "")) if daily else None,
            "feature": "*" in prefix,
            "kind": kind,
        })
    if not items:
        raise RuntimeError(f"No {kind} rows found.")
    return m.group(1), items

def rebuild_history_js():
    snapshots = []
    for f in sorted(HISTORY.glob("*.json")):
        try:
            snapshots.append(json.loads(f.read_text(encoding="utf-8")))
        except Exception:
            pass
    (DATA/"history.js").write_text(
        "window.KWORB_HISTORY=" + json.dumps(snapshots, separators=(",",":"), ensure_ascii=False) + ";\n",
        encoding="utf-8"
    )

def main():
    checked = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    try:
        song_date, songs = parse(fetch(SONGS_URL), "song")
        songs = [x for x in songs if not x["spotify"].endswith("6QytYtRN1xFId83ALPtsW8")]

        # KIDS SEE GHOSTS has a separate artist page. A KSG-only block won't stop the main update.
        try:
            _, ksg = parse(fetch(KSG_URL), "song")
            known = {x["spotify"] for x in songs}
            for x in ksg:
                x["_ksg"] = True
                if x["spotify"] not in known:
                    songs.append(x)
        except Exception as e:
            print("KSG update skipped:", e)

        album_date, albums = parse(fetch(ALBUMS_URL), "album")
        if song_date != album_date:
            raise RuntimeError("Kworb song/album update dates do not match.")
        if len(songs) < 400 or len(albums) < 20:
            raise RuntimeError(f"Kworb returned an incomplete catalog ({len(songs)} songs, {len(albums)} albums).")

        db = {
            "updated": song_date,
            "songs": songs,
            "albums": albums,
            "source": {"songs": SONGS_URL, "albums": ALBUMS_URL, "kidSeeGhostsSongs": KSG_URL},
        }
        compact = json.dumps(db, separators=(",",":"), ensure_ascii=False)
        status = {"ok": True, "message": f"Auto-updated from Kworb · {checked}", "checked": checked}
        (DATA/"current.js").write_text(
            "window.KWORB_DB=" + compact + ";\nwindow.KWORB_STATUS=" +
            json.dumps(status, separators=(",",":"), ensure_ascii=False) + ";\n",
            encoding="utf-8"
        )
        hist_file = HISTORY / (song_date.replace("/","-") + ".json")
        hist_file.write_text(json.dumps(db, ensure_ascii=False, indent=2), encoding="utf-8")
        rebuild_history_js()
        (DATA/"last-update.txt").write_text(
            f"SUCCESS {checked} | Kworb {song_date} | {len(songs)} songs | {len(albums)} albums\n",
            encoding="utf-8"
        )
        print((DATA/"last-update.txt").read_text(encoding="utf-8").strip())
        return 0
    except Exception as e:
        # Keep the last good snapshot live instead of corrupting/replacing it.
        msg = f"FAILED {checked} | {e}\n"
        (DATA/"last-update.txt").write_text(msg, encoding="utf-8")
        print(msg.strip(), file=sys.stderr)
        return 0

if __name__ == "__main__":
    raise SystemExit(main())
