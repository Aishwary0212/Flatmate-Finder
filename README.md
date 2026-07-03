---

# System Architecture

```
                   +-------------------------+
                   |     React + Vite        |
                   |  (Frontend Dashboard)   |
                   +-----------+-------------+
                               |
                         Axios + JWT
                               |
                               v
                   +-------------------------+
                   |    Express.js Backend   |
                   | Authentication          |
                   | Listings               |
                   | Interests              |
                   | Messages               |
                   | Compatibility Service  |
                   +-----+-----------+------+
                         |           |
                         |           |
                  MongoDB           Socket.io
                         |           |
                         |           |
                  Compatibility      Real-time Chat
                  Scores             Notifications
                         |
                         |
               +---------+----------+
               |                    |
         Cloudinary           Nodemailer
     (Image Storage)      (Email Service)
```

---

# Database Schema

### Collections

### Users

```javascript
{
  _id,
  name,
  email,
  password,
  role, // TENANT | OWNER | ADMIN
  avatar,
  createdAt,
  updatedAt
}
```

### Listings

```javascript
{
  _id,
  ownerId,
  title,
  description,
  location,
  rent,
  roomType,
  furnishingStatus,
  availableFrom,
  photos,
  isFilled,
  createdAt
}
```

### TenantProfiles

```javascript
{
  _id,
  userId,
  preferredLocation,
  budget,
  moveInDate,
  preferences
}
```

### Interests

```javascript
{
  _id,
  tenantId,
  listingId,
  status, // PENDING | ACCEPTED | DECLINED
  compatibilityScore,
  explanation
}
```

### Messages

```javascript
{
  _id,
  interestId,
  senderId,
  receiverId,
  message,
  createdAt
}
```

### CompatibilityScores

```javascript
{
  _id,
  tenantId,
  listingId,
  score,
  explanation,
  createdAt
}
```

---

# Entity Relationship

```
User (Owner)
     |
     | 1:N
     |
 Listings
     |
     | 1:N
 Interests
     |
     | 1:N
 Messages

User (Tenant)
     |
     | 1:1
TenantProfile

TenantProfile
      |
      | N:M
      |
CompatibilityScore
      |
      |
Listing
```

---

# LLM Compatibility Prompt

The compatibility engine receives the tenant profile and listing details and returns a compatibility score with an explanation.

### Prompt

```text
Given this room listing:

Location:
Rent:
Room Type:
Available From:

and this tenant profile:

Preferred Location:
Budget:
Move-in Date:

Compute a compatibility score between 0 and 100 based primarily on:

- Budget match
- Location match
- Room type compatibility

Return JSON only.

{
  "score": number,
  "explanation": string
}
```

### Example Input

```json
{
  "listing": {
    "location": "Bangalore",
    "rent": 12000,
    "roomType": "Private"
  },
  "tenant": {
    "preferredLocation": "Bangalore",
    "budget": 13000,
    "moveInDate": "2026-08-01"
  }
}
```

### Example Output

```json
{
  "score": 92,
  "explanation": "Excellent location match and rent is within the preferred budget."
}
```

---

# LLM Fallback Strategy

If the LLM service is unavailable or times out, NestMatch automatically switches to a rule-based scoring algorithm.

Weight distribution:

| Parameter | Weight |
|-----------|--------|
| Budget Match | 40% |
| Location Match | 30% |
| Room Type Match | 20% |
| Amenities Match | 10% |

Example fallback explanation:

```
Budget matches your preference.
Preferred location is available.
Room type matches your requirement.
Some optional amenities are unavailable.
```

Both the score and explanation are stored in MongoDB so they are not recomputed on every request.

---

# Compatibility Score Workflow

```
Tenant opens Listing
        |
        v
Fetch Tenant Profile
        |
        v
Calculate Compatibility
        |
        +------------+
        |            |
        | LLM Works  |
        |            |
        +-----+------+
              |
              |
        Store Score
              |
              |
         Return Result
              |
              |
       Show Compatibility

If LLM fails

Rule-Based Algorithm
        |
Store Result
        |
Return Score
```

---

# Real-Time Chat Flow

```
Tenant sends Interest
        |
Owner Accepts
        |
WebSocket Connection Created
        |
Messages exchanged through Socket.io
        |
Messages stored in MongoDB
        |
Conversation restored whenever users reconnect
```

---

# Email Notification Flow

```
Tenant sends Interest
        |
Calculate Compatibility
        |
Score > 80 ?
     /       \
   Yes       No
   |          |
Notify Owner  Skip
   |
Owner Accepts / Declines
   |
Notify Tenant
```

---

# Hosted Application

### Frontend

```
https://your-vercel-url.vercel.app
```

### Backend

```
https://your-render-url.onrender.com
```

---

# Environment Variables

## Backend (.env.example)

```env
PORT=5000

MONGODB_URI=

JWT_SECRET=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=

SMTP_EMAIL=

SMTP_PASSWORD=

FRONTEND_URL=http://localhost:5173

NODE_ENV=development
```

## Frontend (.env.example)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

# Future Enhancements

- AI-based roommate recommendation
- Google Maps integration
- Push notifications
- Payment gateway integration
- Saved listings
- Review & rating system
- Mobile application (React Native)
- Two-factor authentication (2FA)
- Analytics dashboard for property owners

---
