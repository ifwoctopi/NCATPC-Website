-- Run this in Supabase SQL editor.
-- Goal:
-- 1) Public can read leaderboard rows.
-- 2) Only authenticated admin users can insert/update/delete leaderboard rows.
-- 3) Private bucket is used for avatars under pfp/.
-- 4) Only authenticated admin users can insert/update/delete storage objects in that folder.

-- Admin helper based on JWT app_metadata role.
-- Mark admin users by setting: auth.users.raw_app_meta_data -> { "role": "admin" }
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- Example: promote a user to admin role (replace with a real email)
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
-- where email = 'admin@ncat.edu';

-- Example: remove admin role
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) - 'role'
-- where email = 'admin@ncat.edu';

-- =========================
-- Leaderboard table policies
-- =========================
alter table public.leaderboard enable row level security;

-- Public read
DROP POLICY IF EXISTS "leaderboard_read_public" ON public.leaderboard;
create policy "leaderboard_read_public"
on public.leaderboard
for select
to anon, authenticated
using (true);

-- Admin write: insert
DROP POLICY IF EXISTS "leaderboard_insert_admin" ON public.leaderboard;
create policy "leaderboard_insert_admin"
on public.leaderboard
for insert
to authenticated
with check (public.is_admin());

-- Admin write: update
DROP POLICY IF EXISTS "leaderboard_update_admin" ON public.leaderboard;
create policy "leaderboard_update_admin"
on public.leaderboard
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Admin write: delete
DROP POLICY IF EXISTS "leaderboard_delete_admin" ON public.leaderboard;
create policy "leaderboard_delete_admin"
on public.leaderboard
for delete
to authenticated
using (public.is_admin());

-- =========================
-- Storage bucket + policies
-- =========================
insert into storage.buckets (id, name, public)
values ('private', 'private', false)
on conflict (id) do update set public = excluded.public;

-- Hardening: ensure anon/authenticated roles cannot alter bucket definitions.
revoke all on table storage.buckets from anon, authenticated;

-- Allow signed-url generation for leaderboard avatars.
DROP POLICY IF EXISTS "pfp_select_public_signed" ON storage.objects;
create policy "pfp_select_public_signed"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'private'
  and name like 'pfp/%'
);

-- Only authenticated admin users can upload avatar objects.
DROP POLICY IF EXISTS "pfp_insert_admin" ON storage.objects;
create policy "pfp_insert_admin"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'private'
  and name like 'pfp/%'
  and public.is_admin()
);

-- Only authenticated admin users can update avatar objects.
DROP POLICY IF EXISTS "pfp_update_admin" ON storage.objects;
create policy "pfp_update_admin"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'private'
  and name like 'pfp/%'
  and public.is_admin()
)
with check (
  bucket_id = 'private'
  and name like 'pfp/%'
  and public.is_admin()
);

-- Only authenticated admin users can delete avatar objects.
DROP POLICY IF EXISTS "pfp_delete_admin" ON storage.objects;
create policy "pfp_delete_admin"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'private'
  and name like 'pfp/%'
  and public.is_admin()
);

-- Optional: if you decide later to restrict leaderboard reads to only authenticated users,
-- replace the read policy above with:
-- create policy "leaderboard_read_auth"
-- on public.leaderboard
-- for select
-- to authenticated
-- using (true);
