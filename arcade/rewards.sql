create schema if not exists arcade_private;
revoke all on schema arcade_private from public,anon;
grant usage on schema arcade_private to authenticated;
create table if not exists arcade_private.reward_runs (
 id uuid primary key,
 user_id uuid not null references public.profiles(id) on delete cascade,
 game text not null check(game in ('snake','runner','pacman')),
 started_at timestamptz not null default clock_timestamp(),
 updated_at timestamptz not null default clock_timestamp(),
 score integer not null default 0 check(score>=0),
 bottles integer not null default 0 check(bottles>=0),
 completed boolean not null default false,
 paid bigint not null default 0 check(paid>=0),
 closed boolean not null default false
);
alter table arcade_private.reward_runs enable row level security;
revoke all on arcade_private.reward_runs from public,anon,authenticated;
create index if not exists reward_runs_owner_game on arcade_private.reward_runs(user_id,game,started_at desc);
create unique index if not exists reward_runs_active on arcade_private.reward_runs(user_id,game) where not closed;

create or replace function arcade_private.begin_reward(p_run uuid,p_game text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); r arcade_private.reward_runs;
begin
 if u is null then raise exception 'Sign in to earn YZYMNY'; end if;
 if p_game is null or p_game not in ('snake','runner','pacman') or p_run is null then raise exception 'Invalid reward game'; end if;
 perform pg_advisory_xact_lock(hashtextextended(u::text||':rewards:'||p_game,0));
 select * into r from arcade_private.reward_runs where id=p_run;
 if found then
  if r.user_id<>u or r.game<>p_game then raise exception 'Invalid reward session'; end if;
  return jsonb_build_object('run',r.id,'closed',r.closed);
 end if;
 if (select count(*) from arcade_private.reward_runs where user_id=u and game=p_game and started_at>clock_timestamp()-interval '1 minute')>=30 then raise exception 'Please wait before starting another reward run'; end if;
 update arcade_private.reward_runs set closed=true where user_id=u and game=p_game and not closed;
 insert into arcade_private.reward_runs(id,user_id,game) values(p_run,u,p_game);
 return jsonb_build_object('run',p_run,'closed',false);
end $$;

create or replace function arcade_private.claim_reward(p_run uuid,p_score integer,p_bottles integer,p_completed boolean,p_end boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); r arcade_private.reward_runs; earned bigint; delta bigint; balance bigint; seconds double precision;
begin
 if u is null then raise exception 'Sign in to earn YZYMNY'; end if;
 if p_score is null or p_bottles is null or p_completed is null or p_end is null or p_score<0 or p_bottles<0 then raise exception 'Invalid reward progress'; end if;
 select * into r from arcade_private.reward_runs where id=p_run and user_id=u for update;
 if not found then raise exception 'Reward session not found'; end if;
 if r.closed then return jsonb_build_object('awarded',0,'paid',r.paid,'closed',true); end if;
 seconds:=extract(epoch from clock_timestamp()-r.started_at);
 if seconds>14400 then raise exception 'Reward session expired'; end if;
 -- Conservative physical limits reject impossible client counter jumps.
 if r.game='snake' then
  if p_score>321 or p_bottles<>0 or p_score>floor(seconds/0.07)+1 or (p_completed and p_score<>321) then raise exception 'Invalid Snake progress'; end if;
 elsif r.game='runner' then
  if p_score>floor(seconds*63)+10 or p_bottles>floor(seconds*3)+2 or p_bottles>p_score/3+2 or p_completed then raise exception 'Invalid Jumper progress'; end if;
 else
  if p_score>floor(seconds*12000)+200 or p_bottles<>0 or p_completed then raise exception 'Invalid Pac-Man progress'; end if;
 end if;
 -- Older requests can never reduce progress or replay earlier payouts.
 p_score:=greatest(r.score,p_score);p_bottles:=greatest(r.bottles,p_bottles);p_completed:=r.completed or p_completed;
 earned:=case r.game when 'snake' then p_score+case when p_completed then 100 else 0 end when 'runner' then p_bottles::bigint*3+(p_score/100)::bigint*50 else (p_score/1000)::bigint*50 end;
 delta:=greatest(0,earned-r.paid);
 if delta>0 then
  update public.profiles set yzymny=yzymny+delta where id=u returning yzymny into balance;
  if not found then raise exception 'Account profile missing'; end if;
 end if;
 update arcade_private.reward_runs set score=p_score,bottles=p_bottles,completed=p_completed,paid=earned,closed=p_end,updated_at=clock_timestamp() where id=p_run;
 return jsonb_build_object('awarded',delta,'paid',earned,'closed',p_end,'balance',balance);
end $$;

revoke all on function arcade_private.begin_reward(uuid,text) from public,anon;
revoke all on function arcade_private.claim_reward(uuid,integer,integer,boolean,boolean) from public,anon;
grant execute on function arcade_private.begin_reward(uuid,text) to authenticated;
grant execute on function arcade_private.claim_reward(uuid,integer,integer,boolean,boolean) to authenticated;
create or replace function public.arcade_reward_begin(p_run uuid,p_game text) returns jsonb language sql security invoker set search_path='' as $$ select arcade_private.begin_reward(p_run,p_game) $$;
create or replace function public.arcade_reward_claim(p_run uuid,p_score integer,p_bottles integer default 0,p_completed boolean default false,p_end boolean default false) returns jsonb language sql security invoker set search_path='' as $$ select arcade_private.claim_reward(p_run,p_score,p_bottles,p_completed,p_end) $$;
revoke all on function public.arcade_reward_begin(uuid,text) from public,anon;
revoke all on function public.arcade_reward_claim(uuid,integer,integer,boolean,boolean) from public,anon;
grant execute on function public.arcade_reward_begin(uuid,text) to authenticated;
grant execute on function public.arcade_reward_claim(uuid,integer,integer,boolean,boolean) to authenticated;
