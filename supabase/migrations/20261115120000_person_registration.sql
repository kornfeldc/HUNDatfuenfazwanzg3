-- Online course registration ("Kursanmeldung") from the public homepage.
-- Adds the fields of the paper form to person and a function the homepage calls without login.
begin;

alter table public.person add column if not exists "birthDate" date;
alter table public.person add column if not exists street varchar;
alter table public.person add column if not exists "postalCode" varchar;
alter table public.person add column if not exists city varchar;
alter table public.person add column if not exists "dogBreed" varchar;
alter table public.person add column if not exists "dogSex" varchar;
alter table public.person add column if not exists "dogBirthDate" date;
alter table public.person add column if not exists "dogChipNumber" varchar;
alter table public.person add column if not exists "dogInsuranceNumber" varchar;
alter table public.person add column if not exists "photoConsent" boolean not null default false;
alter table public.person add column if not exists "referralSource" varchar;
alter table public.person add column if not exists "registeredAt" timestamptz;

alter table public.person drop constraint if exists person_dog_sex_check;
alter table public.person add constraint person_dog_sex_check check ("dogSex" in ('male', 'female'));

-- Creates a person from the homepage form. SECURITY DEFINER, so role anon needs no policy on person;
-- the function is the only way in and checks every field itself. The accepted terms include the
-- consent to publish photos and videos, so photoConsent is always set.
create or replace function public.register_person(
    p_og integer,
    p_first_name text,
    p_last_name text,
    p_birth_date date,
    p_street text,
    p_postal_code text,
    p_city text,
    p_phone text,
    p_email text,
    p_dog_name text,
    p_dog_breed text,
    p_dog_sex text,
    p_dog_birth_date date,
    p_dog_chip_number text,
    p_dog_insurance_number text,
    p_mailing_list boolean,
    p_referral_source text,
    p_accept_terms boolean
) returns void
language plpgsql security definer set search_path = '' as $$
declare
    v_id integer;
    v_text text;
begin
    if not exists (select 1 from public.users u where u.og = p_og) then
        raise exception 'Unknown Ortsgruppe' using errcode = '22023';
    end if;
    if p_accept_terms is not true then
        raise exception 'Terms not accepted' using errcode = '22023';
    end if;

    p_first_name := nullif(btrim(p_first_name), '');
    p_last_name := nullif(btrim(p_last_name), '');
    p_street := nullif(btrim(p_street), '');
    p_postal_code := nullif(btrim(p_postal_code), '');
    p_city := nullif(btrim(p_city), '');
    p_phone := nullif(btrim(p_phone), '');
    p_email := nullif(lower(btrim(p_email)), '');
    p_dog_name := nullif(btrim(p_dog_name), '');
    p_dog_sex := nullif(btrim(p_dog_sex), '');
    p_dog_chip_number := nullif(btrim(p_dog_chip_number), '');
    p_dog_insurance_number := nullif(btrim(p_dog_insurance_number), '');
    if p_first_name is null or p_last_name is null or p_street is null or p_postal_code is null or p_city is null
        or p_phone is null or p_email is null or p_dog_name is null
        or p_dog_chip_number is null or p_dog_insurance_number is null then
        raise exception 'Required field missing' using errcode = '22023';
    end if;
    if p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
        raise exception 'Invalid email' using errcode = '22023';
    end if;
    if p_dog_sex is not null and p_dog_sex not in ('male', 'female') then
        raise exception 'Invalid dog sex' using errcode = '22023';
    end if;
    if p_birth_date not between date '1900-01-01' and current_date
        or p_dog_birth_date not between date '1990-01-01' and current_date then
        raise exception 'Invalid date' using errcode = '22023';
    end if;
    foreach v_text in array array[p_first_name, p_last_name, p_street, p_postal_code, p_city, p_phone, p_email,
        p_dog_name, p_dog_breed, p_dog_chip_number, p_dog_insurance_number, p_referral_source] loop
        if length(v_text) > 200 then
            raise exception 'Field too long' using errcode = '22023';
        end if;
    end loop;

    -- The form is public: cap the registrations per hour so a script cannot flood the person list.
    if (select count(*) from public.person p
        where p.og = p_og and p."registeredAt" > now() - interval '1 hour') >= 20 then
        raise exception 'Too many registrations' using errcode = '54000';
    end if;

    insert into public.person (
        og, "firstName", "lastName", "birthDate", street, "postalCode", city, phone, email,
        "dogNames", "dogBreed", "dogSex", "dogBirthDate", "dogChipNumber", "dogInsuranceNumber",
        "isOnMailingList", "photoConsent", "referralSource", "registeredAt",
        "isMember", "isActive", "personGroup", credit, "saleCount", "saleSum"
    ) values (
        p_og, p_first_name, p_last_name, p_birth_date, p_street, p_postal_code, p_city, p_phone, p_email,
        p_dog_name, nullif(btrim(p_dog_breed), ''), p_dog_sex, p_dog_birth_date,
        p_dog_chip_number, p_dog_insurance_number,
        coalesce(p_mailing_list, false), true, nullif(btrim(p_referral_source), ''), now(),
        false, true, '', 0, 0, 0
    ) returning id into v_id;

    insert into public.history ("userEmail", action, "entityType", "entityId", details, og)
    values (p_email, 'register', 'person', v_id::text, p_first_name || ' ' || p_last_name, p_og);
end;
$$;

revoke execute on function public.register_person(integer, text, text, date, text, text, text, text, text, text, text,
    text, date, text, text, boolean, text, boolean) from public;
grant execute on function public.register_person(integer, text, text, date, text, text, text, text, text, text, text,
    text, date, text, text, boolean, text, boolean) to anon, authenticated;

commit;
