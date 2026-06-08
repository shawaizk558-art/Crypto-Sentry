-- Run in Supabase Dashboard → SQL Editor (one-time setup for profile photos)
-- Uploads are performed server-side with SUPABASE_SERVICE_ROLE_KEY (NextAuth app).

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Public read for avatar images
create policy "Public avatar access"
on storage.objects for select
to public
using (bucket_id = 'avatars');
