# MERN Stack Blog System with Controller-Service-Repository Architecture

A production-grade, full-stack blog application built with the **MERN** stack (MongoDB, Express.js, React.js, Node.js), featuring strict **Role-Based Access Control (RBAC)**, **JWT token rotation**, **OAuth 2.0 social login**, **Zod validation**, **soft deletes**, **custom activity audit logging**, **real-time WebSocket notifications**, and a dedicated **Admin Control Panel**.

---

## Key Highlights & Architecture

The backend strictly adheres to the **Controller — Service — Repository** pattern:

```
Request ──► Routes ──► Middlewares (Auth, RBAC, RateLimiter, Validator)
                             │
                             ▼
                        Controllers (HTTP Request/Response, Envelope)
                             │
                             ▼
                        Service Layer (Business Logic, Domain Rules, Security)
                             │
                             ▼
                        Repository Layer (BaseRepository, Mongoose Abstraction)
                             │
                             ▼
                        MongoDB (Indexes, Compound Indexes, Soft Delete Flags)
```

1. **Clean Architecture & Separation of Concerns**:
   - **Controllers**: Handle HTTP input/output and status codes using `ApiResponse`.
   - **Services**: Pure business logic, permissions enforcement, and side-effects.
   - **Repositories**: Encapsulate Mongoose database queries, pagination, and soft delete filters.
   - **Models**: Schemas with compound indexes for performance.
2. **Dual-Token Authentication with Token Rotation**:
   - Short-lived JWT access tokens (15m).
   - Long-lived refresh tokens (7d) stored securely in `httpOnly` cookies and hashed in the database.
   - Automatic silent token refresh via Axios interceptors.
   - Rate limiting on authentication endpoints (`express-rate-limit`).
   - Secure password hashing via `bcryptjs` (salt rounds: 12).
   - Social OAuth 2.0 integration (Google & Facebook via `passport`).
3. **Role-Based Access Control (RBAC)**:
   - Two role tiers: `Admin` and `Regular User`.
   - Admin users can manage all users (change role, activate/deactivate accounts) and all posts.
   - Regular users can create, edit, and delete only their own posts and comments.
   - Enforced rigorously at the API layer with reusable middlewares (`verifyJWT`, `requireRole`, `requireOwnerOrAdmin`).
4. **Post Management & Soft Deletion**:
   - Automatic SEO-friendly slug generation with unique fallback suffix.
   - Full CRUD operations with Zod payload validation.
   - Soft deletes (`isDeleted`, `deletedAt`) preserve audit trails and allow administrative recovery.
5. **Interactive Discussion System**:
   - Authenticated users can comment on articles.
   - Authors can edit their comments; admins can moderate all comments.
   - **Bonus Real-Time**: Instant alerts via Socket.io when an article receives a new comment.
6. **Dedicated React Admin Panel**:
   - High-level KPI metrics: Total Users, Total Posts (Active vs Soft Deleted), Total Comments.
   - User Management table with search, role modification, and account deactivation.
   - Post Moderation table with restore and permanent delete capabilities.
   - Activity Audit Trail inspecting authentication events and resource mutations.

---

## Project Directory Layout

```
blogsystem/
├── server/
│   ├── src/
│   │   ├── config/             # DB connection, OAuth passport strategies, env config
│   │   ├── constants/          # Roles, status codes, action enums
│   │   ├── controllers/        # Request handling (auth, post, comment, admin)
│   │   ├── middlewares/        # Auth, RBAC, RateLimiter, ActivityLogger, ErrorHandler
│   │   ├── models/             # Mongoose schemas (User, Post, Comment, ActivityLog)
│   │   ├── repositories/       # BaseRepository, UserRepository, PostRepository, etc.
│   │   ├── routes/             # Grouped Express Routers (/api/v1/*)
│   │   ├── services/           # Domain business logic (auth, post, comment, admin)
│   │   ├── utils/              # ApiError, ApiResponse, slug generator, JWT helpers
│   │   ├── validations/        # Zod validation schemas
│   │   ├── app.js              # Express app pipeline
│   │   ├── server.js           # HTTP + Socket.io server listener
│   │   └── scripts/seed.js     # Automated database seeder
│   ├── tests/                  # Jest test suites (rbac, services, validations, utils)
│   ├── package.json
│   └── .env.example
│
├── client/
│   ├── src/
│   │   ├── api/                # Axios instance with auto-refresh interceptor
│   │   ├── components/         # Navbar, Footer, PostCard, Pagination, ProtectedRoute, AdminRoute
│   │   ├── context/            # AuthContext, SocketContext
│   │   ├── pages/              # Home, PostDetail, CreateEditPost, MyPosts, Login, Register
│   │   │   └── admin/          # AdminLayout, AdminDashboard, ManageUsers, ManagePosts, ActivityLogs
│   │   ├── App.jsx             # Router and layout configuration
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── package.json                # Root convenience scripts
└── README.md
```

---

## Docker Deployment (Full Stack)

The application includes complete containerization for MongoDB, backend API, and React frontend with Nginx.

### Run with Docker Compose (Single Command)

```bash
docker compose up --build -d
```

Services started:
- **Frontend (Nginx + React SPA)**: http://localhost:5173
- **Backend API (Node.js + Express + WebSockets)**: http://localhost:5000/api/v1
- **Database (MongoDB 7.0)**: localhost:27017

### Seed Database in Docker

Once the containers are up, seed demo users and posts into MongoDB:

```bash
docker compose exec backend npm run seed
```

### Stop Docker Containers

```bash
docker compose down
```

---

## Quick Start Guide (Local Development)

### Prerequisites
- **Node.js** (v18.x or v20.x or v24.x)
- **MongoDB** running locally (`mongodb://localhost:27017`) or a free MongoDB Atlas connection string.

---

### Step 1: Clone & Install Dependencies

```bash
# Clone the repository
git clone <your-repository-url>
cd blogsystem

# Install server packages
cd server
npm install

# Install client packages
cd ../client
npm install
```

---

### Step 2: Environment Configuration

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Your `server/.env` configuration:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blogsystem
CLIENT_URL=http://localhost:5173

JWT_ACCESS_SECRET=your_super_secret_jwt_access_key_here_at_least_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key_here_at_least_32_chars
JWT_REFRESH_EXPIRES_IN=7d

# Optional Social OAuth (Google / Facebook)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/v1/auth/facebook/callback
```

---

### Step 3: Seed Database with Demo Accounts & Posts

Run the automated seeder script to populate default users, articles, tags, comments, and audit logs:

```bash
cd server
npm run seed
```

**Pre-seeded Demo Credentials:**

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@blog.com` | `AdminPass123!` | Full control: user moderation, post restore, audit logs |
| **Regular User** | `john@example.com` | `Password123!` | Create, edit, and delete only their own posts |
| **Regular User** | `jane@example.com` | `Password123!` | Regular user account |

*(Tip: The Login UI features one-click demo quick-fill buttons for both Admin and User!)*

---

### Step 4: Run the Application

In terminal 1 (start backend API & WebSockets):
```bash
cd server
npm run dev
# Server running at http://localhost:5000
```

In terminal 2 (start React frontend):
```bash
cd client
npm run dev
# Vite client running at http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## Running the Automated Test Suite

The backend includes comprehensive **Jest** unit and integration tests covering:
- **RBAC Middleware**: Role verification, permission escalation guards.
- **Service Layer**: Business logic, soft-delete authorization checks, self-role modification guards.
- **Validation**: Zod request schema validation.
- **Utilities**: Slug generator, JWT token generation & verification, `ApiError`, `ApiResponse`.

Run the test suite:
```bash
cd server
npm test
```

Expected output:
```
PASS tests/services.test.js
PASS tests/utils.test.js
PASS tests/validations.test.js
PASS tests/rbac.test.js

Test Suites: 4 passed, 4 total
Tests:       21 passed, 21 total
```

---

## API Documentation Overview

All responses use a standardized JSON envelope:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Resource fetched successfully",
  "data": { ... },
  "meta": { "page": 1, "limit": 10, "totalPages": 5, "totalItems": 48 }
}
```

### 1. Authentication Endpoints (`/api/v1/auth`)
| Method | Endpoint | Description | Access | Rate Limited |
|---|---|---|---|---|
| `POST` | `/register` | Register new user account | Public | Yes (15 / 15m) |
| `POST` | `/login` | Authenticate user & issue tokens | Public | Yes (15 / 15m) |
| `POST` | `/refresh-token` | Rotate refresh token & issue new access token | Public | No |
| `POST` | `/logout` | Invalidate refresh token & clear cookie | Authenticated | No |
| `GET` | `/me` | Fetch authenticated user profile | Authenticated | No |
| `GET` | `/google` | Initiate Google OAuth 2.0 flow | Public | No |
| `GET` | `/facebook` | Initiate Facebook OAuth 2.0 flow | Public | No |

### 2. Posts Endpoints (`/api/v1/posts`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/` | Paginated post feed (`?page=&limit=&search=&tag=`) | Public |
| `GET` | `/slug/:slug` | Fetch post details & author by slug | Public |
| `POST` | `/` | Create article (auto slug generation) | Authenticated |
| `GET` | `/user/my-posts` | List authenticated user's articles | Authenticated |
| `PUT` | `/:id` | Update article | Author or Admin |
| `DELETE` | `/:id` | Soft delete article (`isDeleted: true`) | Author or Admin |
| `PATCH` | `/:id/restore` | Restore soft-deleted article | Admin Only |
| `DELETE` | `/:id/permanent`| Permanently delete post & its comments | Admin Only |

### 3. Comments Endpoints (`/api/v1/comments`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/post/:postId` | List comments for an article | Public |
| `POST` | `/post/:postId` | Post comment (triggers realtime socket alert) | Authenticated |
| `PUT` | `/:id` | Edit comment content | Comment Author Only |
| `DELETE` | `/:id` | Delete comment | Author or Admin |

### 4. Admin Panel Endpoints (`/api/v1/admin`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/stats` | Aggregated counts (users, posts, active, deleted, comments) | Admin Only |
| `GET` | `/users` | Paginated user management table with search | Admin Only |
| `PATCH` | `/users/:id/role` | Promote/demote user (`user` ↔ `admin`) | Admin Only |
| `PATCH` | `/users/:id/status`| Activate or deactivate user account | Admin Only |
| `GET` | `/posts` | Moderation table (active + soft-deleted) | Admin Only |
| `GET` | `/logs` | Immutable activity audit trail | Admin Only |

---

## 5-10 Minute Demo Video Walkthrough Guide

When recording the demo showcase:

1. **Architecture & Project Tour (1-2 mins)**:
   - Walk through the folder structure highlighting the `controllers/`, `services/`, and `repositories/` separation.
   - Run `npm test` inside `server/` showing all 21 unit/integration test suites passing.
2. **User Experience & Public Features (2-3 mins)**:
   - Open homepage: demonstrate search filtering, tag clicking, pagination.
   - Open an article detail page: view markdown content, author details, and comments.
3. **Authentication & RBAC (2 mins)**:
   - Click "Sign In" and use the **User Demo** fast-fill button (`john@example.com`).
   - Create a new article with title, tags, and content.
   - Add a comment to another post.
   - Show that regular users can only edit/delete their own articles in "My Articles".
4. **Admin Panel Showcase (2-3 mins)**:
   - Switch accounts using the **Admin Demo** fast-fill button (`admin@blog.com`).
   - Navigate to `/admin`:
     - **Dashboard Overview**: view live counts for Total Users, Total Posts, and Comments.
     - **User Management**: toggle user status (deactivate) or switch a user to admin.
     - **Post Moderation**: show soft-deleted articles and click **Restore** to bring them back to the public feed.
     - **Activity Audit Logs**: show the live audit trail tracking logins, post updates, and status changes.
5. **Real-time Notifications (Bonus)**:
   - Open two browser tabs (one logged in as post author John, one as Jane).
   - Post a comment as Jane; show the instant real-time notification indicator appearing in John's navigation bar via Socket.io.
