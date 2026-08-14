-- Darul Uloom Muhammadia Karachi
-- Run in Supabase SQL Editor after reviewing.
create table if not exists public.student_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 student_name text not null,
 father_name text not null,
 phone text,
 created_at timestamptz not null default now()
);
create table if not exists public.admission_applications (
 id uuid primary key default gen_random_uuid(),
 student_user_id uuid not null references auth.users(id) on delete cascade,
 application_no text not null unique,
 student_name text not null,
 father_name text not null,
 date_of_birth date,
 course text not null,
 phone text,
 address text,
 message text,
 status text not null default 'New' check (status in ('New','Contacted','Pending','Approved','Rejected')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.student_profiles enable row level security;
alter table public.admission_applications enable row level security;
create policy "students read own profile" on public.student_profiles for select using (auth.uid() = id);
create policy "students insert own profile" on public.student_profiles for insert with check (auth.uid() = id);
create policy "students update own profile" on public.student_profiles for update using (auth.uid() = id);
create policy "students read own applications" on public.admission_applications for select using (auth.uid() = student_user_id);
create policy "students create own applications" on public.admission_applications for insert with check (auth.uid() = student_user_id);
-- Admin operations should be implemented with a server-side authenticated admin role, never a service key in the browser.
