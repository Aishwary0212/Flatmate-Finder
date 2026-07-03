# NestMatch

A modern, AI-powered rental matching platform that connects tenants with compatible properties and vice versa. Built with React, Node.js, and MongoDB.

## Features

- **AI Compatibility Scoring**: Algorithm-based matching between tenant preferences and property characteristics
- **Tenant Browse & Search**: Browse available listings with advanced filtering (location, rent range)
- **Interest Management**: Tenants can send interests and track responses from property owners
- **Real-time Messaging**: Chat with matched tenants/owners after interest acceptance
- **Property Management**: Owners can create, edit, and manage multiple listings
- **Automatic Notifications**: Email alerts for high-compatibility matches and interest responses
- **Image Gallery**: Multiple photo support for property listings with Cloudinary integration
- **User Profiles**: Complete tenant profile management with preferences for AI scoring

## Tech Stack

### Frontend

- **React 18** with Vite (fast build tool)
- **React Router v7** for navigation
- **Zustand** for state management (auth store)
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hot Toast** for notifications
- **Axios** with custom interceptors for API calls

### Backend

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Cloudinary** for image uploads
- **Nodemailer** for email notifications
- **Zod** for request validation
- **Socket.io** for real-time messaging

## Project Structure

```
unthinkable2/
├── backend/
│   ├── src/
│   │   ├── server.js              # Express app entry
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection
│   │   ├── controllers/           # Business logic
│   │   │   ├── auth.controller.js
│   │   │   ├── listing.controller.js
│   │   │   ├── interest.controller.js
│   │   │   ├── message.controller.js
│   │   │   └── profile.controller.js
│   │   ├── models/                # Mongoose schemas
│   │   │   ├── User.js
│   │   │   ├── Listing.js
│   │   │   ├── Interest.js
│   │   │   ├── TenantProfile.js
│   │   │   ├── Message.js
│   │   │   └── CompatibilityScore.js
│   │   ├── routes/                # API endpoints
│   │   │   ├── auth.routes.js
│   │   │   ├── listing.routes.js
│   │   │   ├── interest.routes.js
│   │   │   ├── message.routes.js
│   │   │   ├── profile.routes.js
│   │   │   └── upload.routes.js
│   │   ├── middleware/
│   │   │   └── auth.middleware.js # JWT verification
│   │   ├── services/              # Utility functions
│   │   │   ├── compatibility.service.js
│   │   │   ├── email.service.js
│   │   │   ├── cloudinary.js
│   │   │   └── socket.service.js
│   │   └── validators/
│   │       └── auth.validator.js
│   ├── .env                       # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx               # React entry point
│   │   ├── App.jsx                # Routes config
│   │   ├── index.css              # Global styles
│   │   ├── App.css                # App styles
│   │   ├── lib/
│   │   │   └── api.js             # Axios instance with interceptors
│   │   ├── store/
│   │   │   └── authStore.js       # Zustand auth store
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx     # Real-time messaging
│   │   │   ├── ListingCard.jsx    # Listing display component
│   │   │   └── TenantProfileForm.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx      # Main dashboard (tenant & owner)
│   │   │   ├── ListingDetail.jsx  # Property detail page
│   │   │   └── Profile.jsx        # User profile page
│   │   └── assets/                # Static assets
│   ├── index.html                 # HTML template
│   ├── vite.config.js             # Vite configuration
│   ├── eslint.config.js           # Linting rules
│   └── package.json
│
└── README.md & systemdesign.md
```

## Installation & Setup

### Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)
- Nodemailer SMTP credentials

### Backend Setup

1. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Create `.env` file** with:

   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nestmatch
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   SMTP_EMAIL=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   ```

3. **Start the server**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Install dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Create `.env` file** with:

   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

3. **Start the dev server**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Listings

- `GET /api/listings/browse` - Get available listings (with filters)
- `GET /api/listings/:id` - Get listing details
- `GET /api/listings/my-listings` - Get user's listings (owner)
- `POST /api/listings` - Create new listing
- `PATCH /api/listings/:id/fill` - Mark listing as filled
- `PATCH /api/listings/:id/unfill` - Mark listing as unfilled
- `DELETE /api/listings/:id` - Delete listing
- `POST /api/listings/upload` - Upload listing images

### Interests

- `POST /api/interests` - Send interest to a listing
- `GET /api/interests/sent` - Get interests sent by tenant
- `GET /api/interests/received` - Get interests received on listings (owner)
- `PATCH /api/interests/:id/respond` - Accept/decline interest
- `DELETE /api/interests/:id` - Remove/withdraw interest

### Messages

- `GET /api/messages/:interestId` - Get chat history
- `POST /api/messages` - Send message

### Profile

- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile/tenant` - Create/update tenant preferences

## Usage Flow

### For Tenants

1. **Register** as a tenant
2. **Complete Profile** with preferences (area type, budget, etc.)
3. **Browse Listings** with AI compatibility scores
4. **Send Interest** to desired properties
5. **Receive Responses** from property owners
6. **Chat** with owners when interest is accepted
7. **View/Manage** all sent interests in dashboard

### For Property Owners

1. **Register** as an owner
2. **Create Listings** with photos, rent, and details
3. **Receive Interests** from tenants
4. **Respond** to interests (accept/decline)
5. **Chat** with accepted tenants
6. **Manage Status** (mark as filled/unfilled)

## Key Features Implementation

### AI Compatibility Scoring

- Analyzes tenant preferences (budget, area type, commute distance)
- Compares with listing characteristics
- Returns percentage match score
- Triggers email notifications for matches > 80%

### Interest Management

- Tenants send interests to listings
- Owners accept/decline with email notifications
- Interests can be withdrawn anytime
- Track status: PENDING, ACCEPTED, DECLINED

### Real-time Messaging

- Socket.io integration for live chat
- Message history persistence
- Only available after interest acceptance

### Image Management

- Cloudinary integration for image uploads
- Multiple images per listing
- Fallback to URL input if upload fails
- Image optimization and CDN delivery

## Development

### Running Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm run test
```

### Code Quality

```bash
# Lint frontend
cd frontend
npx eslint --ext .jsx src/

# Lint backend
cd backend
npx eslint src/
```

### Build for Production

**Frontend:**

```bash
cd frontend
npm run build
```

**Backend:**
Ensure `.env` is configured for production and run with `NODE_ENV=production npm start`

## Troubleshooting

### MongoDB Connection Issues

- Verify connection string in `.env`
- Check MongoDB Atlas IP whitelist includes your IP
- Ensure credentials are correct

### Image Upload Fails

- Verify Cloudinary credentials in `.env`
- Check image file size < 10MB
- Fallback to URL input

### JWT Token Expired

- Frontend will automatically redirect to login
- Clear local storage and re-login

### Socket.io Connection Issues

- Verify backend server is running
- Check CORS settings in server.js
- Ensure frontend API URL matches backend

## Contributing

1. Create a feature branch (`git checkout -b feature/new-feature`)
2. Commit changes (`git commit -am 'Add new feature'`)
3. Push to branch (`git push origin feature/new-feature`)
4. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue on the repository.
