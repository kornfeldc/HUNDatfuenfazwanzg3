-- All course writers use the same person-row lock, including the existing individual action.
-- SECURITY INVOKER retains the project's RLS policies; the explicit tenant check is additional.
begin;

create index if not exists course_history_attendance_day_idx
    on public.course_history ("personId", date) where courses < 0;

create or replace function public.adjust_person_courses(
    p_og integer, p_person_id integer, p_amount integer, p_date date
) returns integer
language plpgsql security invoker set search_path = '' as $$
declare
    v_person public.person%rowtype;
    v_history_id integer;
    v_email text := auth.jwt() ->> 'email';
begin
    if auth.uid() is null or not exists (
        select 1 from public.users u where u.login = v_email and u.og = p_og
    ) then
        raise exception 'Course management access denied' using errcode = '42501';
    end if;
    if p_date is null or p_amount is null or p_amount = 0 then
        raise exception 'Invalid course adjustment' using errcode = '22023';
    end if;

    select * into v_person from public.person
    where id = p_person_id and og = p_og for update;
    if not found then
        raise exception 'Person not found' using errcode = '22023';
    end if;

    insert into public.course_history ("personId", courses, date)
    values (p_person_id, p_amount, p_date) returning id into v_history_id;
    update public.person set "courseCount" = coalesce("courseCount", 0) + p_amount
    where id = p_person_id and og = p_og;
    if not found then
        raise exception 'Balance update denied' using errcode = '42501';
    end if;
    insert into public.history ("userEmail", action, "entityType", "entityId", details, og)
    values (v_email, 'add_course', 'person', p_person_id::text,
        format('%s courses for %s %s · %s · Course history ID: %s',
            p_amount, v_person."firstName", v_person."lastName", p_date, v_history_id), p_og);
    return v_history_id;
end;
$$;

create or replace function public.record_course_attendance(
    p_og integer, p_person_ids integer[], p_date date
) returns integer[]
language plpgsql security invoker set search_path = '' as $$
declare
    v_person public.person%rowtype;
    v_ids integer[];
    v_added integer[] := '{}';
begin
    if auth.uid() is null or not exists (
        select 1 from public.users u where u.login = auth.jwt() ->> 'email' and u.og = p_og
    ) then
        raise exception 'Course management access denied' using errcode = '42501';
    end if;
    if p_date is null or p_date > (current_timestamp at time zone 'Europe/Vienna')::date then
        raise exception 'Invalid attendance date' using errcode = '22023';
    end if;
    select array_agg(distinct id order by id) into v_ids from unnest(p_person_ids) id;
    if coalesce(cardinality(v_ids), 0) = 0 or array_position(v_ids, null) is not null then
        raise exception 'Select attendees' using errcode = '22023';
    end if;

    -- Lock in a stable order before checking eligibility or existing attendance.
    perform id from public.person where id = any(v_ids) and og = p_og order by id for update;
    if (select count(*) from public.person where id = any(v_ids) and og = p_og and "isActive" is true)
        <> cardinality(v_ids) then
        raise exception 'Only active persons in your organization can be added' using errcode = '22023';
    end if;

    for v_person in select * from public.person where id = any(v_ids) and og = p_og order by id loop
        -- Retried or overlapping batches are safe: a person already recorded is skipped.
        if not exists (select 1 from public.course_history
            where "personId" = v_person.id and date = p_date and courses < 0) then
            perform public.adjust_person_courses(p_og, v_person.id, -1, p_date);
            v_added := array_append(v_added, v_person.id);
        end if;
    end loop;
    return v_added;
end;
$$;

create or replace function public.undo_course_attendance(
    p_og integer, p_person_id integer, p_history_id integer, p_date date, p_expected_courses integer
) returns void
language plpgsql security invoker set search_path = '' as $$
declare
    v_person public.person%rowtype;
    v_courses integer;
    v_email text := auth.jwt() ->> 'email';
begin
    if auth.uid() is null or not exists (
        select 1 from public.users u where u.login = v_email and u.og = p_og
    ) then
        raise exception 'Course management access denied' using errcode = '42501';
    end if;

    select * into v_person from public.person where id = p_person_id and og = p_og for update;
    if not found then
        raise exception 'Person not found' using errcode = '22023';
    end if;
    select courses into v_courses from public.course_history
    where id = p_history_id and "personId" = p_person_id and date = p_date for update;
    if not found or v_courses >= 0 or p_expected_courses is null or v_courses <> p_expected_courses then
        raise exception 'Attendance changed; reload before undoing' using errcode = '40001';
    end if;

    -- Reduce this exact deduction by one unit. Zero means completely reversed, not a purchase.
    -- The audit log preserves the original quantity and the person/date/entry being corrected.
    update public.course_history set courses = courses + 1 where id = p_history_id;
    if not found then
        raise exception 'Attendance update denied' using errcode = '42501';
    end if;
    update public.person set "courseCount" = coalesce("courseCount", 0) + 1
    where id = p_person_id and og = p_og;
    if not found then
        raise exception 'Balance update denied' using errcode = '42501';
    end if;
    insert into public.history ("userEmail", action, "entityType", "entityId", details, og)
    values (v_email, 'undo_course', 'person', p_person_id::text,
        format('1 course restored for %s %s · Attendance: %s · Course history ID: %s · %s → %s',
            v_person."firstName", v_person."lastName", p_date, p_history_id, v_courses, v_courses + 1), p_og);
end;
$$;

revoke all on function public.adjust_person_courses(integer, integer, integer, date) from public, anon;
revoke all on function public.record_course_attendance(integer, integer[], date) from public, anon;
revoke all on function public.undo_course_attendance(integer, integer, integer, date, integer) from public, anon;
grant execute on function public.adjust_person_courses(integer, integer, integer, date) to authenticated;
grant execute on function public.record_course_attendance(integer, integer[], date) to authenticated;
grant execute on function public.undo_course_attendance(integer, integer, integer, date, integer) to authenticated;

commit;
