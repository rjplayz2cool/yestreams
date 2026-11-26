# YE Stream Tracker v2.0 — Accounts / YZYMNY / Market

The site is built, but the shared account/market features need a Supabase project because GitHub Pages cannot securely host a database by itself.

## 1. Create Supabase
Create a free project at https://supabase.com and open its SQL Editor.

## 2. Create the database
Paste and run `supabase/schema.sql`.

## 3. Make YOUR account the admin
Create your account from the website first. Then in Supabase SQL Editor run:

```sql
update public.profiles set role='admin' where username='YOUR_USERNAME';
```

Only a database admin should run that SQL. Never put an admin/service-role key in the website.

## 4. Seed the song catalog
On your PC, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as environment variables and run:

`python supabase/seed_catalog.py`

The service-role key is secret. Do not upload it to GitHub and do not paste it into `supabase-config.js`.

## 5. Connect the website
In Supabase Project Settings / API, copy the Project URL and the anon/publishable key. Put ONLY those two public values in `supabase-config.js`.

## 6. Upload to GitHub
Upload the changed `index.html`, `supabase-config.js`, and `covers/yzymny.png`. The `supabase/` folder is setup/admin tooling and can be kept in the repo, but it contains no secret keys.

## What v2.0 adds
- Accounts
- Per-account YZYMNY balance (new accounts start with 1,000)
- NOS bottle YZYMNY icon/balance in Daily Roll
- Server-side once-per-day rolls
- Normal rarity weights: 75/60/50/40/25/10/5, normalized across normal pulls
- Unreleased: exactly 1%
- EBK: exactly 0.01%
- Server-side collection
- Player market using YZYMNY
- Admin-only grant-song and balance-adjustment RPCs
- Admin tab appears only for profiles whose database role is `admin`

The browser never receives the service-role key or unrestricted admin authority.
