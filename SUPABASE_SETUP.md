# 🗄️ Supabase Database Setup

Complete guide to connect CollegeConnect to your Supabase database.

## 📋 Your Supabase Project Info

| Setting | Value |
|---------|-------|
| Project URL | `https://zmsqbysmpxkqeoapxnbo.supabase.co` |
| Database Host | `db.zmsqbysmpxkqeoapxnbo.supabase.co` |
| Port | `5432` |
| Database | `postgres` |
| User | `postgres` |

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Your Anon Key

1. Go to [**Supabase Dashboard**](https://supabase.com/dashboard)
2. Click on your project (`zmsqbysmpxkqeoapxnbo`)
3. In the left sidebar, click **Settings** (gear icon at bottom)
4. Click **API** in the settings menu
5. Under **Project API keys**, find **anon public**
6. Click the **Copy** button next to it

> ⚠️ The anon key starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
> It's a long JWT token - make sure you copy the entire thing!

### Step 2: Create Tables

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **+ New Query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)

This will create:
- ✅ `colleges` table
- ✅ `applications` table  
- ✅ `queries` table
- ✅ `favorites` table
- ✅ `users` table
- ✅ Row Level Security policies
- ✅ Performance indexes
- ✅ 6 sample colleges (seed data)

### Step 3: Configure Environment

Create a `.env.local` file in your project root:

```bash
VITE_SUPABASE_URL=https://zmsqbysmpxkqeoapxnbo.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace `your-anon-key-here` with your actual anon key from Step 1.

### Step 4: Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### Step 5: Test the Connection

1. Open the app in browser
2. Go to **Admin Dashboard** (login as admin)
3. Try adding a new college
4. Check Supabase **Table Editor** to see the new entry

## 🗃️ Database Schema

### colleges
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | College name |
| location | TEXT | Full address |
| city | TEXT | City name |
| state | TEXT | State name |
| type | TEXT | Engineering/Medical/etc. |
| affiliation | TEXT | University affiliation |
| established | INTEGER | Year established |
| rating | DECIMAL | 0-5 rating |
| total_seats | INTEGER | Available seats |
| courses_offered | TEXT[] | Array of courses |
| facilities | TEXT[] | Array of facilities |
| fees_min | INTEGER | Minimum fees |
| fees_max | INTEGER | Maximum fees |
| image | TEXT | Image URL |
| description | TEXT | Description |
| nirf_rank | INTEGER | NIRF ranking (optional) |
| accreditation | TEXT[] | Accreditations |
| avg_package | INTEGER | Average placement |
| highest_package | INTEGER | Highest placement |
| placement_rate | DECIMAL | Placement % |

### applications
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| student_id | TEXT | Student identifier |
| student_name | TEXT | Student name |
| student_email | TEXT | Email |
| student_phone | TEXT | Phone |
| college_id | UUID | FK to colleges |
| college_name | TEXT | College name |
| course | TEXT | Applied course |
| status | TEXT | pending/under_review/approved/rejected/counseling |
| applied_date | TIMESTAMP | Application date |
| documents | TEXT[] | Uploaded documents |
| counselor_id | TEXT | Assigned counselor |
| counselor_notes | TEXT | Notes |
| progress_step | INTEGER | Current step (1-5) |
| progress_stage | TEXT | Current stage name |

### queries
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| student_id | TEXT | Student identifier |
| student_name | TEXT | Student name |
| student_email | TEXT | Email |
| subject | TEXT | Query subject |
| message | TEXT | Query message |
| status | TEXT | open/in_progress/resolved |
| response | TEXT | Admin response |
| responded_by | TEXT | Responder name |
| responded_date | TIMESTAMP | Response date |

### favorites
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | TEXT | User identifier |
| college_id | UUID | FK to colleges |

## 🔒 Security (Row Level Security)

The schema enables RLS with permissive policies for demo purposes:
- Everyone can **read** all data
- Everyone can **insert** new data
- Everyone can **update** and **delete** data

**For production**, you should:
1. Enable Supabase Auth
2. Restrict write operations to authenticated users
3. Add user-specific policies

## 🔄 How It Works

### When the app loads:
1. `App.tsx` calls `initializeColleges()`
2. Store checks if Supabase is configured
3. If configured → Fetches from database
4. If not configured → Uses mock data

### When admin adds a college:
1. Admin fills the form
2. `addCollege()` is called
3. Data is inserted into Supabase `colleges` table
4. UI updates with new college

### Data flow:
```
User Action → Store → Supabase API → PostgreSQL
                ↓
            UI Update ← Store Update ← Response
```

## 🐛 Troubleshooting

### "Failed to load colleges"
- Check if anon key is correct in `.env.local`
- Ensure tables exist (run schema.sql)
- Check browser console for detailed errors

### Tables don't exist
1. Go to Supabase SQL Editor
2. Run `supabase/schema.sql` again
3. Check for any SQL errors

### CORS errors
- Verify the Supabase URL is correct
- Check if the project is paused (free tier)

### Data not persisting
- Verify anon key is set
- Check RLS policies are created
- Look at Supabase logs

## 📊 Viewing Data

### In Supabase Dashboard:
1. Go to **Table Editor**
2. Select a table (colleges, applications, etc.)
3. View, edit, or delete rows

### SQL Queries:
```sql
-- Count colleges by type
SELECT type, COUNT(*) FROM colleges GROUP BY type;

-- Recent applications
SELECT * FROM applications ORDER BY applied_date DESC LIMIT 10;

-- Pending queries
SELECT * FROM queries WHERE status = 'open';
```

## 🚀 Production Checklist

Before going live:
- [ ] Create stricter RLS policies
- [ ] Enable Supabase Auth
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Add monitoring/alerting
- [ ] Use environment variables in Vercel
- [ ] Test all CRUD operations

## 💰 Supabase Free Tier Limits

- **Database**: 500 MB
- **Storage**: 1 GB
- **Bandwidth**: 2 GB
- **Auth users**: 50,000 MAU
- **API requests**: Unlimited

Plenty for a college discovery platform!

## 📞 Support

- **Supabase Docs**: https://supabase.com/docs
- **Discord**: https://discord.supabase.com
- **GitHub Issues**: Create an issue in this repo
