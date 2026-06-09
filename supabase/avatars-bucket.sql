-- Run in Supabase Dashboard → SQL Editor (one-time setup for profile photos)
-- Uploads use SUPABASE_SERVICE_ROLE_KEY on the server (service role bypasses RLS).

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

drop policy if exists "Public avatar access" on storage.objects;
create policy "Public avatar access"
on storage.objects for select
to public
using (bucket_id = 'avatars');
