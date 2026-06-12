# API Documentation

Complete API reference for CollegeConnect platform.

## Base URL

```
Production: https://api.collegeconnect.workers.dev
Development: http://localhost:8787
```

## Authentication

All protected endpoints require JWT token in header:

```
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123",
  "role": "student",
  "phone": "+91-9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student"
    },
    "token": "eyJhbGc..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

---

### Colleges

#### Get All Colleges
```http
GET /api/colleges?search=IIT&type=Engineering&location=Delhi&minRating=4&page=1&limit=10
```

**Query Parameters:**
- `search` (optional) - Search term
- `type` (optional) - College type
- `location` (optional) - City or state
- `minRating` (optional) - Minimum rating (0-5)
- `maxFees` (optional) - Maximum fees
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "colleges": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

#### Get College by ID
```http
GET /api/colleges/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "college_123",
    "name": "IIT Delhi",
    "location": "New Delhi",
    ...
  }
}
```

#### Create College (Admin Only)
```http
POST /api/colleges
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "New College",
  "location": "City, State",
  "type": "Engineering",
  "affiliation": "University",
  "established": 2020,
  "rating": 4.5,
  "totalSeats": 1000,
  "coursesOffered": ["B.Tech", "M.Tech"],
  "facilities": ["Library", "Hostel"],
  "fees": { "min": 100000, "max": 500000 },
  "description": "College description"
}
```

#### Update College (Admin Only)
```http
PUT /api/colleges/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "rating": 4.8
}
```

#### Delete College (Admin Only)
```http
DELETE /api/colleges/:id
Authorization: Bearer <admin_token>
```

---

### Applications

#### Get Applications
```http
GET /api/applications?status=pending&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional) - Filter by status
- `studentId` (optional) - Filter by student (counselor/admin)
- `collegeId` (optional) - Filter by college
- `page` (optional) - Page number
- `limit` (optional) - Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": [...],
    "pagination": {...}
  }
}
```

#### Get Application by ID
```http
GET /api/applications/:id
Authorization: Bearer <token>
```

#### Create Application
```http
POST /api/applications
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "collegeId": "college_123",
  "course": "B.Tech Computer Science",
  "documents": ["doc1_url", "doc2_url"]
}
```

#### Update Application
```http
PUT /api/applications/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved",
  "counselorNotes": "Excellent profile",
  "progress": {
    "step": 3,
    "currentStage": "Document Verification"
  }
}
```

#### Delete Application
```http
DELETE /api/applications/:id
Authorization: Bearer <token>
```

---

### Queries

#### Get All Queries
```http
GET /api/queries?status=open&page=1&limit=10
Authorization: Bearer <token>
```

#### Get Query by ID
```http
GET /api/queries/:id
Authorization: Bearer <token>
```

#### Create Query
```http
POST /api/queries
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "subject": "Admission Process",
  "message": "What documents are required?"
}
```

#### Respond to Query (Admin/Counselor)
```http
PUT /api/queries/:id/respond
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "response": "You need 10th, 12th marksheets...",
  "status": "resolved"
}
```

---

### Favorites

#### Get User Favorites
```http
GET /api/favorites
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "favorites": [
      {
        "id": "college_123",
        "name": "IIT Delhi",
        ...
      }
    ]
  }
}
```

#### Add to Favorites
```http
POST /api/favorites/:collegeId
Authorization: Bearer <token>
```

#### Remove from Favorites
```http
DELETE /api/favorites/:collegeId
Authorization: Bearer <token>
```

---

### File Upload

#### Upload File
```http
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://cdn.collegeconnect.com/files/doc123.pdf",
    "filename": "marksheet.pdf",
    "size": 1024000,
    "type": "application/pdf"
  }
}
```

---

### Statistics (Admin)

#### Get Platform Stats
```http
GET /api/stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalColleges": 500,
    "totalStudents": 10000,
    "totalApplications": 25000,
    "totalQueries": 5000,
    "activeUsers": 1500,
    "applicationsToday": 150,
    "queriesResolved": 4500
  }
}
```

#### Get College Analytics
```http
GET /api/stats/colleges/:id
Authorization: Bearer <admin_token>
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| `AUTH_001` | Invalid credentials | Email or password incorrect |
| `AUTH_002` | Token expired | JWT token has expired |
| `AUTH_003` | Unauthorized | Missing or invalid token |
| `AUTH_004` | Forbidden | Insufficient permissions |
| `VAL_001` | Validation error | Request data validation failed |
| `VAL_002` | Missing required field | Required field is missing |
| `RES_001` | Not found | Resource not found |
| `RES_002` | Already exists | Resource already exists |
| `SYS_001` | Server error | Internal server error |
| `SYS_002` | Database error | Database operation failed |

## Rate Limiting

- **Free Tier**: 100 requests/minute
- **Paid Tier**: 1000 requests/minute
- **Headers**:
  - `X-RateLimit-Limit`: Total allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Filtering & Sorting

### Filtering
```http
GET /api/colleges?type=Engineering&location=Delhi&minRating=4
```

### Sorting
```http
GET /api/colleges?sortBy=rating&order=desc
```

### Combined
```http
GET /api/colleges?type=Engineering&sortBy=fees.min&order=asc&page=1&limit=20
```

## Webhooks

Subscribe to events:

```http
POST /api/webhooks
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "url": "https://your-app.com/webhook",
  "events": ["application.created", "application.updated"],
  "secret": "webhook_secret"
}
```

**Available Events:**
- `application.created`
- `application.updated`
- `application.deleted`
- `query.created`
- `query.responded`
- `user.registered`

## WebSocket Events

Connect to real-time updates:

```javascript
const ws = new WebSocket('wss://api.collegeconnect.workers.dev/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data);
};
```

**Events:**
- `application:status` - Application status changed
- `query:response` - Query received response
- `notification` - New notification

## SDK Examples

### JavaScript/TypeScript
```typescript
import { CollegeConnectAPI } from '@collegeconnect/sdk';

const api = new CollegeConnectAPI({
  apiKey: 'your_api_key',
  baseURL: 'https://api.collegeconnect.workers.dev'
});

// Get colleges
const colleges = await api.colleges.list({
  type: 'Engineering',
  limit: 10
});

// Create application
const application = await api.applications.create({
  collegeId: 'college_123',
  course: 'B.Tech CS'
});
```

### Python
```python
from collegeconnect import CollegeConnectAPI

api = CollegeConnectAPI(api_key='your_api_key')

# Get colleges
colleges = api.colleges.list(type='Engineering', limit=10)

# Create application
application = api.applications.create(
    college_id='college_123',
    course='B.Tech CS'
)
```

## Testing

### Postman Collection
Import our Postman collection:
```
https://api.collegeconnect.workers.dev/postman/collection.json
```

### Test Credentials
```
Student:
  email: student@test.com
  password: test123

Counselor:
  email: counselor@test.com
  password: test123

Admin:
  email: admin@test.com
  password: test123
```

## Changelog

### v1.0.0 (Current)
- Initial API release
- All core endpoints
- JWT authentication
- Rate limiting

### Upcoming v1.1.0
- WebSocket support
- Webhook subscriptions
- Advanced analytics
- Bulk operations

---

For support: api@collegeconnect.com
