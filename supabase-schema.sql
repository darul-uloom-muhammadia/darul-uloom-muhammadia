-- Darul Uloom Muhammadia Karachi — current production schema reference
create table if not exists public.student_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  father_name text not null,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admissions (
  id uuid primary key default gen_random_uuid(),
  application_no text not null unique default ('DUMK-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  student_id uuid not null references auth.users(id) on delete cascade,
  student_name text not null,
  father_name text not null,
  date_of_birth date,
  course text not null check (course in ('Madrasa','Hifz-ul-Qur''an','Nazra Qur''an','School')),
  phone text not null,
  address text,
  message text,
  status text not null default 'New' check (status in ('New','Contacted','Pending','Approved','Rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.student_profiles enable row level security;
alter table public.admissions enable row level security;
alter table public.admin_users enable row level security;

-- Student access
create policy "students can view own profile" on public.student_profiles for select to authenticated using (id = auth.uid());
create policy "students can insert own profile" on public.student_profiles for insert to authenticated with check (id = auth.uid());
create policy "students can update own profile" on public.student_profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "students can view own admissions" on public.admissions for select to authenticated using (student_id = auth.uid());
create policy "students can create own admissions" on public.admissions for insert to authenticated with check (student_id = auth.uid());

-- Admin access
create policy "admins can view own admin record" on public.admin_users for select to authenticated using (user_id = auth.uid());
create policy "admins can view all admissions" on public.admissions for select to authenticated using (student_id = auth.uid() or exists (select 1 from public.admin_users au where au.user_id = auth.uid()));
create policy "admins can update all admissions" on public.admissions for update to authenticated using (exists (select 1 from public.admin_users au where au.user_id = auth.uid())) with check (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));
create policy "admins can view all student profiles" on public.student_profiles for select to authenticated using (id = auth.uid() or exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

-- Never put a Supabase service-role key in browser code.
