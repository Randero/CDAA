

# Migration Guide: Moving Your Project to an External Supabase Instance

This guide walks you through every step to migrate your Cyber Defend Africa Academy from Lovable Cloud to your own Supabase project, ensuring nothing is lost.

---

## Overview of What Gets Migrated

| Component | Count | Details |
|-----------|-------|---------|
| Database migrations | 17 SQL files | All tables, enums, functions, RLS policies, triggers |
| Edge Functions | 4 | send-auth-email, send-notification-email, issue-certificate, generate-transcript |
| Storage Buckets | 2 | avatars (public), academy-assets (public) |
| Secrets | 2 custom | RESEND_API_KEY, LOVABLE_API_KEY |
| Frontend code | Full app | React + Vite project |

---

## Step 1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up or log in
2. Click **"New Project"**
3. Choose an organization (or create one)
4. Set a project name (e.g., "cyber-defend-africa")
5. Set a strong database password -- **save this password somewhere safe**
6. Choose a region close to your users (e.g., West Africa or Europe)
7. Click **"Create new project"** and wait 1-2 minutes

Once created, go to **Settings > API** and note down:
- **Project URL** (looks like `https://xxxxx.supabase.co`)
- **anon/public key** (starts with `eyJ...`)
- **service_role key** (starts with `eyJ...`) -- keep this secret

---

## Step 2: Run Database Migrations

You have 17 migration files that must be run **in order**. Each one builds on the previous.

1. In your new Supabase dashboard, go to **SQL Editor**
2. Open each migration file from `supabase/migrations/` in order (sorted by filename/date)
3. Copy the entire contents of each file and paste it into the SQL Editor
4. Click **"Run"** for each one

The files are (in order):
1. `20251224102659_...sql` -- Core schema (profiles, user_roles, courses, enrollments, etc.)
2. `20251224115152_...sql`
3. `20251225113315_...sql`
4. `20251225113410_...sql`
5. `20251225130441_...sql`
6. `20251226072435_...sql`
7. `20251226074017_...sql`
8. `20251226075130_...sql`
9. `20251226080813_...sql`
10. `20251226081939_...sql`
11. `20251228032947_...sql`
12. `20251228033032_...sql`
13. `20260102050003_...sql`
14. `20260105224636_...sql`
15. `20260217225719_...sql`
16. `20260220160127_...sql`
17. `20260221130324_...sql`

**Important**: If any migration fails, do NOT skip it. Fix the error before proceeding to the next one.

---

## Step 3: Create Storage Buckets

In the SQL Editor, run:

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('academy-assets', 'academy-assets', true);
```

Then add RLS policies for storage (check your migrations -- if storage policies are already in a migration file, this step is covered automatically).

---

## Step 4: Install Supabase CLI

The CLI is needed to deploy edge functions.

**On macOS:**
```bash
brew install supabase/tap/supabase
```

**On Windows (using Scoop):**
```bash
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**On Linux:**
```bash
brew install supabase/tap/supabase
```

**Or using npm (any platform):**
```bash
npm install -g supabase
```

Verify installation:
```bash
supabase --version
```

---

## Step 5: Link Your Project to Supabase CLI

1. Log in to Supabase CLI:
```bash
supabase login
```
This opens a browser window -- log in and authorize.

2. Navigate to your project folder (where you cloned the code):
```bash
cd your-project-folder
```

3. Link to your new Supabase project:
```bash
supabase link --project-ref YOUR_PROJECT_ID
```
Replace `YOUR_PROJECT_ID` with the ID from your Supabase dashboard URL (the part after `/project/`).

It will ask for your database password -- enter the one you saved in Step 1.

---

## Step 6: Set Secrets for Edge Functions

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
supabase secrets set LOVABLE_API_KEY=your_lovable_api_key_here
```

- **RESEND_API_KEY**: Get this from your [Resend.com](https://resend.com) dashboard under API Keys
- **LOVABLE_API_KEY**: If you no longer need Lovable AI features, you can skip this one

---

## Step 7: Deploy Edge Functions

Deploy all 4 edge functions:

```bash
supabase functions deploy send-auth-email --no-verify-jwt
supabase functions deploy send-notification-email --no-verify-jwt
supabase functions deploy issue-certificate --no-verify-jwt
supabase functions deploy generate-transcript --no-verify-jwt
```

The `--no-verify-jwt` flag matches your current `config.toml` settings where `verify_jwt = false`.

---

## Step 8: Export Your Code to GitHub

1. In Lovable, go to **Settings > GitHub**
2. Connect your GitHub account and push the code to a repository
3. Clone the repository to your computer:
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

---

## Step 9: Update Environment Variables

Edit the `.env` file in your project root and replace the values:

```
VITE_SUPABASE_URL=https://YOUR_NEW_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_new_anon_key_here
VITE_SUPABASE_PROJECT_ID=YOUR_NEW_PROJECT_ID
```

Get these values from your new Supabase dashboard under **Settings > API**.

---

## Step 10: Update the Transcript Edge Function

The `generate-transcript` function has a hardcoded logo URL pointing to the old project. In the file `supabase/functions/generate-transcript/index.ts`, find and replace:

```
https://jasebalftkngpbcnonxr.supabase.co/storage/v1/object/public/academy-assets/logo.png
```

With:

```
https://YOUR_NEW_PROJECT_ID.supabase.co/storage/v1/object/public/academy-assets/logo.png
```

Then re-deploy: `supabase functions deploy generate-transcript --no-verify-jwt`

---

## Step 11: Re-upload Storage Assets

If you have files in your storage buckets (logo, avatars, etc.):

1. Download them from the current project first (via the Lovable Cloud backend view)
2. Upload them to your new Supabase project via **Storage** in the dashboard

---

## Step 12: Create Your Admin User

Since user passwords cannot be migrated:

1. Go to your new Supabase dashboard > **Authentication > Users**
2. Click **"Add User"** and create your admin account with email/password
3. After creating the user, copy the user's UUID
4. In the SQL Editor, assign the admin role:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('paste-user-uuid-here', 'admin');
```

---

## Step 13: Run the Project Locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. Log in with your new admin account to verify everything works.

---

## Step 14: Deploy to Production (Optional)

To host the frontend on **Vercel**:

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com), import the repository
3. Add environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
4. Deploy

---

## What Cannot Be Migrated Automatically

| Item | Reason | Solution |
|------|--------|----------|
| User passwords | Hashed and inaccessible | Users must reset passwords or create new accounts |
| Existing data (courses, enrollments, etc.) | Stored in Lovable Cloud database | Export via SQL queries and import into new project |
| Auth sessions | Tied to the old project | Users log in fresh on the new project |

---

## Checklist Summary

- [ ] New Supabase project created
- [ ] All 17 migrations run successfully
- [ ] Storage buckets created (avatars, academy-assets)
- [ ] Supabase CLI installed and linked
- [ ] Secrets configured (RESEND_API_KEY, LOVABLE_API_KEY)
- [ ] All 4 edge functions deployed
- [ ] Code exported to GitHub
- [ ] .env updated with new credentials
- [ ] Hardcoded URLs updated in generate-transcript
- [ ] Storage assets re-uploaded
- [ ] Admin user created with role assigned
- [ ] Local development tested successfully
- [ ] Production deployment (if needed)

