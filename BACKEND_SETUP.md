# Backend Setup - Cloudflare Workers

This document provides instructions for setting up the backend on Cloudflare Workers.

## 🏗️ Architecture

### Cloudflare Services Used
1. **Cloudflare Workers** - Serverless API endpoints
2. **Cloudflare D1** - SQLite database
3. **Cloudflare R2** - File storage for college images
4. **Cloudflare KV** - Key-value store for caching

## 📋 Prerequisites

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

## 🗄️ Database Schema (D1)

### Tables

```sql
-- Users Table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK(role IN ('student', 'counselor', 'admin')) NOT NULL,
  phone TEXT,
  avatar TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Colleges Table
CREATE TABLE colleges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  type TEXT NOT NULL,
  affiliation TEXT NOT NULL,
  established INTEGER NOT NULL,
  rating REAL NOT NULL,
  total_seats INTEGER NOT NULL,
  courses_offered TEXT NOT NULL, -- JSON array
  facilities TEXT NOT NULL, -- JSON array
  min_fees INTEGER NOT NULL,
  max_fees INTEGER NOT NULL,
  image_url TEXT,
  description TEXT NOT NULL,
  nirf_rank INTEGER,
  accreditation TEXT, -- JSON array
  avg_package INTEGER,
  highest_package INTEGER,
  placement_rate REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Applications Table
CREATE TABLE applications (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  college_id TEXT NOT NULL,
  course TEXT NOT NULL,
  status TEXT CHECK(status IN ('pending', 'under_review', 'approved', 'rejected', 'counseling')) NOT NULL,
  applied_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  documents TEXT, -- JSON array
  counselor_id TEXT,
  counselor_notes TEXT,
  progress_step INTEGER DEFAULT 1,
  progress_total INTEGER DEFAULT 5,
  progress_stage TEXT,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (college_id) REFERENCES colleges(id),
  FOREIGN KEY (counselor_id) REFERENCES users(id)
);

-- Queries Table
CREATE TABLE queries (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT CHECK(status IN ('open', 'in_progress', 'resolved')) NOT NULL,
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  response TEXT,
  responded_by TEXT,
  responded_date DATETIME,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (responded_by) REFERENCES users(id)
);

-- Favorites Table
CREATE TABLE favorites (
  user_id TEXT NOT NULL,
  college_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, college_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (college_id) REFERENCES colleges(id)
);
```

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Colleges
- `GET /api/colleges` - Get all colleges (with filters)
- `GET /api/colleges/:id` - Get college details
- `POST /api/colleges` - Create college (admin only)
- `PUT /api/colleges/:id` - Update college (admin only)
- `DELETE /api/colleges/:id` - Delete college (admin only)

### Applications
- `GET /api/applications` - Get applications (filtered by role)
- `GET /api/applications/:id` - Get application details
- `POST /api/applications` - Create application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application

### Queries
- `GET /api/queries` - Get queries
- `GET /api/queries/:id` - Get query details
- `POST /api/queries` - Create query
- `PUT /api/queries/:id/respond` - Respond to query (admin/counselor)

### Favorites
- `GET /api/favorites` - Get user favorites
- `POST /api/favorites/:collegeId` - Add to favorites
- `DELETE /api/favorites/:collegeId` - Remove from favorites

### File Upload
- `POST /api/upload` - Upload file to R2

## 🔧 Wrangler Configuration

Create `wrangler.toml`:

```toml
name = "collegeconnect-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "collegeconnect"
database_id = "YOUR_DATABASE_ID"

# R2 Bucket
[[r2_buckets]]
binding = "BUCKET"
bucket_name = "college-images"

# KV Namespace for caching
[[kv_namespaces]]
binding = "CACHE"
id = "YOUR_KV_ID"

# Environment Variables
[vars]
JWT_SECRET = "your-secret-key"
FRONTEND_URL = "https://your-vercel-app.vercel.app"
```

## 📝 Sample Worker Code (Hono Framework)

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt } from 'hono/jwt';

type Bindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
  CACHE: KVNamespace;
  JWT_SECRET: string;
  FRONTEND_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS
app.use('*', cors({
  origin: (origin, c) => c.env.FRONTEND_URL,
  credentials: true,
}));

// Auth middleware
const authMiddleware = jwt({
  secret: (c) => c.env.JWT_SECRET,
});

// Public routes
app.get('/api/colleges', async (c) => {
  const { search, type, location } = c.req.query();
  
  let query = 'SELECT * FROM colleges WHERE 1=1';
  const params: any[] = [];
  
  if (search) {
    query += ' AND (name LIKE ? OR city LIKE ? OR state LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  
  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  
  const { results } = await c.env.DB.prepare(query).bind(...params).all();
  return c.json(results);
});

// Protected routes
app.use('/api/applications/*', authMiddleware);
app.use('/api/queries/*', authMiddleware);
app.use('/api/favorites/*', authMiddleware);

app.post('/api/applications', async (c) => {
  const user = c.get('jwtPayload');
  const body = await c.req.json();
  
  const id = crypto.randomUUID();
  await c.env.DB.prepare(`
    INSERT INTO applications 
    (id, student_id, college_id, course, status, progress_stage) 
    VALUES (?, ?, ?, ?, 'pending', 'Application Received')
  `).bind(id, user.id, body.collegeId, body.course).run();
  
  return c.json({ id, message: 'Application submitted successfully' });
});

export default app;
```

## 🔐 Authentication Setup

Use Cloudflare Access or implement JWT:

```typescript
import { sign, verify } from 'hono/jwt';

// Login endpoint
app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json();
  
  // Verify credentials (hash passwords in production)
  const user = await c.env.DB.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(email).first();
  
  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }
  
  const token = await sign(
    { id: user.id, role: user.role },
    c.env.JWT_SECRET
  );
  
  return c.json({ token, user });
});
```

## 📤 File Upload (R2)

```typescript
app.post('/api/upload', authMiddleware, async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File;
  
  const key = `${Date.now()}-${file.name}`;
  await c.env.BUCKET.put(key, file.stream());
  
  const url = `https://your-r2-domain.com/${key}`;
  return c.json({ url });
});
```

## 🚀 Deployment Steps

```bash
# Create D1 database
wrangler d1 create collegeconnect

# Create tables
wrangler d1 execute collegeconnect --file=./schema.sql

# Create R2 bucket
wrangler r2 bucket create college-images

# Create KV namespace
wrangler kv:namespace create CACHE

# Deploy worker
wrangler deploy
```

## 🔄 Frontend Integration

Update frontend API calls:

```typescript
// src/lib/api.ts
const API_URL = import.meta.env.PROD 
  ? 'https://your-worker.workers.dev' 
  : 'http://localhost:8787';

export async function fetchColleges(filters: any) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${API_URL}/api/colleges?${params}`);
  return response.json();
}
```

## 💰 Cost Estimation (Free Tier)

- **Workers**: 100,000 requests/day free
- **D1**: 5GB storage, 5M reads/day free
- **R2**: 10GB storage, 1M reads/month free
- **KV**: 100,000 reads/day free

**Total**: FREE for starting out! Perfect for MVP.

## 📊 Monitoring

```bash
# View logs
wrangler tail

# View analytics
wrangler analytics
```

## 🔒 Security Best Practices

1. Use environment variables for secrets
2. Hash passwords with bcrypt
3. Validate all inputs
4. Rate limit endpoints
5. Use CORS properly
6. Implement CSRF protection
7. Regular security audits

## 🎯 Next Steps

1. Set up Cloudflare account
2. Create D1 database
3. Deploy worker
4. Update frontend API calls
5. Test integration
6. Deploy to production

---

For detailed Cloudflare documentation: https://developers.cloudflare.com/
