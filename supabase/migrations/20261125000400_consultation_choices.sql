alter table public.consultations
  add column subjects text[],
  add column campuses text[];

update public.consultations
set subjects = array_remove(array[subject], null),
    campuses = array_remove(array[campus], null);

alter table public.consultations
  alter column subjects set not null,
  alter column campuses set not null,
  drop constraint consultations_subject_check,
  drop constraint consultations_campus_check,
  add check (subject is not distinct from nullif(array_to_string(subjects, ', '), '')),
  add check (campus is not distinct from nullif(array_to_string(campuses, ', '), ''));

create function private.set_consultation_choices()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  choices text[];
begin
  if tg_op = 'INSERT' then
    new.subjects := coalesce(new.subjects, array_remove(array[new.subject], null));
    new.campuses := coalesce(new.campuses, array_remove(array[new.campus], null));
  end if;

  for choices in values (new.subjects), (new.campuses) loop
    if coalesce(cardinality(choices), 0) = 0 then
      raise not_null_violation using message = 'Choose at least one subject and one campus.';
    end if;

    if array_ndims(choices) <> 1 or exists (
      select from unnest(choices) as choice(label)
      group by btrim(label)
      having count(*) > 1 or bool_or(label is null or char_length(label) > 160 or label !~ '[^[:space:]]')
    ) then
      raise check_violation using message = 'Each choice must be distinct and between 1 and 160 characters.';
    end if;
  end loop;

  new.subject := array_to_string(new.subjects, ', ');
  new.campus := array_to_string(new.campuses, ', ');
  return new;
end;
$$;

create trigger consultations_assign_choices
before insert or update of subjects, campuses on public.consultations
for each row execute function private.set_consultation_choices();

grant insert (subjects, campuses) on public.consultations to authenticated;
