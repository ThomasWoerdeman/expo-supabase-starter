# Database Setup

To enable the profile page functionality, you need to create a `profiles` table in your Supabase database.

## Create Profiles Table

Run the following SQL in your Supabase SQL editor:

```sql
-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  instagram_handle text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
-- See https://supabase.com/docs/guides/auth/managing-user-data#using-triggers for more details.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Set up Storage!
insert into storage.buckets (id, name)
  values ('avatars', 'avatars');

-- Set up access controls for storage.
-- See https://supabase.com/docs/guides/storage#policy-examples for more details.
create policy "Avatar images are publicly accessible." on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Anyone can upload an avatar." on storage.objects
  for insert with check (bucket_id = 'avatars');

create policy "Anyone can update their own avatar." on storage.objects
  for update using (auth.uid()::text = (storage.foldername(name))[1]);
```

## What this does:

1. **Creates a `profiles` table** that stores additional user information linked to Supabase Auth users
2. **Sets up Row Level Security (RLS)** to ensure users can only modify their own profiles
3. **Creates a trigger** that automatically creates a profile entry when a user signs up
4. **Sets up storage bucket** for avatar images (optional, for future avatar upload functionality)

## After running the SQL:

The profile page will be able to:

- Display user information from the session
- Load and update profile data from the `profiles` table
- Handle cases where the profile doesn't exist yet (graceful fallback)

## Optional: Seed data

If you want to add some initial data to existing users, you can run:

```sql
-- Add profiles for existing users (run this if you already have users)
INSERT INTO profiles (id, full_name, username, instagram_handle)
SELECT
  id,
  coalesce(raw_user_meta_data->>'full_name', email) as full_name,
  null as username,
  null as instagram_handle
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.users.id
);
```
