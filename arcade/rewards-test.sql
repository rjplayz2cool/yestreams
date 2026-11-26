begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles order by created_at limit 1),true);
do $$
declare r jsonb; before_balance bigint; other uuid; sid uuid; gid text;
begin
 select yzymny into before_balance from public.profiles where id=auth.uid();
 foreach gid in array array['snake','runner','pacman'] loop
  sid:=gen_random_uuid();perform public.arcade_reward_begin(sid,gid);
  update arcade_private.reward_runs set started_at=clock_timestamp()-interval '5 minutes' where id=sid;
  if gid='snake' then
   r:=public.arcade_reward_claim(sid,3,0,false,false);if (r->>'awarded')::int<>3 then raise exception 'Snake character payout';end if;
   r:=public.arcade_reward_claim(sid,321,0,true,true);if (r->>'paid')::int<>421 or (r->>'awarded')::int<>418 then raise exception 'Snake completion payout';end if;
  elsif gid='runner' then
   r:=public.arcade_reward_claim(sid,99,4,false,false);if (r->>'paid')::int<>12 then raise exception 'Bottle payout';end if;
   r:=public.arcade_reward_claim(sid,100,4,false,false);if (r->>'paid')::int<>62 then raise exception 'Runner 100 milestone';end if;
   r:=public.arcade_reward_claim(sid,300,8,false,true);if (r->>'paid')::int<>174 then raise exception 'Runner crossed milestones';end if;
  else
   r:=public.arcade_reward_claim(sid,999,0,false,false);if (r->>'paid')::int<>0 then raise exception 'Early Pac-Man reward';end if;
   r:=public.arcade_reward_claim(sid,3500,0,false,true);if (r->>'paid')::int<>150 then raise exception 'Pac-Man milestones';end if;
  end if;
  r:=public.arcade_reward_claim(sid,0,0,false,true);if (r->>'awarded')::int<>0 then raise exception 'Duplicate reward';end if;
 end loop;
 if (select yzymny from public.profiles where id=auth.uid())<>before_balance+421+174+150 then raise exception 'Wallet totals';end if;
 begin perform public.arcade_reward_begin(gen_random_uuid(),'clicker');raise exception 'Clicker was accepted';exception when raise_exception then if sqlerrm='Clicker was accepted' then raise;end if;end;
 sid:=gen_random_uuid();perform public.arcade_reward_begin(sid,'snake');
 begin perform public.arcade_reward_claim(sid,100,0,false,false);raise exception 'Impossible score accepted';exception when raise_exception then if sqlerrm='Impossible score accepted' then raise;end if;end;
 begin perform public.arcade_reward_claim(sid,1,0,true,false);raise exception 'False board completion accepted';exception when raise_exception then if sqlerrm='False board completion accepted' then raise;end if;end;
 select id into other from public.profiles where id<>auth.uid() limit 1;
 perform set_config('request.jwt.claim.sub',other::text,true);
 begin perform public.arcade_reward_claim(sid,1,0,false,false);raise exception 'Cross account reward accepted';exception when raise_exception then if sqlerrm='Cross account reward accepted' then raise;end if;end;
 perform set_config('request.jwt.claim.sub','',true);
 begin perform public.arcade_reward_begin(gen_random_uuid(),'snake');raise exception 'Guest reward accepted';exception when raise_exception then if sqlerrm='Guest reward accepted' then raise;end if;end;
 if has_function_privilege('anon','public.arcade_reward_begin(uuid,text)','execute') then raise exception 'Anonymous execute grant';end if;
 if has_table_privilege('authenticated','arcade_private.reward_runs','insert,update,delete') then raise exception 'Direct reward write grant';end if;
end $$;
select 'PASS: reward rates, multiple milestones, replay protection, wallet credits, account isolation, guest and Clicker rejection' as result;
rollback;
