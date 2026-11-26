-- Ye Snake: per-settings leaderboard categories (already applied via migration "snake_category_leaderboards").
-- Category key format: s{size}-v{speed}-f{foods}-b{bonus%}-w{wrap 0/1}. Default settings stay in arcade_saves ('snake').
create table if not exists public.snake_scores(
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  score integer not null check(score>=0),
  updated_at timestamptz not null default now(),
  primary key(user_id,category)
);
alter table public.snake_scores enable row level security;
-- functions: snake_submit(size,speed,foods,bonus_pct,wrap,score) [authenticated], snake_categories(), snake_leaderboard(category)
