# YE Stream Tracker — Website Final v1

This is the deployable website version of the finished tracker.

## Publish it free with GitHub Pages

1. Create a new GitHub repository (for example `ye-stream-tracker`).
2. Upload **everything inside this folder** to the repository's `main` branch. Keep `.github`, `covers`, `data`, `index.html`, and `update_kworb.py` at the repository root.
3. On GitHub, open **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **GitHub Actions**.
5. Open the repository's **Actions** tab. The workflow named **Update streams and deploy website** will deploy the site.
6. When it finishes, GitHub Pages will show the public URL. For a repository named `ye-stream-tracker`, it will normally look like:
   `https://YOUR-USERNAME.github.io/ye-stream-tracker/`

## Automatic stream updates

`.github/workflows/deploy.yml` runs every 6 hours and can also be run manually from the Actions tab.

The updater:
- fetches Ye songs/albums from Kworb;
- merges KIDS SEE GHOSTS tracks from its Kworb artist page;
- preserves the tracker’s exact-ID UI/cover/credit corrections;
- stores dated snapshots in `data/history/`;
- rebuilds `data/history.js`, so charts keep growing online;
- keeps the last good snapshot if Kworb serves a verification/block page.

GitHub's scheduled Actions are not guaranteed to start at the exact minute shown in the cron schedule.

## Custom domain later

A custom domain is optional. The site works on the free `github.io` address. If you buy a domain later, connect it under **Settings → Pages → Custom domain**.

## Local preview

You can still open `index.html` locally. The website itself has no Windows BAT/PowerShell dependency.
