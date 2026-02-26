-- Enable UUID extension
create extension if not exists "uuid-ossp";
-- 1. Users Table
create table if not exists public.users (
    id uuid references auth.users on delete cascade not null primary key,
    name text,
    role text check (role in ('vendor', 'admin')) default 'vendor',
    company_name text,
    phone text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- 2. Camera Types Table
create table if not exists public.camera_types (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    type text not null,
    -- 'Indoor', 'Outdoor', 'PTZ'
    resolution text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- 3. Projects Table
create table if not exists public.projects (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users not null,
    client_name text not null,
    category text not null,
    -- 'Warehouse', 'Factory', 'Residential', 'Shop'
    full_address text not null,
    google_maps_link text,
    status text default 'draft' check (
        status in ('draft', 'submitted', 'approved', 'rejected')
    ),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- 4. Surveys Table (Detailed details for the project)
create table if not exists public.surveys (
    id uuid default uuid_generate_v4() primary key,
    project_id uuid references public.projects on delete cascade not null,
    total_area numeric,
    ceiling_height numeric,
    racking_height numeric,
    loading_dock text,
    high_temp text,
    dust_risk text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- 5. Cameras Table
create table if not exists public.cameras (
    id uuid default uuid_generate_v4() primary key,
    project_id uuid references public.projects on delete cascade not null,
    camera_type_id uuid references public.camera_types on delete
    set null,
        description text not null,
        mount_height numeric,
        cable_length numeric,
        photo_url text,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- 6. Materials Table
create table if not exists public.materials (
    id uuid default uuid_generate_v4() primary key,
    project_id uuid references public.projects on delete cascade not null,
    item_name text not null,
    quantity numeric not null,
    unit_cost numeric not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- 7. Labor Costs Table
create table if not exists public.labor_costs (
    id uuid default uuid_generate_v4() primary key,
    project_id uuid references public.projects on delete cascade not null,
    workers numeric not null,
    worker_rate numeric not null,
    days numeric not null,
    total_cost numeric not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Insert Dummy Data for Camera Types if it's empty
insert into public.camera_types (name, type, resolution)
values ('Hikvision Indoor Dome 2MP', 'Indoor', '2MP'),
    ('Hikvision Outdoor Bullet 4MP', 'Outdoor', '4MP'),
    ('Dahua PTZ 8MP', 'PTZ', '8MP') on conflict do nothing;
-- RLS Policies
alter table public.users enable row level security;
alter table public.camera_types enable row level security;
alter table public.projects enable row level security;
alter table public.surveys enable row level security;
alter table public.cameras enable row level security;
alter table public.materials enable row level security;
alter table public.labor_costs enable row level security;
-- Drop existing policies if any to avoid errors on reapplying
drop policy if exists "Enable completely public access" on public.users;
drop policy if exists "Enable completely public access" on public.camera_types;
drop policy if exists "Enable completely public access" on public.projects;
drop policy if exists "Enable completely public access" on public.surveys;
drop policy if exists "Enable completely public access" on public.cameras;
drop policy if exists "Enable completely public access" on public.materials;
drop policy if exists "Enable completely public access" on public.labor_costs;
drop policy if exists "Allow all access to authenticated users" on public.users;
drop policy if exists "Allow all access to authenticated users" on public.camera_types;
drop policy if exists "Allow all access to authenticated users" on public.projects;
drop policy if exists "Allow all access to authenticated users" on public.surveys;
drop policy if exists "Allow all access to authenticated users" on public.cameras;
drop policy if exists "Allow all access to authenticated users" on public.materials;
drop policy if exists "Allow all access to authenticated users" on public.labor_costs;
drop policy if exists "Users can read all users" on public.users;
drop policy if exists "Users can update own profile" on public.users;
drop policy if exists "Admins can update users" on public.users;
-- Users: can read all, update own
create policy "Users can read all users" on public.users for
select using (auth.role() = 'authenticated');
create policy "Users can update own profile" on public.users for
update using (auth.uid() = id);
create policy "Admins can update users" on public.users for
update using (
        exists (
            select 1
            from public.users
            where id = auth.uid()
                and role = 'admin'
        )
    );
drop policy if exists "Anyone can read camera_types" on public.camera_types;
drop policy if exists "Admins can insert camera_types" on public.camera_types;
drop policy if exists "Admins can update camera_types" on public.camera_types;
drop policy if exists "Admins can delete camera_types" on public.camera_types;
-- Camera Types: anyone can read, only admin can insert/update/delete 
create policy "Anyone can read camera_types" on public.camera_types for
select using (auth.role() = 'authenticated');
create policy "Admins can insert camera_types" on public.camera_types for
insert with check (
        exists (
            select 1
            from public.users
            where id = auth.uid()
                and role = 'admin'
        )
    );
create policy "Admins can update camera_types" on public.camera_types for
update using (
        exists (
            select 1
            from public.users
            where id = auth.uid()
                and role = 'admin'
        )
    );
create policy "Admins can delete camera_types" on public.camera_types for delete using (
    exists (
        select 1
        from public.users
        where id = auth.uid()
            and role = 'admin'
    )
);
drop policy if exists "Users can read own projects" on public.projects;
drop policy if exists "Users can insert own projects" on public.projects;
drop policy if exists "Users can update own projects" on public.projects;
drop policy if exists "Users can delete own projects" on public.projects;
-- Projects: user can read/insert/update/delete their own
create policy "Users can read own projects" on public.projects for
select using (
        auth.uid() = user_id
        or exists (
            select 1
            from public.users
            where id = auth.uid()
                and role = 'admin'
        )
    );
create policy "Users can insert own projects" on public.projects for
insert with check (auth.uid() = user_id);
create policy "Users can update own projects" on public.projects for
update using (
        auth.uid() = user_id
        or exists (
            select 1
            from public.users
            where id = auth.uid()
                and role = 'admin'
        )
    );
create policy "Users can delete own projects" on public.projects for delete using (
    auth.uid() = user_id
    or exists (
        select 1
        from public.users
        where id = auth.uid()
            and role = 'admin'
    )
);
drop policy if exists "Users can access surveys" on public.surveys;
drop policy if exists "Users can access cameras" on public.cameras;
drop policy if exists "Users can access materials" on public.materials;
drop policy if exists "Users can access labor_costs" on public.labor_costs;
-- Sub-tables: cascade access based on project ownership
create policy "Users can access surveys" on public.surveys for all using (
    exists (
        select 1
        from public.projects
        where id = public.surveys.project_id
            and (
                user_id = auth.uid()
                or exists (
                    select 1
                    from public.users
                    where id = auth.uid()
                        and role = 'admin'
                )
            )
    )
);
create policy "Users can access cameras" on public.cameras for all using (
    exists (
        select 1
        from public.projects
        where id = public.cameras.project_id
            and (
                user_id = auth.uid()
                or exists (
                    select 1
                    from public.users
                    where id = auth.uid()
                        and role = 'admin'
                )
            )
    )
);
create policy "Users can access materials" on public.materials for all using (
    exists (
        select 1
        from public.projects
        where id = public.materials.project_id
            and (
                user_id = auth.uid()
                or exists (
                    select 1
                    from public.users
                    where id = auth.uid()
                        and role = 'admin'
                )
            )
    )
);
create policy "Users can access labor_costs" on public.labor_costs for all using (
    exists (
        select 1
        from public.projects
        where id = public.labor_costs.project_id
            and (
                user_id = auth.uid()
                or exists (
                    select 1
                    from public.users
                    where id = auth.uid()
                        and role = 'admin'
                )
            )
    )
);
-- Trigger to create a user in public.users when they sign up via Supabase Auth
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
        coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
        case
            when is_first_user then 'admin'
            else 'vendor'
        end
    );
return new;
end;
$$ language plpgsql security definer
set search_path = public;
-- Drop trigger if exists
drop trigger if exists on_auth_user_created on auth.users;
-- Create the trigger so next time you signup, it makes you an Admin
create trigger on_auth_user_created
after
insert on auth.users for each row execute procedure public.handle_new_user();