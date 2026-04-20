# NexusHub — Smart Campus Operations Hub
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
| Member 4 | Module D + E | Notifications (`/api/notifications`) + OAuth + User Roles |

---

## Prerequisites

- Java 17+
- Node.js 20+
- Maven 3.8+
- MongoDB Atlas account
- Google Cloud Console project with OAuth 2.0 credentials

---

## Setup & Running

### Backend
```bash
cd smart-campus-backend
mvn spring-boot:run -DskipTests
```

### Frontend
```bash
cd smart-campus-frontend
npm install
npm run dev
```

### Environment Variables
Update `smart-campus-backend/src/main/resources/application.properties`:
```
spring.data.mongodb.uri=your_mongodb_uri
spring.security.oauth2.client.registration.google.client-id=your_client_id
spring.security.oauth2.client.registration.google.client-secret=your_client_secret
```

---

## Access

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`
- Landing Page: `http://localhost:5173/landing`

---

*IT3030 PAF Assignment 2026 — Faculty of Computing, SLIIT — Group 104*
