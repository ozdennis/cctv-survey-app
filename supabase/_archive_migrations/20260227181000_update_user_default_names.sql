-- Update trigger function to use email prefix as default name instead of 'New User'
create or replace function public.handle_new_user() returns trigger as $$
declare is_first_user boolean;
begin
select not exists(
        select 1
        from public.users
    ) into is_first_user;
insert into public.users (id, name, role)
values (
        new.id,
        coalesce(
            new.raw_user_meta_data->>'full_name',
            split_part(new.email, '@', 1)
        ),
        case
            when is_first_user then 'admin'
            else 'vendor'
        end
    );
return new;
end;
$$ language plpgsql security definer
set search_path = public;
-- Update existing users named 'New User' to use their email prefix
update public.users u
set name = split_part(au.email, '@', 1)
from auth.users au
where u.id = au.id
    and u.name = 'New User';