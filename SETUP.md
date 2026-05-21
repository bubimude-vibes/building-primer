# Building Primer — Setup

## Quick Deploy (no admin, blog only)

Upload all files to your GitHub repo. Vercel auto-deploys. The blog works immediately with the seed post — no Supabase needed.

## Full Setup (with admin panel)

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), sign up (free), click **New Project**. Pick any name and region. Save the password.

### 2. Create the posts table

In your Supabase dashboard, go to **SQL Editor** and run this:

```sql
create table posts (
  id bigint generated always as identity primary key,
  title text not null,
  slug text unique not null,
  excerpt text,
  body jsonb not null default '[]',
  tags text[] default '{}',
  date text,
  read_time text,
  published boolean default false,
  created_at timestamptz default now()
);

-- Allow public read access to published posts
alter table posts enable row level security;

create policy "Public can read published posts"
  on posts for select
  using (published = true);

create policy "Authenticated users can do everything"
  on posts for all
  using (auth.role() = 'authenticated');
```

### 3. Seed the first post (optional)

If you want the first post in the database instead of just hardcoded:

```sql
insert into posts (title, slug, excerpt, body, tags, date, read_time, published) values (
  'Why I''m Building Primer',
  'why-im-building-primer',
  'We spend a lot of energy as parents worrying about our kids and their devices. Meanwhile we''re glued to our own. The kids have noticed.',
  '[{"type":"text","content":"We spend a lot of energy as parents worrying about our kids and their devices..."}]',
  '{"vision","parenting"}',
  'May 21, 2026',
  '5 min',
  true
);
```

### 4. Create your admin account

In Supabase dashboard, go to **Authentication** → **Users** → **Add User**. Enter your email and a password. This is what you'll use to log into the admin panel.

### 5. Add environment variables to Vercel

In your Supabase dashboard, go to **Settings** → **API**. You need two values:
- **Project URL** (looks like `https://xxxxx.supabase.co`)
- **anon public key** (a long string starting with `eyJ...`)

In Vercel, go to your project → **Settings** → **Environment Variables**. Add:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon public key |

Click **Save**. Then go to **Deployments** and click **Redeploy** on the latest deployment.

### 6. Test the admin

Go to `projectprimer.blog`, scroll to the footer, click **Admin**. Log in with the email/password you created in step 4. You should see your posts and be able to create new ones.

## Writing Posts

In the admin editor:
- **Blank lines** between text create separate paragraphs
- **`## Heading`** at the start of a line creates a section header
- **` ```code``` `** creates a code block
- **Tags** are comma-separated
- **Excerpt** is the preview text shown on the blog list
- Click **Published/Draft** to toggle visibility
- Posts auto-calculate read time from word count

## Updating the site

To update the blog code: replace all files in the GitHub repo and commit. Vercel auto-rebuilds. Posts stored in Supabase are unaffected by code updates.
