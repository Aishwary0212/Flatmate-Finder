# NestMatch System Design

## 1. Architecture Overview

NestMatch follows a **3-tier client-server architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (React + Vite)               │
│  - Pages: Dashboard, ListingDetail, Profile, Auth           │
│  - Components: ListingCard, ChatWindow, Forms               │
│  - State: Zustand (Auth), Local State (Filters, Forms)      │
│  - API Client: Axios with JWT interceptor                   │
└──────────────┬──────────────────────────────────────────────┘
               │ HTTPS/WebSocket
┌──────────────▼──────────────────────────────────────────────┐
│                Backend (Express + Node.js)                  │
│  - Routes: Auth, Listing, Interest, Message, Profile        │
│  - Controllers: Business logic, validation                  │
│  - Middleware: JWT auth, error handling                     │
│  - Services: Email, Compatibility, Socket, Cloudinary       │
└──────────────┬──────────────────────────────────────────────┘
               │ Mongoose ODM
┌──────────────▼──────────────────────────────────────────────┐
│              Data Layer (MongoDB + Services)                │
│  - Collections: Users, Listings, Interests, Messages, etc.  │
│  - External: Cloudinary (images), Nodemailer (email)        │
└─────────────────────────────────────────────────────────────┘
```

## 2. Data Models

### User Schema

```javascript
{
  _id: ObjectId,
  userId: String,           // Unique identifier
  name: String,
  email: String,           // Unique
  password: String,        // Hashed with bcrypt
  role: Enum("TENANT", "OWNER", "ADMIN"),
  avatar: String,          // Optional profile image
  createdAt: Date,
  updatedAt: Date
}
```

### Listing Schema

```javascript
{
  _id: ObjectId,
  ownerId: ObjectId,       // Reference to User
  title: String,
  description: String,     // Optional
  location: String,
  rent: Number,
  roomType: Enum("Private Room", "Shared Room", "Entire Apartment"),
  furnishingStatus: Enum("Furnished", "Semi-Furnished", "Unfurnished"),
  photos: [String],        // URLs from Cloudinary
  availableFrom: Date,
  isFilled: Boolean,       // Default: false
  amenities: [String],     // Optional: WiFi, Kitchen, etc.
  createdAt: Date,
  updatedAt: Date
}
```

### Interest Schema

```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,      // Reference to TenantProfile
  listingId: ObjectId,     // Reference to Listing
  status: Enum("PENDING", "ACCEPTED", "DECLINED"),
  createdAt: Date,
  updatedAt: Date
}
```

### TenantProfile Schema

```javascript
{
  _id: ObjectId,
  userId: ObjectId,        // Reference to User
  areaType: String,        // e.g., "Urban", "Suburban"
  maxBudget: Number,
  preferredLocation: String,
  commutingPreference: String,
  lookingFor: String,      // "Private Room", "Shared", etc.
  petFriendly: Boolean,
  preferencesData: Object, // Custom fields for AI scoring
  createdAt: Date,
  updatedAt: Date
}
```

### Message Schema

```javascript
{
  _id: ObjectId,
  interestId: ObjectId,    // Reference to Interest
  senderId: ObjectId,      // Reference to User
  receiverId: ObjectId,    // Reference to User
  content: String,
  read: Boolean,           // Default: false
  createdAt: Date
}
```

### CompatibilityScore Schema

```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,      // Reference to TenantProfile
  listingId: ObjectId,     // Reference to Listing
  score: Number,           // 0-100 percentage
  explanation: String,     // Why this score
  createdAt: Date,
  updatedAt: Date
}
```

## 3. Authentication & Authorization

### JWT Flow

```
1. User Registration/Login
   ↓
2. Backend validates credentials
   ↓
3. JWT token generated (header.payload.signature)
   ↓
4. Token stored in localStorage (frontend)
   ↓
5. Subsequent requests include token in Authorization header
   ↓
6. Backend verifies token signature
   ↓
7. Extract user info from payload
```

### Token Structure

```
Header: { alg: "HS256", typ: "JWT" }
Payload: {
  _id: "user_id",
  name: "User Name",
  email: "user@example.com",
  role: "TENANT",
  iat: 1234567890,
  exp: 1234654290  // Expires in ~24 hours
}
Signature: HMACSHA256(header.payload, SECRET_KEY)
```

### Role-Based Access Control (RBAC)

```
Public Routes:
  - POST /auth/register
  - POST /auth/login
  - GET  /listings/browse (limited)

Tenant Routes (role: TENANT):
  - GET  /listings/:id (detail)
  - POST /interests
  - GET  /interests/sent
  - DELETE /interests/:id
  - GET  /messages/:interestId
  - POST /messages
  - PUT  /profile

Owner Routes (role: OWNER):
  - POST /listings
  - PUT  /listings/:id
  - PATCH /listings/:id/fill
  - DELETE /listings/:id
  - GET  /interests/received
  - PATCH /interests/:id/respond

Admin Routes (role: ADMIN):
  - All endpoints
```

## 4. Core Features Implementation

### 4.1 AI Compatibility Scoring

**Algorithm:**

```
1. Retrieve tenant profile preferences (budget, location, area type)
2. Fetch listing details (rent, location, type)
3. Compare dimensions:
   - Budget match: |maxBudget - rent| / maxBudget * 100
   - Location match: Proximity calculation
   - Type match: Does listing match looking_for preference
   - Amenity match: Overlap between preferences and listing amenities
4. Weighted sum: (budget*0.4 + location*0.3 + type*0.2 + amenity*0.1)
5. Store in CompatibilityScore collection
6. If score > 80, trigger email notification
```

**Implementation Location:** `backend/services/compatibility.service.js`

### 4.2 Interest Management Flow

```
Tenant                          Backend                         Owner
  │                               │                              │
  ├─ Send Interest ──────────────>│                              │
  │                               ├─ Validate listing exists     │
  │                               ├─ Check duplicate interest    │
  │                               ├─ Create Interest (PENDING)   │
  │                               ├─ Calculate compatibility     │
  │                               ├─ If score > 80:              │
  │                               │    └─ Send email             │
  │                               │                              │
  │                               │<─ Notify owner (real-time)   │
  │                               │
  │                               ├─ New Interest Alert ─────────>│
  │                               │                              │
  │                       Owner accepts/declines                │
  │                               │                              │
  │<────── Notification ──────────┤                              │
  │       (Email + Toast)         │                              │
  │                               │
  │                          If accepted:                        │
  │                    Can now message (Socket.io)               │
```

### 4.3 Real-Time Messaging

**Socket.io Events:**

```javascript
// Emitted by clients
socket.emit("message:send", {
  interestId,
  senderId,
  receiverId,
  content,
});

// Received by clients
socket.on("message:received", (message) => {
  // Update UI with new message
});

socket.on("user:typing", (data) => {
  // Show typing indicator
});

socket.on("user:online", (userId) => {
  // Update online status
});
```

**Message Persistence:**

- All messages stored in MongoDB
- On page load, fetch message history from API
- Real-time updates via Socket.io

### 4.4 Image Upload & Storage

**Flow:**

```
Frontend                        Backend              Cloudinary
  │                               │                      │
  ├─ Select images ─────────────>│                      │
  │  (FormData)                  │                      │
  │                               ├─ Validate files     │
  │                               ├─ Upload ───────────>│
  │                               │                      │
  │                               │<─ Return URLs ──────│
  │                               │                      │
  │<───── URLs ───────────────────│                      │
  │  (Store in DB + Show preview) │                      │
```

**File Handling:**

- Max file size: 10MB per image
- Supported formats: JPEG, PNG, WebP, GIF
- Cloudinary handles optimization and CDN delivery
- Fallback: Manual URL input if upload fails

### 4.5 Search & Filter

**Filters Available:**

- Location (text search)
- Rent range (min-max)
- Room type
- Furnishing status
- Availability date

**Backend Query:**

```javascript
const filters = {};
if (location) filters.location = new RegExp(location, "i");
if (minRent) filters.rent = { $gte: minRent };
if (maxRent) filters.rent = { ...filters.rent, $lte: maxRent };

Listing.find(filters).limit(20);
```

## 5. API Endpoints Detailed

### Authentication

```
POST /api/auth/register
  Input: { userId, name, email, password, role }
  Output: { token, user }

POST /api/auth/login
  Input: { email, password }
  Output: { token, user }

POST /api/auth/logout
  Output: { message: "Logged out" }
```

### Listings

```
GET /api/listings/browse?location=&minRent=&maxRent=
  Output: { listings: [...], count }

GET /api/listings/:id
  Output: { listing, compatibilityScore }

POST /api/listings
  Auth: TENANT/OWNER
  Input: { title, location, rent, roomType, furnishingStatus, photos }
  Output: { listing }

PATCH /api/listings/:id/fill
  Auth: OWNER
  Output: { listing }

DELETE /api/listings/:id
  Auth: OWNER
  Output: { message }
```

### Interests

```
POST /api/interests
  Auth: TENANT
  Input: { listingId }
  Output: { interest }

GET /api/interests/sent
  Auth: TENANT
  Output: [{ interest, listing }]

GET /api/interests/received
  Auth: OWNER
  Output: [{ interest, tenant }]

PATCH /api/interests/:id/respond
  Auth: OWNER
  Input: { status: "ACCEPTED" | "DECLINED" }
  Output: { interest }

DELETE /api/interests/:id
  Auth: TENANT
  Output: { message }
```

### Messages

```
GET /api/messages/:interestId
  Output: [{ message }]

POST /api/messages
  Input: { interestId, content }
  Output: { message }
```

## 6. Security Considerations

### Password Security

- Hashed with bcrypt (salt rounds: 10)
- Never logged or returned to client
- Minimum requirements: 8+ chars, mixed case, numbers

### JWT Security

- Signed with strong secret key (min 32 chars)
- Set reasonable expiration (24 hours)
- Refresh token mechanism for extended sessions
- Token stored in httpOnly cookie (optional, currently localStorage)

### Input Validation

- All inputs validated with Zod schemas
- Email format validation
- Rent/budget as positive integers
- String length limits

### CORS

```javascript
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
```

### SQL/NoSQL Injection Prevention

- Mongoose automatically sanitizes queries
- Parameterized queries via Zod validation
- No direct string concatenation in queries

### Rate Limiting (Recommended)

```javascript
// Install: npm install express-rate-limit
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api/", limiter);
```

## 7. Error Handling

### Frontend Error Flow

```
API Request
    ↓
Response Check
    ├─ Status 401: Redirect to login (token expired)
    ├─ Status 403: Show "Unauthorized" toast
    ├─ Status 400: Show validation error toast
    ├─ Status 500: Show "Server error" toast
    └─ Success: Update UI + show success toast
```

### Backend Error Response Format

```javascript
{
  status: 400,
  error: "User already exists",
  details: { field: "email" }  // Optional
}
```

## 8. Performance Optimization

### Frontend

- **Code Splitting:** React Router lazy loading
- **Lazy Loading:** Images with placeholder
- **Caching:** API responses in component state
- **Debouncing:** Search input (300ms)
- **Virtual Scrolling:** Long lists of listings

### Backend

- **Indexing:** `location`, `rent`, `ownerId` in Listing
- **Pagination:** Limit to 20 results per request
- **Projection:** Only return needed fields
- **Connection Pooling:** MongoDB connection reuse
- **Compression:** gzip middleware

```javascript
// MongoDB indexes
db.listings.createIndex({ location: 1, rent: 1 });
db.listings.createIndex({ ownerId: 1 });
db.interests.createIndex({ tenantId: 1, listingId: 1 });
```

## 9. Deployment Architecture

### Environment Configuration

```
Development:
  - MongoDB Atlas (dev cluster)
  - Cloudinary (dev account)
  - Local frontend (localhost:5173)

Production:
  - MongoDB Atlas (production cluster)
  - Cloudinary (production account)
  - Frontend deployed (Vercel/Netlify)
  - Backend deployed (Heroku/Railway/AWS)
```

### Environment Variables

```
# Backend .env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://prod_user:password@prod-cluster.mongodb.net/nestmatch
JWT_SECRET=long_random_secret_key_min_32_chars
CLOUDINARY_CLOUD_NAME=prod_account
CLOUDINARY_API_KEY=key
CLOUDINARY_API_SECRET=secret
SMTP_EMAIL=noreply@nestmatch.com
SMTP_PASSWORD=app_password
FRONTEND_URL=https://nestmatch.vercel.app
```

## 10. Future Enhancements

- **Advanced Matching:** Machine learning for better recommendations
- **Video Tours:** Virtual tours of properties
- **Payment Integration:** Stripe for rent collection
- **Reviews & Ratings:** Tenant/owner reputation system
- **Notifications:** Push notifications for mobile app
- **Analytics Dashboard:** Insights for owners (views, inquiries)
- **Mobile App:** React Native version
- **Two-factor Authentication:** Enhanced security
- **Saved Listings:** Favorites/wishlist feature
- **Referral Program:** Incentivize user growth

## 11. Testing Strategy

### Unit Tests

```javascript
// Example: Compatibility scoring
describe("Compatibility Service", () => {
  it("should calculate 100% match for identical preferences", () => {
    const score = calculateScore(tenant, listing);
    expect(score).toBe(100);
  });
});
```

### Integration Tests

```javascript
// Example: Interest flow
describe("Interest API", () => {
  it("should create interest and send email if score > 80", async () => {
    // Setup
    // Execute: POST /api/interests
    // Assert: interest created + email sent
  });
});
```

### E2E Tests (Playwright)

```javascript
// Complete flow: Tenant sends interest
test("tenant sends interest to listing", async ({ page }) => {
  await page.goto("http://localhost:5173/login");
  await page.fill('input[name="email"]', "tenant@example.com");
  await page.fill('input[name="password"]', "password123");
  await page.click('button:has-text("Login")');
  // ... navigate and send interest
});
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-07-04  
**Team:** Development Team
