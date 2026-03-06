insert into storage.buckets (id, name, public)
values ('survey_photos', 'survey_photos', true) on conflict (id) do nothing;
create policy "Authenticated users can upload photos" on storage.objects for
insert with check (
        bucket_id = 'survey_photos'
        and auth.role() = 'authenticated'
    );
create policy "Anyone can view photos" on storage.objects for
select using (bucket_id = 'survey_photos');