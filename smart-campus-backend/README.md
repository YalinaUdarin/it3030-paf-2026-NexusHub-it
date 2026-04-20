# Smart Campus Operations Hub
### IT3030 – Programming Applications & Frameworks | Group 104 | SLIIT

A full-stack web platform to manage campus facility bookings and maintenance incidents.

**Stack:** Spring Boot 3 · MongoDB Atlas · React 18 · Vite · Tailwind CSS · Google OAuth 2.0 · JWT · GitHub Actions

---

## Team & Module Ownership

| Member | Module | Responsibility |
|--------|--------|---------------|
| Member 1 | Module A | Facilities & Assets Catalogue (`/api/resources`) |
| Member 2 | Module B | Booking Management (`/api/bookings`) |
| Member 3 | Module C | Incident Ticketing (`/api/tickets`) |
| Member 4 | Module D + E | Notifications (`/api/notifications`) + OAuth + User Roles (`/api/auth`, `/api/admin/users`) |

---

## Prerequisites

- Java 17+
- Node.js 20+
- Maven 3.8+
- MongoDB Atlas account (cluster already set up)
- Google Cloud Console project with OAuth 2.0 credentials

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project → **APIs & Services** → **Credentials**
3. Click **Create Credentials** → **OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Add Authorized redirect URI:
   ```
   http://localhost:8080/api/auth/oauth2/callback/google
   ```
6. Copy the **Client ID** and **Client Secret**

---

## Backend Setup (Spring Boot)

```bash
cd smart-campus-backend
```

Create a `.env` file or set these environment variables:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@pafcluster.mongodb.net/smart_campus?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-min-32-characters-long
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
CORS_ORIGINS=http://localhost:5173
```

Run the application:

```bash
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

---

## Frontend Setup (React)

```bash
cd smart-campus-frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

---

## REST API Endpoints

### Auth & Users (Member 4)
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/auth/me` | Get current user profile | USER |
| GET | `/api/auth/oauth2/authorize/google` | Initiate Google login | Public |
| GET | `/api/admin/users` | List all users | ADMIN |
| PATCH | `/api/admin/users/{id}/roles` | Update user roles | ADMIN |
| PATCH | `/api/admin/users/{id}/toggle` | Enable/disable user | ADMIN |

### Notifications (Member 4)
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/notifications` | Get user notifications | USER |
| GET | `/api/notifications/count` | Get unread count | USER |
| PATCH | `/api/notifications/{id}/read` | Mark single as read | USER |
| PATCH | `/api/notifications/read-all` | Mark all as read | USER |
| DELETE | `/api/notifications/{id}` | Delete notification | USER |

### Resources (Member 1)
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/resources` | Get all (filterable) | Public |
| GET | `/api/resources/{id}` | Get by ID | Public |
| POST | `/api/resources` | Create resource | ADMIN |
| PUT | `/api/resources/{id}` | Update resource | ADMIN |
| PATCH | `/api/resources/{id}/status` | Update status | ADMIN |
| DELETE | `/api/resources/{id}` | Delete resource | ADMIN |

### Bookings (Member 2)
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/bookings` | Get bookings | USER/ADMIN |
| GET | `/api/bookings/{id}` | Get by ID | USER |
| POST | `/api/bookings` | Create booking | USER |
| PATCH | `/api/bookings/{id}/approve` | Approve booking | ADMIN |
| PATCH | `/api/bookings/{id}/reject` | Reject with reason | ADMIN |
| PATCH | `/api/bookings/{id}/cancel` | Cancel booking | USER/ADMIN |

### Tickets (Member 3)
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/tickets` | Get tickets | USER/ADMIN/TECH |
| GET | `/api/tickets/{id}` | Get by ID | USER |
| POST | `/api/tickets` | Create ticket (multipart) | USER |
| PATCH | `/api/tickets/{id}/status` | Update status | ADMIN/TECH |
| PATCH | `/api/tickets/{id}/assign` | Assign technician | ADMIN |
| POST | `/api/tickets/{id}/comments` | Add comment | USER |
| PUT | `/api/tickets/{id}/comments/{cId}` | Edit comment | USER (owner) |
| DELETE | `/api/tickets/{id}/comments/{cId}` | Delete comment | USER/ADMIN |

---

## Running Tests

```bash
cd smart-campus-backend
mvn test
```

---

## Project Structure

```
it3030-paf-2026-smart-campus-group104/
├── smart-campus-backend/
│   ├── .github/workflows/ci.yml
│   ├── src/main/java/com/smartcampus/
│   │   ├── SmartCampusApplication.java
│   │   ├── controller/          # REST controllers
│   │   ├── service/             # Business logic
│   │   ├── repository/          # MongoDB repositories
│   │   ├── model/               # Domain models
│   │   ├── security/            # JWT + OAuth2 config
│   │   └── exception/           # Error handling
│   └── src/test/                # Unit tests
├── smart-campus-frontend/
│   └── src/
│       ├── api/                 # Axios client
│       ├── context/             # Auth context
│       ├── components/          # Shared components
│       └── pages/               # All page components
│           └── admin/           # Admin pages
└── README.md
```

---

## GitHub Actions CI/CD

The workflow at `.github/workflows/ci.yml` automatically:
- Builds the Spring Boot backend
- Runs all unit tests
- Builds the React frontend
- Uploads build artifacts

Triggers on push to `main` or `develop` branches.

**Required GitHub Secrets:**
```
MONGODB_URI
JWT_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

---

## Innovation Features

- **Analytics Dashboard** — Admin can view booking status distribution, ticket priority breakdown, and key KPIs via interactive Recharts visualizations
- **Real-time Notification Bell** — Auto-polls every 30 seconds with unread badge count and dropdown preview
- **Role-based UI** — Sidebar, routes, and actions dynamically rendered based on user role
- **Conflict Detection** — Backend prevents double-booking of resources for overlapping time ranges
- **Image Attachments** — Tickets support up to 3 image uploads stored server-side

---

*IT3030 PAF Assignment 2026 — Faculty of Computing, SLIIT — Group 104*
