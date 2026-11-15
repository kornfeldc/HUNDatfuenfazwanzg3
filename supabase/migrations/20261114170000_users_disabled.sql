-- Locks a login without deleting the user, so the user's history entries stay as they are.
-- A restrictive policy on every tenant table denies disabled users all data access,
-- whatever the existing (permissive) policies allow.
begin;

alter table public.users add column if not exists disabled boolean not null default false;

-- True unless the caller's users row is disabled. SECURITY DEFINER so it works
-- regardless of the policies on public.users.
create or replace function public.login_enabled() returns boolean
language sql stable security definer set search_path = '' as $$
    select not exists (
        select 1 from public.users u
        where u.login = auth.jwt() ->> 'email' and u.disabled
    );
$$;

-- Only set_user_disabled (running as the owner) may change the flag.
create or replace function public.users_guard_disabled() returns trigger
language plpgsql set search_path = '' as $$
begin
    if current_user in ('anon', 'authenticated') and (
        (tg_op = 'INSERT' and new.disabled)
        or (tg_op = 'UPDATE' and new.disabled is distinct from old.disabled)
    ) then
        raise exception 'Only an admin can disable users' using errcode = '42501';
    end if;
    return new;
end;
$$;

drop trigger if exists users_guard_disabled on public.users;
create trigger users_guard_disabled before insert or update on public.users
    for each row execute function public.users_guard_disabled();

-- Disabled users still read their own row (the app needs the flag) but cannot change it.
drop policy if exists login_enabled_insert on public.users;
create policy login_enabled_insert on public.users as restrictive for insert to authenticated
    with check ((select public.login_enabled()));
drop policy if exists login_enabled_update on public.users;
create policy login_enabled_update on public.users as restrictive for update to authenticated
    using ((select public.login_enabled())) with check ((select public.login_enabled()));
drop policy if exists login_enabled_delete on public.users;
create policy login_enabled_delete on public.users as restrictive for delete to authenticated
    using ((select public.login_enabled()));

do $$
declare
    t text;
begin
    foreach t in array array[
        'person', 'course_history', 'credit_history', 'article', 'sale', 'sale_article',
        'rob_course', 'rob_course_person', 'news', 'album', 'history',
        'person_article_usage', 'sale_day'
    ] loop
        if to_regclass('public.' || t) is not null then
            execute format('drop policy if exists login_enabled on public.%I', t);
            execute format('create policy login_enabled on public.%I as restrictive for all to authenticated '
                'using ((select public.login_enabled())) with check ((select public.login_enabled()))', t);
        end if;
    end loop;
end;
$$;

create or replace function public.og_users(p_og integer)
returns table (login text, admin boolean, disabled boolean)
language plpgsql stable security definer set search_path = '' as $$
begin
    if not exists (
        select 1 from public.users u
        where u.login = auth.jwt() ->> 'email' and u.og = p_og and u.admin and not u.disabled
    ) then
        raise exception 'User management access denied' using errcode = '42501';
    end if;

    return query
        select u.login::text, coalesce(u.admin, false), u.disabled
        from public.users u
        where u.og = p_og
        order by u.disabled, u.login;
end;
$$;

create or replace function public.set_user_disabled(p_og integer, p_login text, p_disabled boolean)
returns void
language plpgsql security definer set search_path = '' as $$
declare
    v_email text := auth.jwt() ->> 'email';
begin
    if not exists (
        select 1 from public.users u
        where u.login = v_email and u.og = p_og and u.admin and not u.disabled
    ) then
        raise exception 'User management access denied' using errcode = '42501';
    end if;
    if p_disabled is null or p_login = v_email then
        raise exception 'Invalid user change' using errcode = '22023';
    end if;

    update public.users set disabled = p_disabled where login = p_login and og = p_og;
    if not found then
        raise exception 'User not found' using errcode = '22023';
    end if;

    insert into public.history ("userEmail", action, "entityType", "entityId", details, og)
    values (v_email, case when p_disabled then 'disable' else 'enable' end, 'user', p_login, p_login, p_og);
end;
$$;

revoke execute on function public.og_users(integer) from public, anon;
revoke execute on function public.set_user_disabled(integer, text, boolean) from public, anon;
grant execute on function public.og_users(integer) to authenticated;
grant execute on function public.set_user_disabled(integer, text, boolean) to authenticated;
grant execute on function public.login_enabled() to anon, authenticated;

commit;
