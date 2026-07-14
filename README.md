# GVCC Learning Portal

A production-ready full-stack Learning Management System (LMS) built with React.js, Node.js, Express, and MongoDB.

## Features

- **Authentication** - JWT-based student/admin login with protected routes
- **Video Learning** - React Player with progress tracking and resume functionality
- **Bookmark System** - Unlimited bookmarks per video with timestamp-based seek
- **Continue Watching** - Auto-save progress and resume from exact timestamp
- **Screenshot Protection** - Multi-layer deterrent mechanisms (see details below)
- **Admin Panel** - Manage videos and students
- **Search & Filter** - Full-text search with category filtering
- **Responsive UI** - Dark mode glassmorphism design

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Install Dependencies

```bash
npm install
npm run install:all
```

### 2. Configure Environment

Copy and fill in the server environment file:

```bash
cp server/.env.example server/.env
```

Required variables:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/gvcc_learning_portal
JWT_SECRET=your_very_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:3000
```

### 3. Seed the Database

```bash
npm run seed
```

This creates sample data including:
- **Admin:** admin@gvcc.edu / admin123
- **Student:** alice@student.com / student123
- 8 sample videos

### 4. Run Development Servers

```bash
npm run dev
```

This starts both servers concurrently:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## Project Structure

```
gvcc-learning-portal/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Layout.js       # Sidebar + header wrapper
│   │   │   ├── VideoCard.js    # Video card with progress
│   │   │   ├── BookmarkPanel.js# Bookmark CRUD panel
│   │   │   ├── Watermark.js    # Dynamic moving watermark
│   │   │   └── Modal.js        # Reusable modal
│   │   ├── pages/              # Route pages
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Videos.js
│   │   │   ├── VideoPlayer.js
│   │   │   ├── Bookmarks.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── AdminVideos.js
│   │   │   └── AdminStudents.js
│   │   ├── context/
│   │   │   └── AuthContext.js  # JWT auth state management
│   │   ├── hooks/
│   │   │   ├── useProgress.js  # Watch progress auto-save
│   │   │   └── useVideoProtection.js # Screenshot deterrents
│   │   ├── services/           # Axios API services
│   │   └── utils/              # Helper functions
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── server/                     # Node.js/Express backend
│   ├── controllers/            # Route handlers
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js
│   │   ├── Video.js
│   │   ├── Bookmark.js
│   │   ├── Progress.js
│   │   └── RecentlyWatched.js
│   ├── routes/                 # Express routers
│   ├── middleware/
│   │   └── auth.js             # JWT verification
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── cloudinary.js       # Cloudinary setup
│   ├── utils/
│   │   ├── helpers.js
│   │   └── seed.js             # Database seeder
│   └── Dockerfile
│
├── docker-compose.yml
└── package.json
```

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new student |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Videos
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/videos` | List videos (search, filter, paginate) |
| GET | `/api/videos/:id` | Get single video |
| GET | `/api/videos/categories` | Get all categories |
| POST | `/api/videos` | Create video (admin) |
| PUT | `/api/videos/:id` | Update video (admin) |
| DELETE | `/api/videos/:id` | Delete video (admin) |

### Bookmarks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookmarks` | Get all user bookmarks |
| GET | `/api/bookmarks/:videoId` | Get bookmarks for a video |
| POST | `/api/bookmarks` | Create bookmark |
| PUT | `/api/bookmarks/:id` | Update bookmark |
| DELETE | `/api/bookmarks/:id` | Delete bookmark |

### Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/progress` | Get all user progress |
| POST | `/api/progress` | Save/update progress |
| GET | `/api/progress/:videoId` | Get progress for video |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/students` | List students |
| PUT | `/api/admin/students/:id/toggle` | Toggle active status |
| DELETE | `/api/admin/students/:id` | Delete student |

---

## Screenshot Protection

### Disclaimer
> **Browsers fundamentally cannot fully prevent screenshots or screen recording.** Any content displayed on screen can be captured. The mechanisms below are deterrents to discourage unauthorized capture, not absolute prevention.

### Implemented Deterrents

1. **Tab Visibility Detection** - Video pauses and blurs when `document.visibilityState` becomes `hidden`
2. **Window Focus Loss** - Video blurs when browser window loses focus (Alt+Tab)
3. **DevTools Heuristic** - Detects if browser window dimensions suggest DevTools are open
4. **Right-Click Disabled** - `contextmenu` event prevented on video element
5. **Drag Protection** - Dragging of video element disabled
6. **Keyboard Shortcuts** - PrintScreen, F12, Ctrl+U, Ctrl+S intercepted
7. **Dynamic Watermark** - Student name, email, and timestamp overlay moves randomly every 5 seconds
8. **ControlsList** - `nodownload` attribute on HTML5 video hides download button
9. **Picture-in-Picture Disabled** - `disablePictureInPicture` attribute set

---

## Docker Deployment

```bash
# Copy and configure environment
cp .env.example .env
# Edit .env with your values

# Build and start all services
docker-compose up -d

# Seed the database (first time only)
docker-compose exec server node utils/seed.js
```

Services:
- **MongoDB:** localhost:27017
- **API Server:** localhost:5000
- **React App:** localhost:3000 (served via Nginx)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router 6, Tailwind CSS |
| Video | React Player |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose |
| Auth | JWT (jsonwebtoken, bcryptjs) |
| Media | Cloudinary |
| Containerization | Docker, Docker Compose |
| Web Server | Nginx (production) |
